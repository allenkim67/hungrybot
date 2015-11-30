var React = require('react');
var Nav   = require('./Nav');

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <div>
          <form action='/session/logout'>
            <button className="btn btn-default logout-btn" type="submit">Logout</button>
          </form>
        </div>
        <Nav/>
        {this.props.children}
      </div>
    );
  }
});



