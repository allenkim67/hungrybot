var React = require('react');
var Nav   = require('./Nav');

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <div className="logout-div text-center">
          <form className="user-btn" action='/session/logout'>
            <button className="btn btn-default" type="submit" id="logout-btn">Logout</button>
          </form>
        </div>
        <Nav/>
        {this.props.children}
      </div>
    );
  }
});



