import { CollectionData } from "./nft";
import { Currency } from "./currency";

export interface PortfolioStatsProps {
  data?: CollectionData[];
  ethPrice?: number;
  totalNfts?: number;
  totalValue?: number;
  selectedCurrency?: Currency;
}

// Add these to the same portfolio.ts file
export interface NFTPortfolioTableProps {
  searchQuery: string;
  data?: CollectionData[];
  totalValue?: number;
  ethPrice?: number;
  selectedCurrency?: Currency;
}
export interface PortfolioViewProps {
  user: {
    name: string;
    ethHandle: string;
    ethAddress: string;
    avatar: string;
    banner: string;
  };
  data?: CollectionData[];
  ethPrice?: number;
  totalNfts?: number;
  totalValue?: number;
  selectedCurrency?: Currency;
}
