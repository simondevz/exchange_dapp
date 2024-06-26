import OrderBook from "./OrderBook";
import Trades from "./Trades";
import MyTransactions from "./MyTransactions";
import PriceChart from "./PriceChart";

export default function Content() {
  // const [exchange] = useState(); // global state

  return (
    <div className="content">
      <div className="vertical-split">
        <div className="card bg-dark text-white">
          <div className="card-header">Card Title</div>
          <div className="card-body">
            <p className="card-text">
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </p>
            <a href="/#" className="card-link">
              Card link
            </a>
          </div>
        </div>
        <div className="card bg-dark text-white">
          <div className="card-header">Card Title</div>
          <div className="card-body">
            <p className="card-text">
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </p>
            <a href="/#" className="card-link">
              Card link
            </a>
          </div>
        </div>
      </div>
      <OrderBook />
      <div className="vertical-split">
        <PriceChart />
        <MyTransactions />
      </div>
      <Trades />
    </div>
  );
}
