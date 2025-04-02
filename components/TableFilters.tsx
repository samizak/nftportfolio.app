"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterX } from "lucide-react";

import { FilterValues } from "@/types/nft";

interface TableFiltersProps {
  onApplyFilters: (field: string, min: string, max: string) => void;
  onClearFilters: () => void;
}

export default function TableFilters({
  onApplyFilters,
  onClearFilters,
}: TableFiltersProps) {
  const [selectedField, setSelectedField] = useState<string>("quantity");
  const [filterValues, setFilterValues] = useState<FilterValues>({
    min: "",
    max: "",
  });

  const handleApplyFilter = () => {
    onApplyFilters(selectedField, filterValues.min, filterValues.max);
  };

  const handleClearFilters = () => {
    setFilterValues({ min: "", max: "" });
    onClearFilters();
  };

  return (
    <Card className="w-full max-w-[300px] mx-auto md:mx-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-md">Filter NFTs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filter-field">Filter by</Label>
            <Select
              value={selectedField}
              onValueChange={(value) => setSelectedField(value)}
            >
              <SelectTrigger id="filter-field" className="cursor-pointer">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantity" className="cursor-pointer">
                  Quantity
                </SelectItem>
                <SelectItem value="floorPrice" className="cursor-pointer">
                  Floor Price
                </SelectItem>
                <SelectItem value="value" className="cursor-pointer">
                  Value
                </SelectItem>
                <SelectItem
                  value="portfolioPercentage"
                  className="cursor-pointer"
                >
                  Portfolio %
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="min-value">Min</Label>
              <Input
                id="min-value"
                type="number"
                placeholder="Min"
                min="0"
                value={filterValues.min}
                onChange={(e) =>
                  setFilterValues({ ...filterValues, min: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-value">Max</Label>
              <Input
                id="max-value"
                type="number"
                placeholder="Max"
                min="0"
                value={filterValues.max}
                onChange={(e) =>
                  setFilterValues({ ...filterValues, max: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              onClick={handleApplyFilter}
              className="flex-1 cursor-pointer"
            >
              Apply Filter
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center cursor-pointer"
            >
              <FilterX className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
