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
        <h2>Create a new menu item.</h2>
        {this.state.errors.length ? (
          <ul>
            {this.state.errors.map(function(err) {
              return <li>{err.msg}</li>
            })}
          </ul>
        ) : null}
        <form onSubmit={this.createMenuItem}>
          <label>Name:</label><br/>
          <input name="name"/><br/>
          <label>Description:</label><br/>
          <input name="description"/><br/>
          <label>Price:</label><br/>
          <input name="price" placeholder="0.00"/><br/>
          <button>Create</button>
        </form>
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