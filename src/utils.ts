import moment from "moment";
import { Dictionary, get, groupBy, maxBy, minBy } from "lodash";
import { ETHER_ADDRESS, GREEN, RED, ether, tokens } from "./helpers";
import { Order, OrderBookOrders } from "./types";

export const decorateFilledOrders = (orders: Order[]) => {
  // Track previous order to compare history
  let previousOrder = orders[0];
  return orders.map((order) => {
    order = decorateOrder(order);
    order = decorateFilledOrder(order, previousOrder);
    previousOrder = order; // Update the previous order once it's decorated
    return order;
  });
};

export const decorateOrder = (order: Order) => {
  let etherAmount;
  let tokenAmount;

  if (order.tokenGive === ETHER_ADDRESS) {
    etherAmount = order.amountGive;
    tokenAmount = order.amountGet;
  } else {
    etherAmount = order.amountGet;
    tokenAmount = order.amountGive;
  }

  // Calculate token price to 5 decimal places
  const precision = 100000;
  let tokenPrice = etherAmount / tokenAmount;
  tokenPrice = Math.round(tokenPrice * precision) / precision;

  return {
    ...order,
    etherAmount: ether(etherAmount),
    tokenAmount: tokens(tokenAmount),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format("h:mm:ss a M/D"),
  };
};

export const decorateFilledOrder = (order: Order, previousOrder: Order) => {
  return {
    ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder),
  };
};

export const tokenPriceClass = (
  tokenPrice: number,
  orderId: number,
  previousOrder: Order
) => {
  // Show green price if only one order exists
  if (previousOrder.id === orderId) {
    return GREEN;
  }

  // Show green price if order price higher than previous order
  // Show red price if order price lower than previous order
  if (previousOrder.tokenPrice <= tokenPrice) {
    return GREEN; // success
  } else {
    return RED; // danger
  }
};

export const decorateOrderBookOrders = (orders: Order[]) => {
  return orders.map((order) => {
    order = decorateOrder(order);
    order = decorateOrderBookOrder(order);
    return order;
  });
};

export const decorateOrderBookOrder = (order: Order) => {
  const orderType = order.tokenGive === ETHER_ADDRESS ? "buy" : "sell";
  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderFillAction: orderType === "buy" ? "sell" : "buy",
  };
};

export const filterForOrderBook = (orders: Order[]) => {
  // Decorate orders
  orders = decorateOrderBookOrders(orders);
  const returnOrder: OrderBookOrders = {
    buyOrders: {
      loaded: false,
      data: [],
    },
    sellOrders: {
      loaded: false,
      data: [],
    },
  };

  // Group orders by "orderType" then Fetch buy orders && sell orders
  const tempOrders: Dictionary<Order[]> = groupBy(orders, "orderType");
  const buyOrders = get(tempOrders, "buy", []);
  const sellOrders = get(tempOrders, "sell", []);

  // Sort orders by token price
  returnOrder.buyOrders = {
    loaded: true,
    data: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
  };

  returnOrder.sellOrders = {
    loaded: true,
    data: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
  };

  return returnOrder;
};

export const decorateMyFilledOrders = (orders: Order[], account: string) => {
  return orders.map((order) => {
    order = decorateOrder(order);
    order = decorateMyFilledOrder(order, account);
    return order;
  });
};

export const decorateMyFilledOrder = (order: Order, account: string) => {
  const myOrder = order.user === account;

  let orderType;
  if (myOrder) {
    orderType = order.tokenGive === ETHER_ADDRESS ? "buy" : "sell";
  } else {
    orderType = order.tokenGive === ETHER_ADDRESS ? "sell" : "buy";
  }

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderSign: orderType === "buy" ? "+" : "-",
  };
};

export const filterMyFilledOrders = (account: string, orders: Order[]) => {
  // Find our orders
  orders = orders.filter((o) => o.user === account || o.userFill === account);
  // Sort by date ascending
  orders = orders.sort((a, b) => a.timestamp - b.timestamp);
  // Decorate orders - add display attributes
  orders = decorateMyFilledOrders(orders, account);
  return orders;
};

export const filterMyOpenOrders = (account: string, orders: Order[]) => {
  // Filter orders created by current account
  orders = orders.filter((o) => o.user === account);
  // Decorate orders - add display attributes
  orders = decorateMyOpenOrders(orders);
  // Sort orders by date descending
  orders = orders.sort((a, b) => b.timestamp - a.timestamp);
  return orders;
};

export const decorateMyOpenOrders = (orders: Order[]) => {
  return orders.map((order) => {
    order = decorateOrder(order);
    order = decorateMyOpenOrder(order);
    return order;
  });
};

export const decorateMyOpenOrder = (order: Order) => {
  const orderType = order.tokenGive === ETHER_ADDRESS ? "buy" : "sell";

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
  };
};

export const buildGraphData = (orders: Order[]) => {
  // Group the orders by hour for the graph
  const regroupedOrders: Dictionary<Order[]> = groupBy(orders, (o) =>
    moment.unix(o.timestamp).startOf("hour").format()
  );
  // Get each hour where data exists
  const hours = Object.keys(regroupedOrders);
  // Build the graph series
  const graphData = hours.map((hour) => {
    // Fetch all the orders from current hour
    const group = regroupedOrders[hour];
    // Calculate price values - open, high, low, close
    const open = group[0]; // first order
    const high = maxBy(group, "tokenPrice"); // high price
    const low = minBy(group, "tokenPrice"); // low price
    const close = group[group.length - 1]; // last order

    return {
      x: new Date(hour),
      y: [open.tokenPrice, high!.tokenPrice, low!.tokenPrice, close.tokenPrice],
    };
  });

  return graphData;
};

export const priceChart = (orders: Order[]) => {
  // Sort orders by date ascending to compare history
  orders = orders.sort((a, b) => a.timestamp - b.timestamp);
  // Decorate orders - add display attributes
  orders = orders.map((o) => decorateOrder(o));
  // Get last 2 order for final price & price change
  const [secondLastOrder, lastOrder] = orders.slice(
    orders.length - 2,
    orders.length
  );
  // get last order price
  const lastPrice = get(lastOrder, "tokenPrice", 0);
  // get second last order price
  const secondLastPrice = get(secondLastOrder, "tokenPrice", 0);

  return {
    lastPrice,
    lastPriceChange: lastPrice >= secondLastPrice ? "+" : "-",
    series: [
      {
        data: buildGraphData(orders),
      },
    ],
  };
};
