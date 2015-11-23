var React     = require('react');
var {History} = require('react-router');
var axios     = require('axios');
var serialize = require('form-serialize');

var stripeUrl = "https://connect.stripe.com/oauth/authorize?response_type=code&amp;client_id=ca_7HWG5j8ikAyqQT1LuuZSuGHDHLMuhgcT&amp;scope=read_write";

module.exports = React.createClass({
  getInitialState: function() {
    return {availPhoneNumbers: []};
  },
  mixins: [ History ],
  render: function() {
    return (
      <div>
        <h2>Upgrade Your Account</h2>
        <h3>Step 1 - Connect a stripe account</h3>
        <a href={stripeUrl}>OAuth Stripe</a>
        <h3>Step 2 - Select a phone number</h3>
        <label>Area Code:</label>
        <form onSubmit={this.getAvailPhoneNumbers}>
          <input/>
          <button>Search</button>
        </form>
        <form onSubmit={this.buyPhoneNumber}>
          <div>
            {this.state.availPhoneNumbers.map(function(phoneNumber) {
              var number = phoneNumber.phoneNumber;
              return <div key={number}><input type='radio' name='phone' value={number}/>{phoneNumber.friendlyName}</div>
            })}
          </div>
          <br/>
          <button>Upgrade Account</button>
        </form>
      </div>
    );
  },

  getAvailPhoneNumbers: function(evt) {
    evt.preventDefault();
    var areacode = evt.target.querySelector('input').value;
    axios.get('/phone/available/' + areacode)
      .then(res => this.setState({availPhoneNumbers: res.data}))
  },

  buyPhoneNumber: function(evt) {
    evt.preventDefault();
    axios.post('/user/addphone', serialize(evt.target))
      .then(() => this.history.pushState(null, '/'));
  }
});