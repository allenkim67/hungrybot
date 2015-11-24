$("#guest-message-demo").on('submit', function(evt) {
  evt.preventDefault();
  var guestMessage = $("#chat-box").val();
  var chatDiv = $(".chat-div");
  $(".chat-text").append('<div class="clear chat"></div><div class="from-me chat"><p>' + guestMessage + '</p></div>');
  $("#chat-box").val(''); 
  chatDiv.scrollTop(chatDiv[0].scrollHeight);

  $.get('/bot?message=' + guestMessage, function(botResponse) {
    $(".chat-text").append('<div class="clear chat"></div><div class="from-them chat"><p>' + botResponse + '</p></div>');
    chatDiv.scrollTop(chatDiv[0].scrollHeight);  
  });
})

$(".subscribe-btn").on('submit', function(evt) {
  evt.preventDefault();
  var subscribeName =  $("subscribe-box-name").val();
  var subscribeEmail =  $("subscribe-box-email").val();  
  $.post('/subscribe', )
  $("subscribe-box-name").val('');
  $("subscribe-box-email").val('');  
})