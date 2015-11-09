var renderPhones = function(numbers){
  var div = document.querySelector('.js-sample-phones');
  div.innerHTML = '';
  numbers.forEach(function(number){
    div.innerHTML += '<input type="radio" name="phone" value="' + number.phoneNumber + '">' + number.friendlyName + '</input>';
  });
};

var getAvailablePhones = function(areacode) { 
  fetch('/phone/available/' + areacode, {
    credentials: 'same-origin'
  })
    .then(function(response){
      return response.json();
    })
    .then(renderPhones)
    .catch(function(err){
      console.log(err, err.stack);
    });
};

document.querySelector('.js-find-phones').onclick = function(event) {
  event.preventDefault();
  var areacode = document.querySelector('.js-areacode').value;
  getAvailablePhones(areacode);
};

