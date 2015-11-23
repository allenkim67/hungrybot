var React = require('react');
var Nav   = require('./Nav');

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <a href='/session/logout'>Log Out</a>
        <Nav/>
        {this.props.children}
      </div>
    );
  }
});