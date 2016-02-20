Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");
Corner = new Mongo.Collection("instructables")
//Posts = new Mongo.Collection("posts");

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });
  Meteor.subscribe("corner");
  Router.configure({
    layoutTemplate: 'ApplicationLayout'
  	});

  	Router.route('/', function () {
    	this.render('welcome', {
      	to:"splash"
    	});
  	});

    Router.route('/codecorner/', function () {
      this.render('navbar', {
        to:"navbar"
      });
      this.render('codecornersplash', {
        to:"splash",
      });
      this.render('codecorner_list', {
        to:"main"
      });
    });

  	Router.route('/codecorner/chat', function () {
    	this.render('navbar', {
      	to:"navbar"
    	});
    	this.render('codecornersplash', {
      	to:"splash"
    	});
      this.render('chatwindow', {
        to: "chat"
      });
  	});

    Router.route('/codecorner/:_id', function () {
      this.render('navbar', {
        to:"navbar"
      });
      this.render('', {
      	to:"splash"
    	});
      this.render('codecorner_item_details', {
        to:"main",
        data:function(){
          return Corner.findOne({_id:this.params._id});
        }
      });
      this.render('chatwindow', {
        to: "chat"
      });
    });

  Template.codecornersplash.rendered = function() {
    $('.parallax').parallax();
  };

  Template.codecorner_item_details.rendered = function() {
    $('.carousel').carousel();
  };

  Template.codecorner_list.helpers({
		codecorners:function(){
			return Corner.find({}, {sort: {upscore: -1}});
		}
	});

  Template.codecorner_item.helpers({
		momentdate: function() {
			var website_id = this._id;
	    var corner = Corner.findOne({_id:website_id});
			console.log(moment(website.createdOn).format());
			return moment(corner.createdOn).format("dddd, MMMM Do YYYY, h:mm:ss a");
		}
	});
	/////
	// template events
	/////

	Template.codecorner_item.events({
		"click .js-upvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			Meteor.call("addUpVote", website_id);
			return false;// prevent the button from reloading the page
		},
		"click .js-downvote":function(event){

			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			Meteor.call("addDownVote", website_id);
			return false;// prevent the button from reloading the page
		}
	});


  Meteor.subscribe("rooms");
  Meteor.subscribe("messages");

  Session.setDefault("roomname", "Default");

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

  Template.chatwindow.helpers({
    currentUser: function() {
      return Meteor.userId();
    },
    release: function() {
      return Meteor.release;
    }
  });
/*
  Template.roominput.events({
    'click .createRoom': function(e) {
       _createRoom();
    }
  });
*/
  _createRoom = function() {
    var el = document.getElementById("room-name");
    Rooms.insert(el.value);
    el.value = "";
    el.focus();
  };
  Meteor.subscribe("posts");


  Router.route('/posts', function () {
    this.render('navbar', {
      to:"navbar"
    });
    this.render('welcomepost', {
      to:"main"
    });
  });

  Router.route('/post', function () {
    this.render('navbar', { to: "navbar" });
    this.render('postList', { to: "main" });
  });




  Session.setDefault('counter', 0);

  Template.codecorner_item.helpers({
    nextChatEmpty: function() {
      return !this.nextChat || this.nextChat == 'Not available';
    }
  });


  Template.welcomepost.helpers({
    posts: function() {
      return Posts.find();
    },
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
        var description = $('.summernote').summernote('code');
        Corner.insert({
  			title:title,
//  			url:url,
        img:"https://pbs.twimg.com/profile_images/2266463001/bntsgwxu124en7h8pmhz_400x400.jpeg",
//        video:video,
  			description:description,
  			owner: Meteor.userId(),
        username: Meteor.user().username,
  			downscore: 0,upscore: 0,
  			createdOn:new Date()
  		  });
        Router.go('/codecorner');
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
    Meteor.methods({
  		addCorner: function(title, url, description, img, video) {
  			if (! Meteor.userId()) {
  	 		throw new Meteor.Error("not-authorized");
   			}
  			Corner.insert({
  			title:title,
  			url:url,
        img:img,
        video:video,
  			description:description,
  			owner: Meteor.userId(),
        username: Meteor.user().username,
  			downscore: 0,upscore: 0,
  			createdOn:new Date()
  		  });
  		},
  		addUpVote: function(corner_id) {
  			Corner.update(corner_id, {$inc: {upscore: 1}});
  		},
  		addDownVote: function(corner_id) {
  			Corner.update(corner_id, {$inc: {downscore: 1}});
  		}
  	});
  	 Meteor.publish("corner", function() {
  	    return Corner.find();
  	 });

     if (!Corner.findOne()){
     	console.log("No Code Corners yet. Creating starter data.");
     	  Corner.insert({
          nextChat: '12:00 PT',
     		title:"Chick Tech",
     		url:"http://www.chicktech.org",
        img:"https://pbs.twimg.com/profile_images/2266463001/bntsgwxu124en7h8pmhz_400x400.jpeg",
        category:"Tech",
     		description:"ChickTech is dedicated to retaining women in the technology workforce and increasing the number of women and girls pursuing technology-based careers",
 				downscore: 0,upscore: 0,
     		createdOn:new Date()
     	});
     	 Corner.insert({
        nextChat: '12:05 PT',
     		title:"Games for Girls",
     		url:"http://girlsmakegames.com",
        img:"https://fortunedotcom.files.wordpress.com/2015/07/alexa-cafe.jpg?quality=80&w=840&h=485&crop=1",
        category:"Art",
     		description:"Girls Make Games is a series of international summer camps, workshops and game jams designed to inspire the next generation of designers, creators, and engineers.",
 				downscore: 0, upscore: 0,
     		createdOn:new Date()
     	});
     	 Corner.insert({
        nextChat: 'Not available',
     		title:"Girl Start",
     		url:"http://www.girlstart.org",
        img:"http://www.girlstart.org/images/stories/gsPhotos/photo_1.jpg",
        category:"Science",
     		description:"Girlstart's mission is to increase girls’ interest and engagement in STEM through innovative, nationally-recognized informal STEM education programs.",
 				upscore: 0,
 				downscore: 0,
     		createdOn:new Date()
     	});
      Corner.insert({
        nextChat: 'Not available',
        title:"Apps for Girls",
        url:"http://www.appinventor.org",
        img:"http://c8.alamy.com/comp/CYXW7E/girls-at-a-technocamp-app-inventor-workshop-for-16-18-year-old-students-CYXW7E.jpg",
        category:"Tech",
        description: "AppInventor.org is a site for learning and teaching how to program mobile apps with MIT's App Inventor. These tutorials are refined versions of the tutorials that have been on the Google and MIT App Inventor sites from App Inventor's inception-- thousands of beginners have used them to learn programming and learn App Inventor.",
        upscore: 0,
        downscore: 0,
        createdOn: new Date()
      });
    }


    if (Rooms.find().count() === 0) {
	  // Create the default rooms when none are set up.
      ["Default"].forEach(function(r) {
        Rooms.insert({roomname: r});
      });
    }
  });

  Rooms.deny({
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

  Meteor.publish("posts", function () {
    return Posts.find({});
  });
}
