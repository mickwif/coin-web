export async function joinWaitlist(
    email: string,
  ) {
    try {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/wait_list`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
          }),
        },
      );
      const data = await result.json();
      return data
    } catch (error) {
      console.error('error', error);
      return false;
    }
  }