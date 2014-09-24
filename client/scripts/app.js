var App = Backbone.Model.extend({
  //Sets the initial property values and kicks off the message fetching
  initialize: function(){
    this.set('server','https://api.parse.com/1/classes/chatterbox');
    this.set('mostRecent','2011-08-20T02:06:57.931Z');
    this.set('currentRoom',undefined);
    this.fetch();
  },

  //Sends the given message to the server url
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

  //Pulls in the data from the server url and recalls itself after 1 second. If successful, adds new messages and new rooms
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
            app.messages.addMessage(data.results[i]);
            if (data.results[i].room){
              app.rooms.addRoom(data.results[i].room);
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

  //Sets the filter to the current room and refreshes the message view
  enterRoom: function(room){
    app.messages.filter = room;
    app.set('currentRoom', room);
    app.messages.refresh();
    if(room === undefined){
      $('.go-back').toggle(false);
    } else{
      $('.go-back').toggle(true);
    }
  },

  //Calls the send method using the data gathered from the input fields and the currentRoom property
  handleSubmit: function(){
    this.send({
      username: $('#username').val(),
      text: $('#message').val(),
      room: this.get('currentRoom')
    })
  }

});

var app = new App();
app.rooms = new Rooms();
app.messages = new Messages();

$(document).ready(function(){

  $('#send').submit(function(e){
    e.preventDefault();
    app.handleSubmit();
  });

  $('#createRoom').submit(function(e){
    e.preventDefault();
    app.rooms.addRoom($('#room').val());
  });

  $('.go-back').click(function(e){
    e.preventDefault();
    app.enterRoom(undefined);
  })

})
