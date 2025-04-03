import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

export function useUserProfile(id: string | null) {
  const {
    userData,
    ensData,
    setUserData,
    setEnsData,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useUser();

  useEffect(() => {
    if (!id) {
      setError("No address provided");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch ENS data
        const ensResponse = await fetchWithRetry(`/api/ens/resolve/${id}`);
        if (!ensResponse) return;
        const ensJson = await (ensResponse as Response).json();
        setEnsData(ensJson);

        // Fetch user profile data
        try {
          const userResponse = await fetchWithRetry(`/api/user/profile/${id}`);
          if (!userResponse) return;
          const userJson = await (userResponse as Response).json();

          if (userJson.error) {
            setUserData(createDefaultUserData(id, ensJson?.ens));
          } else {
            setUserData(userJson);
          }
        } catch (userError) {
          console.warn("Error fetching user profile:", userError);
          setUserData(createDefaultUserData(id, ensJson?.ens));
        }
      } catch (err) {
        console.error("Error in data fetching:", err);
        if (err instanceof Error && !err.message.includes("not found")) {
          setError(err.message || "An error occurred");
        } else {
          setUserData(createDefaultUserData(id));
          setEnsData({ ens: "", address: "" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, setUserData, setEnsData, setIsLoading, setError]);

  // Create formatted user object for components
  const user = userData && {
    name: userData.username || formatAddress(id),
    ethHandle: ensData?.ens || "",
    ethAddress: userData.address || id || "",
    avatar: userData.profile_image_url || "",
    banner: userData.banner_image_url || "",
  };

  return { user, isLoading, error };
}

// Helper functions
function formatAddress(address: string | null): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}

function createDefaultUserData(id: string, ens?: string) {
  return {
    address: id,
    username: ens || formatAddress(id),
    profile_image_url: "",
    banner_image_url: "",
    website: "",
    social_media_accounts: [],
    bio: "",
    joined_date: "",
  };
}
