import { useQuery } from "@tanstack/react-query";

const JUPITER_PRICE_API = process.env.NEXT_PUBLIC_JUPITER_PRICE_API;

export const useTokenPrices = (tokenMints: string[]) => {
  const query = useQuery({
    queryKey: ["tokenBalance", tokenMints.join(",")],
    queryFn: async () => {
      try {
        const tokenIds = tokenMints.join(",");
        const priceResponse = await fetch(
          `${JUPITER_PRICE_API}?ids=${tokenIds}`
        );
        const priceData = await priceResponse.json();


        return priceData as Record<
          string,
          { blockId: number; decimals: number; priceChange24h: number; usdPrice: number }
        >;
      } catch (e) {
        return {}
      }
    },
    staleTime: 10 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};
