import { Social } from "./types";

const STORAGE_KEY = "embedded_wallet_state";

interface StorageState {
  accessToken: string;
  social: Social;
  lastConnected: number;
}

export class Storage {
  static saveAccessToken(token: string, social: Social) {
    const state: StorageState = {
      accessToken: token,
      social: social,
      lastConnected: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  static getAccessToken(): string | null {
    try {
      const stateStr = localStorage.getItem(STORAGE_KEY);
      if (!stateStr) return null;

      const state: StorageState = JSON.parse(stateStr);

      // Token 有效期为 7 天
      const isValid =
        Date.now() - state.lastConnected < 7 * 24 * 60 * 60 * 1000;

      if (!isValid) {
        this.clear();
        return null;
      }

      return state.accessToken;
    } catch {
      return null;
    }
  }

  static getSocial(): Social | null {
    try {
      const stateStr = localStorage.getItem(STORAGE_KEY);
      if (!stateStr) return null;

      const state: StorageState = JSON.parse(stateStr);
      return state.social;
    } catch {
      return null;
    }
  }

  static clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
