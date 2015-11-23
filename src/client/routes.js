var React           = require('react');
var {Router, Route} = require('react-router');
var Main            = require('./components/Main');
var UserUpgrade     = require('./components/UserUpgrade');
var BotDemo         = require('./components/BotDemo');
var Menu            = require('./components/Menu');


module.exports = (
  <Router>
    <Route path="/" component={Main}>
      <Route path="upgrade" component={UserUpgrade}/>
      <Route path="demo" component={BotDemo}/>
      <Route path="menu" component={Menu}/>
    </Route>
  </Router>
);
