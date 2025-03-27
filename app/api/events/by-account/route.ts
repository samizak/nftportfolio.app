import { NextRequest } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Event from "@/app/models/Event";

// Define the Event interface
export interface NFTEvent {
  id: string;
  event_type: string;
  created_date: string;
  transaction: string;
  nft: {
    display_image_url: string;
    identifier: string;
    name: string;
    image_url: string;
    collection: string;
    contract: string;
  };
  payment: {
    quantity: string;
    token_address: string;
    decimals: string;
    symbol: string;
  };
  from_account: {
    address: string;
    user?: {
      username: string;
    };
  };
  to_account: {
    address: string;
    user?: {
      username: string;
    };
  };
  quantity: number;
  walletAddress?: string;
  updatedAt?: Date;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const walletAddress = searchParams.get("address");
  const maxPages = parseInt(searchParams.get("maxPages") || "20");
  const forceRefresh = searchParams.get("refresh") === "true";

  console.log({ "events/by-account -> force refresh": forceRefresh });

  if (!walletAddress) {
    return new Response(
      JSON.stringify({ error: "Wallet address is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Connect to MongoDB
  await dbConnect();

  // Check for existing events
  const existingEvents = await Event.find({
    walletAddress,
  }).sort({ timestamp: -1 });

  // If we have data and no force refresh, return it directly
  if (existingEvents.length > 0 && !forceRefresh) {
    console.log(
      `Found ${existingEvents.length} cached events for ${walletAddress}`
    );

    // Create a new stream for cached data
    const encoder = new TextEncoder();
    const cachedStream = new TransformStream();
    const cachedWriter = cachedStream.writable.getWriter();

    // Send data in a separate function to avoid blocking
    sendCachedData(cachedWriter, existingEvents, encoder);

    return new Response(cachedStream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // If force refresh is true, clear existing events for this wallet
  if (forceRefresh && existingEvents.length > 0) {
    console.log(
      `Force refresh requested for ${walletAddress}, clearing existing events`
    );
    try {
      await Event.deleteMany({ walletAddress });
      console.log(
        `Cleared ${existingEvents.length} events for ${walletAddress}`
      );
    } catch (error) {
      console.error(`Error clearing events for ${walletAddress}:`, error);
      // Continue with fetching even if clearing fails
    }
  }

  // For fresh data, set up a new SSE response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // If no recent data or force refresh, fetch from OpenSea
  fetchAllEvents(walletAddress, maxPages, writer).catch((error) => {
    console.error("Error in SSE stream:", error);
    writer.write(
      encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
    );
    writer.close();
  });

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Separate function to send cached data
// In the sendCachedData function, improve the progress message
async function sendCachedData(
  writer: WritableStreamDefaultWriter,
  events: any[],
  encoder: TextEncoder
) {
  try {
    console.log("Starting to send cached data");

    // Send progress message with more details
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: "progress",
          message: "Fetching data from cache...",
          pageCount: 0,
          currentPage: 0,
          totalPages: 1,
          percentage: 0,
        })}\n\n`
      )
    );
    console.log("Progress message sent");

    // Send all events in one chunk
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: "chunk",
          events: events,
          pageCount: 1,
          totalEvents: events.length,
        })}\n\n`
      )
    );
    console.log("Events chunk sent");

    // Send completion message
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: "complete",
          totalPages: 1,
          totalEvents: events.length,
          hasMore: false,
          fromCache: true,
        })}\n\n`
      )
    );
    console.log("Complete message sent");
  } catch (error) {
    console.error("Error sending cached data:", error);
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: "error",
          error: "Error sending cached data",
        })}\n\n`
      )
    );
  } finally {
    console.log("Closing writer");
    await writer.close();
    console.log("Writer closed");
  }
}
// In the fetchAllEvents function, enhance the progress updates
async function fetchAllEvents(
  walletAddress: string,
  maxPages: number,
  writer: WritableStreamDefaultWriter
) {
  const encoder = new TextEncoder();
  let nextCursor: string | null = null;
  let pageCount = 0;
  let totalEvents = 0;
  const startTime = Date.now();

  try {
    // Initial progress message with estimated total pages
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: "progress",
          message: "Initializing data fetch...",
          currentPage: 0,
          totalPages: maxPages, // Initial estimate
          percentage: 0,
          startTime,
        })}\n\n`
      )
    );

    do {
      // Build URL with cursor if available
      let url = `https://api.opensea.io/api/v2/events/accounts/${walletAddress}?chain=ethereum&event_type=sale&event_type=cancel&event_type=transfer&limit=50`;
      if (nextCursor) {
        url += `&next=${nextCursor}`;
      }

      // Calculate percentage based on current progress
      const percentage = Math.min(Math.round((pageCount / maxPages) * 100), 99);

      // Send enhanced progress update
      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "progress",
            message: `Fetching page ${pageCount + 1} of ~${maxPages}...`,
            pageCount,
            currentPage: pageCount + 1,
            totalPages: maxPages,
            percentage,
            totalEventsSoFar: totalEvents,
            elapsedTime: Date.now() - startTime,
          })}\n\n`
        )
      );

      // Add retry logic for rate limiting
      let retryCount = 0;
      let response: Response | undefined;
      let success = false;

      while (retryCount < 5 && !success) {
        response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "X-API-KEY": process.env.OPENSEA_API_KEY || "",
          },
        });

        if (response.status === 429) {
          retryCount++;
          // Enhanced rate limit notification
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                message: `Rate limited. Retry attempt ${retryCount}/5 after 5 seconds...`,
                pageCount,
                currentPage: pageCount + 1,
                totalPages: maxPages,
                percentage,
                isRateLimited: true,
                retryCount,
                totalEventsSoFar: totalEvents,
                elapsedTime: Date.now() - startTime,
              })}\n\n`
            )
          );
          // Wait 5 seconds before retrying
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          success = true;
        }
      }

      // If we've exhausted all retries and still getting rate limited
      if (!success || !response) {
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: "Rate limit exceeded after 5 retry attempts",
              status: 429,
            })}\n\n`
          )
        );
        break;
      }

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

      // In the fetchAllEvents function, update the events mapping:
      // In the events mapping, ensure unique IDs:
      const events: NFTEvent[] = data.asset_events.map(
        (e: any, index: number) => {
          const fallbackId = `${e.transaction?.hash || "tx"}-${
            e.nft?.identifier || "nft"
          }-${Date.now()}-${index}`;
          return {
            id: e.id || fallbackId,
            event_type: e.event_type,
            created_date: new Date(e.event_timestamp * 1000),
            transaction: e.transaction,
            nft: {
              display_image_url: e.nft?.display_image_url || "",
              identifier: e.nft?.identifier || "",
              name: e.nft?.name || "",
              image_url: e.nft?.image_url || "",
              collection: e.nft?.collection || "",
              contract: e.nft?.contract || "",
            },
            payment: {
              quantity: e.payment?.quantity || null,
              token_address: e.payment?.token?.address || null,
              decimals: e.payment?.token?.decimals || "18",
              symbol: e.payment?.token?.symbol || "ETH",
            },
            from_account: {
              address:
                e.event_type !== "sale" ? e.from_address || "" : e.seller,
              user: e.from_account?.user
                ? {
                    username: e.from_account.user.username || "",
                  }
                : undefined,
            },
            to_account: {
              address: e.event_type !== "sale" ? e.to_address || "" : e.seller,
              user: e.to_account?.user
                ? {
                    username: e.to_account.user.username || "",
                  }
                : undefined,
            },
            quantity: e.quantity || 1,
          };
        }
      );
      const eventsToStore: NFTEvent[] = events.map((event: NFTEvent) => ({
        ...event,
        walletAddress,
        timestamp: new Date((event.created_date as any) * 1000),
        updatedAt: new Date(),
      }));
      const bulkOps = eventsToStore.map((event: NFTEvent) => ({
        updateOne: {
          filter: {
            walletAddress,
            id: event.id,
          },
          update: { $set: event },
          upsert: true,
        },
      }));
      // Use bulkWrite instead of multiple updateOne operations
      await Event.bulkWrite(bulkOps, { ordered: false });
      // Add logging to track operations
      console.log(
        `Processed ${
          eventsToStore.length
        } events for wallet ${walletAddress} (page ${pageCount + 1})`
      );
      totalEvents += events.length;

      // Calculate updated percentage after processing this page
      const updatedPercentage = Math.min(
        Math.round(((pageCount + 1) / maxPages) * 100),
        99
      );

      // Send chunk of events to client with updated progress info
      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "chunk",
            events,
            pageCount: pageCount + 1,
            totalEvents,
            currentPage: pageCount + 1,
            totalPages: maxPages,
            percentage: updatedPercentage,
            elapsedTime: Date.now() - startTime,
          })}\n\n`
        )
      );
      // Update cursor for next page
      nextCursor = data.next;
      pageCount++;
      // Add a small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
      // Stop if we've reached max pages or there's no next cursor
    } while (nextCursor && nextCursor !== "" && pageCount < maxPages);
    // Send completion message with final stats
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: "complete",
          totalPages: pageCount,
          totalEvents,
          hasMore:
            pageCount >= maxPages && nextCursor !== null && nextCursor !== "",
          percentage: 100,
          elapsedTime: Date.now() - startTime,
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
