var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var each = require('foreach');
var multer = require('multer');
var crypto= require('crypto');
var mime = require('mime-types');
var jwt = require('jsonwebtoken');
var notifier = require('node-notifier');
var nodemailer = require("nodemailer");
var fs = require('fs');
var moment = require('moment');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {wsEngine: 'ws'});
var port = process.env.PORT || 3000;
var maxSize = 2 * 1000 * 1000 ;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if(file.mimetype == 'image/jpeg'){
      cb(null, 'public/uploads/profileimages/')
    }
    else{
      if(file.mimetype == 'image/jpg'){
        cb(null, 'public/uploads/profileimages/')
      }else{
        if(file.mimetype == 'image/gif'){
          cb(null, 'public/uploads/profileimages/')
        }else{
          if(file.mimetype == 'image/png'){
            cb(null, 'public/uploads/profileimages/')
          }else{
            var profileerrfile= 'This file is not allowed'  
            return profilefileerr(profileerrfile);
          } 
        }
      }
    }
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(4, function (err, raw) {
      cb(null,  raw.toString('hex') + file.originalname);
    });
  }
});


var attachmentstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if(file.mimetype === 'application/javascript'){
      var errfile= 'Script file is not allowed'  
      return fileerr(errfile);
    } else {
      if(file.mimetype === 'application/octet-stream'){
        var errfile= 'JSON file is not allowed'  
        return fileerr(errfile);
      }else{
        cb(null, 'public/uploads/attachments/');              
      }
    }
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(4, function (err, raw) {
      cb(null,  raw.toString('hex') + file.originalname);
    });
  }
});

var groupattachmentstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if(file.mimetype === 'application/javascript'){
      var errfile= 'Script file is not allowed'  
      return fileerr(errfile);
    }else{
      if(file.mimetype === 'application/octet-stream'){
        var errfile= 'JSON file is not allowed'  
        return fileerr(errfile);
      }else{
        cb(null, 'public/uploads/groupattachments/')           
      }
    }
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(4, function (err, raw) {
      cb(null,  raw.toString('hex') + file.originalname);
    });
  }
});

var meetingattachmentstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if(file.mimetype === 'application/javascript'){
      var errfile= 'Script file is not allowed'  
      return fileerr(errfile);
    }else{
      if(file.mimetype === 'application/octet-stream'){
        var errfile= 'JSON file is not allowed'  
        return fileerr(errfile);
      }else{
        if(file.mimetype === 'video/vnd.dlna.mpeg-tts'){
          var errfile= 'Ts file is not allowed'  
          return fileerr(errfile);
        }
        else{
          if(file.mimetype === 'application/x-zip-compressed'){
            var errfile= 'Zip file is not allowed'  
            return fileerr(errfile);
          }else{
            if(file.mimetype === 'application/json'){
              var errfile= 'Json file is not allowed'  
              return fileerr(errfile);
            }else{
              cb(null, 'public/uploads/meetingattachments/')           
            }
          }
        }
      }
    }
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(4, function (err, raw) {
      cb(null,  raw.toString('hex') + file.originalname);
    });
  }
});

var sharefileuploadstorage = multer.diskStorage({
  destination: function(req, file,cb){
    var extension = file.mimetype.split('/')[0];
    if(extension === 'application' || extension === 'text'){
      cb(null, 'public/uploads/share/file/')
    }
    if(extension === 'image'){
      cb(null, 'public/uploads/share/image/')
    }
    if(extension === 'video'){
      cb(null, 'public/uploads/share/video/')
    }
    if(extension === 'audio'){
      cb(null, 'public/uploads/share/audio/')
    }
  },
  filename: function(req, file, cb){
    crypto.pseudoRandomBytes(4, function (err, raw) {
      cb(null, raw.toString('hex') + file.originalname);
    });
  }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/angularuinotification', express.static(__dirname + '/node_modules/angular-ui-notification/dist/'));
app.use('/froalaeditor', express.static(__dirname + '/node_modules/froala-editor/'));
app.use('/moment', express.static(__dirname + '/node_modules/moment/'));
app.use('/datetimepicker', express.static(__dirname + '/node_modules/ng-material-datetimepicker/dist/'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// caching disabled for every route
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
})
app.use('/', index);
app.use('/users', users);

//mySQL connection
var db = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT
});

db.query("CREATE DATABASE IF NOT EXISTS chat_application");
db.query("CREATE TABLE IF NOT EXISTS register (fname text NOT NULL,lname text NOT NULL,image varchar(255) NULL,phno varchar(20) NOT NULL,uname varchar(20) NOT NULL,pswd varchar(15) NOT NULL,PRIMARY KEY (uname),onlineindication varchar(20) NULL, email varchar(40) NOT NULL, lastseen longtext NULL);");
db.query("CREATE TABLE IF NOT EXISTS messages (me_user varchar(20) NOT NULL, me_fname varchar(20) NOT NULL, me_pic longtext NOT NULL, to_user varchar(20) NOT NULL, to_fname varchar(20) NOT NULL, to_pic longtext NOT NULL, message longtext NULL,attachment longtext NULL,type varchar(20) NULL, mst varchar(40) NOT NULL,reply longtext NULL,fname varchar(20) NULL,replytype varchar(20) NULL,replyattachment longtext NULL, status varchar(10) NOT NULL, callduration varchar(20) NOT NULL, fromdelete varchar(20) NULL, todelete varchar(20) NULL);");
db.query("CREATE TABLE IF NOT EXISTS group_messages (messageId INT NOT NULL AUTO_INCREMENT PRIMARY KEY, groupId INT NOT NULL, groupname varchar(20), uniquegroupname varchar(20), senderpic longtext NOT NULL, senderUsername varchar(20) NOT NULL, senderfname varchar(20) NOT NULL, message longtext NULL, mst varchar(40) NOT NULL, attachment longtext NULL, type varchar(20) NULL, replygroupmessage longtext NULL, replygroupfname varchar(20) NULL, replygrouptype varchar(20) NULL,replygroupattachment longtext NULL);");
db.query("CREATE TABLE IF NOT EXISTS groups (groupId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,admin varchar(20), groupname varchar(20), groupimage longtext, uniquegroupname varchar(20), gcd longtext NOT NULL);");
db.query("CREATE TABLE IF NOT EXISTS sessions (username varchar(20) NOT NULL);");
db.query("CREATE TABLE IF NOT EXISTS meetings (meetingId INT NOT NULL AUTO_INCREMENT PRIMARY KEY, meetadmin varchar(20),uniquemeetname longtext, meetsubject longtext NOT NULL, description longtext NOT NUll,date longtext NOT NULL,meetingtime longtext NOT NULL,uniquetime longtext NOT NULL,meetingattachment longtext NULL,type varchar(20) NULL,meetingtype varchar(20) NULL,momtoall longtext NULL,momshared varchar(20) NULL,meetingcmpltd longtext NULL);");
db.query("CREATE TABLE IF NOT EXISTS meetingnotifications (organizer varchar(20) NOT NULL, participant varchar(20) NOT NULL,accept_or_reject varchar(20) NULL, reason longtext NULL, uniquemeetname longtext NOT NULL,meetingsubject longtext NOT NULL, status varchar(10) NOT NULL, proposedtime varchar(40)  NULL, proposeddate varchar(40)  NULL);");
db.query("CREATE TABLE IF NOT EXISTS acceptordeclinefiles (me_user varchar(20) NOT NULL, to_user varchar(20) NOT NULL, acceptordeclinefile varchar(10) NOT NULL);");
db.query("CREATE TABLE IF NOT EXISTS groupnotifications (groupnotificationId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,uniquegroupname varchar(20) NULL, groupname varchar(20) NULL, newadmin varchar(20) NULL, oldadmin varchar(20) NULL, time longtext NULL);")
db.query("CREATE TABLE IF NOT EXISTS groupnewadminnotifications (groupnotificationId INT NOT NULL,oldadmin varchar(20) NOT NULL,newadmin varchar(20) NOT NULL,usersingroup varchar(20) NOT NULL, status varchar(20) NOT NULL)")
db.query("CREATE TABLE IF NOT EXISTS quotes (quoteId INT NOT NULL AUTO_INCREMENT PRIMARY KEY, postedby text NOT NULL, quote longtext NOT NULL, date longtext NOT NULL, name text NOT NULL,userimage longtext NOT NULL );");
db.query("CREATE TABLE IF NOT EXISTS information (informationId INT NOT NULL AUTO_INCREMENT PRIMARY KEY, postedby text NOT NULL, information longtext NOT NULL, date longtext NOT NULL, name text NOT NULL,userimage longtext NOT NULL );");
db.query("CREATE TABLE IF NOT EXISTS informationnotifications (informationId INT NOT NULL,member varchar(20) NOT NULL, status varchar(10) NOT NULL );");

db.query("CREATE TABLE IF NOT EXISTS sharefiles (uploadername varchar(20) NOT NULL, uploaderusername varchar(20) NOT NULL, file longtext NOT NULL, filetype longtext NOT NULL, fst longtext NOT NULL)");
db.query("CREATE TABLE IF NOT EXISTS sharedfiles (uploadername varchar(20) NOT NULL, uploaderusername varchar(20) NOT NULL, file longtext NOT NULL, filetype longtext NOT NULL, fst longtext NOT NULL, fromname varchar(20) NOT NULL, fromusername varchar(20) NOT NULL, toname varchar(20) NOT NULL, tousername varchar(20) NOT NULL, status varchar(10) NOT NULL)")
db.query("CREATE TABLE IF NOT EXISTS leaveletter (leaveId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,uniqueleavename longtext NULL,fromuname text NOT NULL, fromfname text NOT NULL, subject longtext NOT NULL, reason longtext NOT NULL, hours longtext NULL, fromdate longtext NULL, todate longtext NULL,currentdate longtext NOT NULL, fromdelete varchar(10) NULL);");
db.query("CREATE TABLE IF NOT EXISTS leavereplys (uniqueleavename longtext NOT NULL,fromfname text NOT NULL,fromuname text NOT NULL,tofname text NOT NULL,touname text NOT NULL,replymessage longtext NOT NULL,rst longtext NOT NULL,replymsgId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,notification varchar(20) NOT NULL);");
db.query("CREATE TABLE IF NOT EXISTS callhistroy (typeofcall varchar(20) NOT NULL,callerfname varchar(20) NOT NULL,calleruname varchar(20) NOT NULL,callerpic longtext NOT NULL,calleefname varchar(20) NOT NULL,calleeuname varchar(20) NOT NULL,calleepic longtext NOT NULL,callendtype text NOT NULL,callduration varchar(20) NULL,callstarttime varchar(40) NOT NULL, callendtime varchar(40) NULL, callersticky longtext NULL, calleesticky longtext NULL,callerdelete varchar(10) NULL, calleedelete varchar(10) NULL);");
db.query("CREATE TABLE IF NOT EXISTS checkcallavailability (callunames varchar(20) NULL);");

var upload = multer({ storage: storage });
var uploadAttachment = multer({ storage: attachmentstorage, limits: {fileSize: maxSize} }).array('file');
var groupuploadAttachment = multer({ storage: groupattachmentstorage, limits: {fileSize: maxSize} }).array('file');
var meetinguploadAttachment = multer({ storage: meetingattachmentstorage, limits: {fileSize: maxSize}  }) .single('file');
var sharefileupload = multer({ storage: sharefileuploadstorage}).array('file');

//global variables
userFirstName = null;
uniqueUserName = null;
email = null;
profileData = {};
profilepic = null;
lastseen = null;
clients = [];
groups = [];
meetings = [];
groupnames = [];
leaves = [];
var fileerr;
var profilefileerr;
typingclients = [];

app.get('/login', function(req, res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.get('/signup', function(req, res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.get('/userhome/:uniqueUserName', function(req, res){
  jwt.verify(req.params.uniqueUserName, 'lokesh', function(err,decoded){
    db.query("SELECT * FROM sessions WHERE username= '"+decoded.username+"'",function(err,data){
      getUser(data);
    });
    function getUser(data){
      if(data.length== 0){
        res.redirect('/login');
      }
      else{
        if(data[0].username=== decoded.username){
          db.query('SELECT * FROM register WHERE uname = "'+decoded.username+'"', function(err, userdata){
            if(userdata[0].uname === decoded.username){
              userFirstName = userdata[0].fname;
              uniqueUserName = userdata[0].uname;
              email = userdata[0].email;
              profileData = userdata;
              profilepic = userdata[0].image;
              lastseen = userdata[0].lastseen;
              res.sendFile(path.join(__dirname+'/public/index.html'));
            }else{
              res.json({success: false});
            }
          });
        }else{
          res.send('Not Found');
        }
      }
    }
  });
});

app.get('/:uniqueUserName/logout', function(req, res){
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');  
 res.json({success:true});
});

app.post('/userhome', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  db.query("SELECT onlineindication FROM register WHERE uname= '"+username+"' AND pswd = '"+password+"'", function(err, data){
    if(data.length == 0){
      res.json({success: false});
    }else{
      if(data[0].onlineindication === 'Offline'){
        db.query("UPDATE register SET onlineindication= 'Online',lastseen= NULL WHERE uname= '"+username+"'");
        getUserInfo();
      }else{
        getUserInfo();
      }
    }
  });
  function getUserInfo(){
    db.query('SELECT * FROM register WHERE uname = "'+username+'" AND pswd = "'+password+'"', function(err, data){
      if(err){
        console.log(err);
      }
      else{
        if(data.length === 0){
          res.json({success: false});
        }else{
          if((data[0].uname === username) && (data[0].pswd === password)){ 
            db.query("INSERT INTO sessions(username) VALUES ('"+username+"')");
            userFirstName = data[0].fname;
            uniqueUserName = data[0].uname;
            email = data[0].email;
            profileData = data;
            profilepic = data[0].image;
            lastseen = data[0].lastseen;
            var token = jwt.sign({ username: username }, 'lokesh');
            res.json({success: true, token: token});
          }else{
            res.json({success: false});
          }
        }
      }
    });
  }
});

app.post('/signup', function(req, res){
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var username = req.body.username;
  var password = req.body.password;
  var phonenumber = req.body.phonenumber;
  var email = req.body.email;
  db.query('INSERT INTO register(fname, lname, image , phno, uname, pswd,onlineindication,email) VALUES ("' + firstname + '","' + lastname + '","pro-pic.png","' + phonenumber + '","' + username + '","' + password + '","Offline","'+email+'")', function(err, data){
    if(err){
      console.log(err);
      res.json({success: false});
    }else{
      res.json({success: true});
    }
  });
});

app.post('/usernamevalidation',function(req, res){
  var usernamevalidation = req.body.x;
  db.query("SELECT uname FROM register WHERE uname='"+usernamevalidation+"'", function(err, data){
    if(data.length === 0){
      res.json({success: false, successmsg: ''});
    }
    else{
      res.json({success: true, successmsg: 'Username already exists please choose another'});
    }
  });
});

app.post('/forgotpswd',function(req, res){
  var usermailid = req.body.mailId;
  db.query("SELECT email FROM register WHERE email='"+usermailid+"'", function(err, data){
    if(data.length === 0){
      res.json({success: false, message: 'Sorry You Are Not Registered With Us.'});
    }
    else{
      res.json({success: true, successmsg: 'Please Login With The Password Sent To Your Mail'});
      makeid();
      function makeid(){
        var text = '';
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 8; i++){
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        db.query("UPDATE register set pswd='"+text+"' WHERE email='"+usermailid+"'");

        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "chatresloksek@gmail.com",
            pass: "resloksek"
          }
        });
        var mailOptions = {
          from: "From Chat App", // sender address
          to: usermailid, // list of receivers
          subject: "Chat Application New Password",
          text: text,// Subject line
        }
        smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
            console.log(error);
          }else{
            console.log("Message Sent");
          }
        });
      }

    }
  })
})

