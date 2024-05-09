import Spinner from "./Spinner";
import { Order } from "../types";
import { useAppSelector } from "../store/hook";

const ShowFilledOrders = ({ filledOrders }: { filledOrders: Order[] }) => {
  return (
    <tbody>
      {filledOrders.map((order) => {
        return (
          <tr className={`order-${order.id}`} key={order.id}>
            <td className="text-muted">{order.formattedTimestamp}</td>
            <td>{order.tokenAmount}</td>
            <td className={`text-${order.tokenPriceClass}`}>
              {order.tokenPrice}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default function Trades() {
  const filledOrders = useAppSelector((state) => state.filledOrders);

  return (
    <div className="vertical">
      <div className="card bg-dark text-white">
        <div className="card-header">Trades</div>
        <div className="card-body">
          <table className="table table-dark table-sm small">
            <thead>
              <tr>
                <th>Time</th>
                <th>DAPP</th>
                <th>DAPP/ETH</th>
              </tr>
            </thead>
            {filledOrders.loaded ? (
              <ShowFilledOrders filledOrders={filledOrders.data} />
            ) : (
              <Spinner type="table" />
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
