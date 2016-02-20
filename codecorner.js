Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });

  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.codecorner.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.codecorner.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  Meteor.subscribe("rooms");
  Meteor.subscribe("messages");
  Session.setDefault("roomname", "Meteor");
  
  Template.rooms.events({
	'click .createRoom': function(e) {
	   _createRoom();
	}
  });

  Template.input.events({
    'click .sendMsg': function(e) {
       _sendMessage();
    },
    'keyup #msg': function(e) {
      if (e.type == "keyup" && e.which == 13) {
        _sendMessage();
      }
    }
  });


  _sendMessage = function() {
    var el = document.getElementById("msg");
    Messages.insert({user: Meteor.user().username, msg: el.value, ts: new Date(), room: Session.get("roomname")});
    el.value = "";
    el.focus();
  };
  
  _createRoom = function() {
    var el = document.getElementById("newroom");
	Rooms.insert({roomname: el.value});
    el.value = "";
    el.focus();
  };

  Template.messages.helpers({
    messages: function() {
      return Messages.find({room: Session.get("roomname")}, {sort: {ts: -1}});
    },
	roomname: function() {
      return Session.get("roomname");
    }
  });
  
  Template.message.helpers({
    timestamp: function() {
      return this.ts.toLocaleString();
    }
  });

  Template.rooms.events({
    'click li': function(e) {
      Session.set("roomname", e.target.innerText);
    }
  });
  
  Template.rooms.helpers({
    rooms: function() {
      return Rooms.find();
    }
  });
  
  Template.room.helpers({
	roomstyle: function() {
      return Session.equals("roomname", this.roomname) ? "font-weight: bold" : "";
    }
  });

  Template.chat.helpers({
    release: function() {
      return Meteor.release;
    }
  });

  Template.roominput.events({
    'click .createRoom': function(e) {
       _createRoom();
    }
  });

  _createRoom = function() {
    var el = document.getElementById("room-name");
    Rooms.insert(el.value);
    el.value = "";
    el.focus();
  };

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Rooms.find().count() === 0) {
	  // Create the default rooms when none are set up.
      ["Default"].forEach(function(r) {
        Rooms.insert({roomname: r});
      });
    }
  });
  
  Rooms.deny({
    insert: function (userId, doc) {
      return true;
    },
    update: function (userId, doc, fieldNames, modifier) {
      return true;
    },
    remove: function (userId, doc) {
      return true;
    }
  });
  Rooms.allow({
    insert: function (userId, doc) {
      return (userId !== null);
    }
  });
  Messages.deny({
    insert: function (userId, doc) {
      return (userId === null);
    },
    update: function (userId, doc, fieldNames, modifier) {
      return true;
    },
    remove: function (userId, doc) {
      return true;
    }
  });
  Messages.allow({
    insert: function (userId, doc) {
      return (userId !== null);
    }
  });
  
  Meteor.publish("rooms", function () {
    return Rooms.find();
  });
  Meteor.publish("messages", function () {
    return Messages.find({}, {sort: {ts: -1}});
  });
}
