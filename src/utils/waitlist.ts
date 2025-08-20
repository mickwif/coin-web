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
      if(result.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('error', error);
      return false;
    }
  }