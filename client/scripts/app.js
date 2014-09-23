// YOUR CODE HERE:
var app = {
  messages: [],
  rooms: {},
  server: 'https://api.parse.com/1/classes/chatterbox',
  mostRecent: '2011-08-20T02:06:57.931Z',
  filters: {},
  currentRoom: undefined,
  init: function(){},
  send: function(message){
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message');
      }
    });
  },
  fetch: function(){
    $.ajax({
      url: app.server,
      type: 'GET',
      contentType: 'application/json',
      data: {
        'where': JSON.stringify({
          'updatedAt': {
            '$gt': {
              '__type': 'Date',
              'iso': app.mostRecent
            }
          }
        }),
        'order': '-updatedAt',
        'limit': 100
      },
      success: function (data) {
        if (data.results.length > 0) {
          app.mostRecent = data.results[0].updatedAt;
          for (var i = data.results.length - 1; i >= 0; i--) {
            app.messages.push(data.results[i]);
            if (data.results[i].room){
              app.rooms[data.results[i].room] = data.results[i].room;
            }
          };
        }
      },
      error: function (data) {
        console.error('chatterbox: Failed to fetch message');
      },
      complete: function (data) {
        setTimeout(app.fetch, 1000);
      }
    });
  },
  clearMessages: function(){
    $('#chats').html('');
  },
  addMessage: function(data){
    for (var filter in app.filters) {
      if (data[filter] !== app.filters[filter]) {
        return;
      }
    }
    var $message = $('<div></div>');
    var $user = $('<a href="#" class="username" onclick="app.addFriend();"></a>')
    $message.text(' ' + data.text);
    $user.text(data.username);
    $message.prepend($user);
    $('#chats').prepend($message);
  },
  addRoom: function(room){
    var $room = $('<li></li>');
    var $roomLink = $('<a href="#"></a>');
    $roomLink.text(room);
    $room.append($roomLink);
    $('#roomSelect').append($room);
    $roomLink.click(function(e){
      e.preventDefault();
      app.enterRoom(room);
    })
  },
  enterRoom: function(room){
    app.filters.room = room;
    app.currentRoom = room;
    app.refresh();
    if(room === undefined){
      $('.go-back').toggle(false);
    } else{
      $('.go-back').toggle(true);
    }
  },
  addFriend: function(){
    // Nothing
  },
  handleSubmit: function(){
    app.send({
      username: $('#username').val(),
      text: $('#message').val(),
      room: app.currentRoom
    })
  },
  refresh: function(){
    app.clearMessages();
    for (var i = 0; i < app.messages.length; i++) {
      app.addMessage(app.messages[i]);
    }
  }
};

$(document).ready(function(){

  $('#send').submit(function(e){
    e.preventDefault();
    app.handleSubmit();
  });

  $('#createRoom').submit(function(e){
    e.preventDefault();
    var room = $('#room').val();
    app.rooms[room] = room;
  });

  $('.go-back').click(function(e){
    e.preventDefault();
    app.enterRoom(undefined);
  })

  Object.observe(app.messages, function(changes){
    changes.forEach(function(change) {
      if (change.type === 'add') {
        app.addMessage(app.messages[change.name]);
      }
    });
  });

  Object.observe(app.rooms, function(changes){
    changes.forEach(function(change) {
      if (change.type === 'add') {
        app.addRoom(app.rooms[change.name]);
      }
    });
  });

  app.fetch();

})

