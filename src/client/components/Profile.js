var React   = require('react');
var axios   = require('axios');
var update  = require('react-addons-update');

module.exports = React.createClass({
  getInitialState: function() {
    return {orders: []};
  },
  render: function() {
    return (
      <div>
        <h2>Profile</h2>
        <form>
          <label>Address</label>
          <input/>
          <br/>
          <label>Address (line 2)</label>
          <input/>
          <br/>
          <label>City</label>
          <input/>
          <br/>
          <label>State</label>
          {stateSelect}
          <br/>
          <label>Zip Code</label>
          <input/>
          <br/>
          <br/>
          <label>Phone Number</label>
          <input/>
          <br/>
          <br/>
          <label>Open Hours</label>
          <br/>
          <table>
            <tr>
              <td><input type="checkbox" value=""/> monday</td>
              <td>from {hoursSelect} to {hoursSelect}</td>
            </tr>
            <tr>
              <td><input type="checkbox" value=""/> tuesday</td>
              <td>from {hoursSelect} to {hoursSelect}</td>
            </tr>
            <tr>
              <td><input type="checkbox" value=""/> wednesday</td>
              <td>from {hoursSelect} to {hoursSelect}</td>
            </tr>
            <tr>
              <td><input type="checkbox" value=""/> thursday</td>
              <td>from {hoursSelect} to {hoursSelect}</td>
            </tr>
            <tr>
              <td><input type="checkbox" value=""/> fridayy</td>
              <td>from {hoursSelect} to {hoursSelect}</td>
            </tr>
            <tr>
              <td><input type="checkbox" value=""/> saturday</td>
              <td>from {hoursSelect} to {hoursSelect}</td>
            </tr>
            <tr>
              <td><input type="checkbox" value=""/> sunday</td>
              <td>from {hoursSelect} to {hoursSelect}</td>
            </tr>
          </table>
          <br/>
          <br/>
          <label>Site</label>
          <input/>
          <br/>
          <br/>
          <button>Edit</button>
        </form>
      </div>
    );
  }
});

var stateSelect = (
  <select>
    <option></option>
    <option value="AL">Alabama</option>
    <option value="AK">Alaska</option>
    <option value="AZ">Arizona</option>
    <option value="AR">Arkansas</option>
    <option value="CA">California</option>
    <option value="CO">Colorado</option>
    <option value="CT">Connecticut</option>
    <option value="DE">Delaware</option>
    <option value="DC">District Of Columbia</option>
    <option value="FL">Florida</option>
    <option value="GA">Georgia</option>
    <option value="HI">Hawaii</option>
    <option value="ID">Idaho</option>
    <option value="IL">Illinois</option>
    <option value="IN">Indiana</option>
    <option value="IA">Iowa</option>
    <option value="KS">Kansas</option>
    <option value="KY">Kentucky</option>
    <option value="LA">Louisiana</option>
    <option value="ME">Maine</option>
    <option value="MD">Maryland</option>
    <option value="MA">Massachusetts</option>
    <option value="MI">Michigan</option>
    <option value="MN">Minnesota</option>
    <option value="MS">Mississippi</option>
    <option value="MO">Missouri</option>
    <option value="MT">Montana</option>
    <option value="NE">Nebraska</option>
    <option value="NV">Nevada</option>
    <option value="NH">New Hampshire</option>
    <option value="NJ">New Jersey</option>
    <option value="NM">New Mexico</option>
    <option value="NY">New York</option>
    <option value="NC">North Carolina</option>
    <option value="ND">North Dakota</option>
    <option value="OH">Ohio</option>
    <option value="OK">Oklahoma</option>
    <option value="OR">Oregon</option>
    <option value="PA">Pennsylvania</option>
    <option value="RI">Rhode Island</option>
    <option value="SC">South Carolina</option>
    <option value="SD">South Dakota</option>
    <option value="TN">Tennessee</option>
    <option value="TX">Texas</option>
    <option value="UT">Utah</option>
    <option value="VT">Vermont</option>
    <option value="VA">Virginia</option>
    <option value="WA">Washington</option>
    <option value="WV">West Virginia</option>
    <option value="WI">Wisconsin</option>
    <option value="WY">Wyoming</option>
  </select>
);

var hoursSelect = (
  <select>
    <option value="">00:00</option>
    <option value="">00:15</option>
    <option value="">00:30</option>
    <option value="">00:45</option>
    <option value="">01:00</option>
    <option value="">01:15</option>
    <option value="">01:30</option>
    <option value="">01:45</option>
    <option value="">02:00</option>
    <option value="">02:15</option>
    <option value="">02:30</option>
    <option value="">02:45</option>
    <option value="">03:00</option>
    <option value="">03:15</option>
    <option value="">03:30</option>
    <option value="">03:45</option>
    <option value="">04:00</option>
    <option value="">04:15</option>
    <option value="">04:30</option>
    <option value="">04:45</option>
    <option value="">05:00</option>
    <option value="">05:15</option>
    <option value="">05:30</option>
    <option value="">05:45</option>
    <option value="">06:00</option>
    <option value="">06:15</option>
    <option value="">06:30</option>
    <option value="">06:45</option>
    <option value="">07:00</option>
    <option value="">07:15</option>
    <option value="">07:30</option>
    <option value="">07:45</option>
    <option value="">08:00</option>
    <option value="">08:15</option>
    <option value="">08:30</option>
    <option value="">08:45</option>
    <option value="">09:00</option>
    <option value="">09:15</option>
    <option value="">09:30</option>
    <option value="">09:45</option>
    <option value="">10:00</option>
    <option value="">10:15</option>
    <option value="">10:30</option>
    <option value="">10:45</option>
    <option value="">11:00</option>
    <option value="">11:15</option>
    <option value="">11:30</option>
    <option value="">11:45</option>
    <option value="">12:00</option>
    <option value="">12:15</option>
    <option value="">12:30</option>
    <option value="">12:45</option>
    <option value="">13:00</option>
    <option value="">13:15</option>
    <option value="">13:30</option>
    <option value="">13:45</option>
    <option value="">14:00</option>
    <option value="">14:15</option>
    <option value="">14:30</option>
    <option value="">14:45</option>
    <option value="">15:00</option>
    <option value="">15:15</option>
    <option value="">15:30</option>
    <option value="">15:45</option>
    <option value="">16:00</option>
    <option value="">16:15</option>
    <option value="">16:30</option>
    <option value="">16:45</option>
    <option value="">17:00</option>
    <option value="">17:15</option>
    <option value="">17:30</option>
    <option value="">17:45</option>
    <option value="">18:00</option>
    <option value="">18:15</option>
    <option value="">18:30</option>
    <option value="">18:45</option>
    <option value="">19:00</option>
    <option value="">19:15</option>
    <option value="">19:30</option>
    <option value="">19:45</option>
    <option value="">20:00</option>
    <option value="">20:15</option>
    <option value="">20:30</option>
    <option value="">20:45</option>
    <option value="">21:00</option>
    <option value="">21:15</option>
    <option value="">21:30</option>
    <option value="">21:45</option>
    <option value="">22:00</option>
    <option value="">22:15</option>
    <option value="">22:30</option>
    <option value="">22:45</option>
    <option value="">23:00</option>
    <option value="">23:15</option>
    <option value="">23:30</option>
    <option value="">23:45</option>
  </select>
);