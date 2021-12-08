import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import AppHashLips from "./AppHashLips";
import reportWebVitals from "./reportWebVitals";
import store from "./redux/store";
import { Provider } from "react-redux";
// import "./styles/reset.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/styles.css";

ReactDOM.render(
  <Provider store={store}>
    {window.location.href.includes("test") ? <AppHashLips /> : <App />}
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
