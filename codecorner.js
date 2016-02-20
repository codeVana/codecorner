Topics = new Mongo.Collection("topics");

Meteor.methods({
  postTopic: function (topicText) {
    /* add authentication here */
if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    
    Topics.insert({
      topicText: topicText,
      createdAt: new Date(),
      username: Meteor.user().username
    });
  }
});

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("topics", function () {
    return Topics.find({}, {sort: {createdAt: -1}, limit: 5});
  });
}

/* scrolling code */

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("topics");

  Template.body.helpers({
    recentTopics: function () {
      return Topics.find({}, {sort: {createdAt: 1}});
    },
  });

  /*events*/
  Template.body.events({
    "submit .new-topic": function (event) {
      var text = event.target.text.value;

      Meteor.call("postTopic", text);

      event.target.text.value = "";
      event.preventDefault();
    },
  });


  /*account config*/
   /*account config*/
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}