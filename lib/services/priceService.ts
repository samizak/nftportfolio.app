import { MongoClient } from "mongodb";

interface PriceData {
  isDefault: boolean;
  prices: {
    [key: string]: number;
  };
  lastUpdated: Date;
}

// Default prices to use as fallback if API fails on first load
const DEFAULT_ETH_PRICES = {
  usd: 3000,
  eur: 2800,
  gbp: 2400,
  jpy: 450000,
  aud: 4500,
  cad: 4100,
  cny: 21000,
};

class PriceService {
  private static instance: PriceService;
  private client: MongoClient;
  private updateInterval: NodeJS.Timeout | null = null;
  private initialized: Promise<void>;
  private retryCount: number = 0;
  private maxRetries: number = 5;
  private retryDelay: number = 60 * 1000; // 1 minute in milliseconds
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 10 * 1000; // Minimum 10 seconds between requests

  private constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI || "");
    // Initialize immediately and store the promise
    this.initialized = this.initialize();
  }

  public static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  // New initialization method that runs on startup
  private async initialize(): Promise<void> {
    try {
      console.log(
        `[${new Date().toISOString()}] Initializing price service...`
      );
      const existingPrices = await this.getPrices();
      if (!existingPrices) {
        console.log("No existing prices found, fetching from API...");
        await this.updatePrices();
      } else {
        console.log("Existing prices found, using cached data");
      }

      this.startUpdateCycle();
    } catch (error) {
      console.error("Failed to initialize price service:", error);
      this.startUpdateCycle();
    }
  }

  private async fetchPrices(): Promise<PriceData | null> {
    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();

    try {
      console.log(
        `[${new Date().toISOString()}] Fetching ETH prices from CoinGecko...`
      );
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,eur,gbp,jpy,aud,cad,cny",
        {
          headers: {
            accept: "application/json",
            "x-cg-api-key": process.env.COINGECKO_API_KEY || "",
          },
        }
      );

      // Special handling for rate limiting
      if (response.status === 429) {
        console.warn("Rate limit exceeded (429). Backing off...");
        // Get retry-after header if available or use exponential backoff
        const retryAfter = response.headers.get("retry-after");
        const waitTime = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.pow(2, this.retryCount) * 30 * 1000;
        console.log(`Will retry after ${waitTime / 1000} seconds`);

        // Update retry delay for next attempt
        this.retryDelay = waitTime;
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        `[${new Date().toISOString()}] ETH prices fetched successfully`
      );
      this.retryCount = 0; // Reset retry count on successful fetch
      return {
        prices: data.ethereum,
        lastUpdated: new Date(),
        isDefault: false,
      };
    } catch (error) {
      console.error("Error fetching prices:", error);
      return null;
    }
  }

  // Updated updatePrices method with improved retry logic
  private async updatePrices(): Promise<void> {
    const prices = await this.fetchPrices();

    if (!prices) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        // Use exponential backoff for retries
        const backoffDelay = Math.min(
          this.retryDelay * Math.pow(2, this.retryCount - 1),
          15 * 60 * 1000 // Cap at 15 minutes
        );

        console.log(
          `[${new Date().toISOString()}] [PriceService] Fetch attempt ${
            this.retryCount
          }/${this.maxRetries} failed. Retrying in ${
            backoffDelay / 1000
          } seconds...`
        );

        // Schedule a retry after the delay
        setTimeout(() => {
          this.updatePrices();
        }, backoffDelay);

        return;
      } else {
        console.log(
          `[${new Date().toISOString()}] Maximum retry attempts (${
            this.maxRetries
          }) reached. Using default values.`
        );
        this.retryCount = 0; // Reset for next update cycle
        await this.saveDefaultPrices();
        return;
      }
    }

    try {
      await this.client.connect();
      const db = this.client.db("nft-portfolio");
      const priceCollection = db.collection("eth-prices");

      await priceCollection.updateOne(
        { _id: "latest" },
        {
          $set: {
            prices: prices.prices,
            lastUpdated: prices.lastUpdated,
            isDefault: prices.isDefault,
          },
        },
        { upsert: true }
      );
      console.log(`[${new Date().toISOString()}] Prices updated in database`);
    } catch (error) {
      console.error("Error updating price cache:", error);
    } finally {
      await this.client.close();
    }
  }

  public async getPrices(): Promise<PriceData | null> {
    await this.initialized;

    try {
      await this.client.connect();
      const db = this.client.db("nft-portfolio");
      const priceCollection = db.collection("eth-prices");

      const latestPrices = await priceCollection.findOne({ _id: "latest" });

      // Add proper type checking and conversion
      if (!latestPrices) {
        return null;
      }

      // Ensure the returned object matches PriceData interface
      return {
        prices: latestPrices.prices,
        lastUpdated: latestPrices.lastUpdated,
        isDefault: latestPrices.isDefault || false,
      } as PriceData;
    } catch (error) {
      console.error("Error getting cached prices:", error);
      return null;
    } finally {
      await this.client.close();
    }
  }

  // Save default prices if API fails
  private async saveDefaultPrices(): Promise<void> {
    try {
      await this.client.connect();
      const db = this.client.db("nft-portfolio");
      const priceCollection = db.collection("eth-prices");

      // Check if we already have any prices
      const existing = await priceCollection.findOne({ _id: "latest" });
      if (!existing) {
        await priceCollection.updateOne(
          { _id: "latest" },
          {
            $set: {
              prices: DEFAULT_ETH_PRICES,
              lastUpdated: new Date(),
              isDefault: true,
            },
          },
          { upsert: true }
        );
        console.log("Default prices saved to database");
      }
    } catch (error) {
      console.error("Error saving default prices:", error);
    } finally {
      await this.client.close();
    }
  }

  // Updated to fetch every 5 minutes instead of 2
  private startUpdateCycle(): void {
    this.updateInterval = setInterval(() => {
      this.updatePrices();
    }, 5 * 60 * 1000); // Update every 5 minutes
  }
}

// Initialize the service immediately when this module is imported
export const priceService = PriceService.getInstance();
