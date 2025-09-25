import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { NavbarComp } from "./component";
import { Home, Transaksi, Stock } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <NavbarComp />
      <main>
        <Switch>
          <Route path="/" component={Home} exact />
          <Route path="/Transaksi" component={Transaksi} exact />
          <Route path="/Stock" component={Stock} exact />
        </Switch>
      </main>
    </BrowserRouter>
  );
}

export default App;
