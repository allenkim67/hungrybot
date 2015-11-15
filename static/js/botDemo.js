document.querySelector('.js-demo-form').addEventListener('submit', function(evt) {
  evt.preventDefault();
  var messagesContainer = document.querySelector('.js-demo-messages');
  messagesContainer.innerHTML += '<div>' + document.querySelector('.js-demo-input').value + '</div>';

  fetch('/bot?message=' + document.querySelector('.js-demo-input').value, {credentials: 'same-origin'})
    .then(function(response) {
      return response.text();
    })
    .then(function(response) {
      messagesContainer.innerHTML += '<div>' + response + '</div>';
    });

  document.querySelector('.js-demo-input').value = '';
});