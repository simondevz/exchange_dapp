import Web3 from "web3";
import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  exchangeLoaded,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  allOrdersLoaded,
  orderCancelling,
  orderCancelled,
  orderFilling,
  orderFilled,
} from "./actions";
import Token from "../build/Token.json";
import Exchange from "../build/Exchange.json";

export const loadWeb3 = async (dispatch) => {
  if (typeof window.ethereum !== "undefined") {
    const web3 = new Web3(window.ethereum);
    dispatch(web3Loaded(web3));
    return web3;
  } else {
    window.alert("Please install MetaMask");
    window.location.assign("https://metamask.io/");
  }
};

export const loadAccount = async (web3, dispatch) => {
  const accounts = await web3.eth.getAccounts();
  const account = await accounts[0];
  if (typeof account !== "undefined") {
    dispatch(web3AccountLoaded(account));
    return account;
  } else {
    window.alert("Please login with MetaMask");
    return null;
  }
};

export const loadToken = async (web3, networkId, dispatch) => {
  try {
    const token = new web3.eth.Contract(
      Token.abi,
      Token.networks[networkId].address
    );
    dispatch(tokenLoaded(token));
    return token;
  } catch (error) {
    console.log(
      "Contract not deployed to the current network. Please select another network with Metamask."
    );
    return null;
  }
};

export const loadExchange = async (web3, networkId, dispatch) => {
  try {
    const exchange = new web3.eth.Contract(
      Exchange.abi,
      Exchange.networks[networkId].address
    );
    dispatch(exchangeLoaded(exchange));
    return exchange;
  } catch (error) {
    console.log(
      "Contract not deployed to the current network. Please select another network with Metamask."
    );
    return null;
  }
};

export const loadAllOrders = async (exchange, dispatch) => {
  // Fetch cancelled orders with the "Cancel" event stream
  const cancelStream = await exchange.getPastEvents("Cancel", {
    fromBlock: 0,
    toBlock: "latest",
  });
  // Format cancelled orders
  const cancelledOrders = cancelStream.map((event) => event.returnValues);
  // Add cancelled orders to the redux store
  dispatch(cancelledOrdersLoaded(cancelledOrders));

  // Fetch filled orders with the "Trade" event stream
  const tradeStream = await exchange.getPastEvents("Trade", {
    fromBlock: 0,
    toBlock: "latest",
  });
  // Format filled orders
  const filledOrders = tradeStream.map((event) => event.returnValues);
  // Add cancelled orders to the redux store
  dispatch(filledOrdersLoaded(filledOrders));

  // Load order stream
  const orderStream = await exchange.getPastEvents("Order", {
    fromBlock: 0,
    toBlock: "latest",
  });
  // Format order stream
  const allOrders = orderStream.map((event) => event.returnValues);
  // Add open orders to the redux store
  dispatch(allOrdersLoaded(allOrders));
};

export const subscribeToEvents = async (exchange, dispatch) => {
  exchange.events.Cancel({}, (error, event) => {
    dispatch(orderCancelled(event.returnValues));
  });

  exchange.events.Trade({}, (error, event) => {
    dispatch(orderFilled(event.returnValues));
  });
};

export const cancelOrder = (dispatch, exchange, order, account) => {
  exchange.methods
    .cancelOrder(order.id)
    .send({ from: account })
    .on("transactionHash", (hash) => {
      dispatch(orderCancelling());
    })
    .on("error", (error) => {
      console.log(error);
      window.alert("There was an error!");
    });
};

export const fillOrder = (dispatch, exchange, order, account) => {
  exchange.methods
    .fillOrder(order.id)
    .send({ from: account })
    .on("transactionHash", (hash) => {
      dispatch(orderFilling());
    })
    .on("error", (error) => {
      console.log(error);
      window.alert("There was an error!");
    });
};
