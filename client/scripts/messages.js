var Message = Backbone.Model.extend({
  //Sets the view property for this Message model to a new MessageView
  initialize: function(){
    this.view = new MessageView({
      model: this
    });
  }
});

var Messages = Backbone.Collection.extend({
  model: Message,
  filter: undefined,

  //Adds message to this collection
  addMessage: function(message){
    this.add(new Message({
      username: message.username,
      text: message.text,
      room: message.room
    }));
  },

  //Clears all the messages from the html
  clearMessages: function(){
    $('#chats').html('');
  },

  //Clears the html and re-renders each message
  refresh: function(){
    this.clearMessages();

    app.messages.forEach(function(message){
      message.view.render();
    });
  }
});

var MessageView = Backbone.View.extend({
  tagName: 'div',
  initialize: function(){
    this.render();
  },

  //If there is no filter, or if the model's room matches the filter, adds the message to the html
  render: function(){
    if (app.messages.filter === undefined || this.model.get('room') === app.messages.filter){
      var $user = $('<a href="#" class="username" onclick="this.addFriend();"></a>')
      this.$el.text(' ' + this.model.get('text'));
      $user.text(this.model.get('username'));
      this.$el.prepend($user);
      $('#chats').prepend(this.$el);
    }
  }
})
