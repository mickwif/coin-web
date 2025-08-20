import React from "react";
import { createRoot } from "react-dom/client";
import { LoginModal } from "./LoginModal";
import { SocialType, WalletInfo } from "./types";
import { WalletClient } from "./client";
import { GoogleOAuthProvider } from '@react-oauth/google';

class ModalManager {
  private container: HTMLDivElement | null = null;
  private root: ReturnType<typeof createRoot> | null = null;

  private createContainer() {
    const container = document.createElement("div");
    container.id = "embedded-wallet-modal";
    document.body.appendChild(container);
    return container;
  }

  showLoginModal({
    client,
    isLoading = false,
    googleClientId,
    onClose,
    onLogin,
  }: {
    client: WalletClient;
    isLoading?: boolean;
    googleClientId: string;
    onClose?: () => void;
    onLogin?: (walletInfo: WalletInfo) => void;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.container) {
          this.container = this.createContainer();
          this.root = createRoot(this.container);
        }

        const handleClose = () => {
          this.hideModal();
          onClose?.();
        };

        const handleLogin = (walletInfo: WalletInfo) => {
          this.hideModal();
          onLogin?.(walletInfo);
        };

        if (this.root) {
          this.root.render(
            <GoogleOAuthProvider clientId={googleClientId}>
              <LoginModal
                client={client}
                isOpen={true}
                onClose={handleClose}
                isLoading={isLoading}
                onLogin={handleLogin}
              />
            </GoogleOAuthProvider>
          );
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  hideModal() {
    if (this.root) {
      this.root.unmount();
      if (this.container) {
        document.body.removeChild(this.container);
        this.container = null;
      }
    }
  }
}

export const modalManager = new ModalManager();
