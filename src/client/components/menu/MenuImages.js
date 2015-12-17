var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        {this.props.businessMenuImages.map((image) => <div key={image}> <img src={"https://hungrybot.s3.amazonaws.com/img/"+image} /> </div>)}
      </div>
    )
  },

});