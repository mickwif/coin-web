import { useEffect, useMemo, useRef } from 'react';
import { AppProvider } from '@/lib/context';
import { BuyInterface } from '@/components/BuyInterface';
import { SellInterface } from '@/components/SellInterface';
import { SendInterface } from '@/components/SendInterface';
import { WalletButton } from '@/components/WalletButton';
import { useActiveWallet } from '@/hooks/useActiveEmbeddedWallet';

function getAllowedParentOrigin(): string | null {
  try {
    const ref = document.referrer;
    if (!ref) return null;
    const origin = new URL(ref).origin;
    const allowed = [
      process.env.NEXT_PUBLIC_IFRAME_PARENT_ORIGIN || '',
      process.env.NEXT_PUBLIC_IFRAME_PARENT_ORIGIN_STAGING || '',
    ].filter(Boolean);
    if (allowed.includes(origin)) return origin;
    return null;
  } catch {
    return null;
  }
}

function postMessageToParent(type: string, payload?: any) {
  const origin = getAllowedParentOrigin();
  if (!origin) return; // do not post to wildcard; enforce allowlist
  try {
    window.parent?.postMessage({ type, payload }, origin);
  } catch {
    // swallow
  }
}

function useAutoResize(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => {
      postMessageToParent('frame:resize', { height: ref.current!.scrollHeight });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
}

export default function EmbedPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAutoResize(containerRef);

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const action = (searchParams.get('action') || 'BUY') as 'BUY' | 'SELL' | 'SEND';
  const amountParam = searchParams.get('amount');
  const methodParam = (searchParams.get('method') || 'CARD') as 'CARD' | 'USDC';
  const recipientParam = searchParams.get('recipient') || '';

  useEffect(() => {
    postMessageToParent('wallet:ready', { version: 1 });
    // send initial size promptly
    setTimeout(() => {
      if (containerRef.current) {
        postMessageToParent('frame:resize', { height: containerRef.current.scrollHeight });
      }
    }, 0);
  }, []);

  return (
    <AppProvider>
      <div ref={containerRef} className="bg-white">
        <WalletGate action={action} amountParam={amountParam} methodParam={methodParam} recipientParam={recipientParam} />
      </div>
    </AppProvider>
  );
}

function WalletGate({ action, amountParam, methodParam, recipientParam }:{ action: 'BUY'|'SELL'|'SEND'; amountParam?: string|null; methodParam?: 'CARD'|'USDC'; recipientParam?: string; }) {
  const { wallet } = useActiveWallet();

  useEffect(() => {
    if (wallet?.address) {
      postMessageToParent('wallet:authorized', { address: wallet.address });
    }
  }, [wallet?.address]);

  if (!wallet?.address) {
    return (
      <div className="p-4">
        <WalletButton />
      </div>
    );
  }

  const onClose = () => postMessageToParent('wallet:close', { reason: 'user' });

  return (
    <>
      {action === 'BUY' && <BuyInterface activeWallet={wallet} onClose={onClose} />}
      {action === 'SELL' && <SellInterface activeWallet={wallet} onClose={onClose} />}
      {action === 'SEND' && <SendInterface activeWallet={wallet} onClose={onClose} />}
    </>
  );
}


