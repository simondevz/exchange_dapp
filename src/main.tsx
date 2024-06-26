import "bootstrap/dist/css/bootstrap.css";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import { store } from "./store/store";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
