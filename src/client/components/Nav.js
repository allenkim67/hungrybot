var React  = require('react');
var {Link} = require('react-router');

module.exports = React.createClass({
  render: function() {
    return (
      <ul className="nav nav-pills navbar">
        <li><Link to="menu">Your Menu</Link></li>
        <li><Link to="upgrade">Upgrade Account</Link></li>
        <li><Link to="demo">Bot Demo</Link></li>
        <li><Link to="orders">Incoming Orders</Link></li>
      </ul>
    );
  }
});