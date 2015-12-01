var React     = require('react');
var axios     = require('axios');
var serialize = require('form-serialize');

module.exports = React.createClass({
  getInitialState: function() {
    return {business: {}, loaded: false, saveSuccess: false};
  },
  componentDidMount: function() {
    axios.get('/user').then(res => {
      this.setState({business: res.data, loaded: true});
    });
  },
  render: function() {
    var business = this.state.business;
    var hours = this.state.business.hours || {mon: {}, tue: {}, wed: {}, thur: {}, fri: {}, sat: {}, sun: {}};
    return (
      <div>
        {this.state.loaded ? (<div>
        <h2>Profile</h2>
        <form onSubmit={this.submitHandler}>
          <label>Address</label>
          <input name="address[street1]" defaultValue={business.address ? business.address.street1 : null}/>
          <br/>
          <label>Address (line 2)</label>
          <input name="address[stree2]" defaultValue={business.address ? business.address.street2 : null}/>
          <br/>
          <label>City</label>
          <input name="address[city]" defaultValue={business.address ? business.address.city : null}/>
          <br/>
          <label>State</label>
          {stateSelect(business.address ? business.address.state : null)}
          <br/>
          <label>Zip Code</label>
          <input name="address[zipCode]" defaultValue={business.address ? business.address.zipCode : null}/>
          <br/>
          <br/>
          <label>Phone Number</label>
          <input name="contactPhone" defaultValue={business.contactPhone}/>
          <br/>
          <br/>
          <label>Open Hours</label>
          <br/>
          <table>
            <tbody>
              <tr>
                <td><input type="checkbox" name="working[]" value=""/>monday</td>
                <td>from {hoursSelect(hours.mon.start || '09:00')} to {hoursSelect(hours.mon.end || '17:00')}</td>
              </tr>
              <tr>
                <td><input type="checkbox" name="working[]" value=""/>tuesday</td>
                <td>from {hoursSelect(hours.tue.start || '09:00')} to {hoursSelect(hours.tue.end || '17:00')}</td>
              </tr>
              <tr>
                <td><input type="checkbox" name="working[]" value=""/>wednesday</td>
                <td>from {hoursSelect(hours.wed.start || '09:00')} to {hoursSelect(hours.wed.end || '17:00')}</td>
              </tr>
              <tr>
                <td><input type="checkbox" name="working[]" value=""/>thursday</td>
                <td>from {hoursSelect(hours.thur.start || '09:00')} to {hoursSelect(hours.thur.end || '17:00')}</td>
              </tr>
              <tr>
                <td><input type="checkbox" name="working[]" value=""/>friday</td>
                <td>from {hoursSelect(hours.sat.start || '09:00')} to {hoursSelect(hours.sat.end || '17:00')}</td>
              </tr>
              <tr>
                <td><input type="checkbox" name="working[]" value=""/>saturday</td>
                <td>from {hoursSelect(hours.sun.start || '09:00')} to {hoursSelect(hours.sun.end || '17:00')}</td>
              </tr>
              <tr>
                <td><input type="checkbox" name="working[]" value=""/>sunday</td>
                <td>from {hoursSelect(hours.mon.start || '09:00')} to {hoursSelect(hours.mon.end || '17:00')}</td>
              </tr>
            </tbody>
          </table>
          <br/>
          <br/>
          <label>Site</label>
          <input name="site" value={business.site}/>
          <br/>
          <br/>
          <button>Save</button>{this.state.saveSuccess ? "You saved!" : null}
        </form>
        </div>) : null }
      </div>
    );
  },
  submitHandler: function(evt) {
    evt.preventDefault();
    axios.put('/user', serialize(evt.target, {json: true})).then(() => {
      this.setState({saveSuccess: true});
    });
  }
});

var stateSelect = selected => {
  return (
    <select name="address[state]" defaultValue={selected}>
      {STATES.map(state => <option key={state[0]} value={state[0]}>{state[1]}</option>)}
    </select>
  );
};

var hoursSelect = (selected) => {
  return (
    <select defaultValue={selected}>
      {TIMES.map(time => <option key={time} value={time}>{time}</option>)}
    </select>
  );
};

var STATES = [
  ["", ""],
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "District Of Columbia"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"]
];

var TIMES = [
  "00:00",
  "00:15",
  "00:30",
  "00:45",
  "01:00",
  "01:15",
  "01:30",
  "01:45",
  "02:00",
  "02:15",
  "02:30",
  "02:45",
  "03:00",
  "03:15",
  "03:30",
  "03:45",
  "04:00",
  "04:15",
  "04:30",
  "04:45",
  "05:00",
  "05:15",
  "05:30",
  "05:45",
  "06:00",
  "06:15",
  "06:30",
  "06:45",
  "07:00",
  "07:15",
  "07:30",
  "07:45",
  "08:00",
  "08:15",
  "08:30",
  "08:45",
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
  "10:45",
  "11:00",
  "11:15",
  "11:30",
  "11:45",
  "12:00",
  "12:15",
  "12:30",
  "12:45",
  "13:00",
  "13:15",
  "13:30",
  "13:45",
  "14:00",
  "14:15",
  "14:30",
  "14:45",
  "15:00",
  "15:15",
  "15:30",
  "15:45",
  "16:00",
  "16:15",
  "16:30",
  "16:45",
  "17:00",
  "17:15",
  "17:30",
  "17:45",
  "18:00",
  "18:15",
  "18:30",
  "18:45",
  "19:00",
  "19:15",
  "19:30",
  "19:45",
  "20:00",
  "20:15",
  "20:30",
  "20:45",
  "21:00",
  "21:15",
  "21:30",
  "21:45",
  "22:00",
  "22:15",
  "22:30",
  "22:45",
  "23:00",
  "23:15",
  "23:30",
  "23:45"
];