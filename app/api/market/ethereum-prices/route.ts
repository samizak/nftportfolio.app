import { NextResponse } from "next/server";
import { priceService } from "@/lib/services/priceService";

export async function GET() {
  try {
    const prices = await priceService.getPrices();

    if (!prices) {
      return NextResponse.json(
        { error: "Failed to fetch prices", fallback: true },
        { status: 200 } // Return 200 even with error to prevent cascading failures
      );
    }

    return NextResponse.json({
      ethPrice: prices.prices,
      lastUpdated: prices.lastUpdated,
      isDefault: prices.isDefault || false
    });
  } catch (error) {
    console.error("Error in price API:", error);
    return NextResponse.json(
      { error: "Internal server error", fallback: true },
      { status: 200 } // Return 200 even with error
    );
  }
}
