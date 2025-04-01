import { MongoClient } from "mongodb";

interface GasData {
  currentGasPrice: number;
  lastUpdated: Date;
  isDefault?: boolean;
}

// Comment out the entire GasService class implementation
/*
class GasService {
  private static instance: GasService;
  private client: MongoClient;
  private updateInterval: NodeJS.Timeout | null = null;
  private initialized: Promise<void>;
  private cachedGasData: GasData | null = null;

  private constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI || "", {
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
      const prices = await this.fetchGasPrices();
      if (prices) {
        this.cachedGasData = prices;
        this.updateGasPrices().catch(() => {});
      }

      this.startUpdateCycle();
    } catch (error) {
      this.startUpdateCycle();
    }
  }

  private async fetchGasPrices(): Promise<GasData | null> {
    try {
      const infuraApiKey = process.env.INFURA_API_KEY;

      if (!infuraApiKey) {
        return null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

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

      this.cachedGasData = gasData;

      return gasData;
    } catch (error) {
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
    } catch (error) {
    } finally {
      if (client) {
        await this.closeMongoClient(client);
      }
    }
  }

  private async getMongoClient(): Promise<MongoClient> {
    try {
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
      throw error;
    }
  }

  private async closeMongoClient(client: MongoClient): Promise<void> {
    try {
      await client.close();
    } catch (error) {}
  }

  public async getGasPrices(): Promise<GasData | null> {
    await this.initialized;

    if (this.cachedGasData) {
      const cacheAge = Date.now() - this.cachedGasData.lastUpdated.getTime();
      if (cacheAge < 5 * 60 * 1000) {
        return this.cachedGasData;
      }
    }

    let client = null;
    try {
      client = await this.getMongoClient();
      const db = client.db("nft-portfolio");
      const gasCollection = db.collection("gas-prices");

      const latestPrices = await gasCollection.findOne({ _id: "latest" });

      if (!latestPrices) {
        return await this.fetchGasPrices();
      }

      const gasData = {
        currentGasPrice: latestPrices.currentGasPrice,
        lastUpdated: latestPrices.lastUpdated,
        isDefault: latestPrices.isDefault || false,
      } as GasData;

      this.cachedGasData = gasData;

      return gasData;
    } catch (error) {
      if (this.cachedGasData) {
        return this.cachedGasData;
      }

      return await this.fetchGasPrices();
    } finally {
      if (client) {
        await this.closeMongoClient(client);
      }
    }
  }

  private startUpdateCycle(): void {
    this.updateInterval = setInterval(() => {
      this.updateGasPrices().catch(() => {});
    }, 2 * 60 * 1000); // Update every 2 minutes
  }
}
*/

// Create a mock service that returns default values
class GasService {
  private static instance: GasService;

  private constructor() {}

  public static getInstance(): GasService {
    if (!GasService.instance) {
      GasService.instance = new GasService();
    }
    return GasService.instance;
  }

  public async getGasPrices(): Promise<any> {
    return {
      currentGasPrice: 50, // Default gas price in gwei
      lastUpdated: new Date(),
      isDefault: true,
    };
  }
}

export const gasService = GasService.getInstance();
