import React from 'react';
import { OptionsPage } from './OptionsPage';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer } from 'vaul';

interface PaymentOptionsModalProps {
  isDesktop: boolean;
  nestedDrawerOpen: boolean;
  setNestedDrawerOpen: (open: boolean) => void;
  selectedTab: 'BUY' | 'SELL' | 'SEND';
  handleTabChange: (tab: 'BUY' | 'SELL' | 'SEND') => void;
  handleMethodChange: (method: string) => void;
  sendRecipientWalletAddress: string;
  setSendRecipientWalletAddress: (address: string) => void;
  handleSendFormSubmit: (e: React.FormEvent) => void;
}

export function PaymentOptionsModal({
  isDesktop,
  nestedDrawerOpen,
  setNestedDrawerOpen,
  selectedTab,
  handleTabChange,
  handleMethodChange,
  sendRecipientWalletAddress,
  setSendRecipientWalletAddress,
  handleSendFormSubmit,
}: PaymentOptionsModalProps) {
  if (isDesktop) {
    return (
      <Dialog open={nestedDrawerOpen} onOpenChange={setNestedDrawerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <OptionsPage
            selectedTab={selectedTab}
            handleTabChange={handleTabChange}
            handleMethodChange={(method) => {
              handleMethodChange(method);
              setNestedDrawerOpen(false);
            }}
            setSendRecipientWalletAddress={setSendRecipientWalletAddress}
            sendRecipientWalletAddress={sendRecipientWalletAddress}
            handleSendFormSubmit={(e) => {
              handleSendFormSubmit(e);
              setNestedDrawerOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    );
  } else {
    return (
      <Drawer.Root
        open={nestedDrawerOpen}
        onOpenChange={setNestedDrawerOpen}
        repositionInputs={false}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[50%] fixed bottom-0 left-0 right-0 z-50">
            <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
            <div className="p-4 bg-white rounded-t-[10px] flex-1 overflow-auto">
              <OptionsPage
                selectedTab={selectedTab}
                handleTabChange={handleTabChange}
                handleMethodChange={(method) => {
                  handleMethodChange(method);
                  setNestedDrawerOpen(false);
                }}
                setSendRecipientWalletAddress={setSendRecipientWalletAddress}
                sendRecipientWalletAddress={sendRecipientWalletAddress}
                handleSendFormSubmit={(e) => {
                  handleSendFormSubmit(e);
                  setNestedDrawerOpen(false);
                }}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }
}
