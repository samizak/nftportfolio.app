import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const walletAddress = searchParams.get("address");
  const maxPages = parseInt(searchParams.get("maxPages") || "5");

  if (!walletAddress) {
    return new Response(
      JSON.stringify({ error: "Wallet address is required" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Set up SSE response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start the async process
  fetchAllEvents(walletAddress, maxPages, writer).catch((error) => {
    console.error("Error in SSE stream:", error);
    writer.write(
      encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
    );
    writer.close();
  });

  // Return the stream as SSE
  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function fetchAllEvents(
  walletAddress: string,
  maxPages: number,
  writer: WritableStreamDefaultWriter
) {
  const encoder = new TextEncoder();
  let nextCursor: string | null = null;
  let pageCount = 0;
  let totalEvents = 0;

  try {
    do {
      // Build URL with cursor if available
      let url = `https://api.opensea.io/api/v2/events/accounts/${walletAddress}?chain=ethereum&event_type=sale&event_type=cancel&event_type=transfer&limit=50`;
      if (nextCursor) {
        url += `&next=${nextCursor}`;
      }

      // Send progress update
      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "progress",
            message: `Fetching page ${pageCount + 1}...`,
            pageCount,
          })}\n\n`
        )
      );

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "X-API-KEY": process.env.OPENSEA_API_KEY || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenSea API error:", response.status, errorData);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: "Failed to fetch data from OpenSea",
              status: response.status,
              details: errorData,
            })}\n\n`
          )
        );
        break;
      }

      const data = await response.json();

      // Process events from this page
      const events = data.asset_events.map((e: any) => {
        return {
          event_type: e.event_type,
          transaction: e.transaction,
          from_address: e.from_address,
          to_address: e.to_address,
          quantity: e.quantity,
          nft: e.nft,
          payment: e.payment,
          timestamp: e.event_timestamp,
        };
      });

      totalEvents += events.length;

      // Send chunk of events to client
      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "chunk",
            events,
            pageCount: pageCount + 1,
            totalEvents,
          })}\n\n`
        )
      );

      // Update cursor for next page
      nextCursor = data.next;
      pageCount++;

      // Add a small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Stop if we've reached max pages or there's no next cursor
    } while (nextCursor && nextCursor !== "" && pageCount < maxPages);

    // Send completion message
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: "complete",
          totalPages: pageCount,
          totalEvents,
          hasMore: false,
        })}\n\n`
      )
    );
  } catch (error) {
    console.error("Error fetching OpenSea events:", error);
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: "error",
          error: "Internal server error",
        })}\n\n`
      )
    );
  } finally {
    await writer.close();
  }
}
