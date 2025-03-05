import { MongoClient } from "mongodb";

interface GasData {
  currentGasPrice: number;
  lastUpdated: Date;
  isDefault?: boolean;
}

class GasService {
  private static instance: GasService;
  private client: MongoClient;
  private updateInterval: NodeJS.Timeout | null = null;
  private initialized: Promise<void>;
  // Add in-memory cache to avoid DB calls when possible
  private cachedGasData: GasData | null = null;

  private constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI || "", {
      // Add connection timeout options
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    this.initialized = this.initialize();
  }

  public static getInstance(): GasService {
    if (!GasService.instance) {
      GasService.instance = new GasService();
    }
    return GasService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Initializing gas service...`);

      // First fetch prices directly without checking DB
      const prices = await this.fetchGasPrices();
      if (prices) {
        this.cachedGasData = prices;
        console.log("Initial gas prices fetched from API");

        // Now update the database in the background
        this.updateGasPrices().catch((err) =>
          console.error("Background DB update failed:", err)
        );
      }

      this.startUpdateCycle();
    } catch (error) {
      console.error("Failed to initialize gas service:", error);
      this.startUpdateCycle();
    }
  }

  private async fetchGasPrices(): Promise<GasData | null> {
    try {
      console.log(
        `[${new Date().toISOString()}] Fetching gas prices from Infura...`
      );
      const infuraApiKey = process.env.INFURA_API_KEY;

      if (!infuraApiKey) {
        console.error("Missing INFURA_API_KEY environment variable");
        return null;
      }

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Only fetch the gas price once
      const response = await fetch(
        `https://mainnet.infura.io/v3/${infuraApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_gasPrice",
            params: [],
            id: 1,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const currentGasPrice = +(parseInt(data.result, 16) / 1e9).toFixed(2);

      const gasData = {
        currentGasPrice,
        lastUpdated: new Date(),
        isDefault: false,
      };

      // Update in-memory cache
      this.cachedGasData = gasData;

      return gasData;
    } catch (error) {
      console.error("Error fetching gas prices:", error);
      return null;
    }
  }

  private async updateGasPrices(): Promise<void> {
    const prices = await this.fetchGasPrices();
    if (!prices) return;

    let client = null;
    try {
      client = await this.getMongoClient();
      const db = client.db("nft-portfolio");
      const gasCollection = db.collection("gas-prices");

      await gasCollection.updateOne(
        { _id: "latest" },
        { $set: prices },
        { upsert: true }
      );
      console.log(
        `[${new Date().toISOString()}] Gas prices updated in database`
      );
    } catch (error) {
      console.error("Error updating gas prices cache:", error);
    } finally {
      if (client) {
        await this.closeMongoClient(client);
      }
    }
  }

  // Helper method to get MongoDB client with timeout
  private async getMongoClient(): Promise<MongoClient> {
    try {
      // Create a promise that resolves with the connected client or rejects after timeout
      return await Promise.race([
        this.client.connect(),
        new Promise<MongoClient>((_, reject) => {
          setTimeout(
            () => reject(new Error("MongoDB connection timeout")),
            5000
          );
        }),
      ]);
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  // Helper method to safely close MongoDB client
  private async closeMongoClient(client: MongoClient): Promise<void> {
    try {
      await client.close();
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
  }

  public async getGasPrices(): Promise<GasData | null> {
    // Wait for initialization to complete
    await this.initialized;

    // Return cached data if available and less than 5 minutes old
    if (this.cachedGasData) {
      const cacheAge = Date.now() - this.cachedGasData.lastUpdated.getTime();
      if (cacheAge < 5 * 60 * 1000) {
        // 5 minutes
        console.log("Returning cached gas data");
        return this.cachedGasData;
      }
    }

    let client = null;
    try {
      // Try to get from database with timeout
      client = await this.getMongoClient();
      const db = client.db("nft-portfolio");
      const gasCollection = db.collection("gas-prices");

      const latestPrices = await gasCollection.findOne({ _id: "latest" });

      if (!latestPrices) {
        // If no data in DB, try to fetch fresh data
        console.log("No data in DB, fetching fresh gas prices");
        return await this.fetchGasPrices();
      }

      // Ensure the returned object matches GasData interface
      const gasData = {
        currentGasPrice: latestPrices.currentGasPrice,
        lastUpdated: latestPrices.lastUpdated,
        isDefault: latestPrices.isDefault || false,
      } as GasData;

      // Update in-memory cache
      this.cachedGasData = gasData;

      return gasData;
    } catch (error) {
      console.error("Error getting cached gas prices:", error);

      // If DB access fails but we have cached data, return it regardless of age
      if (this.cachedGasData) {
        console.log("DB error, returning cached gas data");
        return this.cachedGasData;
      }

      // Last resort: try to fetch fresh data
      return await this.fetchGasPrices();
    } finally {
      if (client) {
        await this.closeMongoClient(client);
      }
    }
  }

  private startUpdateCycle(): void {
    this.updateInterval = setInterval(() => {
      this.updateGasPrices().catch((err) =>
        console.error("Error in update cycle:", err)
      );
    }, 2 * 60 * 1000); // Update every 2 minutes
  }
}

export const gasService = GasService.getInstance();
