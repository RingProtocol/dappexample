import { Eip1193Provider } from "web3";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export {};
