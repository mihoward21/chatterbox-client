var Room = Backbone.Model.extend({
  //Sets the view property for this Room model to a new RoomView
  initialize: function(){
    this.view = new RoomView({
      model: this
    });
  },
})

var Rooms = Backbone.Collection.extend({
  model: Room,

  //If roomName is not in this collection, add a new Room model with roomName
  addRoom: function(roomName){
    if (!this.findWhere({room: roomName})) {
      this.add(new Room({
        room: roomName
      }));
    }
  }
})

var RoomView = Backbone.View.extend({
  tagName: 'li',
  initialize: function(){
    this.render();
  },

  //Adds the new room to the html and gives it a click handler
  render: function(){
    var $roomLink = $('<a href="#"></a>');
    $roomLink.text(this.model.get('room'));
    this.$el.append($roomLink);
    $('#roomSelect').append(this.$el);

    $roomLink.click(function(e){
      e.preventDefault();
      app.enterRoom(this.model.get('room'));
    }.bind(this));

  }
})