app.post('/:youName/profile', upload.single('file'), function(req, res){
  var filename= req.file.filename;
  db.query("UPDATE register SET image='"+filename+"' WHERE uname= '"+req.params.youName+"'");
  db.query("UPDATE messages SET me_pic='"+filename+"' WHERE me_user= '"+req.params.youName+"'");
  db.query("UPDATE group_messages SET senderpic='"+filename+"' WHERE senderUsername = '"+req.params.youName+"'");
  db.query("UPDATE information SET userimage = '"+filename+"' WHERE postedby = '"+req.params.youName+"'");
  db.query("SELECT image FROM register WHERE uname = '"+req.params.youName+"'", function(err, data){
    if(err){console.log(err)}
    else{
      res.json(data);
    }
  });
});

app.post('/groupprofile/:uniquegroupname', upload.single('file'), function(req, res){
  var filename= req.file.filename;
  if(req.file.mimetype == 'image/jpg' || req.file.mimetype =='image/png' || req.file.mimetype =='image/jpeg' || req.file.mimetype == 'image/gif'){
    db.query("UPDATE groups SET groupimage='"+filename+"' WHERE uniquegroupname = '"+req.params.uniquegroupname+"'");
    db.query("SELECT groupimage FROM groups WHERE uniquegroupname = '"+req.params.uniquegroupname+"'", function(err, data){
      if(err){console.log(err)}else{
        res.json(data);
      }
    });
  }
  else{
    res.json({msg:'Please Select An Image'});
  }
});

app.post('/attachment', function(req, res){
  uploadAttachment(req, res, function (err) {
    if(err){
      var filesizeerror= 'File size is large to send'
      res.json({filesizeerror: filesizeerror});
    } else {
      var files = req.files;
      res.json({files: files});
    }
  });
});

app.post('/groupattachment', function(req, res){
  groupuploadAttachment(req, res, function (err) {
    if(err){
      var filesizeerror= 'File size is large to send'
      res.json({filesizeerror: filesizeerror});
    } else {
      var files = req.files;
      res.json({files: files});
    }
  });
});

app.post('/meetingattachment',function(req, res){
  meetinguploadAttachment(req, res, function (err) {
    if(err){
      var filesizeerror= 'File size is large to send'
      res.json({filesizeerror: filesizeerror});
    } else {
      var filename= req.file.filename;  
      res.json({filename: filename});
    }
  });
});

// fileshare

app.post('/sharefile', function(req, res){
  sharefileupload(req, res, function(err){
    if(err){
      var sharefileuploaderr = 'there is some problem in uploading files. please try agian';
      res.json({sharefileuploaderr: sharefileuploaderr});
    }else{
      var files = req.files;
      res.json({files: files});
    }
  });
});

// fileshare end

