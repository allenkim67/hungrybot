var React     = require('react');
var Dropzone  = require('react-dropzone');
var axios     = require('axios');

module.exports = React.createClass({
  getInitialState: function() {
    return {files: []}
  },

  render: function () {
    return (
        <div>
          <Dropzone ref="dropzone" onDrop={this.onDrop}>
              <div>Try dropping some files here, or click to select files to upload.</div>
          </Dropzone>
          {this.state.files.length > 0 ? <div>
          <h2>Uploading {this.state.files.length} files...</h2>
          <div>{this.state.files.map((file) => <img src={file.preview} /> )}</div>
          </div> : null}
        </div>
        )
  },

  onDrop: function (files) {
    var data = new FormData();

    files.forEach(function(file) {
      data.append('menuImage', file);
    });

    axios.post('menu/upload', data)
    this.setState({
      files: files
    });
  },

  onOpenClick: function () {
    this.refs.dropzone.open();
  }

});

