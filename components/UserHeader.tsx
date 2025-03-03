"use client";

import { useUser } from "@/context/UserContext";
import ProfileMenu from "@/components/ProfileMenu";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function UserHeader() {
  const { userData, ensData, setUserData, setEnsData, setIsLoading, setError } = useUser();
  const pathname = usePathname();
  
  // Only fetch user data if we're on an address page
  useEffect(() => {
    if (!pathname.startsWith('/address')) {
      return;
    }
    
    const id = new URLSearchParams(pathname.split('?')[1]).get('id');
    
    if (!id) {
      return;
    }
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [userResponse, ensResponse] = await Promise.all([
          fetch(`/api/get-user-profile?id=${id}`),
          fetch(`/api/get-ens?id=${id}`)
        ]);

        if (!userResponse.ok || !ensResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [userJson, ensJson] = await Promise.all([
          userResponse.json(),
          ensResponse.json()
        ]);

        setUserData(userJson);
        setEnsData(ensJson);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pathname, setUserData, setEnsData, setIsLoading, setError]);

  // If we have user data, show the profile menu
  if (userData && ensData) {
    const user = {
      name: userData.username,
      ethHandle: ensData.ens,
      ethAddress: userData.address,
      avatar: userData.profile_image_url || "https://placehold.co/400"
    };
    
    return <ProfileMenu user={user} />;
  }
  
  // Otherwise, don't show anything
  return null;
}