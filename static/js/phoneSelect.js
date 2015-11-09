var renderPhones = function(numbers){
  var div = document.querySelector('.js-sample-phones');
  div.innerHTML = '';
  numbers.forEach(function(number){
    div.innerHTML += '<input type="radio" name="phone" value="' + number.phoneNumber + '">' + number.friendlyName + '</input>';
  });
};

var getAvailablePhones = function(areacode) { 
  fetch('/phone/available/' + areacode)
    .then(function(response){
      return response.json();
    })
    .then(renderPhones);
};

document.querySelector('.js-find-phones').onclick = function(event) {
  event.preventDefault();
  var areacode = document.querySelector('.js-areacode').value;
  getAvailablePhones(areacode);
};

