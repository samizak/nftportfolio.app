import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatEventDate, getEventBadgeColor } from "@/lib/activityUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  ShoppingBag,
  Plus,
  Tag,
  HandCoins,
  XCircle,
  CircleDashed,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface ActivityEvent {
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
}

interface ActivityTableProps {
  events: ActivityEvent[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  itemsPerPage: number;
  onPageChange: (newPage: number) => void;
}

export default function ActivityTable({
  events,
  isLoading,
  currentPage,
  totalPages,
  totalEvents,
  itemsPerPage,
  onPageChange,
}: ActivityTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEvents);

  const renderSkeletons = () => {
    return Array.from({ length: itemsPerPage }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell className="py-5 pl-8 w-[180px]">
          <Skeleton className="h-6 w-24" />
        </TableCell>
        <TableCell className="py-5 w-[300px]">
          <Skeleton className="h-14 w-full" />
        </TableCell>
        <TableCell className="py-5 w-[140px]">
          <Skeleton className="h-6 w-20" />
        </TableCell>
        <TableCell className="py-5 w-[100px]">
          <Skeleton className="h-6 w-12" />
        </TableCell>
        <TableCell className="py-5 w-[180px]">
          <Skeleton className="h-6 w-32" />
        </TableCell>
        <TableCell className="py-5 w-[180px]">
          <Skeleton className="h-6 w-32" />
        </TableCell>
        <TableCell className="py-5 w-[180px]">
          <Skeleton className="h-6 w-32" />
        </TableCell>
        <TableCell className="text-right py-5 pr-8 w-[140px]">
          <Skeleton className="h-6 w-24" />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex flex-col space-y-2">
          <p>Activity History</p>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors">
                <TableHead className="w-[180px] py-5 text-sm font-medium text-muted-foreground pl-8">
                  Event
                </TableHead>
                <TableHead className="w-[300px] py-5 text-sm font-medium text-muted-foreground">
                  NFT
                </TableHead>
                <TableHead className="py-5 text-sm font-medium text-muted-foreground w-[140px]">
                  Price
                </TableHead>
                <TableHead className="py-5 text-sm font-medium text-muted-foreground w-[100px]">
                  Quantity
                </TableHead>
                <TableHead className="py-5 text-sm font-medium text-muted-foreground w-[180px]">
                  From
                </TableHead>
                <TableHead className="py-5 text-sm font-medium text-muted-foreground w-[180px]">
                  To
                </TableHead>
                <TableHead className="py-5 text-sm font-medium text-muted-foreground w-[180px]">
                  Transaction
                </TableHead>
                <TableHead className="text-right py-5 text-sm font-medium text-muted-foreground pr-8 w-[140px]">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && events.length === 0
                ? renderSkeletons()
                : events.map((event, i) => (
                    <TableRow
                      key={`event-${i}-${event.id}`}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="py-5 pl-8">
                        <div className="flex items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-2 rounded-full ${getEventBadgeColor(
                                event.event_type
                              )} bg-opacity-15`}
                            >
                              {event.event_type === "sale" ? (
                                <ShoppingBag className="h-4 w-4" />
                              ) : event.event_type === "transfer" ? (
                                <ArrowLeftRight className="h-4 w-4" />
                              ) : event.event_type === "mint" ? (
                                <Plus className="h-4 w-4" />
                              ) : event.event_type === "list" ? (
                                <Tag className="h-4 w-4" />
                              ) : event.event_type === "offer" ? (
                                <HandCoins className="h-4 w-4" />
                              ) : event.event_type === "cancel_list" ? (
                                <XCircle className="h-4 w-4" />
                              ) : event.event_type === "cancel_offer" ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CircleDashed className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium capitalize text-sm">
                                {event.event_type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {event.event_type === "sale"
                                  ? "NFT Sold"
                                  : event.event_type === "transfer"
                                  ? "NFT Transferred"
                                  : event.event_type === "mint"
                                  ? "NFT Created"
                                  : event.event_type === "list"
                                  ? "Listed for Sale"
                                  : event.event_type === "offer"
                                  ? "Offer Received"
                                  : event.event_type === "cancel"
                                  ? "Listing Cancelled"
                                  : event.event_type === "cancel_offer"
                                  ? "Offer Cancelled"
                                  : "Transaction"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center space-x-4 group">
                          <div className="relative h-14 w-14 rounded-md overflow-hidden border border-muted flex-shrink-0 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                            {event.nft.display_image_url ? (
                              <Image
                                src={event.nft.display_image_url}
                                alt={`NFT image for ${
                                  event.nft.name || `#${event.nft.identifier}`
                                }`}
                                fill
                                sizes="56px"
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                unoptimized={true}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-muted-foreground"
                                >
                                  <path d="M5.64 5.64a9 9 0 1 0 12.72 12.72 9 9 0 1 0-12.72-12.72" />
                                  <path d="m12 14 4-4" />
                                  <path d="M14 12h-4v4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <a
                              href={`https://opensea.io/item/ethereum/${event.nft?.contract}/${event.nft?.identifier}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium truncate max-w-[200px] text-base hover:text-blue-600 transition-colors inline-block"
                            >
                              {event.nft?.name || "#" + event.nft?.identifier}
                            </a>
                            <a
                              href={`https://opensea.io/collection/${event.nft?.collection}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground truncate max-w-[200px] hover:text-blue-500 transition-colors inline-block"
                            >
                              {event.nft?.collection}
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <p className="font-medium text-base">
                          {event.payment?.quantity
                            ? `${(+event.payment.quantity / 1e18).toFixed(4)} ${
                                event.payment.symbol
                              }`
                            : "---"}
                        </p>
                      </TableCell>
                      <TableCell className="py-5 font-medium text-base">
                        <Badge variant="outline">
                          {event.event_type === "sale"
                            ? 1
                            : event.quantity || 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5 font-medium">
                        {event.from_account.address && (
                          <div className="flex items-center space-x-1.5">
                            <span className="bg-muted/30 px-3 py-1.5 rounded text-sm truncate max-w-[180px]">
                              {event.from_account.address !==
                              "0x0000000000000000000000000000000000000000"
                                ? `${event.from_account.address.substring(
                                    0,
                                    12
                                  )}...${event.from_account.address.substring(
                                    event.from_account.address.length - 4
                                  )}`
                                : "Null Address"}
                            </span>
                            <a
                              href={`https://opensea.io/${event.from_account.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 font-medium">
                        {event.to_account.address && (
                          <div className="flex items-center space-x-1">
                            <span className="bg-muted/30 px-2 py-1 rounded text-sm truncate max-w-[180px]">
                              {event.to_account.address !==
                              "0x0000000000000000000000000000000000000000"
                                ? `${event.to_account.address.substring(
                                    0,
                                    12
                                  )}...${event.to_account.address.substring(
                                    event.to_account.address.length - 4
                                  )}`
                                : "Null Address"}
                            </span>
                            <a
                              href={`https://opensea.io/${event.to_account.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 font-medium">
                        {event.transaction && (
                          <a
                            href={`https://etherscan.io/tx/${event.transaction}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center group"
                          >
                            <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded text-sm truncate max-w-[180px] group-hover:bg-blue-500/20 transition-colors">
                              {`${event.transaction.substring(
                                0,
                                12
                              )}...${event.transaction.substring(
                                event.transaction.length - 4
                              )}`}
                            </span>
                            <ExternalLink className="ml-1 h-3.5 w-3.5 text-blue-500 group-hover:text-blue-700 transition-colors" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-base text-muted-foreground py-4 pr-6">
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <span className="cursor-pointer hover:text-foreground transition-colors duration-200">
                                {formatEventDate(
                                  new Date(
                                    Number(event.created_date) * 1000
                                  ).toISOString()
                                )}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              className="bg-popover/95 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm border border-border/50"
                              sideOffset={5}
                            >
                              <p className="text-sm font-medium text-popover-foreground">
                                {new Date(
                                  Number(event.created_date) * 1000
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          {/* Updated Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-border/40">
              {/* Left Side: Showing count */}
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{startIndex + 1}</span>
                {"-"}
                <span className="font-medium">{endIndex}</span> of{" "}
                <span className="font-medium">{totalEvents}</span> events
              </div>

              {/* Right Side: Buttons and Page Indicator */}
              <div className="flex items-center space-x-2">
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  size="icon" // Use icon size
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  aria-label="Go to previous page" // Add aria-label for accessibility
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page X of Y Indicator */}
                <span className="text-sm font-medium text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  className="cursor-pointer"
                  variant="outline"
                  size="icon" // Use icon size
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  aria-label="Go to next page" // Add aria-label for accessibility
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
