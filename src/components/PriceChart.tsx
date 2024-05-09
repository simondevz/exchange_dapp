import Chart from "react-apexcharts";
import { chartOptions } from "./PriceChart.config";
import Spinner from "./Spinner";

const PriceSymbol = ({ lastPriceChange }: { lastPriceChange: string }) => {
  let output;
  if (lastPriceChange === "+") {
    output = <span className="text-success">&#9650;</span>; // Green up tiangle
  } else {
    output = <span className="text-danger">&#9660;</span>; // Red down triangle
  }
  return output;
};

const ShowPriceChart = ({ priceChart }: { priceChart: unknown }) => {
  return (
    <div className="price-chart">
      <div className="price">
        <h4>
          DAPP/ETH &nbsp; <PriceSymbol lastPriceChange={lastPriceChange} />{" "}
          &nbsp; {priceChart.lastPrice}
        </h4>
      </div>
      <Chart
        options={chartOptions}
        series={priceChart.series}
        type="candlestick"
        width="100%"
        height="100%"
      />
    </div>
  );
};

export default function PriceChart() {
  return (
    <div className="card bg-dark text-white">
      <div className="card-header">Price Chart</div>
      <div className="card-body">
        {priceChartLoaded ? (
          <ShowPriceChart priceChart={priceChart} />
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
}
