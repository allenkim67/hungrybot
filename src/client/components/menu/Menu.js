var React       = require('react');
var axios       = require('axios');
var serialize   = require('form-serialize');
var _           = require('underscore');
var update      = require('react-addons-update');
var NewMenuForm = require('./NewMenuForm');
var MenuListing = require('./MenuListing');
var MenuUpload  = require('./MenuUpload');
var MenuImages  = require('./MenuImages');

module.exports = React.createClass({
  getInitialState: function() {
    return {menuItems: [], businessMenuImages: []}
  },
  componentDidMount: function() {
    var that = this;
    axios.all([
      axios.get('/menu'),
      axios.get('/user')
      ])
    .then(axios.spread(function(menu, business) {
      console.log(menu.data, business.data)
      return that.setState({menuItems: menu.data, businessMenuImages: business.data})
    }));
  },
  render: function() {
    return (
      <div>
        <MenuUpload />
        <NewMenuForm addMenu={this.addMenu}/>
        <h2 className="menu-header">Menu:</h2>
        <div className="menu-listing"> 
          {this.state.menuItems.length ? null : '(You have no menu items yet.)'}
          {this.state.menuItems.map(menuItem => {
            return <MenuListing key={menuItem._id}
                                menuItem={menuItem}
                                toggleEditMode={this.toggleEditMode}
                                removeMenu={this.removeMenu}
                                replaceMenu={this.replaceMenu}/>
          })}
        </div>
      </div>
    );
  },
  toggleEditMode: function(menuItem) {
    var idx = _.findIndex(this.state.menuItems, stateMenuItem => stateMenuItem._id === menuItem._id);
    var menuItems =  update(this.state.menuItems, {$apply: function(menuItems) {
      menuItems[idx].editMode = !menuItems[idx].editMode;
      return menuItems;
    }});
    this.setState({menuItems: menuItems});
  },
  removeMenu: function(menuItem) {
    var menuItems = update(this.state.menuItems, {$apply: function(menuItems) {
      return _.without(menuItems, menuItem);
    }});
    this.setState({menuItems: menuItems});
  },
  replaceMenu: function(menuItem, newMenuItem) {
    var idx = _.findIndex(this.state.menuItems, stateMenuItem => stateMenuItem._id === menuItem._id);
    var menuItems = update(this.state.menuItems, {$apply: function(menuItems) {
      menuItems.splice(idx, 1, newMenuItem);
      return menuItems;
    }});
    this.setState({menuItems: menuItems});
  },
  addMenu: function(menuItem) {
    this.setState({
      menuItems: this.state.menuItems.concat(menuItem)
    });
  }

});