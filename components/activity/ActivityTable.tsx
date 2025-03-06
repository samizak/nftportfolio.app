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
import { ExternalLink } from "lucide-react";
import {
  formatEventDate,
  getAccountName,
  getEventBadgeColor,
} from "@/lib/activityUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
}

export default function ActivityTable({ events }: ActivityTableProps) {
  // console.log(events);
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activity History</CardTitle>
      </CardHeader>

      <CardContent>
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
              {events.map((event, i) => (
                <TableRow
                  key={`event-${i}-${event.id}`}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <TableCell className="py-5 pl-8">
                    <Badge
                      className={`${getEventBadgeColor(
                        event.event_type
                      )} px-4 py-1.5 capitalize font-medium text-sm`}
                    >
                      {event.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center space-x-4 group">
                      <div className="relative h-14 w-14 rounded-md overflow-hidden border border-muted flex-shrink-0 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                        <Image
                          src={event.nft.display_image_url}
                          alt={event.nft.name}
                          fill
                          sizes="56px"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
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
                      {event.payment.quantity
                        ? `${+event.payment.quantity / 1e18} ${
                            event.payment.symbol
                          }`
                        : ""}
                    </p>
                  </TableCell>
                  <TableCell className="py-5 font-medium text-base">
                    {event.quantity || 1}
                  </TableCell>
                  <TableCell className="py-5 font-medium">
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
                  </TableCell>
                  <TableCell className="py-4 font-medium">
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
                  </TableCell>
                  <TableCell className="py-4 font-medium">
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
                  </TableCell>
                  <TableCell className="text-right text-base text-muted-foreground py-4 pr-6">
                    {formatEventDate(event.created_date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
