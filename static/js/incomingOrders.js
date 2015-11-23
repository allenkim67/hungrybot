var React    = require('react');
var ReactDOM = require('react-dom');
var axios    = require('axios');

socket.emit('session', SESSION_ID);

var Orders = React.createClass({
  getInitialState: function() {
    return {
      orders: []
    }
  },
  componentDidMount: function() {
    axios.get('/orders/api').then(res => {
      this.setState({orders: res.data});
    });

    socket.on('newOrder', order => {
      this.setState({orders: this.state.orders.concat(order)});
    });
  },
  render: function() {
    return (
      <ul>
        {this.state.orders.map(function(orderGroup) {
          return <li>{JSON.stringify(orderGroup)}</li>
        })}
      </ul>
    )
  }
});

ReactDOM.render(<Orders/>, document.querySelector('.js-orders-container'));