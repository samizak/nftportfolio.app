"use client";
import PortfolioView from '@/components/PortfolioView';
import { useSearchParams } from 'next/navigation';
import { useEffect } from "react";
import { useUser } from '@/context/UserContext';

export default function AddressPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { userData, ensData, setUserData, setEnsData, isLoading, setIsLoading, error, setError } = useUser();

  useEffect(() => {
    if (!id) {
      setError('No address provided');
      setIsLoading(false);
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
  }, [id, setUserData, setEnsData, setIsLoading, setError]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (isLoading || !userData || !ensData) {
    return <div>Loading...</div>;
  }

  const user = {
    name: userData.username,
    ethHandle: ensData.ens,
    ethAddress: userData.address,
    avatar: userData.profile_image_url
  }
  
  return (
    <PortfolioView user={user} />
  );
}
