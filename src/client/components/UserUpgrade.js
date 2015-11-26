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
      <div className="upgrade-container">
        <h2 className="upgrade-header">Upgrade Your Account</h2>
        <h3 className="upgrade-header-step">Step 1 - Connect a stripe account</h3>
        <a className="btn btn-default stripe-btn" href={stripeUrl}>OAuth Stripe</a>       
        <h3 className="upgrade-header-step">Step 2 - Select a phone number</h3>
        <label className="area-code-text">Area Code:</label>
        <form onSubmit={this.getAvailPhoneNumbers}>
          <input className="form-control input-area-code"/>
          <button className="btn btn-default area-code-btn">Search</button>
        </form>
        <form onSubmit={this.buyPhoneNumber}>
          <div  className="area-phone-numbers">
            {this.state.availPhoneNumbers.map(function(phoneNumber) {
              var number = phoneNumber.phoneNumber;
              return <div key={number}><input type='radio' name='phone' value={number}/>{phoneNumber.friendlyName}</div>
            })}
          </div>
          <br/>
          <button className="btn btn-default upgrade-btn">Upgrade Account</button>
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