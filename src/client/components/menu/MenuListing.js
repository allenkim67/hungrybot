var React     = require('react');
var axios     = require('axios');
var serialize = require('form-serialize');

module.exports = React.createClass({
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