var React       = require('react');
var axios       = require('axios');
var serialize   = require('form-serialize');
var _           = require('underscore');
var update      = require('react-addons-update');
var MenuListing = require('./MenuListing');

module.exports = React.createClass({
  getInitialState: function() {
    return {errors: []}
  },
  render: function() {
    return (
      <div>
        <h2 className="create-menu-header">Create a new menu item.</h2>
        {this.state.errors.length ? (
          <ul>
            {this.state.errors.map(function(err) {
              return <li>{err.msg}</li>
            })}
          </ul>
        ) : null}
        <div className="create-menu-form">
          <form onSubmit={this.createMenuItem}>
            <div className="create-menu-name">
              <label>Name:</label><br/>
              <input className="chat-form form-control" name="name"/>
            </div>
            <div className="create-menu-description">
              <label>Description:</label><br/>
              <input className="chat-form form-control" name="description"/>
            </div>
            <div className="create-menu-price">
              <label>Price:</label><br/>
              <input className="chat-form form-control" name="price" placeholder="0.00"/>
            </div>
            <button>Create</button>
          </form>
        </div>
      </div>
    );
  },
  createMenuItem: function(evt) {
    evt.preventDefault();
    axios.post('/menu/create', serialize(evt.target))
      .then(res => {
        this.props.addMenu(res.data);
        this.setState({errors: []});
        evt.target.reset();
      })
      .catch(res => {
        this.setState({errors: res.data});
      });
  }
});