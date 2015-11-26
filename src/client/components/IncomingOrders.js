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
                return this.renderOrderGroup(order);
              })}
            </ul>
          ) : null}
        </div>
      </div>
    );
  },
  renderOrderGroup: function(orderGroup) {
    return (
        <div className="incoming-order">
          <li key={orderGroup._id}>
            <label>Id: </label>
            <span>{orderGroup._id}</span>
            <br/>
            <label>Status: </label>
            <span> {orderGroup.status}</span>
            <br/>
            <label>Items: </label>
            <ul className="incoming-list">
              {orderGroup.orders.map(function(order) {
                return <li key={order._id}>{order.quantity} {order.item}</li>
              })}
            </ul><br/>
            <label>Total: </label>
            <span>${(orderGroup.total/100).toFixed(2)}</span>
          </li>
        </div>
    );
  }
});