io.on('connection', function(socket){
  fileerr = function(errfile){
    socket.emit('fileerr',errfile);
  };

  profilefileerr = function(profileerrfile){
    socket.emit('profilefileerr',profileerrfile);
  };

  // typing indication

  socket.on("typing",function(data){
    io.to(data.selectedUserId).emit("typing", data);
  });
  
  //group typing indication

  socket.on("grouptypingindication",function(data){
    typingclients.push(data.youName);
    removeDuplicates(typingclients);
    function removeDuplicates(array){
      for(var i=0; i<array.length; i++){
        var v = array[i];
        for(var j=i+1; j<array.length; j++){
          if(v == array[j]){
            array.splice(j, 1);          
          }
        }
        if(v == null){
          array.splice(i, 1);
        }
      }
    };
    socket.broadcast.emit("grouptypingindication", data,typingclients);

    function myFunc() {
    typingclients=[];
    }
    setTimeout(myFunc, 3000);
  }); 

  io.to(socket.id).emit('profile', profileData); 

  io.to(socket.id).emit('you',{uniqueUserName, userFirstName, profilepic, email});
  clients.push({id: socket.id,userFirstName: userFirstName,uniqueUserName: uniqueUserName, profilepic: profilepic, email: email, lastseen: lastseen});
  console.log(clients);  
  removeDuplicates(clients);
  function removeDuplicates(array){
    for(var i=0; i<array.length; i++){
      var v = array[i].uniqueUserName;
      for(var j=i+1; j<array.length; j++){
        if(v == array[j].uniqueUserName){
          clients.splice(i, 1);          
        }
      }
      if(v == null){
        clients.splice(i, 1);
      }
    }
  };
  intervalFunc(clients);
  function intervalFunc (clients){
    io.emit('clients',clients);     
  }
  db.query('select fname,uname,image,lname,phno,onlineindication,email,lastseen from register',function(err, data){
    if(err){
      console.log(err);
    }else{
      socket.emit('users', data);
    }
  });
  db.query("SELECT uname,onlineindication,lastseen FROM register", function(err, data){
    if(err){console.log(err)}else{
      io.emit('onlinestatus', data);
    }
  });

  fileAcceptData();
  function fileAcceptData(){
    for(var i=0; i<clients.length; i++){
      if(clients[i].id == socket.id){
        db.query("SELECT * FROM acceptordeclinefiles WHERE to_user= '"+clients[i].uniqueUserName+"'", function(err,data){
          if(err){console.log(err)}else{
            if(data.length > 0){
             socket.emit('alwaysacceptfiles', data);
            }
          }
        });
      }
    }
  } 

  socket.on('onlineusers',function(data){
    db.query("UPDATE register SET onlineindication= '"+data.status+"' WHERE uname= '"+data.uname+"'");
    db.query("SELECT onlineindication,uname,lastseen FROM register WHERE uname= '"+data.uname+"'",function(err,onlinedata){
      for(var i=0; i<clients.length; i++){
        io.to(clients[i].id).emit('onlineusers',onlinedata);
      }
    });
  });

  sendgroups();
  function sendgroups(){
    db.query('SELECT * FROM groups', function(err, data){
      if(err){
        console.log(err);
      }else{
        groupfun(data);
      }
    });
    function groupfun(groupnames){
      each(groupnames, function (value, key, array) {
        var groupId = value.groupId;
        var groupname = value.groupname;
        var uniquegroupname = value.uniquegroupname;
        var groupimage= value.groupimage;
        var admin= value.admin;
        var members = [];
        db.query("SELECT * FROM "+uniquegroupname+"", function(err, data){
          members = data;
          groups[key] = {groupId: groupId, groupname: groupname, uniquegroupname: uniquegroupname, groupimage: groupimage, members: members,admin:admin};
          for(var i=0; i<clients.length; i++){
            for(var j=0; j<members.length; j++){
              if(clients[i].id == socket.id){
                if(clients[i].uniqueUserName === members[j].memberuname){
                  db.query("SELECT * FROM groupnotifications WHERE uniquegroupname='"+members[j].uniquegroupname+"' ", function(err, gndata){
                    io.to(socket.id).emit('groupnotifications', gndata);
                  })
                  io.to(socket.id).emit('groups', groups[key]);
                }
              }
            }
          }
        });
      });
    }
  }

  sendmeetings();
  function sendmeetings(){
    db.query('SELECT * FROM meetings', function(err, data){
      if(err){
        console.log(err);
      }else{
        meetfun(data);
      }
    });
    function meetfun(meetsub){
      each(meetsub, function (value, key, array) {
        var meetingId = value.meetingId;
        var meetsubject = value.meetsubject;
        var uniquemeetname = value.uniquemeetname;
        var uniquetime = value.uniquetime;
        var meetadmin = value.meetadmin;
        var description= value.description;
        var date= value.date;
        var meetingtime= value.meetingtime; 
        var meetingattachment= value.meetingattachment;
        var type= value.type;
        var meetingtype= value.meetingtype;
        var meetmembers = [];
        var momtoallarray = [];
        var momshared = value.momshared;
        var meetingcmpltd = value.meetingcmpltd;
        if(value.momtoall !== null){
          var momtoalltable = value.momtoall;
          db.query("SELECT * FROM "+momtoalltable+"", function(err,momtoalldata){
            if(err){console.log(err)}else{
              momtoallarray = momtoalldata;
            }
          });
        }
        db.query("SELECT * FROM "+uniquemeetname+"", function(err, data){
          meetmembers = data;
          meetings[key] = {meetingId: meetingId, meetsubject: meetsubject, uniquemeetname: uniquemeetname,uniquetime: uniquetime,description: description, meetmembers: meetmembers,meetadmin: meetadmin,date: date,meetingtime: meetingtime,meetingattachment: meetingattachment, type: type, meetingtype: meetingtype, momtoallarray: momtoallarray, momshared: momshared, meetingcmpltd: meetingcmpltd};
          for(var i=0; i<clients.length; i++){
            for(var j=0; j<meetmembers.length; j++){
              if(clients[i].id === socket.id){
                if(clients[i].uniqueUserName === meetmembers[j].membersinmeet){
                  socket.emit('meetings', meetings[key]);
                }
              }
            }
          }
        });
      });
    }
  }

  // one to one chat
  messagesFromDatabase();
  function messagesFromDatabase(){
    each(clients, function(value, key, array){
      if(value.id === socket.id){
        db.query("SELECT * FROM messages WHERE (me_user='"+value.uniqueUserName+"' AND fromdelete IS NULL) OR (to_user='"+value.uniqueUserName+"' AND todelete IS NULL)", function(err, data){
          if(err){
            console.log(err);
          }else{
            for(var i=0; i<data.length; i++){
              if(data[i].message !== null){
                data[i].message = data[i].message.replace(/squote/g, "'");
              }
            }
            io.to(value.id).emit('messages-from-database' , data);
          }
        });
      }
    });
  }
  socket.on('clearotochat', function(data){
    db.query("SELECT * FROM messages WHERE (me_user='"+data.youName+"' AND to_user='"+data.selectedUserName+"') OR (to_user='"+data.youName+"' AND me_user='"+data.selectedUserName+"')", function(err, checkdata){
      if(err){console.log(err)}else{
        for(var i=0; i<checkdata.length; i++){
          if(checkdata[i].me_user === data.youName && checkdata[i].to_user === data.selectedUserName){
            db.query("UPDATE messages SET fromdelete = 'delete' WHERE me_user = '"+checkdata[i].me_user+"' AND to_user = '"+checkdata[i].to_user+"'");
          }
          if(checkdata[i].me_user === data.selectedUserName && checkdata[i].to_user === data.youName){
            db.query("UPDATE messages SET todelete = 'delete' WHERE me_user = '"+checkdata[i].me_user+"' AND to_user = '"+checkdata[i].to_user+"'");
          }
          db.query("SELECT * FROM messages WHERE (me_user='"+data.youName+"' AND to_user='"+data.selectedUserName+"') OR (to_user='"+data.youName+"' AND me_user='"+data.selectedUserName+"')", function(err, deletedata){
            if(err){console.log(err)}else{
              for(var i=0; i<deletedata.length; i++){
                if(deletedata[i].fromdelete === 'delete' && deletedata[i].todelete === 'delete'){
                  if(deletedata[i].attachment !== null){
                    fs.unlink('./public/uploads/attachments/'+deletedata[i].attachment+'', function(err){});
                  }
                }
                db.query("DELETE FROM messages WHERE fromdelete = 'delete' AND todelete = 'delete'");
              }
            }
          });
        }
      }
    });
  });
  socket.on('makeasseen', function(data){
    db.query("UPDATE messages SET status = 'seen' WHERE me_user = '"+data.me_user+"' AND to_user = '"+data.to_user+"'");
  });
  socket.on('sendmsg',function(data){
    io.to(data.to_id).to(data.me_id).emit('sendmsg',{
      me_pic: data.me_pic,
      me_fname: data.me_fname,
      me_user: data.me_user,
      to_pic: data.to_pic,
      to_fname: data.to_fname,
      to_user: data.to_user,
      message: data.message.replace(/squote/g, "'"),
      mst: data.mst,
      reply:data.reply,
      fname:data.fname,
      replytype:data.replytype,
      replyattachment: data.replyattachment,
      callduration: data.callduration
    }); 
    io.to(data.to_id).emit('count', data);    
    db.query("INSERT INTO `messages` (me_user, me_fname, me_pic, to_user, to_fname, to_pic, message, mst,reply,fname,replytype,replyattachment,status,callduration) VALUES ('"+data.me_user+"', '"+data.me_fname+"', '"+data.me_pic+"', '"+data.to_user+"', '"+data.to_fname+"', '"+data.to_pic+"', '"+data.message+"', '"+data.mst+"','"+data.reply+"','"+data.fname+"','"+data.replytype+"','"+data.replyattachment+"', 'unseen','"+data.callduration+"')");
  });
  
  socket.on('sendattach',function(data){
    io.to(data.to_id).to(data.me_id).emit('sendmsg',{
      me_pic: data.me_pic,
      me_fname: data.me_fname,
      me_user: data.me_user,
      to_pic: data.to_pic,
      to_fname: data.to_fname,
      to_user: data.to_user,
      attachment: data.attachment,
      type: data.type,
      mst: data.mst,
      callduration: data.callduration
    });  
    io.to(data.to_id).emit('count', data);     
    db.query("INSERT INTO messages (me_user, me_fname, me_pic, to_user, to_fname, to_pic, attachment, type, mst, status, callduration) VALUES ('"+data.me_user+"', '"+data.me_fname+"', '"+data.me_pic+"', '"+data.to_user+"', '"+data.to_fname+"', '"+data.to_pic+"', '"+data.attachment+"', '"+data.type+"', '"+data.mst+"', 'unseen', '"+data.callduration+"')");
  });
  socket.on('desktopnotification', function(data){
    if(data.message){
      notifier.notify({
        title: data.me_fname,
        message: data.message,
        icon: __dirname + '/public/uploads/profileimages/'+data.me_pic+'',
        sound: true,
        wait: true
      }, function (err, response) {
        // Response is response from notification
      });
    } else{
      notifier.notify({
        title: data.me_fname,
        message: 'You received a file from '+data.me_user+'',
        icon: __dirname + '/public/uploads/profileimages/'+data.me_pic+'',
        sound: true,
        wait: true
      }, function (err, response) {
        // Response is response from notification
      });
    }
  });

  // Deleting message from one to one chat
  socket.on("delete",function(message){
    if(message.message){
      db.query("UPDATE messages SET message ='///Deleted///', reply = NULL where me_user= '"+message.me_user+"' AND mst='"+message.mst+"'");
      updatedMessages();
    }
    if(message.attachment){
      db.query("UPDATE messages SET attachment = null,message='///Deleted///', replyattachment = NULL where me_user= '"+message.me_user+"' AND mst='"+message.mst+"'")
      updatedMessages();      
    }
    function updatedMessages(){
      db.query("SELECT * FROM messages WHERE me_user= '"+message.me_user+"' AND to_user= '"+message.to_user+"' AND mst='"+message.mst+"'", function(err, updateddata){
        if(err){console.log(err)}else{
          for(var i=0; i<clients.length; i++){
            if(clients[i].uniqueUserName === message.me_user){
              io.to(clients[i].id).emit('delete', updateddata)
            }
            if(clients[i].uniqueUserName === message.to_user){
              io.to(clients[i].id).emit('delete', updateddata);
            }
          }
        }
      });
    }
  });

  socket.on('alwaysacceptfiles', function(data){
    db.query("INSERT INTO acceptordeclinefiles (me_user, to_user, acceptordeclinefile) VALUES('"+data.me_user+"','"+data.to_user+"', 'accept');");
    db.query("SELECT * FROM acceptordeclinefiles WHERE to_user= '"+data.to_user+"' AND me_user= '"+data.me_user+"'", function(err,alwaysdata){
      if(err){console.log(err)}else{
        socket.emit('pushalwaysacceptfiles', alwaysdata);
      }
    });
  });

  // group chat
  socket.on('newGroup', function(data){
    db.query("INSERT INTO groups (admin,groupname,groupimage,gcd) VALUES ('"+data.admin+"','"+data.newGroupName+"','group-pic.png', '"+data.gcd+"');");
    db.query("SELECT groupId,groupname FROM groups WHERE gcd = '"+data.gcd+"'", function(err, data){
      for(var i=0; i < data[0].groupname.length; i++) {
        data[0].groupname = data[0].groupname.replace(" ", "_");
      }
      var append = data[0].groupname + data[0].groupId;
      updateUniqueGroupname(append,data[0].groupId);
    });
    function updateUniqueGroupname(append, id){
      db.query("UPDATE groups SET `uniquegroupname` = '"+append+"' WHERE groupId = '"+id+"'");
      db.query("SELECT * FROM groups WHERE groupname = '"+data.newGroupName+"' AND gcd = '"+data.gcd+"'", function(err, dataId){
        creatingNewGroup(dataId, data);
      });
    }
    function creatingNewGroup(dataId, data){
      db.query("CREATE TABLE IF NOT EXISTS "+dataId[0].uniquegroupname+"(groupId INT NOT NULL, groupname varchar(20) NOT NULL, uniquegroupname varchar(20) NOT NULL, memberfname varchar(20), memberuname varchar(20), memberimage longtext, deletemsgs longtext NULL)");
      var groupNotificationTable = dataId[0].uniquegroupname+'notifications';
      db.query("CREATE TABLE IF NOT EXISTS "+groupNotificationTable+"(messageId INT NOT NULL, uniquegroupname varchar(20), member varchar(20) NOT NULL, status varchar(10) NOT NULL)");
      for(var i=0; i<data.groupofusers.length; i++){
        db.query("INSERT INTO "+dataId[0].uniquegroupname+" (groupId,groupname,uniquegroupname,memberfname, memberuname, memberimage) VALUES ("+dataId[0].groupId+", '"+dataId[0].groupname+"', '"+dataId[0].uniquegroupname+"', '"+data.groupofusers[i].fname+"', '"+data.groupofusers[i].uname+"', '"+data.groupofusers[i].image+"');");
      }
      pushgroups(dataId);
    }
    function pushgroups(dataId){
      var groupId = dataId[0].groupId;
      var groupname = dataId[0].groupname;
      var uniquegroupname = dataId[0].uniquegroupname;
      var groupimage= dataId[0].groupimage;
      var admin= dataId[0].admin;
      var members = [];
      db.query("SELECT * FROM "+dataId[0].uniquegroupname+"", function(err, data){
        members = data;
        groups = {groupId: groupId, groupname: groupname, uniquegroupname: uniquegroupname, groupimage: groupimage, members: members,admin:admin};
        for(var i=0; i<clients.length; i++){
          for(var j=0; j<data.length; j++){
            if(clients[i].uniqueUserName === data[j].memberuname){
              io.to(clients[i].id).emit('pushGroups', groups);
            }
          }
        }
      });
    }
  });
  socket.on('getgroupchat', function(uniquegroupname,uname){
    db.query("SELECT deletemsgs FROM "+uniquegroupname+" WHERE memberuname='"+uname+"'", function(err, clearuptodata){
      if(clearuptodata.length !== 0){
        if(err){console.log(err)}else{
          if(clearuptodata[0].deletemsgs === null){
            db.query("SELECT * FROM group_messages WHERE uniquegroupname='"+uniquegroupname+"'", function(err, groupchatdata){
              if(err){console.log(err);}else{
                for(var i=0; i<groupchatdata.length; i++){
                  if(groupchatdata[i].message !== null){
                    groupchatdata[i].message = groupchatdata[i].message.replace(/squote/g, "'");
                  }
                }
                socket.emit('group_messages-from-database', groupchatdata);
              }
            });
          }else{
            db.query("SELECT * FROM group_messages WHERE uniquegroupname='"+uniquegroupname+"' AND mst > '"+clearuptodata[0].deletemsgs+"'", function(err, groupchatdata){
              if(err){console.log(err);}else{
                for(var i=0; i<groupchatdata.length; i++){
                  if(groupchatdata[i].message !== null){
                    groupchatdata[i].message = groupchatdata[i].message.replace(/squote/g, "'");
                  }
                }
                socket.emit('group_messages-from-database', groupchatdata);
              }
            }); 
          }
          var groupNotificationTable = uniquegroupname+'notifications';
          db.query("SELECT * FROM "+groupNotificationTable+" WHERE member = '"+uname+"'", function(err, data){
            if(err){console.log(err)}else{
              if(data.length > 0){
                socket.emit('dbgroupcount', data);
              }
            }
          });
        }
      }
    });
  });
  socket.on('cleargroupchat',function(youName, uniquegroupname, clearmsgsupto){
    db.query("UPDATE "+uniquegroupname+" SET deletemsgs='"+clearmsgsupto+"' WHERE memberuname='"+youName+"'", function(err){
      db.query("SELECT * FROM group_messages WHERE uniquegroupname ='"+uniquegroupname+"'", function(err, msgsdata){
        if(err){console.log(err)}else{
          db.query("SELECT * FROM "+uniquegroupname+"", function(err, checkmstdata){
            if(err){console.log(err)}else{
              for(var i=0; i<msgsdata.length; i++){
                var counter = 0;
                for(var j=0; j<checkmstdata.length; j++){
                  if(checkmstdata[j].deletemsgs > msgsdata[i].mst){
                    counter += 1;
                  }
                  if(counter === checkmstdata.length){
                    db.query("SELECT attachment FROM group_messages WHERE uniquegroupname='"+uniquegroupname+"' AND mst ='"+msgsdata[i].mst+"'", function(err, unlinkfilename){
                      if(err){console.log(err)}else{
                        fs.unlink('./public/uploads/groupattachments/'+unlinkfilename[0].attachment+'', function(err){});                        
                      }
                    });
                    db.query("DELETE FROM group_messages WHERE uniquegroupname = '"+uniquegroupname+"' AND mst ='"+msgsdata[i].mst+"'");
                  }
                }
              }
            }
          });
        }
      });
      var groupNotificationTable = uniquegroupname+'notifications';
      db.query("DELETE FROM "+groupNotificationTable+" WHERE uniquegroupname='"+uniquegroupname+"' AND member='"+youName+"'");
    });
  });
  socket.on('groupmsg', function(data){
    for(var i=0; i<data.memberids.length; i++){
      io.to(data.memberids[i]).emit('groupmsg',{
        groupId: data.groupId,
        groupname: data.groupname,
        uniquegroupname: data.uniquegroupname,
        senderpic: data.senderpic,
        senderUsername : data.senderUsername,
        senderfname: data.senderfname,
        message: data.message.replace(/squote/g, "'"),
        mst: data.mst,
        replygroupmessage:data.replygroupmessage,
        groupfname:data.groupfname,
        replygroupmessage:data.replygroupmessage,
        replygroupattachment:data.replygroupattachment,
        replygroupfname:data.replygroupfname,
        replygrouptype:data.replygrouptype
      });
      io.to(data.memberids[i]).emit('groupcount', data.uniquegroupname,data.message.replace(/squote/g, "'"),data.mst);
    }
    db.query("INSERT INTO group_messages (groupId,groupname,uniquegroupname,senderpic,senderUsername,senderfname, message, mst, replygroupmessage, replygroupfname, replygroupattachment, replygrouptype) VALUES ('"+data.groupId+"', '"+data.groupname+"', '"+data.uniquegroupname+"', '"+data.senderpic+"','"+data.senderUsername+"','"+data.senderfname+"', '"+data.message+"', '"+data.mst+"','"+data.replygroupmessage+"','"+data.replygroupfname+"','"+data.replygroupattachment+"','"+data.replygrouptype+"')");
    db.query("SELECT uniquegroupname, messageId FROM group_messages WHERE message = '"+data.message+"' AND mst = '"+data.mst+"'", function(err, messageIdData){
      if(err){console.log(err)} else{
        var groupNotificationTable = messageIdData[0].uniquegroupname+'notifications';
        for(var j=0; j<data.memberUsernames.length; j++){
          if(data.memberUsernames[j] !== data.senderUsername){
            db.query("INSERT INTO "+groupNotificationTable+" (messageId, uniquegroupname, member, status) VALUES ('"+messageIdData[0].messageId+"', '"+messageIdData[0].uniquegroupname+"', '"+data.memberUsernames[j]+"', 'unseen')");
          }
        }
      }
    });
  });

  socket.on('groupsendattach',function(data){
    for(var i=0; i<data.memberids.length; i++){
      io.to(data.memberids[i]).emit('groupmsg',{
        groupId: data.groupId,
        groupname: data.groupname,
        uniquegroupname: data.uniquegroupname,
        senderpic: data.senderpic,
        senderUsername : data.senderUsername,
        senderfname: data.senderfname,
        attachment: data.attachment,
        type: data.type,
        mst: data.mst
      });
      io.to(data.memberids[i]).emit('groupcount', data.uniquegroupname,'Attachment',data.mst);
    }
    db.query("INSERT INTO group_messages (groupId,groupname,uniquegroupname,senderpic,senderUsername,senderfname, attachment, mst, type) VALUES ('"+data.groupId+"', '"+data.groupname+"', '"+data.uniquegroupname+"', '"+data.senderpic+"','"+data.senderUsername+"','"+data.senderfname+"', '"+data.attachment+"', '"+data.mst+"', '"+data.type+"')");
    db.query("SELECT uniquegroupname, messageId FROM group_messages WHERE attachment = '"+data.attachment+"' AND mst = '"+data.mst+"'", function(err, messageIdData){
      if(err){console.log(err)} else{
        var groupNotificationTable = messageIdData[0].uniquegroupname+'notifications';
        for(var j=0; j<data.memberUsernames.length; j++){
          db.query("INSERT INTO "+groupNotificationTable+" (messageId, uniquegroupname, member, status) VALUES ('"+messageIdData[0].messageId+"', '"+messageIdData[0].uniquegroupname+"', '"+data.memberUsernames[j]+"', 'unseen')");
        }
      }
    });
  });

  // Deleting message from group messages
  socket.on("deletegroupmsg",function(groupmessage){
    if(groupmessage.message){
      db.query("UPDATE group_messages SET message ='///Deleted///',replygroupmessage = NULL where uniquegroupname= '"+groupmessage.uniquegroupname+"' AND mst='"+groupmessage.mst+"'");
      updatedGroupMessages();
    }
    if(groupmessage.attachment){
      db.query("UPDATE group_messages SET attachment = null,message='///Deleted///',replygroupattachment = NULL where uniquegroupname= '"+groupmessage.uniquegroupname+"' AND mst='"+groupmessage.mst+"'")
      updatedGroupMessages();
    }
    function updatedGroupMessages(){
      db.query("SELECT * FROM group_messages WHERE uniquegroupname= '"+groupmessage.uniquegroupname+"' AND mst='"+groupmessage.mst+"'", function(err, updatedgroupdata){
        if(err){console.log(err)}else{
          db.query("SELECT memberuname FROM "+groupmessage.uniquegroupname+"", function(err, memberunamedata){
            if(err){console.log(err)}else{
              for(var i=0; i<clients.length; i++){
                for(var j=0; j<memberunamedata.length; j++){
                  if(clients[i].uniqueUserName === memberunamedata[j].memberuname){
                    io.to(clients[i].id).emit('deletegroupmsg', updatedgroupdata);
                  }
                }
              }
            }
          });
        }
      });
    }
  });

  socket.on('makeasseengroup', function(data){
    var groupNotificationTable = data.uniquegroupname+'notifications';
    db.query("UPDATE "+groupNotificationTable+" SET status = 'seen' WHERE member = '"+data.username+"'");
    db.query("DELETE FROM "+groupNotificationTable+" WHERE  status = 'seen'");    
  });

  // Group Deleting
  socket.on('deletegroups', function(deldata){
    db.query("DELETE FROM groups WHERE  `uniquegroupname` = '"+deldata.uniquegroupname+" '");
    db.query("DELETE FROM group_messages WHERE  `uniquegroupname` = '"+deldata.uniquegroupname+" '");
    db.query("DROP TABLE "+deldata.uniquegroupname+"");var groupNotificationTable = deldata.uniquegroupname+'notifications';   
    var groupNotificationTable = deldata.uniquegroupname+'notifications';   
    db.query("DROP TABLE "+groupNotificationTable+"");
    for(var i=0; i<clients.length; i++){
      for(var j=0; j<deldata.memberUsernames.length; j++){
        if(clients[i].uniqueUserName === deldata.memberUsernames[j]){
          io.to(clients[i].id).emit('initgroupsarray');
        }
      }
    }
    db.query('SELECT * FROM groups', function(err, data){
      if(err){console.log(err);}else{
        if(data.length === 0){
          for(var i=0; i<clients.length; i++){
            for(var j=0; j<deldata.memberUsernames.length; j++){
              if(clients[i].uniqueUserName === deldata.memberUsernames[j]){
                io.to(clients[i].id).emit('initgroupsarray');
              }
            }
          }
        }else{
          updatedgroupfun(data);
        }
      }
    });
    function updatedgroupfun(groupnames){
      each(groupnames, function (value, key, array) {
        var groupId = value.groupId;
        var groupname = value.groupname;
        var uniquegroupname = value.uniquegroupname;
        var groupimage= value.groupimage;
        var admin= value.admin;
        var members = [];
        db.query("SELECT * FROM "+uniquegroupname+"", function(err, data){
          members = data;
          groups[key] = {groupId: groupId, groupname: groupname, uniquegroupname: uniquegroupname, groupimage: groupimage, members: members,admin:admin};
          for(var i=0; i<clients.length; i++){
            for(var j=0; j<deldata.memberUsernames.length; j++){
              if(clients[i].uniqueUserName === deldata.memberUsernames[j]){
                io.to(clients[i].id).emit('groups', groups[key]);
              }
            }
          }
        });
      });
    }
  });

  //Leave Group
  socket.on('leavegroup', function(leavegroupdata){
    db.query("DELETE FROM "+leavegroupdata.uniquegroupname+" WHERE memberuname ='"+leavegroupdata.leaveUname+"'");
    db.query("SELECT memberuname FROM "+leavegroupdata.uniquegroupname+"", function(err, lastmemberdata){
      if(lastmemberdata.length === 0){
        db.query("DELETE FROM groups WHERE uniquegroupname = '"+leavegroupdata.uniquegroupname+"'");
        db.query("DROP TABLE "+leavegroupdata.uniquegroupname+"");
        checkSize();
      } else {
        checkSize();
      }
    });
    function checkSize(){
      for(var i=0; i<clients.length; i++){
        if(clients[i].uniqueUserName === leavegroupdata.leaveUname){
          sendToLeft(clients[i].id);
          io.to(clients[i].id).emit('initgroupsarray');        
        }
      }
    }
    function sendToLeft(id){
      db.query('SELECT * FROM groups', function(err, data){
        if(err){console.log(err);}else{
          groupfun(data);
        }
      });
      function groupfun(groupnames){
        each(groupnames, function (value, key, array) {
          var groupId = value.groupId, groupname = value.groupname, uniquegroupname = value.uniquegroupname, groupimage= value.groupimage;
          var admin= value.admin;
          var members = [];
          db.query("SELECT * FROM "+uniquegroupname+"", function(err, data){
            members = data;
            groups[key] = {groupId: groupId, groupname: groupname, uniquegroupname: uniquegroupname, groupimage: groupimage, members: members,admin:admin};
            io.to(id).emit('groups', groups[key]);
          });
        });
      }
    }
    db.query("SELECT * FROM "+leavegroupdata.uniquegroupname+"",function(err,data){
      if(err){console.log(err);
      }else{
        for(var i=0; i<clients.length; i++){
          for(var j=0; j<data.length; j++){
            if(clients[i].uniqueUserName === data[j].memberuname){
              io.to(clients[i].id).emit('leftmember', data);
            }
          }
        }
      }
    });
  });
  // Update New admin
  groupNotificationsFunction();
  function groupNotificationsFunction(){
    db.query("SELECT * FROM groupnewadminnotifications WHERE usersingroup= '"+uniqueUserName+"'", function(err, data){
      for(var i=0; i<clients.length; i++){
        if(clients[i].uniqueUserName == uniqueUserName){
          io.to(clients[i].id).emit('groupnewadminnotifications', data);
        }
      }
    })
  }

  socket.on('makegncountseen', function(data){
    db.query("DELETE FROM groupnewadminnotifications WHERE usersingroup='"+data.username+"'");
  });

  socket.on('updatenewadmin', function(data){
    db.query("INSERT INTO groupnotifications (uniquegroupname, groupname, newadmin, oldadmin, time) VALUES('"+data.uniquegroupname+"','"+data.groupname+"','"+data.newadmin+"','"+data.oldadmin+"', '"+data.time+"');");
    var memberUsernames = data.memberUsernames
    db.query("SELECT * FROM groupnotifications WHERE uniquegroupname='"+data.uniquegroupname+"' AND newadmin= '"+data.newadmin+"' AND oldadmin='"+data.oldadmin+"' AND time= '"+data.time+"'", function(err,Iddata){
      for(var i=0; i<memberUsernames.length; i++){
        if(data.oldadmin !== memberUsernames[i]){
          db.query("INSERT INTO groupnewadminnotifications (groupnotificationId,oldadmin,newadmin,usersingroup,status) VALUES('"+Iddata[0].groupnotificationId+"', '"+Iddata[0].oldadmin+"', '"+Iddata[0].newadmin+"', '"+memberUsernames[i]+"', 'unseen');");
          for(var j=0; j<clients.length; j++){
            if(clients[j].uniqueUserName === memberUsernames[i]){
              io.to(clients[j].id).emit('pushgroupnewadminnotifications', {status: 'unseen'});        
            }
          }
        }
      }
    });
    for(var i=0; i<clients.length; i++){
      for(var j=0; j<memberUsernames.length; j++){
        if(clients[i].uniqueUserName !== data.oldadmin){
          if(clients[i].uniqueUserName == memberUsernames[j]){
            io.to(clients[i].id).emit('pushgroupnotifications', data);        
          }
        }
      }
    }

    db.query("UPDATE groups set admin ='"+data.newadmin+"' WHERE uniquegroupname = '"+data.uniquegroupname+"'");
    for(var i=0; i<clients.length; i++){
      if(clients[i].uniqueUserName === data.newadmin){
        sendToNewAdmin(clients[i].id);
        io.to(clients[i].id).emit('initgroupsarray');
      }
    }
    function sendToNewAdmin(id){
      db.query('SELECT * FROM groups', function(err, data){
        if(err){console.log(err);}else{
          groupfun(data);
        }
      });
      function groupfun(groupnames){
        each(groupnames, function (value, key, array) {
          var groupId = value.groupId, groupname = value.groupname, uniquegroupname = value.uniquegroupname, groupimage= value.groupimage;
          var admin= value.admin;
          var members = [];
          db.query("SELECT * FROM "+uniquegroupname+"", function(err, data){
            members = data;
            groups[key] = {groupId: groupId, groupname: groupname, uniquegroupname: uniquegroupname, groupimage: groupimage, members: members,admin:admin};
            io.to(id).emit('groups', groups[key]);
          });
        });
      }
    }
  });

  // Adding member to group
  socket.on('addmembertogroup',function(adddata){
    db.query("INSERT INTO "+adddata.uniquegroupname+" (groupId, groupname, uniquegroupname, memberfname, memberuname, memberimage) VALUES ('"+adddata.groupId+"', '"+adddata.groupname+"', '"+adddata.uniquegroupname+"', '"+adddata.memberfname+"', '"+adddata.memberuname+"', '"+adddata.memberimage+"')");     
    for(var i=0; i<clients.length; i++){
      if(clients[i].uniqueUserName === adddata.uname){
        sendToAdded(clients[i].id);
        io.to(clients[i].id).emit('initgroupsarray');        
      }
    }
    function sendToAdded(id){
      db.query('SELECT * FROM groups', function(err, data){
        if(err){console.log(err);}else{
          groupfun(data);
        }
      });
      function groupfun(groupnames){
        each(groupnames, function (value, key, array) {
          var groupId = value.groupId, groupname = value.groupname, uniquegroupname = value.uniquegroupname, groupimage= value.groupimage;
          var admin= value.admin;
          var members = [];
          db.query("SELECT * FROM "+uniquegroupname+"", function(err, data){
            members = data;
            groups[key] = {groupId: groupId, groupname: groupname, uniquegroupname: uniquegroupname, groupimage: groupimage, members: members,admin:admin};
            io.to(id).emit('groups', groups[key]);
          });
        });
      }
    }
    db.query("SELECT * FROM "+adddata.uniquegroupname+"",function(err,data){
      if(err){console.log(err);
      }else{
        for(var i=0; i<clients.length; i++){
          for(var j=0; j<data.length; j++){
            if(clients[i].uniqueUserName === data[j].memberuname){
              io.to(clients[i].id).emit('addmemberforall', data);
            }
          }
        }
      }
    });
  });

  //remove member from group
  socket.on('removemember',function(removedata){
    db.query("DELETE FROM "+removedata.uniquegroupname+" WHERE memberuname= '"+removedata.uname+"'");
    for(var i=0; i<clients.length; i++){
      if(clients[i].uniqueUserName === removedata.uname){
        sendToRemoved(clients[i].id);
        io.to(clients[i].id).emit('initgroupsarray');        
      }
    }
    function sendToRemoved(id){
      db.query('SELECT * FROM groups', function(err, data){
        if(err){console.log(err);}else{
          groupfun(data);
        }
      });
      function groupfun(groupnames){
        each(groupnames, function (value, key, array) {
          var groupId = value.groupId, groupname = value.groupname, uniquegroupname = value.uniquegroupname, groupimage= value.groupimage;
          var admin= value.admin;
          var members = [];
          db.query("SELECT * FROM "+uniquegroupname+"", function(err, data){
            members = data;
            groups[key] = {groupId: groupId, groupname: groupname, uniquegroupname: uniquegroupname, groupimage: groupimage, members: members,admin:admin};
            io.to(id).emit('groups', groups[key]);
          });
        });
      }
    }
    db.query("SELECT * FROM "+removedata.uniquegroupname+"",function(err,data){
      if(err){console.log(err);
      }else{
        for(var i=0; i<clients.length; i++){
          for(var j=0; j<data.length; j++){
            if(clients[i].uniqueUserName === data[j].memberuname){
              io.to(clients[i].id).emit('removememberforall', data);
            }
          }
        }
      }
    });
  });

  // profile
  socket.on('updated-fname', function(fname){
    each(clients, function(value, key, array){
      if(value.id === socket.id){
        db.query("UPDATE register SET `fname` = '"+fname+" 'WHERE `uname`='"+value.uniqueUserName+"' ");
        db.query("UPDATE messages SET `me_fname` = '"+fname+" 'WHERE `me_user`='"+value.uniqueUserName+"' ");
        db.query("UPDATE group_messages SET `senderfname` = '"+fname+" 'WHERE `senderUsername`='"+value.uniqueUserName+"' ");
        db.query("UPDATE information SET name = '"+fname+"' WHERE postedby = '"+value.uniqueUserName+"'");
      }
    });    
  });
  socket.on('updated-lname', function(lname){
    each(clients, function(value, key, array){
      if(value.id === socket.id){
        db.query("UPDATE register SET `lname` = '"+lname+" 'WHERE `uname`='"+value.uniqueUserName+"' ");        
      }
    });
  });
  socket.on('updated-phno', function(phno){
    each(clients, function(value, key, array){
      if(value.id === socket.id){
        db.query("UPDATE register SET `phno` = '"+phno+" 'WHERE `uname`='"+value.uniqueUserName+"' ");        
      }
    });
  });
  socket.on('updated-password', function(pswd){
    each(clients, function(value, key, array){
      if(value.id === socket.id){
        db.query("UPDATE register SET `pswd` = '"+pswd+" 'WHERE `uname`='"+value.uniqueUserName+"' ");        
      }
    });
  });

  socket.on('changepswd',function(data,id){
    each(clients, function(value, key, array){
      if(value.id === socket.id){
        db.query('SELECT `pswd` from register WHERE `uname`="'+value.uniqueUserName+'"',function(err, res){
          if(err){
            console.log(err);
          }
          else{
            if(res[0].pswd === data.oldpswd){
              db.query("UPDATE register SET `pswd` = REPLACE(pswd, '"+data.oldpswd+"','"+data.confirmpswd+"') WHERE `uname`='"+value.uniqueUserName+"'");
              io.to(id).emit('changepswd',{msg: 'Your Password Updated Successfully'});
            }
            else{
              io.to(id).emit('changepswd',{msg: 'Failed To Change Password'});
            }
          }
        });
      }
    });
  });

// Meeting Data
  sendMeetingNotifications();
  function sendMeetingNotifications(){
    db.query('SELECT * FROM meetingnotifications WHERE organizer= "'+uniqueUserName+'" || participant= "'+uniqueUserName+'"',function(err, data){
      if(err){console.log(err)}
      else{
        for(var i=0; i<clients.length; i++){
          if(clients[i].uniqueUserName == uniqueUserName){
            io.to(clients[i].id).emit('sendMeetingNotifications', data);
          }
        }
      }
    })
  } 
  socket.on('makemeetingasseen', function(uniquemeetname, uname){
    db.query("UPDATE "+uniquemeetname+" SET status = 'seen' WHERE membersinmeet = '"+uname+"'");
  });
  socket.on('meetdata',function(data){
    db.query("INSERT INTO meetings(meetadmin,meetsubject,description,date,meetingtime,uniquetime,meetingattachment,type,meetingtype) VALUES('"+data.meetadmin+"','"+data.meetsubject+"','"+data.description+"','"+data.meetingdate+"','"+data.meetingtime+"','"+data.uniquetime+"','"+data.meetingattachment+"','"+data.type+"','"+data.meetingtype+"');", function(err){
      db.query("SELECT meetingId,meetsubject FROM meetings where uniquetime= '"+data.uniquetime+"'",function(err,mdata){
        for(var i=0; i < mdata[0].meetsubject.length; i++) {
          mdata[0].meetsubject = mdata[0].meetsubject.replace(" ", "_");
        }
        var append = mdata[0].meetsubject + mdata[0].meetingId;
        UniqueMeetNameUpdate(append,mdata[0].meetingId);
      })
  
      function UniqueMeetNameUpdate(append, meetid){
        db.query("UPDATE meetings SET `uniquemeetname`= '"+append+"' WHERE meetingId= '"+meetid+"'");
        db.query("SELECT * FROM meetings WHERE meetsubject= '"+data.meetsubject+"' AND uniquetime= '"+data.uniquetime+"'",function(err,meetdata){
          createMeetMembersTable(meetdata,data);
        })
      }
      function createMeetMembersTable(meetdata,data){
        db.query("CREATE TABLE IF NOT EXISTS "+meetdata[0].uniquemeetname+" (meetingId INT NOT NULL, meetsubject longtext NOT NULL,uniquemeetname longtext NOT NULL,membersinmeet varchar(20), remindertime longtext NOT NULL, momtome longtext NULL, momtoall longtext NULL, status varchar(20) NOT NULL, hide varchar(20) NULL, momstatus varchar(20) NULL);");
        for(var i=0; i<data.option.length; i++){
          if(meetdata[0].meetadmin === data.option[i]){
            db.query("INSERT INTO "+meetdata[0].uniquemeetname+" (meetingId,meetsubject,uniquemeetname,membersinmeet,remindertime,status) VALUES ('"+meetdata[0].meetingId+"','"+meetdata[0].meetsubject+"','"+meetdata[0].uniquemeetname+"','"+data.option[i]+"',10, 'seen');");
          }else{
            db.query("INSERT INTO "+meetdata[0].uniquemeetname+" (meetingId,meetsubject,uniquemeetname,membersinmeet,remindertime,status) VALUES ('"+meetdata[0].meetingId+"','"+meetdata[0].meetsubject+"','"+meetdata[0].uniquemeetname+"','"+data.option[i]+"',10, 'unseen');");
          }
        }
        pushmeetings(meetdata);
      }
    });
     
    function pushmeetings(meetdata){
      var meetingId = meetdata[0].meetingId;
      var meetsubject = meetdata[0].meetsubject;
      var uniquemeetname = meetdata[0].uniquemeetname;
      var meetadmin = meetdata[0].meetadmin;
      var description= meetdata[0].description;
      var date= meetdata[0].date;
      var meetingtime= meetdata[0].meetingtime; 
      var meetingattachment= meetdata[0].meetingattachment;
      var meetingtype= meetdata[0].meetingtype;
      var type= meetdata[0].type;
      var meetmembers = [];
      db.query("SELECT * FROM "+meetdata[0].uniquemeetname+"", function(err, memdata){
        meetmembers = memdata;
        meetings = {meetingId: meetingId, meetsubject: meetsubject, uniquemeetname: uniquemeetname,description: description, meetmembers: meetmembers,meetadmin: meetadmin,date: date,meetingtime: meetingtime,meetingattachment: meetingattachment,type: type,meetingtype: meetingtype};
        for(var i=0; i<clients.length; i++){
          for(var j=0; j<memdata.length; j++){
            if(clients[i].uniqueUserName === memdata[j].membersinmeet){
              io.to(clients[i].id).emit('pushmeeting', meetings);
            }
          }
        }
        if(data.mails == 'sendmails'){
          sendEmail(meetmembers,meetadmin,meetsubject,meetingtype,date,meetingtime,description,meetingattachment);
        }
      });
    }

    function sendEmail(meetmembers,meetadmin,meetsubject,meetingtype,date,meetingtime,description,meetingattachment){
      var memebersinmeettomail = [];
      for(var j=0; j<meetmembers.length; j++){
        memebersinmeettomail.push(meetmembers[j].membersinmeet);
      }
      for(var i=0; i<meetmembers.length; i++){
        db.query("SELECT email,uname FROM register WHERE uname = '"+meetmembers[i].membersinmeet+"'", function(err, email){
          var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: "chatresloksek@gmail.com",
              pass: "resloksek"
            }
          });
          if(email[0].uname === meetadmin){
            var mailOptions = {
              from: meetadmin, // sender address
              to: email[0].email, // list of receivers
              subject: meetsubject, // Subject line
              html: '<html>'+
                      '<body style="background-color: #FFFEFB;">'+
                        '<div style="font-size:18px; margin-top: 10px;text-transform: capitalize;">Hi '+meetadmin+'</div><br>'+
                        '<div style="text-transform: capitalize;color: #069925; font-size:15px;">You Organised This Meeting.</div><br><br>'+
                        '<div style="border-left: 6px solid #1f82dc;">'+
                          '<div style="margin-left: 20px;">'+
                            '<div><b>Meeting Type : </b> '+meetingtype+'</div>'+
                            '<div><b>Meeting Time : </b> '+date +',  '+ meetingtime+'</div>'+
                            '<div><b>Agenda : </b> '+meetsubject+'</div>'+
                          '</div>'+
                        '</div><br>'+
                        '<div><b>Members in Meeting : </b>'+memebersinmeettomail+'</div><br>'+
                        '<div><b>Details</b></div>'+
                        '<div>'+description+'</div>'+
                      '</body>'+
                    '</html>',
            }
            if(meetingattachment !== 'null'){
              mailOptions.attachments = [{path: 'public/uploads/meetingattachments/'+meetingattachment}]
            }else{
              delete mailOptions.attachments
            }
          }else{
            var mailOptions = {
              from: meetadmin, // sender address
              to: email[0].email, // list of receivers
              subject: meetsubject, // Subject line
              html: '<html>'+
                      '<body style="background-color: #FFFEFB;">'+
                        '<div style="font-size:18px; margin-top: 10px;text-transform: capitalize;">Hi '+email[0].uname+'</div><br>'+
                        '<div style="text-transform: capitalize;color: #069925;font-size:15px;">You Are Invited To This Meeting.</div><br><br>'+
                        '<div style="border-left: 6px solid #1f82dc;">'+
                          '<div style="margin-left: 20px;">'+
                            '<div><b>Meeting Type : </b> '+meetingtype+'</div>'+
                            '<div><b>Presenter : </b> '+meetadmin+'</div>'+
                            '<div><b>Meeting Time : </b> '+date +',  '+ meetingtime+'</div>'+
                            '<div><b>Agenda : </b> '+meetsubject+'</div>'+
                          '</div>'+
                        '</div><br>'+
                        '<div><b>Members in Meeting : </b>'+memebersinmeettomail+'</div><br>'+
                        '<div><b>Details</b></div>'+
                        '<div>'+description+'</div>'+
                      '</body>'+
                    '</html>'
            }
            if(meetingattachment !== 'null'){
              mailOptions.attachments = [{path: 'public/uploads/meetingattachments/'+meetingattachment}]
            }else{
              delete mailOptions.attachments
            }
          }
          smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
              console.log(error);
            }else{
              console.log("Message sent: ");
            }
          });
        });
      }
    }
  });


  socket.on('nodeMeetingNotification', function(data, uname){
    notifier.notify({
      title: 'Hi '+uname,
      message: 'You have new meeting invitation from '+data.meetadmin+'\nTopic: '+data.meetsubject+'',
      icon: __dirname + '/public/uploads/profileimages/pro-pic.png',
      sound: true,
      wait: true,
      sticky: true
    });
  });

  socket.on('meetingremainder', function(data){
    notifier.notify({
      title: 'Reminder for '+data.meetsubject+'',
      message: 'You have meeting at '+data.meetingtime+' on '+data.date+'',
      icon: __dirname + '/public/uploads/profileimages/reminder-bell.png',
      sound: true,
      wait: true,
      sticky: true
    });
  });

  socket.on('momtoalldesktopreminder', function(data){
    notifier.notify({
      title: 'Action Of Item Reminder for '+data.identifier,
      message: data.point,
      icon: __dirname + '/public/uploads/profileimages/reminder-bell.png',
      sound: true,
      wait: true,
      sticky: true
    });
  });

  socket.on('setremindertime', function(rt, uniquemeetname, uname){
    db.query("UPDATE "+uniquemeetname+" SET remindertime= '"+rt+"' WHERE membersinmeet='"+uname+"'");
  });

  socket.on('declinemeeting',function(data){
    for(var i=0; i<clients.length; i++){
      if(clients[i].uniqueUserName === data.organizer){
        io.to(clients[i].id).to(data.id).emit('pushMeetingNotifications', data);
      }
    }
    db.query("INSERT INTO meetingnotifications (organizer,participant,accept_or_reject,reason,uniquemeetname,meetingsubject,status) VALUES('"+data.organizer+"', '"+data.participant+"', '"+data.accept_or_reject+"', '"+data.reason+"','"+data.uniquemeetname+"', '"+data.meetingsubject+"', '"+data.status+"');");    
  });
  socket.on('acceptmeeting',function(data){
    for(var i=0; i<clients.length; i++){
      if(clients[i].uniqueUserName === data.organizer){
        io.to(clients[i].id).to(data.id).emit('pushMeetingNotifications', data);
      }
    }
    db.query("INSERT INTO meetingnotifications (organizer,participant,accept_or_reject,uniquemeetname,meetingsubject,status) VALUES('"+data.organizer+"', '"+data.participant+"', '"+data.accept_or_reject+"','"+data.uniquemeetname+"', '"+data.meetingsubject+"', '"+data.status+"');");
  });

  socket.on('meetingnotificationseen', function(notification){
    db.query("UPDATE meetingnotifications SET status='seen' WHERE uniquemeetname='"+notification.uniquemeetname+"' AND organizer='"+notification.organizer+"' AND participant='"+notification.participant+"'");
  })

  socket.on('createnotesforme', function(createnotesformedata){
    db.query("UPDATE "+createnotesformedata.uniquemeetname+" SET momtome = '"+createnotesformedata.createnotesforme+"' WHERE membersinmeet = '"+createnotesformedata.member+"'", function(){
      createnotesforme(createnotesformedata);
    });
    function createnotesforme(createnotesformedata){
      db.query("SELECT email FROM register WHERE uname ='"+createnotesformedata.member+"'", function(err, emails){
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "chatresloksek@gmail.com",
            pass: "resloksek"
          }
        });
        var mailOptions = {
          from: 'You', // sender address
          to: emails[0].email, // list of receivers
          subject: createnotesformedata.meetingsubject, // Subject line
          html: createnotesformedata.createnotesforme
        }
        smtpTransport.sendMail(mailOptions, function(error, response){if(error){console.log(error);}});
      });
    }
  });

  socket.on('proposedtime', function(data){
    for(var i=0; i<clients.length; i++){
      if(clients[i].uniqueUserName === data.organizer){
        io.to(clients[i].id).to(data.id).emit('pushMeetingNotifications', data);
      }
    }
    db.query("INSERT INTO meetingnotifications (organizer,participant,accept_or_reject,uniquemeetname,meetingsubject,status,proposeddate,proposedtime) VALUES('"+data.organizer+"', '"+data.participant+"', '"+data.accept_or_reject+"', '"+data.uniquemeetname+"', '"+data.meetingsubject+"', '"+data.status+"', '"+data.proposeddate+"','"+data.proposedtime+"');");
  });
  
  // meeting end

  // action of items

  socket.on('actionofitem', function(data){
    var tablename = data.identifier+'AOI';
    db.query("UPDATE "+data.identifier+" SET momtoall='"+tablename+"' WHERE membersinmeet='"+data.assignedby+"' AND momtoall IS NULL");
    db.query("UPDATE meetings SET momtoall='"+tablename+"' WHERE uniquemeetname='"+data.identifier+"' AND momtoall IS NULL");
    db.query("CREATE TABLE IF NOT EXISTS "+tablename+" (AOIId INT NOT NULL AUTO_INCREMENT PRIMARY KEY, identifier longtext NOT NULL, assignedby varchar(20) NOT NULL, assignedto longtext NULL, point longtext NOT NULL, workstream longtext NULL, adminstatus varchar(20) NULL, memberstatus varchar(20) NULL, priority varchar(20) NULL, createddate longtext NOT NULL, pcdate longtext NULL, acdate longtext NULL, reminder longtext NULL);");
    db.query("INSERT INTO "+tablename+" (identifier, assignedby, assignedto, point, workstream, priority, createddate, pcdate, adminstatus) VALUES('"+data.identifier+"', '"+data.assignedby+"', '"+data.assignedto+"', '"+data.AOIpoint+"', '"+data.workstream+"', '"+data.priority+"', '"+data.createddate+"', '"+data.duedate+"','Created')", function(err){
      if(err){console.log(err)}else{
        db.query("SELECT * FROM "+tablename+" WHERE createddate= '"+data.createddate+"'", function(err, selectedAOIdata){
          if(err){console.log(err)}else{
            each(selectedAOIdata, function(value, key, array){
              for(var i=0; i<clients.length; i++){
                if(clients[i].uniqueUserName === value.assignedby){
                  io.to(clients[i].id).emit('actionofitem', value);
                }
              }
            });
          }
        })
      }
    });
  });
  socket.on('getmomtoalldata', function(momtoalltablename, uname){
    db.query("SELECT * FROM "+momtoalltablename+"", function(err, momtoalldata){
      if(err){console.log(err)}else{
        for(var i=0; i<clients.length; i++){
          if(clients[i].uniqueUserName === uname){
            io.to(clients[i].id).emit('getmomtoalldata', momtoalldata);
          }
        }
      }
    });
  });

  socket.on('shareaoi', function(tablename, meetmembers, mail, cmpltdtime){
    var aoitable = tablename+'AOI';
    db.query("UPDATE meetings SET momshared = 'shared',meetingcmpltd = '"+cmpltdtime+"' WHERE uniquemeetname = '"+tablename+"'");
    db.query("UPDATE "+tablename+" SET momtoall='"+aoitable+"', hide='hide', momstatus= 'unseen'");
    db.query("SELECT * FROM "+aoitable+"", function(err, momtoalldata){
      if(err){console.log(err)}else{
        for(var i=0; i<clients.length; i++){
          for(var j=0; j<meetmembers.length; j++){
            if(clients[i].uniqueUserName == meetmembers[j].membersinmeet){
              io.to(clients[i].id).emit('shareaoi', aoitable, tablename, momtoalldata, cmpltdtime);
            }
          }
        }
      }
    });
    if(mail == 'shareandmail'){
      for(var j=0; j<meetmembers.length; j++){
        db.query("SELECT email FROM register WHERE uname='"+meetmembers[j].membersinmeet+"'", function(err, mailsdata){
          AOIMail(mailsdata[0].email);
        });
      }
    }
    function AOIMail(email){
      var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "chatresloksek@gmail.com",
          pass: "resloksek"
        }
      });
      var mailOptions = {
        from: 'Action Of Items', // sender address
        to: email, // list of receivers
        subject: 'This is Action of items mail', // Subject line
        html: '<h1>hii</h1>'
      }
      smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
          console.log(error);
        }else{
          console.log("Message sent: ");
        }
      });
    }
  })

  socket.on('updateactionofitem', function(updatedata){
    var tablename = updatedata.identifier+'AOI';
    db.query("UPDATE "+tablename+" SET assignedto='"+updatedata.assignedto+"', point='"+updatedata.AOIpoint+"', workstream='"+updatedata.workstream+"', priority='"+updatedata.priority+"', pcdate='"+updatedata.duedate+"' WHERE AOIId='"+updatedata.editobjid+"' AND createddate='"+updatedata.createddate+"'", function(err){
      if(err){console.log(err)}else{
        db.query("SELECT * FROM "+tablename+" WHERE createddate= '"+updatedata.createddate+"'", function(err, selectedAOIdata){
          if(err){console.log(err)}else{
            each(selectedAOIdata, function(value, key, array){
              for(var i=0; i<clients.length; i++){
                if(clients[i].uniqueUserName === value.assignedby){
                  io.to(clients[i].id).emit('updateactionofitem', value);
                }
              }
            });
          }
        })
      }
    });
  })

  socket.on('updateadminstatus', function(status, AOI){
    var tablename = AOI.identifier+'AOI';
    db.query("UPDATE "+tablename+" SET adminstatus='"+status+"' WHERE AOIId='"+AOI.AOIId+"' AND createddate='"+AOI.createddate+"'");
  })

  socket.on('updatememberstatus', function(status, AOI, meetmembers){
    var tablename = AOI.identifier+'AOI';
    db.query("UPDATE "+tablename+" SET memberstatus='"+status+"' WHERE AOIId='"+AOI.AOIId+"' AND createddate='"+AOI.createddate+"'");
    for(var i=0; i<clients.length; i++){
      for(var j=0; j<meetmembers.length; j++){
        if(clients[i].uniqueUserName === meetmembers[j].membersinmeet){
          io.to(clients[i].id).emit('onlineupdateofmemberstatus', status, AOI);
        }
      }
    }
  })

  socket.on('namedatetime', function(uname,AOI){
    var tablename = AOI.identifier+'AOI';
    db.query("SELECT reminder FROM "+tablename+" WHERE AOIId='"+AOI.AOIId+"' AND createddate='"+AOI.createddate+"'", function(err, reminderdata){
      if(err){console.log(err)}else{
        for(var i=0; i<clients.length; i++){
          if(clients[i].uniqueUserName == uname){
            if(reminderdata[0].reminder == null){
              io.to(clients[i].id).emit('reminderisnull');
            }else{
              io.to(clients[i].id).emit('reminderisnotnull', reminderdata[0].reminder);
            }
          }
        }
      }
    })
  });

  socket.on('reminderisnull', function(remindertime, AOI, unames){
    var tablename = AOI.identifier+'AOI';
    db.query("UPDATE "+tablename+" SET reminder='"+remindertime+"' WHERE AOIId='"+AOI.AOIId+"' AND createddate='"+AOI.createddate+"'");
    db.query("SELECT * FROM "+tablename+"", function(err, momtoalldata){
      if(err){console.log(err)}else{
        for(var i=0; i<clients.length; i++){
          for(var j=0; j<unames.length; j++){
            if(clients[i].uniqueUserName == unames[j].membersinmeet){
              io.to(clients[i].id).emit('updatemomtoalldata', AOI, momtoalldata);
            }
          }
        }
      }
    });
  });

  socket.on('updatenamedatetime', function(AOI, reminderAOIarray, unames){
    var tablename = AOI.identifier+'AOI';
    db.query("UPDATE "+tablename+" SET reminder='"+reminderAOIarray+"' WHERE AOIId='"+AOI.AOIId+"' AND createddate='"+AOI.createddate+"'");
    db.query("SELECT * FROM "+tablename+"", function(err, momtoalldata){
      if(err){console.log(err)}else{
        for(var i=0; i<clients.length; i++){
          for(var j=0; j<unames.length; j++){
            if(clients[i].uniqueUserName == unames[j].membersinmeet){
              io.to(clients[i].id).emit('updatemomtoalldata', AOI, momtoalldata);
            }
          }
        }
      }
    });
  });

  socket.on('changenamedatetime', function(uname, AOI){
    var tablename = AOI.identifier+'AOI';
    db.query("SELECT reminder FROM "+tablename+" WHERE AOIId='"+AOI.AOIId+"' AND createddate='"+AOI.createddate+"'", function(err, changereminderdata){
      if(err){console.log(err)}else{
        for(var i=0; i<clients.length; i++){
          if(clients[i].uniqueUserName == uname){
            io.to(clients[i].id).emit('changenamedatetime', changereminderdata[0].reminder);
          }
        }
      }
    });
  });

  socket.on('momstatusasseen', function(uniquemeetname, uname){
    db.query("UPDATE "+uniquemeetname+" SET momstatus= 'seen' WHERE membersinmeet='"+uname+"'");
  });

  // action of items end

  // share files

  sharefilesfromdatabase();
  function sharefilesfromdatabase(){
    var sharefilesfromdatabase = [];
    db.query("SELECT * FROM sharefiles WHERE uploaderusername = '"+uniqueUserName+"'", function(err, data){
      sharefilesfromdatabase = data;
    });
    db.query("SELECT * FROM sharedfiles WHERE tousername = '"+uniqueUserName+"'", function(err, data){
      each(data, function(value, key, array){
        sharefilesfromdatabase.push(value);
      });
      socket.emit('sharefromdatabase', sharefilesfromdatabase);
    });
  }
 
  socket.on('sharefile', function(data){
    db.query("INSERT INTO sharefiles (uploadername,uploaderusername,file,filetype,fst) VALUES ('"+data.uploadername+"', '"+data.uploaderusername+"', '"+data.file+"', '"+data.filetype+"', '"+data.fst+"')");
    for(var i=0; i<clients.length; i++){
      if(clients[i].uniqueUserName === data.uploaderusername){
        io.to(clients[i].id).emit('sharefile',{
          uploadername: data.uploadername,
          uploaderusername: data.uploaderusername,
          file: data.file,
          filetype: data.filetype,
          fst: data.fst
        });
      }
    }
  });

  socket.on('sharetothisusers', function(data){
    var sharetothisusersdata = data.sharetothisusersdata;
    for(var i=0; i<sharetothisusersdata.length; i++){
      db.query("INSERT INTO sharedfiles (uploadername,uploaderusername,file,filetype,fst,fromname,fromusername,toname,tousername,status) VALUES ('"+data.selectedShareFileData.uploadername+"', '"+data.selectedShareFileData.uploaderusername+"', '"+data.selectedShareFileData.file+"', '"+data.selectedShareFileData.filetype+"', '"+data.fst+"', '"+data.fromname+"', '"+data.fromusername+"', '"+sharetothisusersdata[i].fname+"', '"+sharetothisusersdata[i].uname+"', 'unseen')");
      for(var j=0; j<clients.length; j++){
        if(clients[j].uniqueUserName === sharetothisusersdata[i].uname){
          io.to(clients[j].id).emit('sharetothisusers', {
            uploadername: data.selectedShareFileData.uploadername,
            uploaderusername: data.selectedShareFileData.uploaderusername,
            file: data.selectedShareFileData.file,
            filetype: data.selectedShareFileData.filetype,
            fst: data.fst,
            fromname: data.fromname,
            fromusername: data.fromusername,
            toname: sharetothisusersdata[i].fname,
            tousername: sharetothisusersdata[i].uname,
            status: 'unseen'
          });
        }
      }
    }
  });

  socket.on('removefile', function(data,username){
    db.query("SELECT * FROM sharedfiles WHERE file='"+data.file+"' AND filetype='"+data.filetype+"' AND fromusername= '"+data.uploaderusername+"'", function(err, checkdata){
      if(checkdata.length === 0){
        db.query("DELETE FROM sharefiles WHERE file='"+data.file+"' AND fst='"+data.fst+"'", function(err){
          if(err){console.log(err)}else{
            updatedsharefiles();
          }
        });
        if(data.filetype === 'application' || data.filetype == 'text'){
          fs.unlink("./public/uploads/share/file/"+data.file+"", function(err){});
        }else{
          fs.unlink("./public/uploads/share/"+data.filetype+"/"+data.file+"", function(err){});
        }
      }else{
        if(checkdata[0].uploaderusername === username){
          db.query("DELETE FROM sharefiles WHERE uploaderusername='"+username+"' AND file='"+data.file+"' AND fst='"+data.fst+"'");
          db.query("DELETE FROM sharedfiles WHERE tousername='"+username+"' AND file='"+data.file+"' AND fromusername= '"+data.fromusername+"' AND fst='"+data.fst+"'", function(err){
            if(err){console.log(err)}else{
              updatedsharefiles();
            }
          });
          db.query("SELECT * FROM sharedfiles WHERE file='"+data.file+"'", function(err, dt){
            if(dt.length === 0){
              if(data.filetype === 'application' || data.filetype == 'text'){
                fs.unlink("./public/uploads/share/file/"+data.file+"", function(err){});
              }else{
                fs.unlink("./public/uploads/share/"+data.filetype+"/"+data.file+"", function(err){});
              }
            }
          });
        }else{
          db.query("DELETE FROM sharedfiles WHERE tousername='"+username+"' AND fromusername= '"+data.fromusername+"' AND file='"+data.file+"' AND fst='"+data.fst+"'", function(err){
            if(err){console.log(err)}else{
              updatedsharefiles();
            }
          });
          updatedsharefiles();
          db.query("SELECT * FROM sharedfiles WHERE file='"+data.file+"' AND filetype='"+data.filetype+"'", function(err, checkdata1){
            if(checkdata1.length === 0){
              db.query("SELECT * FROM sharefiles WHERE file='"+data.file+"' AND filetype='"+data.filetype+"'", function(err, uploaderdata){
                if(uploaderdata.length === 0){
                  if(data.filetype === 'application' || data.filetype == 'text'){
                    fs.unlink("./public/uploads/share/file/"+data.file+"", function(err){});
                  }else{
                    fs.unlink("./public/uploads/share/"+data.filetype+"/"+data.file+"", function(err){});
                  }
                }
              })
            }
          });
        }
      }
    });
    function updatedsharefiles(){
      var sharefilesfromdatabase = [];
      db.query("SELECT * FROM sharefiles WHERE uploaderusername = '"+username+"'", function(err, data){
        sharefilesfromdatabase = data;
        db.query("SELECT * FROM sharedfiles WHERE tousername = '"+username+"'", function(err, data){
          each(data, function(value, key, array){
            sharefilesfromdatabase.push(value);
          });
          for(var i=0; i<clients.length; i++){
            if(clients[i].uniqueUserName === username){
              io.to(clients[i].id).emit('sharefromdatabase', sharefilesfromdatabase);
            }
          }
        });
      });
    }
  });

  socket.on('sharefilesasseen', function(data){
    db.query("UPDATE sharedfiles SET status='seen' WHERE tousername='"+data.tousername+"' AND fst='"+data.fst+"' AND file='"+data.file+"'");
  });

  //sharefiles end

  //Quotes

  socket.on('sendtodaydate', function(todaydate){
    db.query("SELECT * FROM quotes WHERE date='"+todaydate+"'", function(err, data){
      if(err){console.log(err);}else{
        socket.emit('quotesdatafromdatabase', data);
      }
    });
  });

  socket.on('quotesdata', function(quotedata){
    db.query("SELECT date FROM quotes WHERE date='"+quotedata.tomorrowdate+"'", function(err, tomdata){
      if(tomdata.length === 0){
        db.query("SELECT date FROM quotes WHERE date='"+quotedata.date+"'", function(err, todaydata){
          if(todaydata.length === 0){
            for(var i=0; i<clients.length; i++){
              io.to(clients[i].id).emit('quotesdata', quotedata);
            }
            db.query("INSERT INTO quotes (name,postedby,quote,date,userimage) VALUES('"+quotedata.name+"', '"+quotedata.postedby+"', '"+quotedata.quote+"', '"+quotedata.date+"', '"+quotedata.userimage+"');");
          }else{
            for(var i=0; i<clients.length; i++){
              if(clients[i].uniqueUserName == quotedata.postedby){
                io.to(clients[i].id).emit('tomsuccessmsg');
              }
            }
            db.query("INSERT INTO quotes (name,postedby,quote,date,userimage) VALUES('"+quotedata.name+"', '"+quotedata.postedby+"', '"+quotedata.quote+"', '"+quotedata.tomorrowdate+"', '"+quotedata.userimage+"');");
          }
        });
      }else{
        db.query("SELECT date FROM quotes WHERE date='"+quotedata.date+"'", function(err, todaydata){
          if(todaydata.length === 0){
            db.query("INSERT INTO quotes (name,postedby,quote,date,userimage) VALUES('"+quotedata.name+"', '"+quotedata.postedby+"', '"+quotedata.quote+"', '"+quotedata.date+"', '"+quotedata.userimage+"');");
          }else{
            for(var i=0; i<clients.length; i++){
              if(clients[i].uniqueUserName == quotedata.postedby){
                io.to(clients[i].id).emit('tomerrormsg');
              }
            }
          }
        });
      }
    });
  });

  informationsharing();
  function informationsharing(){
    db.query("SELECT * FROM information ", function(err, data){
      if(err){console.log(err);}else{
        for(var i=0; i<data.length; i++){
          if(data[i].information !== null){
            data[i].information = data[i].information.replace(/squote/g, "'");
          }
        }
        for(var i=0; i<clients.length; i++){
            io.to(clients[i].id).emit('informationdatafromdatabase', data);
        }
      }
    });
  }

  socket.on('informationdata', function(informationdata){
    db.query("INSERT INTO information (name,postedby,information,date,userimage) VALUES('"+informationdata.name+"', '"+informationdata.postedby+"', '"+informationdata.information+"', '"+informationdata.date+"', '"+informationdata.userimage+"');");
    db.query("SELECT informationId from information where date= '"+informationdata.date+"'", function(err,infodata){
      if(err){console.log(err);}else{
          db.query("SELECT * from register", function(err,data){
            if(err){console.log(err);}else{
            for(var i=0;i<data.length;i++){
              if(data[i].uname !== informationdata.postedby){
                db.query("INSERT INTO informationnotifications (informationId,member,status) VALUES('"+infodata[0].informationId+"','"+data[i].uname+"', 'unseen');");
              }
            }
            for(var j=0; j<clients.length; j++){
              if(clients[j].uniqueUserName !== informationdata.postedby){
              io.to(clients[j].id).emit('infonotifications', {informationId: infodata[0].informationId, member:clients[j].uniqueUserName, status:'unseen'});
              }
            }
          }
        })
      }
    });
    for(var i=0; i<clients.length; i++){
      io.to(clients[i].id).emit('infodata', {information: informationdata.information.replace(/squote/g, "'"), name:informationdata.name, postedby:informationdata.postedby, date: informationdata.date, userimage:informationdata.userimage});
    }
  });

  infonotifications();
  function infonotifications(){
    db.query("SELECT * FROM informationnotifications", function(err, data){
      if(err){console.log(err);}else{
        for(var i=0; i<clients.length; i++){
            io.to(clients[i].id).emit('dbinformationnotifications', data);
        }
      }
    });
  }

  socket.on("infocountdecrement",function(data){
    db.query("DELETE FROM informationnotifications WHERE member = '"+data+"'");
  });

  // quotes end

  // leave letter

  sendleaves();
  function sendleaves(){
    db.query('SELECT * FROM leaveletter', function(err, data){
      if(err){
        console.log(err);
      }else{
        leavefun(data);
      }
    });
    function leavefun(leavesub){
      each(leavesub, function (value, key, array) {
        var leaveId = value.leaveId;
        var uniqueleavename = value.uniqueleavename;
        var fromuname = value.fromuname;
        var fromfname = value.fromfname;
        var subject = value.subject;
        var reason = value.reason;
        var hours = value.hours;
        var fromdate = value.fromdate;
        var todate = value.todate;
        var currentdate = value.currentdate;
        var leavemembers = [];
        db.query("SELECT * FROM "+uniqueleavename+"", function(err, data){
          leavemembers = data;
          leaves[key] = {leaveId: leaveId, uniqueleavename: uniqueleavename, fromuname: fromuname, fromfname: fromfname, subject: subject, reason: reason, hours: hours, fromdate: fromdate, todate: todate, currentdate: currentdate, leavemembers: leavemembers, fromdelete: value.fromdelete};
          for(var i=0; i<clients.length; i++){
            if(clients[i].id === socket.id){
              if(clients[i].uniqueUserName === fromuname){
                socket.emit('leavesfromdatabasefromuname', leaves[key]);
              }else{
                for(var j=0; j<leavemembers.length; j++){
                  if(clients[i].uniqueUserName === leavemembers[j].touname){
                    socket.emit('leavesfromdatabasetouname', leaves[key]);
                  }
                }
              }
            }
          }
        });
      });
      db.query("SELECT * FROM leavereplys WHERE fromuname= '"+uniqueUserName+"' OR touname= '"+uniqueUserName+"'", function(err,data){
        socket.emit('leavereplysfromdatabase', data);
      });
    }
  }

  socket.on('leaveletterdata', function(data){
    if(data.fromdate){
      db.query("INSERT INTO leaveletter (fromuname,fromfname,subject,reason,fromdate,todate,currentdate) VALUES ('"+data.fromuname+"', '"+data.fromfname+"', '"+data.subject+"', '"+data.reason+"', '"+data.fromdate+"', '"+data.todate+"', '"+data.currentdate+"')");
      createLeaveTable();
    }
    if(data.hours){
      db.query("INSERT INTO leaveletter (fromuname,fromfname,subject,reason,hours,currentdate) VALUES ('"+data.fromuname+"', '"+data.fromfname+"', '"+data.subject+"', '"+data.reason+"', '"+data.hours+"', '"+data.currentdate+"')");
      createLeaveTable();
    }
    function createLeaveTable(){
      db.query("SELECT * FROM leaveletter WHERE fromuname ='"+data.fromuname+"' AND currentdate ='"+data.currentdate+"';", function(err, uniquetabledata){
        var uniqueleavename = uniquetabledata[0].currentdate + uniquetabledata[0].leaveId;
        db.query("UPDATE leaveletter SET uniqueleavename= '"+uniqueleavename+"' WHERE fromuname='"+uniquetabledata[0].fromuname+"' AND currentdate='"+uniquetabledata[0].currentdate+"'")
        db.query("CREATE TABLE IF NOT EXISTS "+uniqueleavename+" (uniqueleavename text NOT NULL, fromuname text NOT NULL, fromfname text NOT NULL,touname text NOT NULL, tofname text NOT NULL, decision text NULL, notification text NOT NULL, todelete varchar(20) NULL)");
        for(var i=0; i< data.tousers.length; i++){
          db.query("INSERT INTO "+uniqueleavename+" (uniqueleavename,fromuname,fromfname,touname,tofname,notification) VALUES ('"+uniqueleavename+"', '"+uniquetabledata[0].fromuname+"', '"+uniquetabledata[0].fromfname+"', '"+data.tousers[i].uname+"', '"+data.tousers[i].fname+"', 'unseen')");
        }
        db.query("SELECT * FROM leaveletter WHERE fromuname ='"+data.fromuname+"' AND currentdate ='"+data.currentdate+"';", function(err, pushleavedata){
          pushleaves(pushleavedata)
        });
      });
      function pushleaves(pushleavedata){
        var leaveId = pushleavedata[0].leaveId;
        var uniqueleavename = pushleavedata[0].uniqueleavename;
        var fromuname = pushleavedata[0].fromuname;
        var fromfname = pushleavedata[0].fromfname;
        var subject = pushleavedata[0].subject;
        var reason = pushleavedata[0].reason;
        var hours = pushleavedata[0].hours;
        var fromdate = pushleavedata[0].fromdate;
        var todate = pushleavedata[0].todate;
        var currentdate = pushleavedata[0].currentdate;
        var leavemembers = [];
        db.query("SELECT * FROM "+uniqueleavename+"", function(err, leavemembersdata){
          leavemembers = leavemembersdata;
          leaves = {leaveId: leaveId, uniqueleavename: uniqueleavename, fromuname: fromuname, fromfname: fromfname, subject: subject, reason: reason, hours: hours, fromdate: fromdate, todate: todate, currentdate: currentdate, leavemembers: leavemembers, fromdelete: pushleavedata[0].fromdelete};
          for(var i=0; i<clients.length; i++){
            if(clients[i].uniqueUserName === fromuname){
              io.to(clients[i].id).emit('pushleavesdata', leaves);
            }
            for(var j=0; j<leavemembers.length; j++){
              if(clients[i].uniqueUserName === leavemembers[j].touname){
                io.to(clients[i].id).emit('pushleavesdata', leaves);
              }
            }
          }
        });
      }
    }
  });


  socket.on('replychat', function(leavereply,selectedreplymember,rst){
    for(var i=0; i<clients.length; i++){
      if((clients[i].uniqueUserName === selectedreplymember.fromuname) || (clients[i].uniqueUserName === selectedreplymember.touname)){
        io.to(clients[i].id).emit('replychat',{
          uniqueleavename: selectedreplymember.uniqueleavename,
          fromfname: selectedreplymember.fromfname,
          fromuname: selectedreplymember.fromuname,
          tofname: selectedreplymember.tofname,
          touname: selectedreplymember.touname,
          replymessage: leavereply,
          rst: rst,
          notification: 'unseen'
        });
      }
    }
    db.query("UPDATE "+selectedreplymember.uniqueleavename+" SET todelete= NULL WHERE touname='"+selectedreplymember.touname+"' AND todelete= 'delete'")
    db.query("INSERT INTO leavereplys (uniqueleavename,fromfname,fromuname,tofname,touname,replymessage,rst,notification) VALUES('"+selectedreplymember.uniqueleavename+"','"+selectedreplymember.fromfname+"','"+selectedreplymember.fromuname+"','"+selectedreplymember.tofname+"','"+selectedreplymember.touname+"','"+leavereply+"','"+rst+"','unseen');");
  });
  socket.on('replychatto', function(leavereply, selectedleavedata, rst, tofname, touname){
    for(var i=0; i<clients.length; i++){
      if((clients[i].uniqueUserName === selectedleavedata.fromuname) || (clients[i].uniqueUserName === touname)){
        io.to(clients[i].id).emit('replychatto',{
          uniqueleavename: selectedleavedata.uniqueleavename,
          fromfname:tofname,
          fromuname: touname,
          tofname: selectedleavedata.fromfname,
          touname: selectedleavedata.fromuname,
          replymessage: leavereply,
          rst: rst,
          notification: 'unseen'
        });
      }
    }
    db.query("UPDATE leaveletter SET fromdelete= NULL WHERE uniqueleavename = '"+selectedleavedata.uniqueleavename+"' AND fromdelete='delete'");
    db.query("INSERT INTO leavereplys (uniqueleavename,fromfname,fromuname,tofname,touname,replymessage,rst,notification) VALUES('"+selectedleavedata.uniqueleavename+"', '"+tofname+"', '"+touname+"', '"+selectedleavedata.fromfname+"', '"+selectedleavedata.fromuname+"', '"+leavereply+"', '"+rst+"','unseen')");
  });

  socket.on('leavemakeasseen', function(data){
    db.query("UPDATE "+data.uniqueleavename+" SET notification= 'seen' WHERE touname='"+data.uname+"'");
    db.query("UPDATE leavereplys SET notification='seen' WHERE uniqueleavename= '"+data.uniqueleavename+"' AND touname='"+data.uname+"'");
  });

  socket.on('deleteleave', function(deleteleavedata, uname){
  if(deleteleavedata.fromuname == uname){
    db.query("UPDATE leaveletter SET fromdelete='delete' WHERE fromuname='"+uname+"' AND uniqueleavename='"+deleteleavedata.uniqueleavename+"'", function(err){
      db.query("SELECT * FROM "+deleteleavedata.uniqueleavename+" WHERE todelete IS NULL",function(err, ddata){
        if(err){console.log(err)}else{
          if(ddata.length == 0){
            db.query("DROP TABLE "+deleteleavedata.uniqueleavename+"");
            db.query("DELETE FROM leaveletter WHERE uniqueleavename='"+deleteleavedata.uniqueleavename+"' AND fromdelete='delete'");
            db.query("DELETE FROM leavereplys WHERE uniqueleavename='"+deleteleavedata.uniqueleavename+"'");
          }
        }
      });
    });
    }else{
    db.query("UPDATE "+deleteleavedata.uniqueleavename+" SET todelete='delete' WHERE touname='"+uname+"'", function(err){
      if(err){console.log(err)}else{
        db.query("SELECT * FROM "+deleteleavedata.uniqueleavename+" WHERE todelete IS NULL",function(err, ddata){
          if(err){console.log(err)}else{
            if(ddata.length == 0){
              db.query("SELECT * FROM leaveletter WHERE uniqueleavename='"+deleteleavedata.uniqueleavename+"'", function(err, dddata){
                if(err){console.log(err)}else{
                  if(dddata[0].fromdelete == 'delete'){
                    db.query("DROP TABLE "+deleteleavedata.uniqueleavename+"");
                    db.query("DELETE FROM leaveletter WHERE uniqueleavename='"+deleteleavedata.uniqueleavename+"' AND fromdelete='delete'");
                    db.query("DELETE FROM leavereplys WHERE uniqueleavename='"+deleteleavedata.uniqueleavename+"'");
                  }
                }
              })
            }
          }
        });
      }
    });
  }
  })

  // leave letter end

  // Audio Video calling

  socket.on('testcommunication', function(data){
    for(var i=0; i<clients.length; i++){
      if(clients[i].uniqueUserName === data){
        io.to(clients[i].id).emit('testcommunication');
      }
    }
  });

  callhistroyFromDatabase();
  function callhistroyFromDatabase(){
    each(clients, function(value, key, array){
      if(value.id === socket.id){
        db.query("SELECT * FROM callhistroy WHERE calleruname='"+value.uniqueUserName+"' OR calleeuname='"+value.uniqueUserName+"'", function(err, data){
          if(err){
            console.log(err);
          }else{
            io.to(value.id).emit('callhistroy-from-database' , data);
          }
        });
        db.query("SELECT * FROM checkcallavailability", function(err,checkcalldata){
          if(err){console.log(err)}else{
            if(checkcalldata.length >= 1){
              io.to(value.id).emit('checkcalldata-from-database' , checkcalldata);
            }
          }
        })
      }
    });
  }
  socket.on('callerId', function(typeofcall, you, youName, youId, selectedId, constraints, callerpic, callstarttime){
    io.to(selectedId).emit('callerId', typeofcall, you, youName, youId, constraints, callerpic,callstarttime);
  });
  socket.on('endcall', function(calleeId){
    io.to(calleeId).emit('endcall');
  });
  socket.on('rejectcall', function(data){
    io.to(data).emit('rejectcall');
  })
  socket.on('accrejmodalclose', function(data){
    io.to(data).emit('accrejmodalclose');
  })
  socket.on('splice', function(splice, id){
    io.to(id).emit('splice', splice);
  });
  socket.on('hidesandrbtnoncalleeside', function(calleeId){
    io.to(calleeId).emit('hidesandrbtnoncalleeside');
  });
  socket.on('showsandrbtnoncalleeside', function(calleeId){
    io.to(calleeId).emit('showsandrbtnoncalleeside');
  });
  socket.on('hidesandrbtnoncallerside', function(callerId){
    io.to(callerId).emit('hidesandrbtnoncallerside');
  });
  socket.on('showsandrbtnoncallerside', function(callerId){
    io.to(callerId).emit('showsandrbtnoncallerside');
  });
  socket.on('insertcheckavailability', function(calleeuname,calleruname){
    db.query("INSERT INTO checkcallavailability (callunames) VALUES('"+calleeuname+"')");
    db.query("INSERT INTO checkcallavailability (callunames) VALUES('"+calleruname+"')");
    db.query("SELECT * FROM checkcallavailability", function(err,data){
      if(err){console.log(err)}else{
        socket.broadcast.emit('checkcalldata-from-database', data);
      }
    })
  });
  socket.on('insertendcallrecord', function(missedcalldata){
    db.query("INSERT INTO callhistroy (typeofcall,callerfname,calleruname,callerpic,calleefname,calleeuname,calleepic,callendtype,callstarttime) VALUES ('"+missedcalldata.typeofcall+"', '"+missedcalldata.callerfname+"', '"+missedcalldata.calleruname+"', '"+missedcalldata.callerpic+"', '"+missedcalldata.calleefname+"', '"+missedcalldata.calleeuname+"', '"+missedcalldata.calleepic+"', '"+missedcalldata.callendtype+"', '"+missedcalldata.callstarttime+"')", function(err){
      if(err){console.log(err)}else{
        db.query("SELECT * FROM callhistroy WHERE calleruname='"+missedcalldata.calleruname+"' AND calleeuname='"+missedcalldata.calleeuname+"' AND callstarttime='"+missedcalldata.callstarttime+"'", function(err, inserteddata){
          if(err){console.log(err)}else{
          io.to(missedcalldata.callerId).to(missedcalldata.calleeId).emit('insertendcallrecord', inserteddata[0]);
          }
        });
      }
    });
  });
  socket.on('insertrejectcallrecord', function(rejectcalldata){
    db.query("INSERT INTO callhistroy (typeofcall,callerfname,calleruname,callerpic,calleefname,calleeuname,calleepic,callendtype,callstarttime) VALUES ('"+rejectcalldata.typeofcall+"', '"+rejectcalldata.callerfname+"', '"+rejectcalldata.calleruname+"', '"+rejectcalldata.callerpic+"', '"+rejectcalldata.calleefname+"', '"+rejectcalldata.calleeuname+"', '"+rejectcalldata.calleepic+"', '"+rejectcalldata.callendtype+"', '"+rejectcalldata.callstarttime+"')", function(err){
      if(err){console.log(err)}else{
        db.query("SELECT * FROM callhistroy WHERE calleruname='"+rejectcalldata.calleruname+"' AND calleeuname='"+rejectcalldata.calleeuname+"' AND callstarttime='"+rejectcalldata.callstarttime+"'", function(err, rejectedcalldata){
          if(err){console.log(err)}else{
          io.to(rejectcalldata.callerId).to(rejectcalldata.calleeId).emit('insertendcallrecord', rejectedcalldata[0]);
          }
        });
      }
    });
  });
  socket.on('insertcalldurationrecord', function(calldurationdata){
    db.query("SELECT * FROM callhistroy WHERE calleruname='"+calldurationdata.calleruname+"' AND calleeuname='"+calldurationdata.calleeuname+"' AND callstarttime='"+calldurationdata.callstarttime+"'", function(err, data){
      if(err){console.log(err)}else{
        if(data.length == 0){
          db.query("INSERT INTO callhistroy (typeofcall,callerfname,calleruname,callerpic,calleefname,calleeuname,calleepic,callendtype,callstarttime) VALUES ('"+calldurationdata.typeofcall+"', '"+calldurationdata.callerfname+"', '"+calldurationdata.calleruname+"', '"+calldurationdata.callerpic+"', '"+calldurationdata.calleefname+"', '"+calldurationdata.calleeuname+"', '"+calldurationdata.calleepic+"', '"+calldurationdata.callendtype+"', '"+calldurationdata.callstarttime+"')");
        }
      }
    });
  });
  socket.on('updateduration', function(callerId,calleeId,youName,calleeuname,callstarttime, duration,callendtime){
    db.query("SELECT * FROM callhistroy WHERE calleruname='"+youName+"' AND calleeuname='"+calleeuname+"' AND callstarttime='"+callstarttime+"'", function(err, data){
      if(err){console.log(err)}else{
        if((data[0].callduration === null) && (data[0].callendtime === null)){
          db.query("UPDATE callhistroy SET callduration='"+duration+"', callendtime='"+callendtime+"' WHERE calleruname='"+youName+"' AND calleeuname='"+calleeuname+"' AND callstarttime='"+callstarttime+"'", function(){
            db.query("SELECT * FROM callhistroy WHERE calleruname='"+youName+"' AND calleeuname='"+calleeuname+"' AND callstarttime='"+callstarttime+"'", function(err, calldurationdata){
              io.to(callerId).to(calleeId).emit('insertcalldurationrecord', calldurationdata);
            });
          });
        }
      }
    });
    db.query("DELETE FROM checkcallavailability WHERE callunames='"+youName+"'");
    db.query("DELETE FROM checkcallavailability WHERE callunames='"+calleeuname+"'");
    db.query("SELECT * FROM checkcallavailability", function(err,data){
      if(err){console.log(err)}else{
        socket.broadcast.emit('checkcalldata-from-database', data);
      }
    })
  });
  socket.on('callerstickynotes', function(youName, calleeuname, callstarttime, stickydata){
    db.query("SELECT * FROM callhistroy WHERE calleruname='"+youName+"' AND calleeuname='"+calleeuname+"' AND callstarttime='"+callstarttime+"'", function(err, data){
      if(err){console.log(err)}else{
        if(data[0].callersticky === null){
          db.query("UPDATE callhistroy SET callersticky= '"+stickydata+"' WHERE calleruname='"+youName+"' AND calleeuname='"+calleeuname+"' AND callstarttime='"+callstarttime+"'");
        }
      }
    });
  });
  socket.on('calleestickynotes', function(youName, calleeuname, callstarttime, stickydata){
    db.query("SELECT * FROM callhistroy WHERE calleruname='"+youName+"' AND calleeuname='"+calleeuname+"' AND callstarttime='"+callstarttime+"'", function(err, data){
      if(err){console.log(err)}else{
        if(data[0].calleesticky === null){
          db.query("UPDATE callhistroy SET calleesticky= '"+stickydata+"' WHERE calleruname='"+youName+"' AND calleeuname='"+calleeuname+"' AND callstarttime='"+callstarttime+"'");
        }
      }
    });
  });

  socket.on('deletecallhistory', function(deletecall, uname){
    if(deletecall.calleruname == uname){
      db.query("UPDATE callhistroy SET callerdelete = 'delete' WHERE calleruname='"+deletecall.calleruname+"' AND calleeuname='"+deletecall.calleeuname+"' AND callstarttime='"+deletecall.callstarttime+"'");
      checkdelete();
    }
    if(deletecall.calleeuname == uname){
      db.query("UPDATE callhistroy SET calleedelete = 'delete' WHERE calleruname='"+deletecall.calleruname+"' AND calleeuname='"+deletecall.calleeuname+"' AND callstarttime='"+deletecall.callstarttime+"'");
      checkdelete();
    }
    function checkdelete(){
      db.query("SELECT * FROM callhistroy WHERE calleruname='"+deletecall.calleruname+"' AND calleeuname='"+deletecall.calleeuname+"' AND callstarttime='"+deletecall.callstarttime+"'", function(err, checkdata){
        if(err){console.log(err)}else{
          if(checkdata[0].callerdelete == 'delete' && checkdata[0].calleedelete == 'delete'){
            db.query("DELETE FROM callhistroy WHERE calleruname='"+deletecall.calleruname+"' AND calleeuname='"+deletecall.calleeuname+"' AND callstarttime='"+deletecall.callstarttime+"'")
          }
        }
      });
    }
  });

  // Audio Video calling end

  socket.on('logout', function(data){
    db.query("UPDATE register SET lastseen= '"+data.lastseen+"' WHERE uname= '"+data.logoutuser+"'");
    db.query("DELETE FROM sessions WHERE username= '"+data.logoutuser+"'");
    if(data.selectedStatusItem === 'Online'){
      db.query("UPDATE register SET onlineindication= 'Offline' WHERE uname='"+data.logoutuser+"'");
      sendStatus();
    }
    function sendStatus(){
      db.query("SELECT onlineindication,uname,lastseen FROM register WHERE uname= '"+data.logoutuser+"'",function(err,onlinedata){
        for(var i=0; i<clients.length; i++){
          io.to(clients[i].id).emit('onlineusers',onlinedata);
        }
      });
    }
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    // console.log(clients);
    // each(clients, function (value, key, array) {
    //   if(value.id == socket.id){
    //     db.query("SELECT onlineindication FROM register WHERE uname= '"+value.uniqueUserName+"'", function(err, checkonline){
    //       if(err){console.log(err);} else {
    //         if(checkonline[0].onlineindication === 'Online'){
    //           db.query("UPDATE register SET onlineindication= 'Offline' WHERE uname='"+value.uniqueUserName+"'");
    //           sendStatus();
    //         }
    //       }
    //     });
    //   } 
    //   function sendStatus(){
    //     db.query("SELECT onlineindication,uname FROM register WHERE uname= '"+value.uniqueUserName+"'",function(err,onlinedata){
    //       for(var i=0; i<clients.length; i++){
    //         io.to(clients[i].id).emit('onlineusers',onlinedata);
    //       }
    //     });
    //   }
    // });
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
http.listen(port, function(){
  console.log('listening on *:'+port);
});
module.exports = app;