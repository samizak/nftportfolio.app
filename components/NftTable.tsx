"use client";

import { useState, useEffect } from "react";
import TableFilters from "@/components/TableFilters";

// Assuming you have a table component already
export default function NftTable({ nfts }: any) {
  const [filteredNfts, setFilteredNfts] = useState(nfts);
  const [activeFilter, setActiveFilter] = useState<any>(null);

  const applyFilters = (field: any, min: any, max: any) => {
    const minValue = min === "" ? -Infinity : parseFloat(min);
    const maxValue = max === "" ? Infinity : parseFloat(max);

    setActiveFilter({ field: field, min: minValue, max: maxValue } as any);

    const filtered = nfts.filter((nft: any) => {
      let value;

      switch (field) {
        case "quantity":
          value = nft.quantity;
          break;
        case "floorPrice":
          value = nft.floorPrice;
          break;
        case "value":
          value = nft.value;
          break;
        case "portfolioPercentage":
          value = nft.portfolioPercentage;
          break;
        default:
          value = 0;
      }

      return value >= minValue && value <= maxValue;
    });

    setFilteredNfts(filtered);
  };

  const clearFilters = () => {
    setActiveFilter(null);
    setFilteredNfts(nfts);
  };

  // Update filtered NFTs when the original data changes
  useEffect(() => {
    if (!activeFilter) {
      setFilteredNfts(nfts);
    } else {
      applyFilters(
        activeFilter.field,
        activeFilter.min.toString(),
        activeFilter.max.toString()
      );
    }
  }, [nfts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 max-w-[280px]">
        <TableFilters
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />
      </div>
      <div className="md:col-span-3">
        <table className="w-full">
          <tbody>
            {filteredNfts.map((nft: any) => (
              <tr key={nft.id}></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
