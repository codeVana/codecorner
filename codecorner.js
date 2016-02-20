Posts = new Mongo.Collection("posts");

if (Meteor.isClient) {

  Meteor.subscribe("posts");

  Router.configure({
  layoutTemplate: 'codecorner'
  });

  Router.route('/', function () {
    this.render('welcome', {
      to:"main"
    });
  });

  Router.route('/post', function () {
    this.render('postList');
  });



 
  Session.setDefault('counter', 0);


  Template.welcome.helpers({
    posts: function() {
      return Posts.find();
    },
    length: function() {
      return Posts.find().count();
    }
  });

  Template.postList.helpers({
    counter: function () {
      return Session.get('counter');
    },
    posts: function () {
      return Posts.find();
    }
  });

   Template.postList.events({
    'submit .new-post': function(event, template) {
        event.preventDefault();
        var title = event.target.title.value;
        var text = $('.summernote').summernote('code');
        Posts.insert({
          title: title,
          text: text,
          createdAt: new Date()
        });
    }
  });

   Template.postList.rendered = function () {
    $('.summernote').summernote({
      height: 200
    });
  };

}




if (Meteor.isServer) {
  Meteor.startup(function () {

  });

  Meteor.publish("posts", function () {
    return Posts.find({});
  });
}



