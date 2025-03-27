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
    this.initialized = this.initialize();
  }

  public static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      const existingPrices = await this.getPrices();
      if (!existingPrices) {
        await this.updatePrices();
      }
      this.startUpdateCycle();
    } catch (error) {
      this.startUpdateCycle();
    }
  }

  private async fetchPrices(): Promise<PriceData | null> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();

    try {
      const requestUrl =
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,eur,gbp,jpy,aud,cad,cny";

      const response = await fetch(requestUrl, {
        headers: {
          accept: "application/json",
          "x-cg-api-key": process.env.COINGECKO_API_KEY || "",
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        const waitTime = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.pow(2, this.retryCount) * 30 * 1000;

        this.retryDelay = waitTime;
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.ethereum) {
        return null;
      }

      this.retryCount = 0;
      return {
        prices: data.ethereum,
        lastUpdated: new Date(),
        isDefault: false,
      };
    } catch (error) {
      return null;
    }
  }

  private async updatePrices(): Promise<void> {
    const prices = await this.fetchPrices();

    if (!prices) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const backoffDelay = Math.min(
          this.retryDelay * Math.pow(2, this.retryCount - 1),
          15 * 60 * 1000
        );

        setTimeout(() => {
          this.updatePrices();
        }, backoffDelay);

        return;
      } else {
        this.retryCount = 0;
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
    } catch (error) {
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

      if (!latestPrices) {
        return null;
      }

      return {
        prices: latestPrices.prices,
        lastUpdated: latestPrices.lastUpdated,
        isDefault: latestPrices.isDefault || false,
      } as PriceData;
    } catch (error) {
      return null;
    } finally {
      await this.client.close();
    }
  }

  private async saveDefaultPrices(): Promise<void> {
    try {
      await this.client.connect();
      const db = this.client.db("nft-portfolio");
      const priceCollection = db.collection("eth-prices");

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
      }
    } catch (error) {
      // Error handling
    } finally {
      await this.client.close();
    }
  }

  private startUpdateCycle(): void {
    this.updateInterval = setInterval(() => {
      this.updatePrices();
    }, 5 * 60 * 1000); // Update every 5 minutes
  }
}

export const priceService = PriceService.getInstance();
