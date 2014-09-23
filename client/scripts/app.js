// YOUR CODE HERE:

var Message = Backbone.Model.extend({
  initialize: function(){
    this.view = new MessageView(this);
    this.trigger('change');
  }
});

var Messages = Backbone.Collection.extend({
  model: Message
});

var messages = new Messages();

var MessageView = Backbone.View.extend({
  tagName: 'div',
  initialize: function(model){
    this.render(model);
  },
  render: function(model){
    var $user = $('<a href="#" class="username" onclick="this.addFriend();"></a>')
    this.$el.text(' ' + model.get('text'));
    $user.text(model.get('username'));
    this.$el.prepend($user);
    $('#chats').prepend(this.$el);
  }
})

var Room = Backbone.Model.extend({
  initialize: function(){
    var $room = $('<li></li>');
    var $roomLink = $('<a href="#"></a>');
    $roomLink.text(this.get('room'));
    $room.append($roomLink);
    $('#roomSelect').append($room);
    $roomLink.click(function(e){
      e.preventDefault();
      app.enterRoom(this.get('room'));
    })
  }
})

var Rooms = Backbone.Collection.extend({
  model: Room
})

var rooms = new Rooms();

var App = Backbone.Model.extend({
  initialize: function(){
    this.set('rooms',{});
    this.set('server','https://api.parse.com/1/classes/chatterbox');
    this.set('mostRecent','2011-08-20T02:06:57.931Z');
    this.set('filters',{});
    this.set('currentRoom',undefined);
  }
});

var AppMethods = {
  send: function(message){
    $.ajax({
      url: this.get('server'),
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      context: this,
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
      url: this.get('server'),
      type: 'GET',
      context: this,
      contentType: 'application/json',
      data: {
        'where': JSON.stringify({
          'updatedAt': {
            '$gt': {
              '__type': 'Date',
              'iso': this.get('mostRecent')
            }
          }
        }),
        'order': '-updatedAt',
        'limit': 100
      },
      success: function (data) {
        if (data.results.length > 0) {
          this.set('mostRecent', data.results[0].updatedAt);
          for (var i = data.results.length - 1; i >= 0; i--) {
            messages.add(new Message({
              username: data.results[i].username,
              text: data.results[i].text,
              room: data.results[i].room
            }));
            if (data.results[i].room && !rooms.findWhere({room: data.results[i].room})){
              rooms.add(new Room({
                room: data.results[i].room
              }));
            }
          }
        }
      },
      error: function (data) {
        console.error('chatterbox: Failed to fetch message');
      },
      complete: function (data) {
        setTimeout(this.fetch.bind(this), 1000);
      }
    });
  },
  clearMessages: function(){
    $('#chats').html('');
  },
  enterRoom: function(room){
    this.get('filters').room = room;
    this.set('currentRoom', room);
    this.refresh();
    if(room === undefined){
      $('.go-back').toggle(false);
    } else{
      $('.go-back').toggle(true);
    }
  },
  handleSubmit: function(){
    this.send({
      username: $('#username').val(),
      text: $('#message').val(),
      room: this.get('currentRoom')
    })
  },
  refresh: function(){
    this.clearMessages();
    for (var i = 0; i < this.get('messages').length; i++) {
      this.addMessage(this.get('messages')[i]);
    }
  }
}

var app = new App();
_.extend(app, AppMethods);

// var appView = Backbone.View.extend({

// });

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

  Object.observe(app.get('rooms'), function(changes){
    changes.forEach(function(change) {
      if (change.type === 'add') {
        app.addRoom(app.get('rooms')[change.name]);
      }
    });
  });

  app.fetch();

})

