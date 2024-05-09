import { MetaMaskInpageProvider } from "@metamask/providers";
import Web3 from "web3";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Web3Connection = Web3<any> | null;

export type TokenContract = { loaded: boolean; data: unknown };

export type ExchangeContract = { loaded: boolean; data: unknown };

export type Order = {
  id: number;
  user: string; // an account address - for the person that created the order
  userFill: string; // an account address - for the person that filled the order
  tokenGive: string;
  amountGive: number;
  tokenGet: string;
  amountGet: number;
  etherAmount: number;
  tokenAmount: number;
  tokenPrice: number;
  tokenPriceClass: string;
  formattedTimestamp: string;
  orderType: string;
  orderTypeClass: string;
  orderSign: string;
  orderFillAction: string;
  timestamp: number;
};

export type Orders = { loaded: boolean; data: Order[] };

export type OrderBookOrders = { buyOrders: Orders; sellOrders: Orders };
