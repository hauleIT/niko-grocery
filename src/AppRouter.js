import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Products from "modules/product";
import Carts from 'modules/cart';
import AppHistory from "AppHistory";
import OrderHistory from 'modules/orderHistory';

const AppRouter = () => (
  <Router history={AppHistory}>
    <Switch>
      <Route exact path="/" component={Products} />
      <Route exact path="/product" component={Products} />
      <Route exact path="/cart" component={Carts}/>
      <Route exact path="/order-history" component={OrderHistory}/>
    </Switch>
  </Router>
);

export default AppRouter;
