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
// import { ActivityEvent } from "@/types/activity";
import {
  formatEventDate,
  getAccountName,
  getEventBadgeColor,
} from "@/lib/activityUtils";

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
    collection: {
      name: string;
      image_url: string;
    };
  };
  payment: {
    quantity: string;
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
  console.log(events);
  return (
    <Table className="border rounded-lg">
      <TableHeader>
        <TableRow className="border-b border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors">
          <TableHead className="w-[180px] py-4 text-sm font-medium text-muted-foreground pl-6">
            Event
          </TableHead>
          <TableHead className="w-[280px] py-4 text-sm font-medium text-muted-foreground">
            NFT
          </TableHead>
          <TableHead className="py-4 text-sm font-medium text-muted-foreground">
            Price
          </TableHead>
          <TableHead className="py-4 text-sm font-medium text-muted-foreground">
            Quantity
          </TableHead>
          <TableHead className="py-4 text-sm font-medium text-muted-foreground">
            From
          </TableHead>
          <TableHead className="py-4 text-sm font-medium text-muted-foreground">
            To
          </TableHead>
          <TableHead className="py-4 text-sm font-medium text-muted-foreground">
            Transaction
          </TableHead>
          <TableHead className="text-right py-4 text-sm font-medium text-muted-foreground pr-6">
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
            <TableCell className="py-4 pl-6">
              <Badge
                className={`${getEventBadgeColor(
                  event.event_type
                )} px-4 py-1.5 capitalize font-medium text-sm`}
              >
                {event.event_type}
              </Badge>
            </TableCell>
            <TableCell className="py-4">
              <div className="flex items-center space-x-4">
                <div className="relative h-12 w-12 rounded-md overflow-hidden border border-muted flex-shrink-0">
                  <Image
                    src={event.nft.display_image_url}
                    alt={event.nft.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium truncate max-w-[180px] text-base">
                    {event.nft?.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                    {event.nft?.collection?.name}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="py-4">
              <p className="font-medium text-base">
                {event.payment
                  ? `${event.payment.quantity} ${event.payment.symbol}`
                  : "N/A"}
              </p>
            </TableCell>
            <TableCell className="py-4 font-medium text-base">
              {event.quantity || 1}
            </TableCell>
            <TableCell className="font-medium py-4 text-base">
              {getAccountName(event.from_account)}
            </TableCell>
            <TableCell className="font-medium py-4 text-base">
              {getAccountName(event.to_account)}
            </TableCell>
            <TableCell className="font-medium py-4">
              {event.transaction ? (
                <a
                  href={`https://etherscan.io/tx/${event.transaction}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:text-blue-700 transition-colors text-base"
                >
                  <span className="truncate max-w-[120px]">
                    {event.transaction.substring(0, 6)}...
                    {event.transaction.substring(event.transaction.length - 4)}
                  </span>
                  <ExternalLink className="ml-1.5 h-4 w-4" />
                </a>
              ) : (
                <span className="text-muted-foreground text-base">N/A</span>
              )}
            </TableCell>
            <TableCell className="text-right text-base text-muted-foreground py-4 pr-6">
              {formatEventDate(event.created_date)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
