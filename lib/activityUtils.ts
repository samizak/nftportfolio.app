import { formatDistanceToNow } from "date-fns";

/**
 * Returns the appropriate badge color class based on event type
 */
export const getEventBadgeColor = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case "sale":
      return "bg-green-500";
    case "listing":
      return "bg-blue-500";
    case "offer":
      return "bg-purple-500";
    case "transfer":
      return "bg-yellow-500";
    case "mint":
      return "bg-pink-500";
    default:
      return "bg-gray-500";
  }
};

/**
 * Formats an Ethereum address to a shortened form
 */
export const formatAddress = (address: string) => {
  if (!address) return "Unknown";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

/**
 * Gets the display name for an account (username or formatted address)
 */
export const getAccountName = (account: any) => {
  if (!account) return "Unknown";
  return account.user?.username || formatAddress(account.address);
};

/**
 * Formats a date string to a relative time format (e.g., "2 days ago")
 */
export const formatEventDate = (dateString: string) => {
  try {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown time";
  }
};

/**
 * Filters events based on a search query
 */
export const filterEvents = (events: any[], query: string) => {
  if (!query) return events;

  const lowercaseQuery = query.toLowerCase();

  return events.filter((event) => {
    // Search in NFT name
    if (event.nft?.name?.toLowerCase().includes(lowercaseQuery)) return true;

    // Search in collection name
    if (event.nft?.collection?.name?.toLowerCase().includes(lowercaseQuery))
      return true;

    // Search in event type
    if (event.event_type?.toLowerCase().includes(lowercaseQuery)) return true;

    // Search in usernames
    if (
      event.from_account?.user?.username?.toLowerCase().includes(lowercaseQuery)
    )
      return true;
    if (
      event.to_account?.user?.username?.toLowerCase().includes(lowercaseQuery)
    )
      return true;

    return false;
  });
};

/**
 * Sorts events by specified criteria
 */
export const sortEvents = (
  events: any[],
  sortBy: string = "date",
  sortOrder: "asc" | "desc" = "desc"
) => {
  return [...events].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case "date":
        valueA = new Date(a.created_date).getTime();
        valueB = new Date(b.created_date).getTime();
        break;
      case "price":
        valueA = parseFloat(a.payment?.quantity || "0");
        valueB = parseFloat(b.payment?.quantity || "0");
        break;
      default:
        valueA = new Date(a.created_date).getTime();
        valueB = new Date(b.created_date).getTime();
    }

    return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
  });
};
