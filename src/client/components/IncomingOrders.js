var React   = require('react');
var axios   = require('axios');
var update  = require('react-addons-update');

module.exports = React.createClass({
  getInitialState: function() {
    return {orders: []};
  },
  componentDidMount: function() {
    axios.get('/orders').then(res => {
      this.setState({orders: res.data});
    });
    this.props.socket.on('newOrder', newOrder => {
      this.setState({orders: update(this.state.orders, {$push: [newOrder]})});
    });
  },
  render: function() {
    return (
      <div>
        <h2 className="incoming-header">Incoming Orders</h2>
        <div className="incoming-order-list">
          {this.state.orders.length ? (
            <ul>
              {this.state.orders.map(order => {
                return this.renderOrder(order);
              })}
            </ul>
          ) : null}
        </div>
      </div>
    );
  },
  renderOrder: function(order) {
    return (
        <div className="incoming-order" key={order._id}>
          <li>
            <label>Id: </label>
            <span>{order._id}</span>
            <br/>
            <label>Status: </label>
            <span> {order.status}</span>
            <br/>
            <label>Items: </label>
            <ul className="incoming-list">
              {order.items.map(function(item) {
                return <li key={item._id}>{item.quantity} {item.name}</li>
              })}
            </ul><br/>
            <label>Total: </label>
            <span>${order.total}</span>
          </li>
        </div>
    );
  }
});