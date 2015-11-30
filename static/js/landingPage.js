$("#guest-message-demo").on('submit', function(evt) {
  evt.preventDefault();
  var guestMessage = $("#chat-box").val();
  var chatDiv = $(".chat-div");
  $(".chat-text").append('<div class="clear chat"></div><div class="from-me chat"><p>' + guestMessage + '</p></div>');
  $("#chat-box").val(''); 
  chatDiv.scrollTop(chatDiv[0].scrollHeight);

  $.get('/bot/public?message=' + guestMessage, function(botResponse) {
    $(".chat-text").append('<div class="clear chat"></div><div class="from-them chat"><p>' + botResponse + '</p></div>');
    chatDiv.scrollTop(chatDiv[0].scrollHeight);  
  });
})

$(".js-subscribe-form").on('submit', function(evt) {
  evt.preventDefault();
  var subscribeName =  $("#js-subscribe-box-name").val();
  var subscribeEmail =  $("#js-subscribe-box-email").val();
  $.post('/subscriber', {name: subscribeName, email: subscribeEmail});
  $("#js-subscribe-box-name").val('');
  $("#js-subscribe-box-email").val('');
})