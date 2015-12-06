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
      <div className="menu-item-list" key={this.props.menuItem._id}>
        <ul className="menu-item">
          <li><strong>Name: </strong>{this.props.menuItem.name}</li>
          <li><strong>Synonyms: </strong><br/>{this.props.menuItem.synonyms.join(', ')}</li>
          <li><strong>Description: </strong><br/>{this.props.menuItem.description}</li>
          <li><strong>Price: </strong>{(this.props.menuItem.price/100).toFixed(2)}</li>
        </ul>
      <div className="menu-btns"> 
        <button className="btn btn-default menu-btn" onClick={this.toggleEditMode}>Edit</button>
        <button className="btn btn-default menu-btn" onClick={this.deleteMenu}>Delete</button>
      </div>
      </div>
    );
  },
  renderMenuEdit: function() {
    return (
      <form key={this.props.menuItem._id} onSubmit={this.saveEdit}>
        <div className="menu-item-list">
          <ul className="menu-item">
            <li><strong>Name: </strong>
              <input className="chat-form form-control" name="name" defaultValue={this.props.menuItem.name}/>
            </li>
            <li><strong>Synonyms: </strong>
              <input className="chat-form form-control" name="synonyms" defaultValue={this.props.menuItem.synonyms.join(', ')}/>
            </li>
            <li><strong>Description: </strong>
              <input className="chat-form form-control" name="description" defaultValue={this.props.menuItem.description}/>
            </li>
            <li><strong>Price: </strong>
              <input className="chat-form form-control" name="price" defaultValue={(this.props.menuItem.price/100).toFixed(2)}/>
            </li>
          </ul>
        <div className="menu-edit-btns">  
          <button className="btn btn-default">Save</button>
          <button className="btn btn-default" onClick={this.toggleEditMode}>Cancel</button>
        </div>
        </div>
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