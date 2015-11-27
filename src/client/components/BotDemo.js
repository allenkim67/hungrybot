var React = require('react');
var axios = require('axios');

module.exports = React.createClass({
  getInitialState: function() {
    return {messages: []}
  },
  render: function() {
    return (
      <div>
        <h2 className="bot-header">Bot Demo</h2>
        <div className="chat-box">
          {this.state.messages.map(function(message) {
            return <div dangerouslySetInnerHTML={{__html: message}}></div>;
          })}
        </div>
        <form onSubmit={this.submitMessage}>
          <input className="chat-form form-control chat-input" autoComplete="off"/>
          <button className="btn btn-primary chat-btn">Send</button>
        </form>
      </div>
    );
  },
  submitMessage: function(evt) {
    evt.preventDefault();
    var input = evt.target.querySelector('input');

    var message = input.value;
    this.setState({messages: this.state.messages.concat(message)});

    axios.get('/bot/private?message=' + message).then(res => {
      this.setState({messages: this.state.messages.concat(res.data)});
    });

    input.value = '';
  }
});