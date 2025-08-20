export async function fetchCoinbaseToken(
    address: string,
    asset: string = 'SOL',
  ) {
    try {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/ramp/coinbase`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addresses: [
              {
                address,
                blockchains: ['solana'],
              },
            ],
            assets: [asset],
          }),
        },
      );
      const { token } = await result.json();
      return token;
    } catch (error) {
      console.error('error', error);
      return null;
    }
  }