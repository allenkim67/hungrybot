var React     = require('react');
var axios     = require('axios');
var serialize = require('form-serialize');
var _         = require('underscore');
var update    = require('react-addons-update');

var MenuItemListing = React.createClass({
  getInitialState: function() {
    return {errors: []};
  },
  render: function() {
    return (
      <div>
        {this.state.errors.length ? (
          <ul>
            {this.state.errors.map(function(err) {
              return <li>{err.msg}</li>
            })}
          </ul>
        ) : null}
        {this.props.menuItem.editMode ? this.renderMenuEdit() : this.renderMenuItem()}  
      </div>
    );
  },
  renderMenuItem: function() {
    return (
      <div key={this.props.menuItem._id}>
        <ul>
          <li>Name: {this.props.menuItem.name}</li>
          <li>Description: {this.props.menuItem.description}</li>
          <li>Price: {(this.props.menuItem.price/100).toFixed(2)}</li>
        </ul>
        <button onClick={this.toggleEditMode}>Edit</button>
        <button onClick={this.deleteMenu}>Delete</button>
      </div>
    );
  },
  renderMenuEdit: function() {
    return (
      <form key={this.props.menuItem._id} onSubmit={this.saveEdit}>
        <ul>
          <li>Name:
            <input name="name" defaultValue={this.props.menuItem.name}/>
          </li>
          <li>Description:
            <input name="description" defaultValue={this.props.menuItem.description}/>
          </li>
          <li>Price:
            <input name="price" defaultValue={(this.props.menuItem.price/100).toFixed(2)}/>
          </li>
        </ul>
        <button>Save</button>
        <button onClick={this.toggleEditMode}>Cancel</button>
      </form>
    )
  },
  deleteMenu: function() {
    axios.delete('/menu/delete/' + this.props.menuItem._id).then(() => {
      this.props.removeMenu(this.props.menuItem);
    });
  },
  saveEdit: function(evt) {
    evt.preventDefault();
    axios.put('/menu/update/' + this.props.menuItem._id, serialize(evt.target))
      .then(res => {
        this.props.replaceMenu(this.props.menuItem, res.data);
        this.setState({errors: []});
      })
      .catch(res => {
        this.setState({errors: res.data});
      })
  },
  toggleEditMode: function(evt) {
    evt.preventDefault();
    this.props.toggleEditMode(this.props.menuItem);
    this.setState({errors: []});
  }
});

module.exports = React.createClass({
  getInitialState: function() {
    return {menuItems: [], errors: []}
  },
  componentDidMount: function() {
    axios.get('/menu').then(res => {
      this.setState({menuItems: res.data});
    });
  },
  render: function() {
    return (
      <div>
        {this.renderNewMenuForm()}
        <h2>Menu:</h2>
        {this.state.menuItems.length ? null : '(You have no menu items yet.)'}
        {this.state.menuItems.map(menuItem => {
          return <MenuItemListing menuItem={menuItem}
                                  toggleEditMode={this.toggleEditMode}
                                  removeMenu={this.removeMenu}
                                  replaceMenu={this.replaceMenu}/>
        })}
      </div>
    );
  },
  renderNewMenuForm: function() {
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
        this.setState({
          menuItems: this.state.menuItems.concat(res.data),
          errors: {}
        });
        evt.target.reset();
      })
      .catch(res => {
        this.setState({errors: res.data});
      });
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
  }
});