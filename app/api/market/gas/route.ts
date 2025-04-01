// import { NextResponse } from "next/server";
// import { gasService } from "@/lib/services/gasService";

// export async function GET() {
//   try {
//     const prices = await gasService.getGasPrices();

//     if (!prices) {
//       return NextResponse.json(
//         { error: "Failed to fetch gas prices", fallback: true },
//         { status: 200 } // Return 200 even with error to prevent cascading failures
//       );
//     }

//     return NextResponse.json({
//       gasPrices: {
//         currentGasPrice: prices.currentGasPrice,
//         timestamp: prices.lastUpdated.toISOString(),
//       },
//       isDefault: prices.isDefault || false,
//     });
//   } catch (error) {
//     console.error("Error in gas API:", error);
//     return NextResponse.json(
//       { error: "Internal server error", fallback: true },
//       { status: 200 } // Return 200 even with error
//     );
//   }
// }
