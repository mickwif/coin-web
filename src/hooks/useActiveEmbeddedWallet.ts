import { useSolanaWallets } from "@privy-io/react-auth";
import { usePrivy } from "@privy-io/react-auth";

export const useActiveEmbeddedWallet = () => {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();

  if (!ready || !authenticated) {
    return;
  }

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  return embeddedWallet;
};

export const useActiveWallet = () => {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();

  if (!ready || !authenticated) {
    return;
  }

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const phantomWallet = wallets.find((w) => w.walletClientType === "phantom");
  const activeWallet = embeddedWallet || phantomWallet;

  return activeWallet;
};

export const usePhantomWallet = () => {
  const { wallets } = useSolanaWallets();
  const phantomWallet = wallets.find((w) => w.walletClientType === "phantom");
  return phantomWallet;
};