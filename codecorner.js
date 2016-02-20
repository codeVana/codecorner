if (Meteor.isClient) {
  // counter starts at 0


  Router.configure({
  layoutTemplate: 'codecorner'
  });

  Router.route('/', function () {
    this.render('welcome', {
      to:"main"
    });
  });

  Router.route('/post', function () {
    this.render('post');
  });

 
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


  Template.post.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

   Template.post.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

   Template.post.rendered = function () {
    $('.summernote').summernote({
      height: 100
    });
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}



