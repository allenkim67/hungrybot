var React           = require('react');
var {Router, Route} = require('react-router');
var Cookies         = require('cookies-js');
var socket          = require('socket.io-client')();
var Main            = require('./components/Main');
var UserUpgrade     = require('./components/UserUpgrade');
var BotDemo         = require('./components/BotDemo');
var Menu            = require('./components/menu/Menu');
var IncomingOrders  = require('./components/IncomingOrders');
var Profile         = require('./components/Profile');

socket.emit('sessionToken', Cookies.get('session'));

function createElement(Component, props) {
  return <Component {...props} socket={socket}/>;
}

module.exports = (
  <Router createElement={createElement}>
    <Route path="/" component={Main}>
      <Route path="upgrade" component={UserUpgrade}/>
      <Route path="demo" component={BotDemo}/>
      <Route path="menu" component={Menu}/>
      <Route path="orders" component={IncomingOrders}/>
      <Route path="profile" component={Profile}/>
    </Route>
  </Router>
);