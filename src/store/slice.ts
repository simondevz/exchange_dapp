import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  ExchangeContract,
  Orders,
  TokenContract,
  Web3Connection,
} from "../types";

export interface InitialState {
  connection: Web3Connection;
  account: string;
  tokenContract: TokenContract;
  exchangeContract: ExchangeContract;
  cancelledOrders: Orders;
  filledOrders: Orders;
  allOrders: Orders;
  orderCancelling: boolean;
  orderFilling: boolean;
}

const initialState: InitialState = {
  account: "",
  orderCancelling: false,
  orderFilling: false,
  cancelledOrders: {
    loaded: false,
    data: [],
  },
  filledOrders: {
    loaded: false,
    data: [],
  },
  allOrders: {
    loaded: false,
    data: [],
  },
  tokenContract: {
    loaded: false,
    data: undefined,
  },
  exchangeContract: {
    loaded: false,
    data: undefined,
  },
  connection: null,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    loadWeb3: (state, action: PayloadAction<Web3Connection>) => {
      state.connection = action.payload;
    },

    LoadWeb3Account: (state, action: PayloadAction<string>) => {
      state.account = action.payload;
    },

    loadToken: (state, action: PayloadAction<TokenContract>) => {
      state.tokenContract = action.payload;
    },

    loadExchange: (state, action: PayloadAction<ExchangeContract>) => {
      state.exchangeContract = action.payload;
    },

    loadCancelledOrders: (state, action: PayloadAction<Orders>) => {
      state.cancelledOrders = action.payload;
    },

    loadFilledOrders: (state, action: PayloadAction<Orders>) => {
      state.filledOrders = action.payload;
    },

    loadAllOrders: (state, action: PayloadAction<Orders>) => {
      state.allOrders = action.payload;
    },

    cancelOrder: (state, action: PayloadAction<boolean>) => {
      state.orderCancelling = action.payload;
    },

    fillOrder: (state, action: PayloadAction<boolean>) => {
      state.orderFilling = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  loadWeb3,
  LoadWeb3Account,
  loadToken,
  loadFilledOrders,
  loadExchange,
  loadCancelledOrders,
  loadAllOrders,
  cancelOrder,
  fillOrder,
} = appSlice.actions;

export default appSlice.reducer;
