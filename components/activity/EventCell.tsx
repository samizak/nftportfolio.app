import { getEventBadgeColor } from "@/lib/activityUtils";
import { Badge } from "lucide-react";
import { TableCell } from "../ui/table";

export default function EventCell({ event }: { event: any }) {
  return (
    <TableCell className="py-5 pl-8">
      <Badge
        className={`${getEventBadgeColor(
          event.event_type
        )} px-4 py-1.5 capitalize font-medium text-sm`}
      >
        {event.event_type}
      </Badge>
    </TableCell>
  );
}
