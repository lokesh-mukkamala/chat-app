'use strict';
var app = angular.module('myApp', ['ui.router','ngMaterial', 'ngMessages','mdPickers','ui-notification','ngSanitize','ngMaterialDatePicker']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, NotificationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });  
  $urlRouterProvider.otherwise('/login');

  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: '../pages/login.html'
  })
  .state('signup', {
    url: '/signup',
    templateUrl: '../pages/signup.html'
  })
  .state('TandC', {
    url: '/TandC',
    templateUrl: '../pages/termsandconditions.html'
  })
  .state('userhome', {
    url: '/userhome/:uniqueUserName',
    templateUrl: '../pages/userhome.html'
  });
  NotificationProvider.setOptions({
    delay: 10000,
    startTop: 300,
    startRight: 100,
    verticalSpacing: 20,
    horizontalSpacing: 20,
    positionX: 'right',
    positionY: 'top'
  });
});

app.controller('myCtrl',function($scope, $http, $state, $timeout) {
  $scope.login = function(myCtrl) {
    $http.post('/userhome', myCtrl).then
    (function(res){
      if(res.data.success){
        $state.go('userhome',{uniqueUserName: res.data.token});
      }else{
        $scope.errorMessage = " Invalid UserName Or Password";
        $timeout(function () {
          $scope.errorMessage   = "";
        }, 2000);
      }
    });
  }    
  $scope.signup= function(myCtrl){
    $scope.errorMessage = "";      
    $http.post('/signup', myCtrl).then
    (function(res){
        if(res.data.success){
          $scope.successMsg= "You Are Registered With Us, Login Here..."; 
          $timeout(function () {
            $scope.successMsg   = "";
          }, 2000);
          $state.go('login');     
        }else{
          alert('User Name already exists, Please choose another User Name');
          $state.go('signup');
        }
    });
  };
  // username validation
  $scope.usernamevalidation = function(x){
    $http.post('/usernamevalidation', {x : x}).then(
      function(res){
        if(res.data.success){
          $scope.x = res.data.successmsg;
        }else{
          $scope.x = res.data.successmsg;
        }
      }
    )
  }
  //  Forgrot Password
  $scope.forgotPswd = function(mailId){
    $http.post('/forgotpswd', {mailId : mailId}).then(
      function(res){
        if(res.data.success){
          $scope.forgotsuccessmsg = res.data.successmsg;
          $timeout(function () {
            $scope.forgotsuccessmsg   = "";
          }, 3000);
        }else{
          forgoterrormsg = res.data.message;
          $timeout(function () {
            $scope.forgoterrormsg   = "";
          }, 3000);
        }
      }
    )
  }
});  


app.controller('socketctrl',function($scope,$rootScope, $mdToast, $interval, $window, $filter, $http, $timeout, Notification, $mdSidenav) {  
  $rootScope.socket= io();
  $scope.users = [];
  $scope.fnames = [];
  $scope.messages = [];
  $scope.groupmsgs = [];
  $scope.yourId = null;
  $scope.profile = {};
  $scope.ctrl = null;
  $scope.img = null;
  $scope.showgroupinput = null;
  $scope.uniquemeetname = null;
  $scope.meetingattachment = null;
  $scope.groupofusers = [];
  $scope.groups = [];
  $scope.meetings = [];
  $scope.meetingtype= null;
  $scope.alwaysAcceptFiles = [];
  $scope.minimize = null;
  $scope.sas= null;
  $scope.mails = null;
  $scope.swa = null;
  $scope.notesforme = null;
  $scope.sharewithall = null;
  $scope.createnotesforme = null;
  $scope.showmomtoalltexteditor = null;
  $scope.showmomtometexteditor = null;
  $scope.MGnotifications = null;
  $scope.groupnotificationscount = null;
  $scope.meetingnotificationcount = null;
  $scope.groupnotifications = null;
  $scope.notifications = null;
  $scope.bellnotifications = null;
  $scope.sharefiles= [];
  $scope.multipleSelectedFiles = [];
  $scope.multipleshare = null;
  $scope.multipleshareimage = null;
  $scope.multiplesharedoc = null;
  $scope.multipleshareaudio = null;
  $scope.multiplesharevideo = null;
  $scope.tomsuccessmsg = null;
  $scope.tomerrormsg = null;
  $scope.newmeetingnotifications = null; 
  $scope.momstatusnotification = null;
  $scope.callduration = 'NULL';
  $scope.attachmentpath = '/uploads/attachments/';
  $scope.groupattachmentpath = '/uploads/groupattachments/';
  $scope.videopath = '/uploads/share/video/';
  $scope.audiopath = '/uploads/share/audio/';

  var header = document.getElementById("myDIV");
  var btns = header.getElementsByClassName("btnn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function(){
      var current = document.getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";
    });
  }

  var header1 = document.getElementById("myDIV1");
  var btns1 = header1.getElementsByClassName("btnn");
  for (var i = 0; i < btns1.length; i++) {
    btns1[i].addEventListener("click", function(){
      var current = document.getElementsByClassName("active1");
      current[0].className = current[0].className.replace(" active1", "");
      this.className += " active1";
      $scope.closeMenuSidenav();
    });
  }
  $.fn.select2.amd.require(['select2/selection/search'], function (Search) {
    var oldRemoveChoice = Search.prototype.searchRemoveChoice;
    Search.prototype.searchRemoveChoice = function () {
      oldRemoveChoice.apply(this, arguments);
      this.$search.val('');
    };
    angular.element('.meetmembers').select2({
      width: '300px',
    });
  });

  angular.element('#reshma').css('left','220px', 'top' , '200');
  angular.element('.navbar-collapse button').click(function(){
    angular.element('.navbar-collapse').collapse('hide');
  });
  angular.element(document).ready(function () {
    angular.element('[data-toggle="tooltip"]').tooltip();
  });
  $window.onblur = function() {
    $scope.minimize = 'minimize';
  }
  $window.focus = function() { 
    $scope.minimize = null;
  }
  angular.element(document).ready(function () {
    angular.element('.froalaeditortome').froalaEditor({
      toolbarButtons: ['fullscreen','bold', 'italic', 'underline','formatOL','formatUL','fontSize', 'subscript', 'superscript','insertlink','specialCharacters','insertTable','undo', 'redo'],
      quickInsertTags : [''], //to avoid plus button
      placeholderText: 'Create Notes For Own Reference.'
    });
    angular.element('.froalaeditortome').on("froalaEditor.contentChanged", function(){
      $scope.createnotesforme = angular.element(this).froalaEditor('html.get');
    });
  });


  // Editing Password
  $scope.edit = 'edit';
  $scope.enableEditor = function() {
    $scope.editmsg= null;
  	if ($scope.edit=="close"){
      $scope.edit = "edit";
    }else {
      $scope.edit = "close";
    }
  };

  //Default Message Popup
  $scope.pmessages = [
    "I am busy now.",
    "I will chat later.",
    "I am in meeting.",
    "I am in work.",
  ];
   
  $scope.changePswd= function(socketctrl){
    $scope.socket.emit('changepswd', socketctrl, $scope.yourId); 
    $scope.socket.on('changepswd',function(data){
      $scope.editmsg= data.msg;
      $scope.$digest();
    })   
  }

  $scope.pro = function(){
    $scope.ctrl = 'profile';
    if(screen.width >= 320 && screen.width <= 767){
      $scope.showgroupinput = null;
    }else{
      if($scope.selectedUserName == null && $scope.uniquegroupname == null){
        $scope.showgroupinput = null;
      }else{
        if($scope.selectedUserName !==null){
          $scope.showgroupinput = 'otochat';
        }else{
          if($scope.uniquegroupname !== null){
            $scope.showgroupinput = 'groupchat';
          }
        }
      }
    }
  }
  $scope.userlist = function(){
    $scope.ctrl = null;
    if(screen.width >= 320 && screen.width <= 767){
      $scope.showgroupinput = null;
    }else{
      if($scope.selectedUserName == null && $scope.uniquegroupname == null){
        $scope.showgroupinput = null;
        $scope.socket.emit('sendtodaydate', $filter('date')(new Date(), 'dd MMMM y'));
      }else{
        if($scope.selectedUserName !==null){
          $scope.showgroupinput = 'otochat';
          Notification.clearAll();
        }else{
          if($scope.uniquegroupname !== null){
            $scope.showgroupinput = 'groupchat';
            Notification.clearAll();
          }
        }
      }
    }
  }
  $scope.addgroup = function(){
    $scope.ctrl = 'addgroup';
    if(screen.width >= 320 && screen.width <= 767){
      $scope.showgroupinput = null;
    }else{
      if($scope.selectedUserName == null && $scope.uniquegroupname == null){
        $scope.showgroupinput = null;
      }else{
        if($scope.selectedUserName !==null){
          $scope.showgroupinput = 'otochat';
        }else{
          if($scope.uniquegroupname !== null){
            $scope.showgroupinput = 'groupchat';
          }
        }
      }
    }
  }
  $scope.meeting = function(){
    $scope.ctrl = 'meeting';
    if(screen.width >= 320 && screen.width <= 767){
      $scope.showgroupinput = null;
    }else{
      if($scope.uniquemeetname !== null){
        $scope.showgroupinput = 'meetings';
        Notification.clearAll();
      }else{
        if($scope.selectedUserName == null && $scope.uniquegroupname == null){
          $scope.showgroupinput = null;
          $scope.socket.emit('sendtodaydate', $filter('date')(new Date(), 'dd MMMM y'));
        }else{
          if($scope.selectedUserName !==null){
            $scope.showgroupinput = 'otochat';
          }else{
            if($scope.uniquegroupname !== null){
              $scope.showgroupinput = 'groupchat';
            }
          }
        }
      }
    }
  }

  $scope.Settings = function(){
    Notification.clearAll();
    $scope.ctrl = 'settings';
    if(screen.width >= 320 && screen.width <= 767){
      $scope.showgroupinput = null;
    }
  }

  $scope.sharefiles = function(){
    Notification.clearAll();
    $scope.ctrl = 'sharefiles';
    $scope.showgroupinput = 'sharefiles';
  }
  
  $scope.quotes = function(){
    if(screen.width >= 320 && screen.width <= 767){
      $scope.ctrl = 'quotes';
    }else{
      $scope.ctrl = null;
    }
    $scope.showgroupinput = 'quotes';
    $scope.socket.emit('sendtodaydate', $filter('date')(new Date(), 'dd MMMM y'));
  }

  $scope.leaveLetter = function(){
    Notification.clearAll();
    $scope.ctrl = 'leaveletter';
    if(screen.width >= 320 && screen.width <= 767){
      $scope.showgroupinput = null;
    }
    $scope.hideleavesselect = null;
    $scope.leavesdeletecount = 0;
    if($scope.leaves.length <= 1){
      $scope.hideleavesselect = 'hide';
    }
    for(var i=0; i<$scope.leaves.length; i++){
      if($scope.leaves[i].fromuname == $scope.youName){
        if($scope.leaves[i].fromdelete == 'delete'){
          $scope.leavesdeletecount += 1;
        } 
      }
      for(var j=0; j<$scope.leaves[i].leavemembers.length; j++){
        if($scope.leaves[i].leavemembers[j].touname == $scope.youName){
          if($scope.leaves[i].todelete == 'delete'){
            $scope.leavesdeletecount += 1;
          }
        }
      }
      if($scope.leaves.length-1 == $scope.leavesdeletecount){
        $scope.hideleavesselect = 'hide';
      }
    }
  }

  $scope.callHistroy = function(){
    $scope.hideselectofcall = null;
    $scope.calldeletecount = 0;
    Notification.clearAll();
    $scope.ctrl = 'callhistroy';
    if(screen.width >= 320 && screen.width <= 767){
      $scope.showgroupinput = null;
    }
    if($scope.callhistroydata.length <= 1){
      $scope.hideselectofcall = 'callshide';
    }
    for(var i=0; i<$scope.callhistroydata.length; i++){
      if( $scope.callhistroydata[i].calleeuname == $scope.youName){
        if($scope.callhistroydata[i].calleedelete == 'delete'){
          $scope.calldeletecount += 1;
        } 
      }
      if($scope.callhistroydata[i].calleruname == $scope.youName){
        if($scope.callhistroydata[i].callerdelete == 'delete'){
          $scope.calldeletecount += 1;
        }
      }
      if($scope.calldeletecount == $scope.callhistroydata.length-1){
        $scope.hideselectofcall = 'callshide';
      }
    }
  }

  $scope.showCallHistoryDetails = function(chd){
    if(screen.width >= 320 && screen.width <= 767){
      $scope.ctrl = 'xs-callhistory';
    }
    if($scope.hidecallhistorydata == null){
      $scope.showgroupinput = 'histroy';
    }
    $scope.calldata = chd;
    $scope.hidecallhistorydata = null;
  }

  $scope.uploadFile = function(youName){
    $scope.profileerr = null;
    $scope.img = 'uploadimg';    
    var file = $scope.preprofilepic;
    var fd = new FormData();
    fd.append('file', file);
    $http.post('/'+youName+'/profile', fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    }).success(function(data){
      if(data.msg){
        $scope.profileerr = data.msg;
      }else{
        $scope.profilePic = data[0].image;
      }
    }).error(function(){
    });
  };

  $scope.socket.on('users',function(data){
    for(var i=0; i<data.length; i++){
      data[i].count = null;
      data[i].lastmsg = null;
    }
    angular.forEach(data, function(value, key){
      if(value.uname === $scope.youName){
        $scope.youObj = value;
      }
    });
    angular.forEach(data, function(value, key){
      $scope.groups.push(value);
    });
    $scope.users = data;
    $scope.child = angular.copy($scope.users);
    $scope.meetingusers = angular.copy($scope.users);
    $scope.shareusers = angular.copy($scope.users);
    $scope.leaveusers = angular.copy($scope.users);
    $scope.deleteusers = angular.copy($scope.users);
    $scope.$digest();
  });
  $scope.socket.on('onlinestatus', function(data){
    for(var i=0; i<$scope.users.length; i++){
      for(var j=0; j<data.length; j++){
        if($scope.users[i].uname === data[j].uname){
          $scope.users[i].onlineindication = data[j].onlineindication;
          $scope.users[i].lastseen = data[j].lastseen;
          $scope.$digest();
        }
      }
    }
  });

  $scope.socket.on('alwaysacceptfiles',function(data){
    $scope.alwaysAcceptFiles = data;
    $scope.$digest();
  });
  $scope.socket.on('pushalwaysacceptfiles', function(data){
    angular.forEach(data, function(value, key){
      $scope.alwaysAcceptFiles .push(value);
      $scope.$digest();
    });
  });

  $scope.socket.on('you',function(data){
    $scope.you = data.userFirstName;
    $scope.youName = data.uniqueUserName;
    $scope.profilePic = data.profilepic;
    $scope.email = data.email;
    $scope.meetingmailid = data.email;
  });

  $scope.socket.on('clients',function(data){
    $scope.clients = data;
    $scope.$digest();
    angular.forEach($scope.clients, function(value, key){
      if(value.uniqueUserName === $scope.youName){
        $scope.yourId = value.id;
      }
    });
  });

  // Status Types
  $scope.status= [{'sta':'Online',"tool" : "Available"},{'sta':'Do Not Disturb',"tool" : "You Can't Receive Messages"},{'sta':'Busy',"tool" : "Unable To Respond"},{'sta':'Away',"tool" : "Not At Work Place"},{'sta':'Off Work',"tool" : "Out Of Work Place"},{'sta':'Will Be Back',"tool" : "Will Respond In A Moment"}];
  $scope.getSelectedSatus = function (status) {
    $scope.socket.emit('onlineusers',{status: status,uname: $scope.youName});
  };
  $scope.socket.on('onlineusers',function(onlinedata){
    for(var i=0; i< $scope.users.length; i++){
      if($scope.users[i].uname == onlinedata[0].uname){
        $scope.users[i].onlineindication= onlinedata[0].onlineindication;
        $scope.users[i].lastseen = onlinedata[0].lastseen;
        $scope.$digest();
      }
    }
  })
  $scope.socket.on('profile', function(data){
    $scope.profile = data;
    $scope.selectedStatusItem = data[0].onlineindication;
  });
  $scope.sidenavMenu = function(){
    $mdSidenav('left').toggle();
  }
  $scope.closeMenuSidenav = function(){
    $mdSidenav('left').close();
  }
  
  // oto chat
  // typing indication
  $scope.typing = function(){
    if(($scope.selectedUserId === undefined) || ($scope.selectedUserId === null)){}else{
      $scope.socket.emit('typing', {selectedUserId: $scope.selectedUserId,you: $scope.you, youName: $scope.youName});      
    }
  };
  $scope.socket.on("typing", function(data){
    $scope.typingindication =" is typing... ";  
    $scope.select = data.youName;
    $timeout(function () {
      $scope.typingindication   = "";
    }, 5000);
  });
  $scope.selectedUser =function(fname,uname,image,lname,phno,onlineindication,email,lastseen){
    if(screen.width >= 320 && screen.width <= 767){
      $scope.ctrl = 'oto-xs';
    }
    $scope.selectedUserLastseen = null;
    angular.element('#message').focus();
    Notification.clearAll();
    $scope.disablederror = null;
    $scope.notavailableforcall  = null;
    $scope.uniquegroupname = null;
    $scope.selectedUserId = null;  
    $scope.onlineindication = onlineindication;  
    if(onlineindication === 'Do Not Disturb'){
      $scope.selectedUserName = uname;
      $scope.disablederror = 'You Cannot Chat with this person right now.';
      $timeout(function () {
        $scope.disablederror   = "";
      }, 4000);
    }
    $scope.showgroupinput = "otochat";
    $scope.makeNull = function(){
      for(var i=0; i<$scope.users.length; i++){
        if($scope.users[i].uname === uname){
          $scope.users[i].count = null;
        }
      }
    }
    $interval(function(){$scope.makeNull()}, 500);
    $scope.socket.emit('makeasseen', {me_user: uname, to_user: $scope.youName});
    $scope.lastSeen(lastseen);
    for(var i=0; i<$scope.clients.length; i++){
      if($scope.clients[i].uniqueUserName === uname){
        $scope.selectedUserId = $scope.clients[i].id;
        $scope.selectedUserFname = fname;
        $scope.selectedUserEmail = $scope.clients[i].email;
        $scope.selectedUserName = $scope.clients[i].uniqueUserName;
        $scope.selectedUserPic = $scope.clients[i].profilepic;
        $scope.getMsgs($scope.clients[i].uniqueUserName);
        $scope.$on('$destroy', function(){
          $interval.cancel($scope.can);
        });
      }else{
        $scope.selectedUserPic = image;        
        $scope.selectedUserFname = fname;        
        $scope.selectedUserName = uname; 
        $scope.selectedUserLname = lname;        
        $scope.selectedUserPhno = phno;
        $scope.selectedUserEmail = email;
        $scope.getMsgs(uname);
      }
    }
    for(var i=0; i<$scope.alwaysAcceptFiles.length; i++){
      if($scope.alwaysAcceptFiles[i].me_user == $scope.selectedUserName){
        $scope.acceptordeclinefile = $scope.alwaysAcceptFiles[i].acceptordeclinefile;
      }else{
        $scope.acceptordeclinefile = null;
      }
    }
  };
  $scope.lastSeen = function(lastseen){
    if(lastseen !== null){
      var filteredlastseen = $filter('date')(lastseen, 'hh:mm a dd MMM y');
      var lastseendate=moment(lastseen);
      var presentdate=moment(new Date()); 
      var duration = moment.duration(presentdate.diff(lastseendate));
      var days = parseInt(duration.days());
      if(days !== 0){
        if(days == 1){
          $scope.selectedUserLastseen = 'last seen yesterday at\t'+filteredlastseen.substring(0,9);        
        }else{
          $scope.selectedUserLastseen = 'last seen on\t'+filteredlastseen.substring(0,9);
        }
      }else{
        $scope.selectedUserLastseen = 'last seen today at\t'+filteredlastseen.substring(0,9);
      }
    }
  }

  $scope.sendMessage = function(message){
    if(message !== '*/*/*Call Duration*/*/*'){
      $scope.callduration = 'NULL';
    }
    if($scope.replymessage === undefined || $scope.replymessage === ''){
      $scope.replymessage = null;
    }
    if($scope.replyfname === undefined || $scope.replyfname === ''){
      $scope.replyfname = null;
    }
    if($scope.replytype === undefined || $scope.replytype === ''){
      $scope.replytype = null;
    }
    if($scope.replyattachment === undefined || $scope.replyattachment === ''){
      $scope.replyattachment = null;
    }
    $scope.showMsg = 'message';
    $scope.socket.emit('sendmsg',{
      to_id: $scope.selectedUserId,
      to_pic: $scope.selectedUserPic,
      to_user: $scope.selectedUserName,
      to_fname: $scope.selectedUserFname,
      me_id: $scope.yourId,
      me_pic: $scope.profilePic,
      me_user: $scope.youName,
      me_fname: $scope.you,
      message: message.replace(/'/g, "squote"),
      mst: $filter('date')(new Date(), 'dd-MM-yyyy h:mm:ss a'),
      reply:$scope.replymessage,
      fname:$scope.replyfname,
      replytype:$scope.replytype,
      replyattachment: $scope.replyattachment,
      callduration: $scope.callduration
    });
    for(var i=0; i<$scope.users.length; i++){
      if($scope.users[i].uname === $scope.selectedUserName){
      $scope.users[i].lastmsg = message;
      $scope.users[i].date = $filter('date')(new Date(), 'dd-MM-yyyy h:mm:ss a');
      }
    }
    $scope.can = $interval(function(){ $scope.getMsgs($scope.selectedUserName)}, 100);
    $scope.message = '';
    $scope.replymessage = "";
    $scope.replyfname = "";
    $scope.replyattachment = "";
  };

  $scope.clear = function () {
    angular.element("input[type='file']").val(null);
    angular.element("input[type='password']").val(null);
    $scope.myFile = null;    
   };

  $scope.attachment = function(){
    var file = $scope.preattachment;
    var fd = new FormData();
    angular.forEach(file, function(value, key){
      var extension = value.type.split('/')[0];
      if(extension === 'application' || extension === 'image' || extension === 'video' || extension === 'audio' || extension === 'text'){
        fd.append('file', value);
      }else{
        $mdToast.show($mdToast.simple().textContent(''+value.name+' Is Not Allowed').position("bottom right").hideDelay(5000));
      }
    });
    $http.post('/attachment', fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    })
    .success(function(data){
      if(data.filesizeerror){
        $scope.filesizeerror = data.filesizeerror;
        $timeout( function(){
          $scope.filesizeerror = "";
        }, 3000 );
      } else {
        angular.forEach(data.files, function(value, key){
          var fileType = value.mimetype.split('/')[0];
          $scope.socket.emit('sendattach',{
            to_id: $scope.selectedUserId,
            to_pic: $scope.selectedUserPic,
            to_user: $scope.selectedUserName,
            to_fname: $scope.selectedUserFname,
            me_id: $scope.yourId,
            me_pic: $scope.profilePic,
            me_user: $scope.youName,
            me_fname: $scope.you,
            attachment: value.filename,
            type: fileType,
            mst: $filter('date')(new Date(), 'dd-MM-yyyy h:mm:ss a'),
            callduration: $scope.callduration
          });
          for(var i=0; i<$scope.users.length; i++){
            if($scope.users[i].uname === $scope.selectedUserName){
            $scope.users[i].lastmsg = 'Attachment';
            $scope.users[i].date = $filter('date')(new Date(), 'dd-MM-yyyy h:mm:ss a');
            }
          }
          $scope.can = $interval(function(){ $scope.getMsgs($scope.selectedUserName)}, 500);
          $scope.message = '';
        });
      }
     })
    .error(function(err){console.log(err)});
  };

  //  deleting messages
  $scope.delete = function(msg){
    $scope.socket.emit("delete",msg);
    for(var i=0; i<$scope.users.length; i++){
      if($scope.users[i].uname === $scope.selectedUserName){
        if($scope.users[i].lastmsg === msg.message){
          $scope.users[i].lastmsg = '///Deleted///';
        }
      }
    }
  }
  $scope.socket.on('delete', function(updateddata){
    angular.forEach(updateddata, function(value, key){
      for(var i=0; i<$scope.messages.length; i++){
        if($scope.messages[i].mst === value.mst){
          $scope.messages.splice(i, 1, value);
          $scope.getMsgs($scope.selectedUserName);
        }
      }
    });
  });
  // reply for message one to one chat
  $scope.reply = function(replymessage,replyattachment,fname,replytype){
    $scope.replyfname = fname;
    $scope.replymessage = replymessage;
    $scope.replytype= replytype;
    $scope.replyattachment= replyattachment;
  } 
  $scope.Cancelreply = function(){
    $scope.replyfname = null;
    $scope.replymessage = null;
    $scope.replytype= null;
    $scope.replyattachment= null;
  }
  //accept or reject file
  $scope.aodconfoto = function(fromusername){
    for(var i=0; i<$scope.alwaysAcceptFiles.length; i++){
      if($scope.alwaysAcceptFiles[i].me_user == fromusername){
        $scope.acceptordeclinefile = $scope.alwaysAcceptFiles[i].acceptordeclinefile;
      }else{
        $scope.acceptordeclinefile = null;
      }
    }
  };

  $scope.acceptDownload = function(attachment,acceptfromuser){
    $scope.acceptfile = attachment;
    $scope.acceptfromuser = acceptfromuser;
  }

  $scope.closeAcceptFileModal = function(alwaysaccept){
    if(alwaysaccept == 'YES'){
      if($scope.selectedUserName){
        $scope.socket.emit('alwaysacceptfiles',{me_user: $scope.acceptfromuser, to_user: $scope.youName});
      }
      if($scope.uniquegroupname){
        $scope.socket.emit('alwaysacceptfiles',{me_user: $scope.acceptfromuser, to_user: $scope.youName});
      }
    }
    $scope.alwaysaccept = null;
    angular.element('#downloadModal').modal('hide');
  }

  $scope.socket.on('fileerr',function(data){
    $scope.errfile= data;
    $scope.$digest();
    $timeout( function(){
      $scope.errfile = "";
  }, 3000 );
  })

  $scope.socket.on('profilefileerr',function(data){
    $scope.profileerrfile= data;
    $scope.$digest();
    $timeout( function(){
      $scope.profileerrfile = null;
  }, 3000 );
  });

  $scope.socket.on('messages-from-database', function(data){
    $scope.messages = data;
    for(var i=0; i<$scope.users.length; i++){
      for(var j=0; j<data.length; j++){
        if($scope.users[i].uname === data[j].me_user){
          if($scope.users[i].uname !== $scope.youName){
            if(data[j].status === 'unseen'){
              $scope.users[i].count = $scope.users[i].count + 1;
            }
          }
        }
        if(($scope.users[i].uname === data[j].me_user) || ($scope.users[i].uname === data[j].to_user)){
          if($scope.users[i].uname !== $scope.youName){
            if(data[j].message){
              $scope.users[i].lastmsg = data[j].message;
              $scope.users[i].date = data[j].mst;
            }
            if(data[j].attachment){
              $scope.users[i].lastmsg = 'attachment';
              $scope.users[i].date = data[j].mst;
            }
          }
        }
      }
    }
  });

  $scope.socket.on('sendmsg',function(message){
    $scope.messages.push(message);
    var desktopmsg = angular.copy(message);
    if(desktopmsg.message == '***Call Ended***'){
      if(desktopmsg.me_user == $scope.youName){
        desktopmsg.message = 'You Ended Call...';
      }else{
        desktopmsg.message = 'You Missed Call From '+desktopmsg.me_user;
      }
    }
    if(desktopmsg.message == '***Call Rejected***'){
      if(desktopmsg.me_user == $scope.youName){
        desktopmsg.message = 'You Rejected Call From '+desktopmsg.to_user;
      }else{
        desktopmsg.message = desktopmsg.me_user+' Rejected Your Call...';
      }
    }
    if(desktopmsg.message == '*/*/*Call Duration*/*/*'){
      if(desktopmsg.me_user == $scope.youName){
        desktopmsg.message = 'call with '+desktopmsg.to_user+' ended';
      }else{
        desktopmsg.message = 'call with '+desktopmsg.me_user+' ended';
      }
    }
    if(desktopmsg.me_user !== $scope.youName){
      if($scope.minimize === 'minimize'){  // get notification if window is minimized.
        $scope.socket.emit('desktopnotification', desktopmsg);
      }
    }
  });
  $scope.socket.on('count', function(data){
    for(var i=0; i<$scope.users.length; i++){
      if($scope.users[i].uname === data.me_user){
        $scope.users[i].count = $scope.users[i].count + 1;
        if(data.message){
          $scope.users[i].lastmsg = data.message;
          $scope.users[i].date = data.mst;
        }
        if(data.attachment){
          $scope.users[i].lastmsg = 'attachment';
          $scope.users[i].date = data.mst;
        }
      }
    }
  });

  $scope.getMsgs = function(user){
    $scope.displaymsg = [];
    angular.forEach($scope.messages, function(data){
      if((user == data.me_user) && ($scope.youName == data.to_user)){
        $scope.displaymsg.push(data);
      }
      if((user == data.to_user) && ($scope.youName == data.me_user)){
        $scope.displaymsg.push(data);
      }
    });
  };

  $scope.clearOtoChat = function(youName, selectedUserName){
    for(var i=0; i<$scope.messages.length; i++){
      for(var j=0; j<$scope.displaymsg.length; j++){
        if($scope.messages[i] === $scope.displaymsg[j]){
          $scope.messages.splice(i, 1);
        }
      }
    }
    for(var k=0; k<$scope.groups.length; k++){
      if($scope.groups[k].uname === selectedUserName){
        $scope.groups[k].lastmsg = null;
      }
    }
    $scope.displaymsg = [];
    $scope.socket.emit('clearotochat', {youName: youName, selectedUserName: selectedUserName});
  }
  // oto chat end

  // group chat
  $scope.toggleSidenave = function(){
    $mdSidenav('right').toggle();
    $scope.sidenav = 'profilenav';
  }
  $scope.closeSidenav = function(){
    $mdSidenav('right').close();
  }
  $scope.toggleSidenaveGroup = function(){
    $mdSidenav('right').toggle();
    $scope.sidenav = 'groupnav';
  }
  $scope.socket.on('initgroupsarray', function(){
    $scope.groups = [];
    angular.forEach($scope.deleteusers, function(value, key){
      $scope.groups.push(value);
    });
    $scope.groups = $scope.groups;
    $scope.showgroupinput= null;
  });
  $scope.socket.on('groups', function(data){
    data.groupcount = null;
    data.grouplastmsg = null;
    $scope.groups.push(data);
    $scope.$digest();
    $scope.socket.emit('getgroupchat', data.uniquegroupname,$scope.youName);
  });
  $scope.socket.on('pushGroups', function(data){
    data.groupcount = null;
    data.grouplastmsg = null;
    $scope.groups.push(data);
    $scope.$digest();
  });
  // group typing indication
  $scope.grouptyping = function(){
    $scope.socket.emit('grouptypingindication', {groupname:$scope.groupname,you: $scope.you, youName: $scope.youName});       
  };
  $scope.socket.on("grouptypingindication", function(data,typingclients){
    $scope.seletedgroup = data.groupname;
    for(var i=0; i<typingclients.length; i++){
      if(typingclients[i]==$scope.youName){
        typingclients.splice(i, 1)
      }
    }
    if(typingclients.length==1){
      $scope.grptyping =""+typingclients+" is typing... ";  
    }else{
      $scope.grptyping =""+typingclients+" are typing... ";  
    }
    $timeout(function () {
      $scope.grptyping   = "";
    }, 4000);
  });
  $scope.createGroup = function(formname,newGroupName,groupofuser){
    formname.$setUntouched();
    for(var i=0; i< groupofuser.length; i++){
      for(var j=0; j<$scope.users.length; j++){
        if(groupofuser[i] === $scope.users[j].uname){
          $scope.groupofusers.push($scope.users[j]);
        }
      }
    }
    $scope.groupofusers.push($scope.youObj);
    $scope.socket.emit('newGroup',{admin: $scope.youName,newGroupName: newGroupName, groupofusers: $scope.groupofusers, gcd: $filter('date')(new Date(), 'd.MMM.yy, h:m:s:sss a')});
    $scope.newGroupName = '';
    $scope.groupofusers = [];
    $scope.child= angular.copy($scope.users);
  };
  $scope.uploadGroupFile = function(){
    $scope.groupprofileerr = null;
    $scope.img = 'uploadimg';    
    var file = $scope.pregrouppic;
    var fd = new FormData();
    fd.append('file', file);
    $http.post('/groupprofile/'+$scope.uniquegroupname+'', fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    }).success(function(data){
      if(data.msg){
        $scope.groupprofileerr = data.msg;
      }else{
        $scope.groupimage = data[0].groupimage;
        angular.forEach($scope.groups, function(value, key){
          if(value.uniquegroupname === $scope.uniquegroupname){
            value.groupimage = data[0].groupimage;
          }
        });
      }
    }).error(function(){
    });
  };
  // Showing participants in 
  $scope.show = null;
  $scope.addpeople = null;
  $scope.showparticipants = function() {
    $scope.show = 'Show Participants';
    $scope.addpeople = null;
  };
  $scope.cancleShowParticipants = function(){
    $scope.show= null;
  }
  $scope.showAddMembers = function(){
    $scope.addpeople = 'addpeople';
    $scope.show= null;
  }
  $scope.cancelshowAddMembers = function(){
    $scope.addpeople = null;
  }
  $scope.selectedGroup = function(groupId,groupname,groupimage,uniquegroupname,admin){
    if(screen.width >= 320 && screen.width <= 767){
      $scope.ctrl = 'group-xs';
    }
    angular.element('#groupmsg').focus();
    Notification.clearAll();
    $scope.selectedUserName = null;
    $scope.child2 = angular.copy($scope.users);
    $scope.showgroupinput = 'groupchat';
    $scope.memberUsernames = []; 
    $scope.memberFnames = [];  
    $scope.memberSocketids = [];
    $scope.groupId = groupId;
    $scope.groupname = groupname;
    $scope.uniquegroupname = uniquegroupname;
    $scope.admin= admin;
    $scope.socket.emit('makeasseengroup', {uniquegroupname: $scope.uniquegroupname, username: $scope.youName});
    $scope.makeGroupNull = function(){
      if($scope.uniquegroupname){
        for(var i=0; i<$scope.groups.length; i++){
          if($scope.groups[i].uniquegroupname === $scope.uniquegroupname){
            $scope.groups[i].groupcount = null;
          }
        }
      }
    }
    $interval(function(){$scope.makeGroupNull()}, 500);
    $interval(function(){ $scope.getGroupMsgs($scope.groupId,$scope.groupname,$scope.uniquegroupname)}, 500);
    $scope.groupimage= groupimage;
    angular.forEach($scope.groups, function(value, key){
      if(value.groupId === groupId){
        angular.forEach(value.members, function(value, key){
          $scope.memberUsernames.push(value.memberuname);
        });
      }
    });
    for(var i=0; i < $scope.memberUsernames.length; i++){
      angular.forEach($scope.clients, function(value, key){
        if($scope.memberUsernames[i] === value.uniqueUserName ){
          $scope.memberSocketids.push(value.id)
        }
      });
    }
    angular.forEach($scope.memberUsernames, function(value, key){
      angular.forEach($scope.child2, function(value1, key1){
        if(value === value1.uname){
          $scope.child2.splice(key1, 1);
        }
      });
    });
  };
  
  // Adding member to group
  
  $scope.addMemberToGroup = function(fname,uname,image){
    $scope.socket.emit('addmembertogroup',{groupId: $scope.groupId, groupname: $scope.groupname,uniquegroupname: $scope.uniquegroupname, memberfname: fname, memberuname: uname, memberimage: image});
  }
  $scope.socket.on('addmemberforall',function(data){
    for(var i=0; i<$scope.groups.length; i++){
      if($scope.groups[i].uniquegroupname === data[0].uniquegroupname){
        $scope.groups[i].members = data;
        $scope.selectedGroup($scope.groups[i].groupId,$scope.groups[i].groupname,$scope.groups[i].groupimage,$scope.groups[i].uniquegroupname,$scope.groups[i].admin);
      }
    }
  });

  // Remove user from group

  $scope.removeMember = function(uniquegroupname, uname){
    $scope.socket.emit('removemember',{uname: uname, uniquegroupname: uniquegroupname});
  }
  $scope.socket.on('removememberforall',function(data){
    for(var i=0; i<$scope.groups.length; i++){
      if($scope.groups[i].uniquegroupname === data[0].uniquegroupname){
        $scope.groups[i].members = data;
        $scope.selectedGroup($scope.groups[i].groupId,$scope.groups[i].groupname,$scope.groups[i].groupimage,$scope.groups[i].uniquegroupname,$scope.groups[i].admin);
      }
    }
  });

  // Deleting Group
  $scope.deletegroups = function(uniquegroupname){
    $scope.socket.emit('deletegroups',{uniquegroupname:$scope.uniquegroupname, memberUsernames: $scope.memberUsernames});
    $scope.closeSidenav();
  }
  // Leave Group
  $scope.leaveGroup = function(uniquegroupname, leaveUname){
    $scope.socket.emit('leavegroup', {uniquegroupname: uniquegroupname, leaveUname: leaveUname});
    $scope.closeSidenav();
  }
  //Update Admin
  $scope.updateNewAdmin = function(oldadmin, newadmin, uniquegroupname,groupname,memberUsernames){
    $scope.socket.emit('updatenewadmin', {oldadmin: oldadmin, newadmin: newadmin, uniquegroupname: uniquegroupname, groupname: groupname, time: $filter('date')(new Date(), 'dd-MM-yyyy h:mm:ss a'), memberUsernames: memberUsernames});
    $scope.newadmin = '';
    $scope.leaveGroup(uniquegroupname,$scope.admin);
  }

  $scope.socket.on('pushgroupnotifications', function(data){
    $scope.groupnotifications.push(data);
  });

  $scope.socket.on('groupnotifications',function(data){
    $scope.groupnotifications = data;
  });

  $scope.socket.on('groupnewadminnotifications',function(data){
    for(var i=0; i<data.length; i++){
      if(data[i].status === 'unseen'){
        $scope.groupnotificationscount += 1;
        $scope.bellnotifications += 1;
      }
    }
  });

  $scope.socket.on('pushgroupnewadminnotifications',function(data){
    if(data.status === 'unseen'){
      $scope.groupnotificationscount = $scope.groupnotificationscount + 1;
      $scope.bellnotifications += 1;
      $scope.$digest();
    }
  });

  $scope.socket.on('leftmember',function(data){
    for(var i=0; i<$scope.groups.length; i++){
      if($scope.groups[i].uniquegroupname === data[0].uniquegroupname){
        $scope.groups[i].members = data;
        $scope.selectedGroup($scope.groups[i].groupId,$scope.groups[i].groupname,$scope.groups[i].groupimage,$scope.groups[i].uniquegroupname,$scope.groups[i].admin);
      }
    }
  });

  $scope.groupmsg = function(gmsg){
    if($scope.replygroupmessage === undefined){
      $scope.replygroupmessage = null;
    }
    if($scope.replygroupfname === undefined){
      $scope.replygroupfname = null;
    }
    if($scope.replygrouptype === undefined){
      $scope.replygrouptype = null;
    }
    if($scope.replygroupattachment === undefined){
      $scope.replygroupattachment = null;
    }
    $scope.socket.emit('groupmsg',{
      memberids: $scope.memberSocketids,
      memberUsernames: $scope.memberUsernames,
      groupId: $scope.groupId,
      groupname: $scope.groupname,
      uniquegroupname: $scope.uniquegroupname,
      senderpic: $scope.profilePic,
      senderUsername: $scope.youName,
      senderfname: $scope.you,
      message: gmsg.replace(/'/g, "squote"),
      mst: $filter('date')(new Date(), 'dd-MM-yyyy h:mm:ss a'),
      replygroupmessage:$scope.replygroupmessage,
      groupfname:$scope.groupfname,
      replygroupmessage:$scope.replygroupmessage,
      replygroupattachment:$scope.replygroupattachment,
      replygroupfname:$scope.replygroupfname,
      replygrouptype:$scope.replygrouptype
    });
    $interval(function(){ $scope.getGroupMsgs($scope.groupId,$scope.groupname,$scope.uniquegroupname)}, 500);
    $scope.gmsg = '';
    $scope.replygroupmessage = '';
    $scope.replygroupattachment = '';
    $scope.replygroupfname = '';
  }

  $scope.socket.on('group_messages-from-database', function(data){
    angular.forEach(data, function(value, key){
      $scope.groupmsgs.push(value);
      for(var i=0; i<$scope.groups.length; i++){
        if($scope.groups[i].uniquegroupname === value.uniquegroupname){
          if(value.message){$scope.groups[i].grouplastmsg = value.message;$scope.groups[i].date = value.mst;}
          if(value.attachment){$scope.groups[i].grouplastmsg = 'attachment';$scope.groups[i].date = value.mst;}
        }
      }
    });
  });

  $scope.socket.on('dbgroupcount', function(data){
    for(var j=0; j<data.length; j++){
      for(var i=0; i<$scope.groups.length; i++){
        if($scope.groups[i].uniquegroupname === data[j].uniquegroupname){
          if(data[j].status === 'unseen'){
            $scope.groups[i].groupcount = $scope.groups[i].groupcount + 1;
            $scope.$digest();
          }
        }
      }
    }
  });

  $scope.socket.on('groupmsg', function(data){
    $scope.groupmsgs.push(data);
  });

  $scope.socket.on('groupcount', function(data, grouplastmsg, groupdate){
    for(var i=0; i<$scope.groups.length; i++){
      if($scope.groups[i].uniquegroupname === data){
        $scope.groups[i].groupcount = $scope.groups[i].groupcount + 1;
        $scope.groups[i].grouplastmsg = grouplastmsg;
        $scope.groups[i].date = groupdate;
      }
    }
  });

  $scope.getGroupMsgs = function(groupId,groupname,uniquegroupname){
    $scope.displaygroupmsg = [];
    angular.forEach($scope.groupmsgs, function(data){
      if((groupId === data.groupId) && (uniquegroupname == data.uniquegroupname)){
        $scope.displaygroupmsg.push(data);
      }
    });
  };

  $scope.aodconf = function(senderUsername){
    for(var i=0; i<$scope.alwaysAcceptFiles.length; i++){
      if($scope.alwaysAcceptFiles[i].me_user == senderUsername){
        $scope.acceptordeclinefile = $scope.alwaysAcceptFiles[i].acceptordeclinefile;
      }else{
        $scope.acceptordeclinefile = null;
      }
    }
  };

  $scope.groupattachment = function(){
    var file = $scope.pregroupattachment;
    var fd = new FormData();
    angular.forEach(file, function(value, key){
      var extension = value.type.split('/')[0];
      if(extension === 'application' || extension === 'image' || extension === 'video' || extension === 'audio' || extension === 'text'){
        fd.append('file', value);
      }else{
        $mdToast.show($mdToast.simple().textContent(''+value.name+' Is Not Allowed').position("bottom right").hideDelay(5000));
      }
    });
    $http.post('/groupattachment', fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    })
    .success(function(data){
      if(data.filesizeerror){
        $scope.filesizeerror= data.filesizeerror;
        $timeout( function(){
          $scope.filesizeerror = "";
        }, 3000 );
      }else{
        angular.forEach(data.files, function(value, key){
          var fileType = value.mimetype.split('/')[0];
          $scope.socket.emit('groupsendattach',{
            memberids: $scope.memberSocketids,
            memberUsernames: $scope.memberUsernames,
            groupId: $scope.groupId,
            groupname: $scope.groupname,
            uniquegroupname: $scope.uniquegroupname,
            senderpic: $scope.profilePic,
            senderUsername: $scope.youName,
            senderfname: $scope.you,
            attachment: value.filename,
            type: fileType,
            mst: $filter('date')(new Date(), 'dd-MM-yyyy h:mm:ss a')
          });
        });
      }
     })
    .error(function(err){console.log(err)});
  };

  //  deleting Group messages
  $scope.deleteGroup = function(groupmessage){
    $scope.socket.emit("deletegroupmsg",groupmessage);
    for(var i=0; i<$scope.groups.length; i++){
      if($scope.groups[i].uniquegroupname === $scope.uniquegroupname){
        if($scope.groups[i].grouplastmsg === groupmessage.message){
          $scope.groups[i].grouplastmsg = '///Deleted///';
        }
      }
    }
  } 
  $scope.socket.on('deletegroupmsg', function(updatedgroupdata){
    angular.forEach(updatedgroupdata, function(value, key){
      for(var i=0; i<$scope.groupmsgs.length; i++){
        if($scope.groupmsgs[i].mst === value.mst){
          $scope.groupmsgs.splice(i, 1, value);
          $scope.getGroupMsgs($scope.groupId,$scope.groupname,$scope.uniquegroupname);
        }
      }
    });
  });
  // Reply for Group messages
  $scope.replyGroup = function(replygroupmessage,replygroupattachment,replygroupfname,replygrouptype){
    $scope.replygroupmessage = replygroupmessage;
    $scope.replygroupattachment = replygroupattachment;
    $scope.replygroupfname = replygroupfname;
    $scope.replygrouptype = replygrouptype;
  } 
  $scope.Cancelgroupreply = function(){
    $scope.replygroupmessage = null;
    $scope.replygroupattachment = null;
    $scope.replygroupfname = null;
    $scope.replygrouptype = null;
  }
  // clear group chat
  $scope.clearGroupChat = function(youName, uniquegroupname){
    for(var i=0; i<$scope.groupmsgs.length; i++){
      for(var j=0; j<$scope.displaygroupmsg.length; j++){
        if($scope.groupmsgs[i] === $scope.displaygroupmsg[j]){
          $scope.groupmsgs.splice(i, 1);
        }
      }
    }
    for(var k=0; k<$scope.groups.length; k++){
      if($scope.groups[k].uniquegroupname === uniquegroupname){
        $scope.groups[k].grouplastmsg = null;
      }
    }
    $scope.displaygroupmsg = [];
    $scope.socket.emit('cleargroupchat', youName, uniquegroupname, $filter('date')(new Date(), 'dd-MM-yyyy h:mm:ss a'));
  }
  // group chat end

  // Meetings
  $scope.socket.on('meetings', function(data){
    var meetmembers = data.meetmembers;
    for(var i=0; i<meetmembers.length; i++){
      if(data.meetadmin !== $scope.youName){
        if(meetmembers[i].membersinmeet == $scope.youName){
          if(meetmembers[i].status == 'unseen' || meetmembers[i].momstatus == 'unseen'){
            $scope.newmeetingnotifications += 1; 
          }
          if(meetmembers[i].momstatus == 'unseen'){
            data.momstatusnotification = 'Shared Minutes Of Meeting.';  
          }
        }
      }
    }
    $scope.meetings.push(data);
    $scope.$digest();
  });
  $scope.socket.on('pushmeeting', function(data){
    data.momtoallarray = [];
    data.momshared = null;
    var meetmembers = data.meetmembers;
    for(var i=0; i<meetmembers.length; i++){
      if(data.meetadmin !== $scope.youName){
        if(meetmembers[i].membersinmeet == $scope.youName){
          if(meetmembers[i].status == 'unseen'){
            $scope.newmeetingnotifications += 1; 
          }
        }
      }
    }
    $scope.meetings.push(data);
    $scope.$digest();
    if(data.meetadmin !== $scope.youName){
      $scope.socket.emit('nodeMeetingNotification', data,$scope.youName);
    }
  });

  $scope.mindate= new Date();
  $scope.toDaysDate = $filter('date')(new Date(), 'dd:MM:y');
  $timeout(function () {
    $scope.meetingRemainder($scope.meetings);
  }, 3000);
  $scope.meetingRemainder = function(meetings){
    $interval(function(){
      for(var i=0; i<meetings.length; i++){
        if(meetings[i].date === $scope.toDaysDate){
          var meetmembers = meetings[i].meetmembers;
          for(var j=0; j<meetmembers.length; j++){
            if(meetmembers[j].membersinmeet === $scope.youName){
              $scope.meetingTime = $filter('date')(new Date(new Date().getTime() + 60 * meetmembers[j].remindertime * 1000), 'hh:mm:ss a');
              if(meetings[i].meetingtime === $scope.meetingTime){
                $scope.socket.emit('meetingremainder', meetings[i]);
              }
            }
          }
        }
        if(meetings[i].momtoall !== null){
          var momtoalldata = meetings[i].momtoallarray;
          for(var k=0; k<momtoalldata.length; k++){
            if(momtoalldata[k].reminder !== null){
              var remindertoarray = momtoalldata[k].reminder.split(',');
              for(var m=0; m<remindertoarray.length; m++){
                var uname = remindertoarray[m].substring(0,remindertoarray[m].indexOf('*'));
                var remindertime= remindertoarray[m].substring(remindertoarray[m].indexOf('*')+1, remindertoarray[m].length);
                if(uname == $scope.youName){
                  if($filter('date')(new Date(), "d:MM:y, H:mm:ss a") === $filter('date')(new Date(remindertime), "d:MM:y, H:mm:ss a")){
                    $scope.socket.emit('momtoalldesktopreminder', momtoalldata[k]);
                  }
                }
              }
            }
          }
        }      
      }
    }, 1000);
  };
  $scope.reminderTime = [{displaytime:'15 mins', convertedintominutes: 15},{displaytime:'30 mins', convertedintominutes: 30},
                          {displaytime:'45 mins', convertedintominutes: 45},{displaytime:'1 hour', convertedintominutes: 60},
                          {displaytime:'2 hours', convertedintominutes: 120},{displaytime:'3 hours', convertedintominutes: 180},
                          {displaytime:'4 hours', convertedintominutes: 240},{displaytime:'5 hours', convertedintominutes: 300},
                          {displaytime:'6 hours', convertedintominutes: 360},{displaytime:'7 hours', convertedintominutes: 420},
                          {displaytime:'8 hours', convertedintominutes: 480},{displaytime:'9 hours', convertedintominutes: 540},
                          {displaytime:'10 hours', convertedintominutes: 600},{displaytime:'11 hours', convertedintominutes: 660},
                          {displaytime:'0.5 day', convertedintominutes: 720},{displaytime:'18 hours', convertedintominutes: 1080},
                          {displaytime:'1 day', convertedintominutes: 1440},{displaytime:'2 days', convertedintominutes: 2880},
                          {displaytime:'3 days', convertedintominutes: 4320},{displaytime:'4 days', convertedintominutes: 5760},
                          {displaytime:'1 week', convertedintominutes: 10080},{displaytime:'2 weeks', convertedintominutes: 20160}];
  $scope.setReminder =  function(rt){
    if(rt == '15 mins'){$scope.setremindertime = 15;}
    if(rt == '30 mins'){$scope.setremindertime = 30;}
    if(rt == '45 mins'){$scope.setremindertime = 45;}
    if(rt == '1 hour'){$scope.setremindertime = 60;}
    if(rt == '2 hours'){$scope.setremindertime = 120;}
    if(rt == '3 hours'){$scope.setremindertime = 180;}
    if(rt == '4 hours'){$scope.setremindertime = 240;}
    if(rt == '5 hours'){$scope.setremindertime = 300;}
    if(rt == '6 hours'){$scope.setremindertime = 360;}
    if(rt == '7 hours'){$scope.setremindertime = 420;}
    if(rt == '8 hours'){$scope.setremindertime = 480;}
    if(rt == '9 hours'){$scope.setremindertime = 540;}
    if(rt == '10 hours'){$scope.setremindertime = 600;}
    if(rt == '11 hours'){$scope.setremindertime = 660;}
    if(rt == '0.5 day'){$scope.setremindertime = 720;}
    if(rt == '18 hours'){$scope.setremindertime = 1080;}
    if(rt == '1 day'){$scope.setremindertime = 1440;}
    if(rt == '2 days'){$scope.setremindertime = 2880;}
    if(rt == '3 days'){$scope.setremindertime = 4320;}
    if(rt == '4 days'){$scope.setremindertime = 5760;}
    if(rt == '1 week'){$scope.setremindertime = 10080;}
    if(rt == '2 weeks'){$scope.setremindertime = 20160;}
    for(var i=0; i<$scope.meetings.length; i++){
      if($scope.uniquemeetname === $scope.meetings[i].uniquemeetname){
        var meetmembers = $scope.meetings[i].meetmembers;
        for(var j=0; j<meetmembers.length; j++){
          if(meetmembers[j].membersinmeet === $scope.youName){
            $scope.defaultreminder = ''+$scope.setremindertime+'';
            meetmembers[j].remindertime = ''+$scope.setremindertime+'';
            var meetdatetime = $scope.meetings[i].date+':'+$scope.meetings[i].meetingtime;
            var date1parts = meetdatetime.split(':');
            if(date1parts[5].substr(date1parts[5].length-2,date1parts[5].length-1).toString() == 'PM'){
              var twentyfourhourformat = Number(date1parts[3])+12;
              var date1 = new Date(date1parts[2], date1parts[1]-1, date1parts[0], twentyfourhourformat, date1parts[4]);
            }else{
              var date1 = new Date(date1parts[2], date1parts[1]-1, date1parts[0], date1parts[3], date1parts[4]);
            }
            $scope.defaultreminder = meetmembers[j].remindertime;
            date1.setMinutes(date1.getMinutes() - meetmembers[j].remindertime)
            $scope.selectedremindertime = date1;
          }
        }
      }
    }
    $scope.socket.emit('setremindertime', $scope.setremindertime, $scope.uniquemeetname, $scope.youName);
  }

  // Meeting notes
  $scope.hidesharewithmeeditor = null;
  $scope.saveNotes = function(){
    $scope.hidesharewithmeeditor = 'hidesharewithmeeditor';
    angular.element('.froalaeditortome').froalaEditor('html.set','');
    $scope.socket.emit('createnotesforme', {createnotesforme: $scope.createnotesforme,meetingsubject: $scope.meetingsubject, uniquemeetname: $scope.uniquemeetname, member: $scope.youName});
    for(var i=0; i<$scope.meetings.length; i++){
      if($scope.meetings[i].uniquemeetname === $scope.uniquemeetname){
        var members = $scope.meetings[i].meetmembers;
        for(var j=0; j<members.length; j++){
          if(members[j].membersinmeet == $scope.youName){
            members[j].momtome = $scope.createnotesforme;
            $scope.momtomefilepreview = $scope.createnotesforme;
          }
        }
        $scope.selectedmeeting($scope.meetings[i]);
      }
    }
  }
  $scope.socket.on('sendMeetingNotifications',function(data){
    $scope.notifications= data;
    $scope.$digest();
    for(var i=0; i<$scope.notifications.length; i++){
      if($scope.notifications[i].organizer == $scope.youName){
        if($scope.notifications[i].status === 'unseen'){
          $scope.meetingnotificationcount += 1;
          $scope.bellnotifications += 1;
        }
      }
    }
  });
  $scope.socket.on('pushMeetingNotifications',function(data){
    $scope.notifications.push(data);
    if(data.organizer == $scope.youName){
      if(data.status === 'unseen'){
        $scope.meetingnotificationcount += 1;
        $scope.bellnotifications += 1;
        $scope.$digest();
      }
    }
  });

  $scope.meetingNotificationSeen = function(notification){
    $scope.socket.emit('meetingnotificationseen', notification);
    for(var i=0; i<$scope.notifications.length; i++){
      if($scope.notifications[i].uniquemeetname === notification.uniquemeetname && $scope.notifications[i].organizer === notification.organizer && $scope.notifications[i].participant === notification.participant){
        if($scope.meetingnotificationcount <= 1){
          $scope.meetingnotificationcount = null;
          if($scope.bellnotifications <= 1){
            $scope.bellnotifications = null;
          }else{
            $scope.bellnotifications -= 1;
          }
        }else{
          $scope.meetingnotificationcount -= 1;
          if($scope.bellnotifications <= 1){
            $scope.bellnotifications = null;
          }else{
            $scope.bellnotifications -= 1;
          }
        }
        $scope.notifications[i].status = 'seen';
      }
    }
  }

  $scope.createMeeting= function(){
    Notification.clearAll();
    $scope.showgroupinput= 'createMeeting';
    if(screen.width >= 320 && screen.width <= 767){
      $scope.ctrl = 'xs-createmeeting';
    }
  }
  $scope.saveAndSend= function(){
    $scope.sas= 'sas';
  }
  $scope.cancleSaveAndSend= function(){
    $scope.sas= null;
  }
  $scope.option= [];
  
  // open textarea on click decline
  $scope.toggle = function() {
    $scope.reject = !$scope.reject;
    $scope.reason= '';
  };
  $scope.adminToggle = function(){
    $scope.addAdmin = !$scope.addAdmin;
    $scope.newadmin = '';
  }

  $scope.proposedTime = function() {
    $scope.protime = !$scope.protime;
    $scope.T = '';
  };

  angular.element(document).ready(function () {
    angular.element('.meetmembers').select2({
      width: '300px',
    });
    angular.element("#searchclearhours").click(function(){
      angular.element("#h").select2('val', 'All');
    });
    angular.element("#searchcleardays").click(function(){
      angular.element("#d").select2('val', 'All');
    });
    angular.element("#cleargroupdata").click(function(){
      angular.element("#g").select2('val', 'All');
    });
    angular.element("#clearreplydata").click(function(){
      angular.element("#r").select2('val', 'All');
    });
    angular.element("#multipleshare").click(function(){
      angular.element("#s").select2('val', 'All');
    });
    angular.element("#share").click(function(){
      angular.element("#s").select2('val', 'All');
    });
    angular.element("#clearAOIdata").click(function(){
      angular.element("#A").select2('val', 'All');
    });
    angular.element("#clearupdateAOIdata").click(function(){
      angular.element("#A").select2('val', 'All');
    });
    angular.element("#clearcancleAOIdata").click(function(){
      angular.element("#A").select2('val', 'All');
    });
  });

  $scope.showMeetingNotifications = function(){
    $scope.MGnotifications = 'Mnotifications';
  }
  $scope.showGroupNotifications = function(groupnotificationscount){
    $scope.MGnotifications = 'Gnotifications';
    $scope.bellnotifications -= groupnotificationscount;
    $scope.groupnotificationscount= null;
    $scope.socket.emit('makegncountseen', {username: $scope.youName});
  }
  $scope.meetingType= ['Status Update','Information Sharing','Decision Making','Problem Solving','Innovation','Team Building'];
  $scope.getSelectedMeetingType = function (meetingtype){
    if(meetingtype == 'Decision Making'){
      $scope.meetingdate = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
      $scope.meetingtime = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
    }else{
      $scope.meetingdate = new Date();
      $scope.meetingtime = new Date();
    }
    $scope.meetingtype= meetingtype;
  };

  $scope.validateTime = function(ctime){
    if(ctime >= $scope.meetingdate){
      $scope.disableddateerror = '';
    }else{
      $scope.meetingtime = $scope.meetingdate;
      $scope.disableddateerror = 'Selected time must be above 24 hours from current time.';
      $timeout(function () {
        $scope.disableddateerror  = "";
      }, 4000);
    }
  }

  angular.element(document).ready(function (){
    angular.element('.froalaeditortomeeting').froalaEditor({
      toolbarButtons: ['fullscreen','bold', 'italic', 'underline','formatOL','formatUL'],
      quickInsertTags : [''], //to avoid plus button
      placeholderText: 'Description'
    });
    angular.element('.froalaeditortomeeting').on("froalaEditor.contentChanged", function(){
      $scope.description = angular.element(this).froalaEditor('html.get');
    });
  });
  $scope.meetingdata = function(formname,meetadmin,meetsubject,meetingdate,meetingtime,option,mails){
    angular.element('.froalaeditortomeeting').froalaEditor('html.set', '');
    formname.$setUntouched();
    option.push(meetadmin);
    $scope.uniquetime= $filter('date')(new Date(), 'dd:MM:y, hh:mm:ss:sss a');
    $scope.option= [];
    $scope.meetingusers= [];
    $scope.meetsubject= '';
    $scope.meetingdate= '';
    $scope.meetingtime= '';
    if($scope.meetingattachment === undefined || $scope.type === undefined){
      $scope.meetingattachment = 'NULL';
      $scope.type = 'NULL';
    }
    $scope.socket.emit('meetdata',{
      meetadmin,
      meetsubject,
      description: $scope.description,
      meetingdate :$filter('date')(meetingdate, 'dd:MM:y'),
      meetingtime :$filter('date')(meetingtime, 'hh:mm:ss a'),
      uniquetime:$scope.uniquetime,
      option,
      meetingattachment:$scope.meetingattachment,
      type:$scope.type,
      meetingtype: $scope.meetingtype,
      mails: mails
    });
    $scope.selectedMeetingItem= '';
    $scope.displyattachment = null;
    $scope.meetingattachment = null;
    $scope.meetingusers= angular.copy($scope.users);
  }
  $scope.meetingdatamails = function(formname,meetadmin,meetsubject,meetingdate,meetingtime,option){
    $scope.mails = 'sendmails';
    $scope.meetingdata(formname,meetadmin,meetsubject,meetingdate,meetingtime,option,$scope.mails);
  }

  $scope.meetattachment = function(){
    var file = $scope.premeetingattachment;
    $scope.fileType = file.name.substring(file.name.lastIndexOf(".") + 1); /* getting file extension to know file or image */
    var fd = new FormData();
    fd.append('file', file);
    $http.post('/meetingattachment', fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    })
    .success(function(data){
      if(data.filesizeerror){
        $scope.filesizeerror= data.filesizeerror;
        $timeout(function () {
          $scope.filesizeerror  = "";
        }, 3000);
      }else{
        $scope.displyattachment = data.filename;
        $scope.meetingattachment= data.filename;
        $scope.type= $scope.fileType;
      }
    })
    .error(function(err){console.log(err)});
  };
  $scope.selectedmeeting= function(meet){
    if(screen.width >= 320 && screen.width <= 767){
      $scope.ctrl = 'xs-meeting';
    }
    $scope.resetmdtab = 0;
    Notification.clearAll();
    $scope.reminder = null;
    $scope.defaultreminder = null;
    $scope.selectedremindertime = null;
    $scope.actionofitemslist = [];
    $scope.showAccRej= null;
    $scope.hideAOIform = null;
    $scope.hideAOIeditbtn = null;
    $scope.hideAOIsharebtn = null;
    $scope.showgroupinput= 'meetings';
    $scope.filepre = null;
    $scope.momtomefilepreview = null;
    $scope.hidesharewithmeeditor = null;
    angular.forEach($scope.notifications, function(value, key){
      if((meet.uniquemeetname === value.uniquemeetname) && (meet.meetadmin === value.organizer) && ($scope.youName === value.participant)){
        $scope.showAccRej = value.accept_or_reject;
      }
    });
    $scope.uniquemeetname= meet.uniquemeetname;
    $scope.meetingsubject = meet.meetsubject;
    $scope.meetingdescription = meet.description;
    $scope.meetadmin = meet.meetadmin;
    $scope.meetmembers = meet.meetmembers;
    var parts = meet.date.split(':');
    $scope.date= new Date(parts[2], parts[1]-1, parts[0]).toDateString();
    $scope.dateformdpickerinmeeting = new Date();
    var meetdatetime = meet.date+':'+meet.meetingtime;
    var date1parts = meetdatetime.split(':');
    if(date1parts[5].substr(date1parts[5].length-2,date1parts[5].length-1).toString() == 'PM'){
      var twentyfourhourformat = Number(date1parts[3])+12;
      var date1 = new Date(date1parts[2], date1parts[1]-1, date1parts[0], twentyfourhourformat, date1parts[4]);
    }else{
      var date1 = new Date(date1parts[2], date1parts[1]-1, date1parts[0], date1parts[3], date1parts[4]);
    }
    var date2 = new Date();
    if(date1 >= date2){
      $scope.timeDiff = Math.floor(Math.abs(date2.getTime() - date1.getTime())/60000);
      $scope.disablereminderselect = false;
    }else{
      $scope.disablereminderselect = true;
      $scope.timeDiff = 0;
    }
    $scope.time= meet.meetingtime;
    $scope.meetingattachment= meet.meetingattachment;
    $scope.type= meet.type;
    $scope.meetingtype= meet.meetingtype;
    if($scope.meetadmin == $scope.youName || meet.momshared === 'shared'){
      if(meet.momtoall !== null){
        var momtoalldata = meet.momtoallarray;
        for(var i=0; i<momtoalldata.length; i++){
          if(typeof momtoalldata[i].assignedto === 'string'){
            momtoalldata[i].assignedto = momtoalldata[i].assignedto.split(',');
          }
          if($scope.meetadmin !== $scope.youName){
            var index = momtoalldata[i].assignedto.findIndex(x => x== $scope.youName);
            if(index === -1){
              momtoalldata[i].disablemdselect = 'disable';
            }
          }
          if(momtoalldata[i].reminder !== null){
            var remindertoarray = momtoalldata[i].reminder.split(',');
            for(var j=0; j<remindertoarray.length; j++){
              var uname = remindertoarray[j].substring(0,remindertoarray[j].indexOf('*'));
              var remindertime= remindertoarray[j].substring(remindertoarray[j].indexOf('*')+1, remindertoarray[j].length);
              if(uname == $scope.youName){
                momtoalldata[i].hidedatepickerone = 'hidedatepicker';
                momtoalldata[i].remindertime = new Date(remindertime);
              }
            }  
          }
        }
        $scope.actionofitemslist = momtoalldata;
      }
    }
    for(var i=0; i<$scope.meetings.length; i++){
      if($scope.meetings[i].uniquemeetname == $scope.uniquemeetname){
        var meetmembers = $scope.meetings[i].meetmembers;
        for(var j=0; j<meetmembers.length; j++){
          if(meetmembers[j].membersinmeet == $scope.youName){
            $scope.defaultreminder = meetmembers[j].remindertime;
            date1.setMinutes(date1.getMinutes() - meetmembers[j].remindertime)
            $scope.selectedremindertime = date1;
            for(var k=0; k<$scope.reminderTime.length; k++){
              if($scope.reminderTime[k].convertedintominutes === Number(meetmembers[j].remindertime)){
                $scope.reminder = $scope.reminderTime[k].displaytime;
              }
            }
            if(meetmembers[j].momtoall !== null){
              if(meetmembers[j].hide == 'hide'){
                $scope.hideAOIform = 'hide';
                $scope.hideAOIeditbtn = 'hide';
                $scope.hideAOIsharebtn = 'hide';
              }
            }
            $scope.momtomefilepreview = meetmembers[j].momtome;
            if(meetmembers[j].momtome !== null){
              $scope.hidesharewithmeeditor = 'hidesharewithmeeditor';
            }
            meetmembers[j].status = 'seen';
            if($scope.newmeetingnotifications <= 1){
              $scope.newmeetingnotifications = null;
            }else{
              $scope.newmeetingnotifications -= 1;
            }
          }
        }
      }
    }
    $scope.socket.emit('makemeetingasseen', $scope.uniquemeetname, $scope.youName);
  }

  $scope.declineMeeting = function(reason,participant){
    $scope.showAccRej = 'Declined';
    $scope.socket.emit('declinemeeting',{id: $scope.yourId, organizer: $scope.meetadmin, participant: participant, accept_or_reject: 'Declined', reason: reason, uniquemeetname: $scope.uniquemeetname, meetingsubject:  $scope.meetingsubject, status: 'unseen'})    
    $scope.reason= '';
  }

  $scope.acceptMeeting = function(participant){
    $scope.showAccRej = 'Accepted';
    $scope.socket.emit('acceptmeeting',{id: $scope.yourId, organizer: $scope.meetadmin, participant: participant, accept_or_reject: 'Accepted', uniquemeetname: $scope.uniquemeetname, meetingsubject:  $scope.meetingsubject, status: 'unseen'})    
  }

  $scope.proposedTimeData = function(proposedDate,proposedTime,participant) {
    $scope.showAccRej = 'Proposed';
    $scope.socket.emit('proposedtime',{id: $scope.yourId, organizer: $scope.meetadmin, participant: participant, accept_or_reject: 'Proposed', proposeddate: proposedDate,proposedtime: proposedTime, uniquemeetname: $scope.uniquemeetname, meetingsubject:  $scope.meetingsubject, status: 'unseen'})
  }
  
  // Action Of Items
  $scope.actionofitemslist = [];
  $scope.AOItopersons = [];
  $scope.hidesave = null;
  $scope.shareandmail = null;
  $scope.workstream = ['Production','R & D','Purchase','Marketing','HR Management','Accounting & Finance'];
  $scope.prioritylist = ['High','Medium','Low'];
  $scope.statusAOIadmin = ['Cancel','Close'];
  $scope.statusAOImember = ['Accept','In Progress','In Progress-On Hold','Completed-Verifies','Completed','Reject','Stopped'];

  $scope.actionofitem= function(formname,AOIpoint,AOItopersons,workstreammodel,prioritymodel,AOIdate){
    formname.$setUntouched();
    $scope.AOIpoint = '';
    $scope.AOItopersons = [];
    $scope.workstreammodel = '';
    $scope.prioritymodel = '';
    $scope.AOIdate = '';
    $scope.socket.emit('actionofitem', {
      identifier: $scope.uniquemeetname,
      AOIpoint: AOIpoint,
      workstream: workstreammodel,
      priority: prioritymodel,
      assignedto: AOItopersons,
      createddate: $filter('date')(new Date(), 'd.MMM.yy, h:m:s:sss a'),
      duedate: AOIdate,
      assignedby: $scope.youName
    });
  }

  $scope.editAOI = function(edit){
    $scope.hidesave = 'hidesave';
    $scope.editobj = edit;
    $scope.AOIpoint = edit.point;
    angular.element(document).ready(function(){
      angular.element(".meetmembers").val(edit.assignedto).select2();
    })
    $scope.workstreammodel = edit.workstream;
    $scope.prioritymodel = edit.priority;
    if(edit.pcdate){
      $scope.AOIdate = new Date(edit.pcdate);
    }
  }

  $scope.socket.on('actionofitem', function(data){
    if(typeof data.assignedto === 'string'){
      data.assignedto = data.assignedto.split(',');
    }
    $scope.actionofitemslist.push(data);
  });
  $scope.socket.on('getmomtoalldata', function(momtoalldata){
    for(var i=0; i<momtoalldata.length; i++){
      if(momtoalldata[i].reminder !== null){
        var remindertoarray = momtoalldata[i].reminder.split(',');
        for(var j=0; j<remindertoarray.length; j++){
          var uname = remindertoarray[j].substring(0,remindertoarray[j].indexOf('*'));
          var remindertime= remindertoarray[j].substring(remindertoarray[j].indexOf('*')+1, remindertoarray[j].length);
          if(uname == $scope.youName){
            momtoalldata[i].hidedatepickerone = 'hidedatepicker';
            momtoalldata[i].remindertime = new Date(remindertime);
          }
        }  
      }
    }
    $scope.actionofitemslist = momtoalldata;
  });

  $scope.shareAOI = function(){
    var cmpltdtime = 'completed at '+$filter('date')(new Date(), 'dd-MM-yyyy h:mm a');
    for(var i=0; i<$scope.meetings.length; i++){
      if($scope.meetings[i].uniquemeetname === $scope.uniquemeetname){
        $scope.meetings[i].meetingcmpltd = cmpltdtime;
      }
    }
    $scope.socket.emit('shareaoi', $scope.uniquemeetname, $scope.meetmembers, $scope.shareandmail, cmpltdtime);
    $scope.shareandmail = null;
    $scope.hideAOIform = 'hide';
    $scope.hideAOIeditbtn = 'hide';
    $scope.hideAOIsharebtn = 'hide';
  }

  $scope.shareAOIMail = function(){
    $scope.shareandmail = 'shareandmail';
    $scope.shareAOI();
  }

  $scope.socket.on('shareaoi', function(aoitablename, meetingtablename, momtoalldata, cmpltdtime){
    for(var i=0; i<$scope.meetings.length; i++){
      if($scope.meetings[i].uniquemeetname == meetingtablename){
        $scope.meetings[i].meetingcmpltd = cmpltdtime;
        for(var j=0; j<$scope.meetings[i].meetmembers.length; j++){
          $scope.meetings[i].momshared = 'shared';
          $scope.meetings[i].momtoallarray = momtoalldata;
          if($scope.meetings[i].meetadmin !== $scope.youName){
            $scope.meetings[i].momstatusnotification = 'Shared Minutes Of Meeting';
          }
          $scope.meetings[i].meetmembers[j].momtoall =  aoitablename;
          $scope.meetings[i].meetmembers[j].hide =  'hide';
          $scope.meetings[i].meetmembers[j].momstatus = 'unseen';
        }
      }
    }
  });

  $scope.updateAOI = function(formname,editobj,AOIpoint,AOItopersons,workstreammodel,prioritymodel,AOIdate){
    formname.$setUntouched();
    $scope.updatepersons = [];
    $scope.AOIpoint = '';
    $scope.workstreammodel = '';
    $scope.prioritymodel = '';
    $scope.AOIdate = '';
    if(AOItopersons.length == 0){
      $scope.updatepersons = editobj.assignedto;
    }else{
      $scope.updatepersons = AOItopersons;
    }
    $scope.socket.emit('updateactionofitem', {
      editobjid: editobj.AOIId,
      identifier: $scope.uniquemeetname,
      AOIpoint: AOIpoint,
      workstream: workstreammodel,
      priority: prioritymodel,
      assignedto: $scope.updatepersons,
      createddate: editobj.createddate,
      duedate: AOIdate,
      assignedby: $scope.youName
    });
    $scope.hidesave = null;
  }

  $scope.socket.on('updateactionofitem', function(updateddata){
    if(typeof updateddata.assignedto === 'string'){
      updateddata.assignedto = updateddata.assignedto.split(',');
    }
    var updatedobj = $scope.actionofitemslist;
    for(var i=0; i<updatedobj.length; i++){
      if(updatedobj[i].AOIId == updateddata.AOIId && updatedobj[i].createddate == updateddata.createddate){
        updatedobj[i] = updateddata;
      }
    }
  });

  $scope.cancleAOI = function(formname){
    formname.$setUntouched();
    $scope.AOIpoint = '';
    $scope.workstreammodel = '';
    $scope.prioritymodel = '';
    $scope.AOIdate = '';
    $scope.hidesave = null;
  }

  $scope.updateAdminStatus = function(status, AOI){
    $scope.socket.emit('updateadminstatus', status, AOI);
  }

  $scope.updateMemberStatus = function(status, AOI){
    $scope.socket.emit('updatememberstatus', status, AOI, $scope.meetmembers);
  }
  $scope.socket.on('onlineupdateofmemberstatus', function(status, AOI){
    for(var i=0; i<$scope.meetings.length; i++){
      if($scope.meetings[i].uniquemeetname === AOI.identifier){
        for(var j=0; j<$scope.meetings[i].momtoallarray.length; j++){
          if($scope.meetings[i].momtoallarray[j].AOIId === AOI.AOIId){
            $scope.meetings[i].momtoallarray[j].memberstatus = status;
          }
          for(var k=0; k<$scope.actionofitemslist.length; k++){
            if($scope.actionofitemslist[k].AOIId === AOI.AOIId){
              $scope.actionofitemslist[k].memberstatus = status;
            }
          }
        }
      }
    }
  });

  $scope.reminderAOI = function(datetime, AOI){
    var namedatetime = $scope.youName+'*'+datetime;
    $scope.socket.emit('namedatetime',$scope.youName, AOI);
    $scope.socket.on('reminderisnull', function(){
      $scope.socket.emit('reminderisnull', namedatetime, AOI, $scope.meetmembers);
    });
    $scope.socket.on('reminderisnotnull', function(reminderdata){
      var reminderAOIarray = [];
      reminderAOIarray.push(reminderdata);
      reminderAOIarray.push(namedatetime);
      $scope.socket.emit('updatenamedatetime', AOI, reminderAOIarray, $scope.meetmembers);
    });
  }
  $scope.socket.on('updatemomtoalldata', function(AOI, momtoalldata){
    for(var i=0; i<$scope.meetings.length; i++){
      if($scope.meetings[i].uniquemeetname == AOI.identifier){
        $scope.meetings[i].momtoallarray = momtoalldata;
      }
    }
  })

  $scope.updateReminderAOI = function(datetime, AOI){
    var namedatetime = $scope.youName+'*'+datetime;
    $scope.socket.emit('changenamedatetime',$scope.youName, AOI);
    $scope.socket.on('changenamedatetime', function(changereminderdata){
      var remindertoarray = changereminderdata.split(',');
      for(var j=0; j<remindertoarray.length; j++){
        var uname = remindertoarray[j].substring(0,remindertoarray[j].indexOf('*'));
        if(uname == $scope.youName){
          remindertoarray[j] = namedatetime;
        }
      } 
      $scope.socket.emit('updatenamedatetime', AOI, remindertoarray, $scope.meetmembers);
    });
  }

  $scope.momStatusAsSeen = function(){
    $scope.socket.emit('momstatusasseen', $scope.uniquemeetname, $scope.youName);
    for(var i=0; i<$scope.meetings.length; i++){
      if($scope.meetings[i].uniquemeetname == $scope.uniquemeetname){
        for(var j=0; j<$scope.meetings[i].meetmembers.length; j++){
          if($scope.meetings[i].meetmembers[j].membersinmeet == $scope.youName){
            $scope.meetings[i].meetmembers[j].momstatus = 'seen';
            $scope.meetings[i].momstatusnotification = null;
          }
        }
      }
    }
  }
  // Action Of Items end
  // end of meetings

  // share files
  $scope.imageselecalltbtn = null;
  $scope.docselectallbtn = null;
  $scope.audioselectallbtn = null;
  $scope.videoselectallbtn = null;
  $scope.socket.on('sharefromdatabase', function(data){
    $scope.sharefilenotifications = null;
    $scope.shareFiles = [];
    $scope.imagecount = 0;
    $scope.doccount = 0;
    $scope.audiocount = 0;
    $scope.videocount = 0;
    for(var i=0; i<data.length; i++){
      if(data[i].tousername === $scope.youName){
        if(data[i].status == 'unseen'){
          $scope.sharefilenotifications += 1;
        }
      }
      if(data[i].filetype === 'image'){
        $scope.imagecount += 1;
      }
      if(data[i].filetype === 'application' || data[i].filetype === 'text'){
        $scope.doccount += 1;
      }
      if(data[i].filetype === 'audio'){
        $scope.audiocount += 1;
      }
      if(data[i].filetype === 'video'){
        $scope.videocount += 1;
      }
      data[i].originalname = data[i].file.substring(8,data[i].file.length);
    }
    $scope.shareFiles = data;
    if($scope.imagecount <= 1){$scope.imageselecalltbtn = 'imageselecalltbtn';}
    if($scope.doccount <= 1){$scope.docselectallbtn = 'docselectallbtn';}
    if($scope.audiocount <= 1){$scope.audioselectallbtn = 'audioselectallbtn';}
    if($scope.videocount <= 1){$scope.videoselectallbtn = 'videoselectallbtn';}
  });

  $scope.shareFile = function(){
    var file = $scope.sharefile;
    console.log(file);
    var fd = new FormData();
    angular.forEach(file, function(value, key){
      var extension = value.type.split('/')[0];
      if(extension === 'application' || extension === 'image' || extension === 'video' || extension === 'audio' || extension === 'text'){
        fd.append('file', value);
      }else{
        $mdToast.show($mdToast.simple().textContent(''+value.name+' Is Not Allowed').position("bottom right").hideDelay(5000));
      }
    });
    $http.post('/sharefile', fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined},
      uploadEventHandlers: {
        progress: function (e) {
           if (e.lengthComputable) {
              $scope.uploadprogress =  (e.loaded / e.total) * 100;
           }
        }
      }
    })
    .success(function(data){
      if(data.files){
        angular.forEach(data.files, function(value, key){
          var extension = value.mimetype.split('/')[0];
          $scope.socket.emit('sharefile', {
            uploadername: $scope.you,
            uploaderusername: $scope.youName,
            file: value.filename,
            filetype: extension,
            fst: new Date()
          });
        });
      }else{
        $scope.sharefileuploaderr = data.sharefileuploaderr;
      }
      if ($scope.uploadprogress == 100){$scope.uploadprogress = 0;}
    })
    .error(function(err){console.log(err)});
  }
  $scope.socket.on('sharefile', function(data){
    if(data.filetype === 'image'){
      $scope.imagecount += 1;
    }
    if(data.filetype === 'application' || data.filetype === 'text'){
      $scope.doccount += 1;
    }
    if(data.filetype === 'audio'){
      $scope.audiocount += 1;
    }
    if(data.filetype === 'video'){
      $scope.videocount += 1;
    }
    data.originalname = data.file.substring(8,data.file.length);
    $scope.shareFiles.push(data);
    if($scope.imagecount <= 1){$scope.imageselecalltbtn = 'imageselecalltbtn';}else{$scope.imageselecalltbtn = null;}
    if($scope.doccount <= 1){$scope.docselectallbtn = 'docselectallbtn';}else{$scope.docselectallbtn = null;}
    if($scope.audiocount <= 1){$scope.audioselectallbtn = 'audioselectallbtn';}else{$scope.audioselectallbtn = null;}
    if($scope.videocount <= 1){$scope.videoselectallbtn = 'videoselectallbtn';}else{$scope.videoselectallbtn = null;}
  });

  $scope.selectedShareFile = function(data){
    $scope.selectedShareFileData = data;
    $scope.sharetothisusersdata = [];
    $scope.multipleSelectedFiles = [];
    if(data.filetype == 'image'){
      $scope.multipleshareimage = null;
    }
    if(data.filetype == 'application' || data.filetype == 'text'){
      $scope.multiplesharedoc = null;
    }
    if(data.filetype == 'audio'){
      $scope.multipleshareaudio = null;
    }
    if(data.filetype == 'video'){
      $scope.multiplesharevideo = null;
    }
  }

  $scope.shareToUsers = function(sharetothisusers){
    for(var i=0; i<sharetothisusers.length; i++){
      for(var j=0; j<$scope.users.length; j++){
        if(sharetothisusers[i] === $scope.users[j].uname){
          $scope.sharetothisusersdata.push($scope.users[j]);
        }
      }
    }
    if($scope.selectedShareFileData.filetype === 'image'){
      $scope.showimagecheckbox = null;
      $scope.checkboxselectimage = 'Select';
    }
    if($scope.selectedShareFileData.filetype === 'application' || $scope.selectedShareFileData.filetype === 'text'){
      $scope.showdoccheckbox = null;
      $scope.checkboxselectdoc = 'Select';
    }
    if($scope.selectedShareFileData.filetype === 'audio'){
      $scope.showaudiocheckbox = null;
      $scope.checkboxselectaudio = 'Select';
    }
    if($scope.selectedShareFileData.filetype === 'video'){
      $scope.showvideocheckbox = null;
      $scope.checkboxselectvideo = 'Select';
    }
    $scope.socket.emit('sharetothisusers', {selectedShareFileData: $scope.selectedShareFileData, fst: new Date(), fromname: $scope.you, fromusername: $scope.youName, sharetothisusersdata: $scope.sharetothisusersdata});
    angular.element('#sharefile').modal('hide');
  }

  $scope.showimagecheckbox = null;
  $scope.checkboxselectimage = 'Select';
  $scope.showdoccheckbox = null;
  $scope.checkboxselectdoc = 'Select';
  $scope.showaudiocheckbox = null;
  $scope.checkboxselectaudio = 'Select';
  $scope.showvideocheckbox = null;
  $scope.checkboxselectvideo = 'Select';
  $scope.activatecheckbox = function(filetype){
    if(filetype == 'image'){
      if($scope.showimagecheckbox === null){
        $scope.showimagecheckbox = 'show';
        $scope.checkboxselectimage = 'Unselect';
      }else{
        $scope.showimagecheckbox = null;
        $scope.checkboxselectimage = 'Select';
        $scope.multipleSelectedFiles = [];
        $scope.multipleshareimage = null;
      }
    }
    if(filetype == 'application' || filetype == 'text'){
      if($scope.showdoccheckbox === null){
        $scope.showdoccheckbox = 'show';
        $scope.checkboxselectdoc = 'Unselect';
      }else{
        $scope.showdoccheckbox = null;
        $scope.checkboxselectdoc = 'Select';
        $scope.multipleSelectedFiles = [];
        $scope.multiplesharedoc = null;
      }
    }
    if(filetype == 'audio'){
      if($scope.showaudiocheckbox === null){
        $scope.showaudiocheckbox = 'show';
        $scope.checkboxselectaudio = 'Unselect';
      }else{
        $scope.showaudiocheckbox = null;
        $scope.checkboxselectaudio = 'Select';
        $scope.multipleSelectedFiles = [];
        $scope.multipleshareaudio = null;
      }
    }
    if(filetype == 'video'){
      if($scope.showvideocheckbox === null){
        $scope.showvideocheckbox = 'show';
        $scope.checkboxselectvideo = 'Unselect';
      }else{
        $scope.showvideocheckbox = null;
        $scope.checkboxselectvideo = 'Select';
        $scope.multipleSelectedFiles = [];
        $scope.multiplesharevideo = null;
      }
    }
  }
  $scope.activateAllCheckboxes = function(filetype){
    if(filetype == 'image'){
      for(var i=0; i<$scope.shareFiles.length; i++){
        if($scope.shareFiles[i].filetype === 'image'){
          var index = $scope.multipleSelectedFiles.findIndex(x => x.file== $scope.shareFiles[i].file && x.fst == $scope.shareFiles[i].fst);
          if(index == -1){
            $scope.multipleSelectGrid($scope.shareFiles[i]);
          }
        }
      }
    }
    if(filetype == 'application' || filetype == 'text'){
      for(var i=0; i<$scope.shareFiles.length; i++){
        if($scope.shareFiles[i].filetype === 'application' || $scope.shareFiles[i].filetype === 'text'){
          var index = $scope.multipleSelectedFiles.findIndex(x => x.file== $scope.shareFiles[i].file && x.fst == $scope.shareFiles[i].fst);
          if(index == -1){
            $scope.multipleSelectGrid($scope.shareFiles[i]);
          }
        }
      }
    }
    if(filetype == 'audio'){
      for(var i=0; i<$scope.shareFiles.length; i++){
        if($scope.shareFiles[i].filetype === 'audio'){
          var index = $scope.multipleSelectedFiles.findIndex(x => x.file== $scope.shareFiles[i].file && x.fst == $scope.shareFiles[i].fst);
          if(index == -1){
            $scope.multipleSelectGrid($scope.shareFiles[i]);
          }
        }
      }
    }
    if(filetype == 'video'){
      for(var i=0; i<$scope.shareFiles.length; i++){
        if($scope.shareFiles[i].filetype === 'video'){
          var index = $scope.multipleSelectedFiles.findIndex(x => x.file== $scope.shareFiles[i].file && x.fst == $scope.shareFiles[i].fst);
          if(index == -1){
            $scope.multipleSelectGrid($scope.shareFiles[i]);
          }
        }
      }
    }
  }

  $scope.multipleSelectGrid = function(sf){
    var index = $scope.multipleSelectedFiles.findIndex(x => x.file== sf.file && x.fst == sf.fst);
    if(index == -1){
      $scope.multipleSelectedFiles.push(sf);
    }else{
      $scope.multipleSelectedFiles.splice(index, 1);
    }
    if($scope.multipleSelectedFiles.length <=1){
      if(sf.filetype == 'image'){
        $scope.multipleshareimage = null;
      }
      if(sf.filetype == 'application' || sf.filetype == 'text'){
        $scope.multiplesharedoc = null;
      }
      if(sf.filetype == 'audio'){
        $scope.multipleshareaudio = null;
      }
      if(sf.filetype == 'video'){
        $scope.multiplesharevideo = null;
      }
      $scope.multipleshare = null;
    }else{
      $scope.multipleshare = 'share';
      if(sf.filetype == 'image'){
        $scope.multipleshareimage = 'share';
      }
      if(sf.filetype == 'application' || sf.filetype == 'text'){
        $scope.multiplesharedoc = 'share';
      }
      if(sf.filetype == 'audio'){
        $scope.multipleshareaudio = 'share';
      }
      if(sf.filetype == 'video'){
        $scope.multiplesharevideo = 'share';
      }
    }
  }
  $scope.makeAsSeen = function(sf){
    for(var x=0; x<$scope.shareFiles.length; x++){
      if($scope.shareFiles[x] == sf ){
        if($scope.shareFiles[x].status == 'unseen'){
          $scope.shareFiles[x].status = 'seen';
          if($scope.sharefilenotifications <= 1){
            $scope.sharefilenotifications = null;
          }else{
            $scope.sharefilenotifications -= 1;
          }
        }
      }
    }
    $scope.socket.emit('sharefilesasseen', sf);
  }
  $scope.exists = function(sf){
    return $scope.multipleSelectedFiles.indexOf(sf) > -1;
  }
 
  $scope.shareMultipleFilesToMultipleUsers = function(multipleSelectedFiles, sharetothisusers){
    angular.forEach(multipleSelectedFiles, function(value, key){
      $scope.selectedShareFile(value);
      $scope.shareToUsers(sharetothisusers);
    });
    angular.element('#sharefile').modal('hide');
  }

  $scope.socket.on('sharetothisusers', function(data){
    data.originalname = data.file.substring(8,data.file.length);
    if(data.tousername === $scope.youName){
      if(data.status == 'unseen'){
        $scope.sharefilenotifications += 1; 
      }
      if(data.filetype === 'image'){
        $scope.imagecount += 1;
      }
      if(data.filetype === 'application' || data.filetype === 'text'){
        $scope.doccount += 1;
      }
      if(data.filetype === 'audio'){
        $scope.audiocount += 1;
      }
      if(data.filetype === 'video'){
        $scope.videocount += 1;
      }
    }
    $scope.shareFiles.push(data);
    if($scope.imagecount <= 1){$scope.imageselecalltbtn = 'imageselecalltbtn';}else{$scope.imageselecalltbtn = null;}
    if($scope.doccount <= 1){$scope.docselectallbtn = 'docselectallbtn';}else{$scope.docselectallbtn = null;}
    if($scope.audiocount <= 1){$scope.audioselectallbtn = 'audioselectallbtn';}else{$scope.audioselectallbtn = null;}
    if($scope.videocount <= 1){$scope.videoselectallbtn = 'videoselectallbtn';}else{$scope.videoselectallbtn = null;}
  });

  $scope.removeFile = function(data){
    $scope.socket.emit('removefile', data,$scope.youName);
  };
  $scope.emptyArray = function(filetype){
    $scope.multipleSelectedFiles = [];
    if(filetype == 'image'){$scope.multipleshareimage = null;}
    if(filetype == 'application' || filetype == 'text'){$scope.multiplesharedoc = null;}
    if(filetype == 'audio'){$scope.multipleshareaudio = null;}
    if(filetype == 'video'){$scope.multiplesharevideo = null;}
  }

  $scope.removeMultipleFiles = function(filetype){
    angular.forEach($scope.multipleSelectedFiles, function(value, key){
      if(value.filetype == filetype){
        $scope.removeFile(value);
      }else{
        if(value.filetype == 'text'){
          $scope.removeFile(value);
        }
      }
    });
    $scope.multipleSelectedFiles = [];
    if(filetype == 'image'){
      $scope.multipleshareimage = null;
      $scope.showimagecheckbox = null;
      $scope.checkboxselectimage = 'Select';
    }
    if(filetype == 'application' || filetype == 'text'){
      $scope.multiplesharedoc = null;
      $scope.showdoccheckbox = null;
      $scope.checkboxselectdoc = 'Select';
    }
    if(filetype == 'audio'){
      $scope.multipleshareaudio = null;
      $scope.showaudiocheckbox = null;
      $scope.checkboxselectaudio = 'Select';
    }
    if(filetype == 'video'){
      $scope.multiplesharevideo = null;
      $scope.showvideocheckbox = null;
      $scope.checkboxselectvideo = 'Select';
    }
   
  }
  $scope.intializeAudio = function(sf){
    $timeout( function(){
      var aud = document.getElementById(''+sf+'');
      for(var i=0; i<$scope.shareFiles.length; i++){
        if($scope.shareFiles[i].originalname === sf){
          $scope.shareFiles[i].sliderlength = aud.duration;
        }      
      }
    }, 1500 );
  }
  $scope.playorpauseAudio = function(sf){
    var aud = document.getElementById(''+sf+'');
    for(var i=0; i<$scope.shareFiles.length; i++){
      if($scope.shareFiles[i].originalname === sf){
        if($scope.shareFiles[i].playorpausebtn === 'Play'){
          $scope.shareFiles[i].playorpausebtn = 'Pause';
          aud.play();
        }else{
          $scope.shareFiles[i].playorpausebtn = 'Play';
          aud.pause();
        }
      }
    }
    aud.addEventListener('timeupdate',function(){
      for(var i=0; i<$scope.shareFiles.length; i++){
        if($scope.shareFiles[i].originalname === sf){
          $scope.shareFiles[i].currenttime = aud.currentTime;
          if(aud.ended){
            $scope.shareFiles[i].playorpausebtn = 'Play';
            $scope.shareFiles[i].muteaudio = 'Mute';
            aud.muted = false;
            aud.pause();
          }
        }
      }
    });
  }
  $scope.muteAudio = function(sf){
    var aud = document.getElementById(''+sf+'');
    for(var i=0; i<$scope.shareFiles.length; i++){
      if($scope.shareFiles[i].originalname === sf){
        if($scope.shareFiles[i].muteaudio === 'Mute'){
          $scope.shareFiles[i].muteaudio = 'Unmute';
          aud.muted = true;
        }else{
          $scope.shareFiles[i].muteaudio = 'Mute';
          aud.muted = false;
        }
      }
    }
  }
  $scope.updateTym = function(sf){
    var aud = document.getElementById(''+sf+'');
    for(var i=0; i<$scope.shareFiles.length; i++){
      if($scope.shareFiles[i].originalname === sf){
        aud.currentTime = $scope.shareFiles[i].currenttime;
      }
    }
  }

  angular.element("#multipleshare").click(function(){
    angular.element("md-grid-tile").removeClass('red');
  });
  angular.element("#share").click(function(){
    angular.element("md-grid-tile").removeClass('red');
  });
  // end share files

  // Quotes

  $scope.socket.emit('sendtodaydate', $filter('date')(new Date(), 'dd MMMM y'));
  $scope.socket.on('quotesdatafromdatabase', function(data){
    Notification.clearAll();
    angular.forEach(data, function(value, key){
      Notification.primary({title: 'Todays Quote',message: '<div>'+value.quote+'</div><div style="font-size: 12px;float: right;"><img src="/uploads/profileimages/'+value.userimage+'" style="width:20px;height:20px;border-radius: 50%;"><span style="padding-left: 10px;">'+value.name+'</span></div><br>', delay: null});
    });
  });

  $scope.postQuote = function(formname,quote,you,youName,profilePic){
    formname.$setUntouched();
    $scope.socket.emit('quotesdata', {quote: quote, name: you, postedby: youName, date: $filter('date')(new Date(), 'dd MMMM y'), tomorrowdate: $filter('date')(new Date(new Date().getTime() + 60 * 60 * 24 * 1000), 'dd MMMM y'), userimage: profilePic});
    $scope.quote = null;
  }

  $scope.socket.on('quotesdata', function(data){
    Notification.primary({title: 'Todays Quote',message: '<div>'+data.quote+'</div><div style="font-size: 12px;float: right;"><img src="/uploads/profileimages/'+data.userimage+'" style="width:20px;height:20px;border-radius: 50%;"><span style="padding-left: 10px;">'+data.name+'</span></div><br>', delay: null});
  });

  $scope.socket.on('tomsuccessmsg',function(){
    $scope.tomsuccessmsg = 'Your Quote Will Be Posted Tomorrow...'
    $timeout(function () {
      $scope.tomsuccessmsg   = null;
    }, 5000);
  })

  $scope.socket.on('tomerrormsg',function(){
    $scope.tomerrormsg = "Sorry You Can't Post, Try Tomorrow...";
    $timeout(function () {
      $scope.tomerrormsg   = null;
    }, 5000);
  });

  
  $scope.info = [];
  $scope.socket.on("informationdatafromdatabase", function(data){
    $scope.info = data;
  });

  $scope.socket.on("infodata",function(data){
    $scope.info.push(data);
  });

  $scope.infocount = null; 
  $scope.infonotifications = [];
  $scope.socket.on("dbinformationnotifications",function(data){
  $scope.infocount = null; 
    for(var j=0; j<data.length; j++){
        if($scope.youName === data[j].member){
          if(data[j].status == 'unseen'){
            $scope.infocount += 1;
            $scope.$digest();
          }
        }
    }
  })

  $scope.socket.on("infonotifications",function(data){
    if($scope.youName === data.member){
      if(data.status === 'unseen'){
        $scope.infocount += 1;
        $scope.$digest();
      }
    }
  })

  $scope.infocountdecrement = function(data){
    $scope.infocount = null;
    $scope.socket.emit("infocountdecrement",data);
    $scope.can2 = $interval(function(){ $scope.countd()}, 1000);
  }

  $scope.countd = function(){
    $scope.infocount = null;
  }

  $scope.livequotecount = function(){
     $interval.cancel($scope.can2);
  }

  $scope.shareInformation = function(formname,information,you,youName,profilePic){
    formname.$setUntouched();
    $scope.socket.emit('informationdata', {information: information.replace(/'/g, "squote"), name: you, postedby: youName, date: $filter('date')(new Date(), 'dd-MM-yyyy h:mm:ss a'), userimage: profilePic});
    $scope.information = null;
  }

  $scope.clearquote = function(){
    Notification.clearAll();
  }

  // quotes end

  // leave letter data
  $scope.hleaveto = [];
  $scope.replys= [];
  $scope.leavereply = null;
  $scope.leaveletternotifications = null;
  $scope.showReply = function(data){
    for(var i=0; i<$scope.replys.length; i++){
      if($scope.replys[i] == data){
        if($scope.replys[i].show == 'no'){
          $scope.replys[i].show = 'yes';
        }else{
          $scope.replys[i].show = 'no';
        }
        $scope.replys[i].notification = 'seen';
      }
    }
  }

  $scope.applyLeave = function(){
    Notification.clearAll();
    $scope.showgroupinput = 'createleaveletter';
    if(screen.width >= 320 && screen.width <= 767){
      $scope.ctrl = 'xs-leavecreation';
    }
  }
  $scope.lhours = ['1 Hour','2 Hours','3 Hours','Half Day'];

  $scope.leaves= [];
  $scope.socket.on('leavesfromdatabasefromuname',function(data){
    if(data.fromdelete == null){
      $scope.leaves.push(data);
    }
  });
  $scope.socket.on('leavesfromdatabasetouname',function(data){
    for(var i=0; i<data.leavemembers.length; i++){
      if(data.leavemembers[i].touname === $scope.youName){
        if(data.leavemembers[i].notification === 'unseen'){
          data.notification = 'unseen';
          $scope.leaveletternotifications += 1;
        }
        if(data.leavemembers[i].todelete == null){
          $scope.leaves.push(data);
        }
      }
    }
  });


  $scope.socket.on('leavereplysfromdatabase', function(data){
    for(var i=0; i<data.length; i++){
      for(var j=0; j<$scope.users.length; j++){
        if(data[i].fromuname === $scope.users[j].uname){
          data[i].frompic = $scope.users[j].image;
          data[i].fromemail = $scope.users[j].email;
          data[i].show = 'no';
        }
        if(data[i].touname === $scope.users[j].uname){
          data[i].topic = $scope.users[j].image;
          data[i].toemail = $scope.users[j].email;
          data[i].show = 'no';
        }
      }
    }
    for(var m=0; m<$scope.leaves.length; m++){
      $scope.leaves[m].notificationcount = null;
      for(var n=0; n<data.length; n++){
        if(($scope.leaves[m].uniqueleavename == data[n].uniqueleavename) && ($scope.youName == data[n].touname)){
          if(data[n].notification == 'unseen'){
            $scope.leaves[m].notificationcount +=1;
          }
        }
      }
      if($scope.leaves[m].notificationcount !== null){
        $scope.leaveletternotifications +=1;
      }
    }
    $scope.replys = data;
  });

  angular.element(document).ready(function () {
    angular.element('.froalaeditorforhleave').froalaEditor({
      toolbarButtons: ['fullscreen','bold', 'italic', 'underline','formatOL','formatUL'],
      quickInsertTags : [''], //to avoid plus button
      placeholderText: 'Reason' 
    });
    angular.element('.froalaeditorforhleave').on("froalaEditor.contentChanged", function(){
      $scope.hreasonforleave = angular.element(this).froalaEditor('html.get');
    });
    angular.element('.froalaeditorfordleave').froalaEditor({
      toolbarButtons: ['fullscreen','bold', 'italic', 'underline','formatOL','formatUL'],
      quickInsertTags : [''], //to avoid plus button
      placeholderText: 'Reason' 
    });
    angular.element('.froalaeditorfordleave').on("froalaEditor.contentChanged", function(){
      $scope.dreasonforleave = angular.element(this).froalaEditor('html.get');
    });
    angular.element('.froalaeditorforreply').froalaEditor({
      toolbarButtons: ['fullscreen','bold', 'italic', 'underline','formatOL','formatUL'],
      quickInsertTags : [''],
      placeholderText: 'Reply' 
    });
    angular.element('.froalaeditorforreply').on("froalaEditor.contentChanged", function(){
      $scope.leavereply = angular.element(this).froalaEditor('html.get');
    });
  });
  $scope.hleaveLetterData = function(formname,tousers,subject, hours){
    formname.$setUntouched();
    angular.element('#hourseditor').froalaEditor('html.set', '');
    $scope.hsubject= '';
    $scope.currentdate= null;
    $scope.tousersdata = [];
    $scope.selectedhours = '';
    for(var i=0; i<tousers.length; i++){
      for(var j=0; j<$scope.users.length; j++){
        if(tousers[i] === $scope.users[j].uname){
          $scope.tousersdata.push($scope.users[j]);
        }
      }
    }
    $scope.currentdate = $filter('date')(new Date(), 'dd_MM_y_hh_mm_sss_a');
    $scope.socket.emit('leaveletterdata', {fromuname: $scope.youName, fromfname: $scope.you, tousers: $scope.tousersdata, subject: subject, reason: $scope.hreasonforleave, hours: hours, currentdate: $scope.currentdate});
  }

  $scope.dleaveLetterData =function(formname,tousers,subject,fromdate,todate){
    formname.$setUntouched();
    angular.element('#dayseditor').froalaEditor('html.set', '');
    $scope.dsubject= '';
    $scope.fromdate= '';
    $scope.todate= '';
    $scope.currentdate= null;
    $scope.tousersdata = [];
    $scope.dleaveto = [];
    $scope.selectedhours = '';
    for(var i=0; i<tousers.length; i++){
      for(var j=0; j<$scope.users.length; j++){
        if(tousers[i] === $scope.users[j].uname){
          $scope.tousersdata.push($scope.users[j]);
        }
      }
    }
    $scope.currentdate = $filter('date')(new Date(), 'dd_MM_y_hh_mm_sss_a');
    $scope.socket.emit('leaveletterdata', {fromuname: $scope.youName, fromfname: $scope.you, tousers: $scope.tousersdata, subject: subject, reason: $scope.dreasonforleave, fromdate: fromdate, todate: todate, currentdate: $scope.currentdate});
  }

  $scope.selectedLeave = function(leave){
    $scope.leavereply = null;
    if($scope.hideleavedata == null){
      $scope.showgroupinput = 'leaves';
    }
    if(screen.width >= 320 && screen.width <= 767){
      $scope.ctrl = 'xs-leave';
    }
    Notification.clearAll();
    $scope.selectedleavedata = leave;
    $scope.selectedcurrentdate = leave.currentdate.replace(/\_/g, ":");
    $scope.selectedleavemembers = leave.leavemembers;
    $scope.selectedleavereason = leave.reason;
    for(var i=0; i<$scope.users.length; i++){
      if($scope.users[i].uname == leave.fromuname){
        $scope.selectedfromname = $scope.users[i].fname +' '+ $scope.users[i].lname;
        $scope.selectedfromemail = $scope.users[i].email;
      }
    }
    for(var j=0; j<$scope.leaves.length; j++){
      if($scope.leaves[j].uniqueleavename == leave.uniqueleavename){
        if($scope.leaves[j].notification == 'unseen'){
          $scope.leaves[j].notification = 'seen';
          if($scope.leaveletternotifications == 1){
            $scope.leaveletternotifications= null;
          }else{
            $scope.leaveletternotifications -= 1;
          }
        }
        $scope.leaves[j].notificationcount = null;
        if($scope.leaveletternotifications <= 1){
          $scope.leaveletternotifications= null;
        }else{
          $scope.leaveletternotifications -= 1;
        }
      }
    }
    $scope.socket.emit('leavemakeasseen', {uniqueleavename: leave.uniqueleavename, uname: $scope.youName});
    $scope.hideleavedata = null;
  }

  $scope.socket.on('pushleavesdata', function(data){
    for(var i=0; i<data.leavemembers.length; i++){
      data.notificationcount = null;
      if(data.leavemembers[i].touname === $scope.youName){
        if(data.leavemembers[i].notification === 'unseen'){
          data.notification = 'unseen';
          $scope.leaveletternotifications += 1;
        }
      }
    }
    $scope.leaves.push(data);
    if($scope.leaves.length <= 1){
      $scope.hideleavesselect = 'hide';
    }else{
      $scope.hideleavesselect = null;
    }
  });

  $scope.getToUserData = function(uname){
    for(var i=0; i<$scope.users.length; i++){
      if($scope.users[i].uname == uname){
       $scope.selectedtousername =  $scope.users[i].fname +' '+ $scope.users[i].lname;
       $scope.selectedtouseremail = $scope.users[i].email;
      }
    }
  }

  $scope.replyForLeaveAplicant = function(selectedreplymember){
    angular.element('.froalaeditorforreply').froalaEditor('html.set', '');
    for(var i=0; i<$scope.selectedleavemembers.length; i++){
      if(selectedreplymember == $scope.selectedleavemembers[i].touname){
        $scope.socket.emit('replychat', $scope.leavereply, $scope.selectedleavemembers[i], $filter('date')(new Date(), 'd MMMM y, h:mm a'));
      }
    }
  }

  $scope.replyForLeaveApprover = function(selectedleavedata){
    angular.element('.froalaeditorforreply').froalaEditor('html.set', '');
    $scope.socket.emit('replychatto', $scope.leavereply, selectedleavedata, $filter('date')(new Date(), 'd MMMM y, h:mm a'), $scope.you, $scope.youName);
  }

  $scope.replyForLeaveAplicantDefult = function(selectedreplymember,popleave){
    if(selectedreplymember== undefined||selectedreplymember== null){
      $scope.leavepoperrormsg= "Select Person To Send Reply."
      $timeout(function () {
        $scope.leavepoperrormsg = "";
    }, 3000);
    }
  else{
      $scope.leavereply = popleave;
      angular.element('.froalaeditorforreply').froalaEditor('html.set', '');
      for(var i=0; i<$scope.selectedleavemembers.length; i++){
        if(selectedreplymember == $scope.selectedleavemembers[i].touname){
          $scope.socket.emit('replychat', $scope.leavereply, $scope.selectedleavemembers[i], $filter('date')(new Date(), 'd MMMM y, h:mm a'));
        }
      }
    }
  }

  $scope.replyForLeaveApproverDefult = function(selectedleavedata,popleave){
    $scope.leavereply = popleave;
    $scope.socket.emit('replychatto', $scope.leavereply, selectedleavedata, $filter('date')(new Date(), 'd MMMM y, h:mm a'), $scope.you, $scope.youName);
  }
  
 //Default leave Popup
  $scope.replyfromapplicant = [
    "Thank You.",
    "Feeling Happy For Your Respose.",
    "Thank You Very Much Sir.",
    ];

  $scope.replyfromorgaziner = [
    "Thank You.",
    "Take It.",
    "Okay Fine.",
    "Meet Me Once.",
    ];  


  $scope.socket.on('replychat', function(data){
    for(var i=0; i<$scope.users.length; i++){
      if(data.fromuname === $scope.users[i].uname){
        data.frompic = $scope.users[i].image;
        data.fromemail = $scope.users[i].email;
        data.show = 'no';
      }
      if(data.touname === $scope.users[i].uname){
        data.topic = $scope.users[i].image;
        data.toemail = $scope.users[i].toemail;
        data.show = 'no';
      }
    }
    var length = $scope.leaves.length;
    for(var m=0; m<$scope.leaves.length; m++){
      if(($scope.leaves[m].uniqueleavename == data.uniqueleavename) && ($scope.youName == data.touname)){
        for(var n=0; n<$scope.leaves[m].leavemembers.length; n++){
          if($scope.leaves[m].leavemembers[n].touname == $scope.youName && $scope.leaves[m].leavemembers[n].todelete == 'delete'){
            $scope.leaves[m].leavemembers[n].todelete = null;
            length += 1;
          }
        }
        if(data.notification == 'unseen'){
          $scope.leaves[m].notificationcount +=1;
          $scope.leaveletternotifications +=1;
        }
      }
      if(length <= 1){
        $scope.hideleavesselect = 'hide';
      }else{
        $scope.hideleavesselect = null;
      }
    }
    $scope.replys.push(data);
  });
  $scope.socket.on('replychatto', function(data){
    for(var i=0; i<$scope.users.length; i++){
      if(data.fromuname === $scope.users[i].uname){
        data.frompic = $scope.users[i].image;
        data.fromemail = $scope.users[i].email;
        data.show = 'no';
      }
      if(data.touname === $scope.users[i].uname){
        data.topic = $scope.users[i].image;
        data.toemail = $scope.users[i].toemail;
        data.show = 'no';
      }
    }
    var length = $scope.leaves.length;
    for(var m=0; m<$scope.leaves.length; m++){
      if(($scope.leaves[m].uniqueleavename == data.uniqueleavename) && ($scope.youName == data.touname)){
        if($scope.leaves[m].fromdelete === 'delete'){
          $scope.leaves[m].fromdelete = null;
          length += 1;
        }
        if(data.notification == 'unseen'){
          $scope.leaves[m].notificationcount +=1;
          $scope.leaveletternotifications +=1;
        }
      }
      if(length <= 1){
        $scope.hideleavesselect = 'hide';
      }else{
        $scope.hideleavesselect = null;
      }
    }
    $scope.replys.push(data);
  });

  $scope.hideleavedata = null;
  $scope.deleteLeave = function(deleteleavedata){
    var length = $scope.leaves.length;
    for(var i=0; i<$scope.leaves.length; i++){
      if($scope.leaves[i].uniqueleavename === deleteleavedata.uniqueleavename){
        if($scope.leaves[i].fromuname === $scope.youName){
          $scope.leaves[i].fromdelete = 'delete';
          length -= 1;
        }
        for(var j=0; j<$scope.leaves[i].leavemembers.length; j++){
          if($scope.leaves[i].leavemembers[j].touname === $scope.youName){
            $scope.leaves[i].leavemembers[j].todelete = 'delete';
            length -= 1;
          }
        }
      }
      if(length <= 1){
        $scope.hideleavesselect = 'hide';
      }else{
        $scope.hideleavesselect = null;
      }
    }
    $scope.hideleavedata = 'hideleavedata';
    $scope.showgroupinput = null;
    $scope.socket.emit('deleteleave', deleteleavedata, $scope.youName);
  }

  $scope.multipleselectedleaves = [];
  $scope.selectbtninleaves = 'Select';
  $scope.selectallbtn = null;

  $scope.selectedLeaveToDelete = function(selectedleave){
    var index = $scope.multipleselectedleaves.findIndex(x => x.uniqueleavename== selectedleave.uniqueleavename);
    if(index == -1){
      $scope.multipleselectedleaves.push(selectedleave);
    }else{
      $scope.multipleselectedleaves.splice(index, 1);
    }
  }

  $scope.selectLeavesToDelete = function(){
    if($scope.selectbtninleaves == 'Select'){
      $scope.selectbtninleaves = 'Unselect';
      $scope.selectallbtn = 'show';
    }else{
      $scope.selectbtninleaves = 'Select';
      $scope.selectallbtn = null;
      $scope.multipleselectedleaves = [];
    }
  }

  $scope.selectAllLeavesToDelete = function(){
    for(var i=0; i<$scope.leaves.length; i++){
      var index = $scope.multipleselectedleaves.findIndex(x => x.uniqueleavename== $scope.leaves[i].uniqueleavename);
      if(index == -1){
        $scope.multipleselectedleaves.push($scope.leaves[i]);
      }
    }
  }
  $scope.leavesExists = function(leave){
    return $scope.multipleselectedleaves.indexOf(leave) > -1;
  }

  $scope.deleteMultipleLeaves = function(){
    for(var i=0; i<$scope.multipleselectedleaves.length; i++){
      $scope.deleteLeave($scope.multipleselectedleaves[i]);
    }
    $scope.selectbtninleaves = 'Select';
    $scope.selectallbtn = null;
  }
  // leave letter end

  // Audio Video Calling
  $scope.checkcalldata = [];
  $scope.callhistroydata = [];
  $scope.disablecallerror   = null;
  $scope.notavailableforcall   = null;
  $scope.hidecallhistorydata = null;
  $scope.streamdata = null;

  $scope.disableCall = function(){
    $scope.disablecallerror = 'Cannot Call This Person Right Now...';
    $timeout(function () {
      $scope.disablecallerror   = null;
    }, 3000);
  }

  $scope.socket.on('callhistroy-from-database', function(callhistroydata){
    $scope.callhistroydata = callhistroydata;
  });
  $scope.socket.on('checkcalldata-from-database', function(checkcalldata){
    $scope.checkcalldata = checkcalldata;
  });
  $scope.socket.on('insertendcallrecord', function(data){
    $scope.callhistroydata.push(data);
    $scope.$digest();
    if($scope.callhistroydata.length > 1){
      $scope.hideselectofcall = null; 
    }else{
      $scope.hideselectofcall = 'callshide';
    }
  });
  $scope.socket.on('insertrejectcallrecord', function(data){
    $scope.callhistroydata.push(data);
    $scope.$digest();
    if($scope.callhistroydata.length > 1){
      $scope.hideselectofcall = null; 
    }else{
      $scope.hideselectofcall = 'callshide';
    }
  });
  $scope.socket.on('insertcalldurationrecord', function(data){
    $scope.callhistroydata.push(data[0]);
    $scope.$digest();
    if($scope.callhistroydata.length > 1){
      $scope.hideselectofcall = null; 
    }else{
      $scope.hideselectofcall = 'callshide';
    }
  });
 
  $scope.constraints = null;
  $scope.insertcallmessage = null;
  // caller side
  $scope.videoCall = function(typeofcall){
    if($scope.checkcalldata == []){
      var index = -1;
    }else{
      var index = $scope.checkcalldata.findIndex(x => x.callunames== $scope.selectedUserName);
    }
    if(index == -1){
      $scope.notavailableforcall = null;
      if(typeofcall == 'video'){
        $scope.constraints = {audio: true,video: true}; 
      }else{
        $scope.constraints = {audio: true,video: false}; 
      }
      const configuration = {
        iceServers: [{urls: 'stun:stunserver.org'},{urls: 'stun:stun.services.mozilla.com'}]
      };
      var $popup = $window.open("../pages/childwindow.html", "popup", "width=700,height=700");
      $popup.typeofcall = typeofcall;
      $popup.name = $scope.youName;
      $popup.callerpic = $scope.profilePic;
      $popup.calleepic = $scope.selectedUserPic;
      if($scope.selectedUserId == null){
        $scope.notavailableerror = $scope.selectedUserName+' is not available to take the call'
      }else{
        $scope.returntocallstreamend = null;
        $scope.notavailableerror = null;
        $scope.callerId = $scope.yourId;
        $scope.calleruname = $scope.youName;
        $scope.calleeId = $scope.selectedUserId;
        $scope.calleefname = $scope.selectedUserFname;
        $scope.calleeuname = $scope.selectedUserName;
        $scope.calleepic = $scope.selectedUserPic;
        $scope.calleename = $scope.selectedUserFname;                           
        $scope.callstarttime = $filter('date')(new Date(), 'h:mm:ss a dd MMM y');
        const roomHash = $scope.yourId;
        $scope.socket.emit('callerId', typeofcall, $scope.you, $scope.youName, $scope.yourId, $scope.calleeId, $scope.constraints, $scope.profilePic, $scope.callstarttime);
        const drone = new ScaleDrone('yiS12Ts5RdNhebyM');
        const roomName = 'observable-' + roomHash;
        var room;
        var pc;
        function onSuccess() {};
        function onError(error) {
          console.error(error);
        };
        drone.on('open', function(error){
          if (error) {return console.error(error)};
          room = drone.subscribe(roomName);
          room.on('open', function(error){if (error) {onError(error);}});
          room.on('members', function(members){
            const isOfferer = members.length === 2;
            startWebRTC(isOfferer);
          });
        });
        function sendMessage(message){
          drone.publish({
            room: roomName,
            message
          });
        }
        function startWebRTC(isOfferer) {
          pc = new RTCPeerConnection(configuration);
          pc.onicecandidate = function(event){
            if (event.candidate) {
              sendMessage({'candidate': event.candidate});
            }
          };
          if (isOfferer) {
            pc.onnegotiationneeded = function(){
              pc.createOffer().then(localDescCreated).catch(onError);
            }
          }
          pc.ontrack = function(event){
            const stream = event.streams[0];
            if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
              remoteVideo.srcObject = stream;
              $popup.getRemoteVideo(stream);
            }
          };
          $scope.unsubscribeRoom = function(){
            room.unsubscribe(roomName);
          }
          $scope.disableEndByCallerFun = function(){
            $popup.endCallByCaller = function(){}
            $popup.close();
          }
          $popup.endCallByCaller = function(){
            $scope.streamdata.getTracks().map(function (val){
              val.stop();
            });
            $scope.socket.emit('accrejmodalclose', $scope.calleeId);
            room.unsubscribe(roomName);
            $scope.sendMessage('***Call Ended***');
            $scope.socket.emit('insertendcallrecord', {
              typeofcall: typeofcall,
              callerId: $scope.yourId,
              callerfname: $scope.you,
              calleruname: $scope.youName,
              callerpic: $scope.profilePic,
              calleeId: $scope.calleeId,
              calleefname: $scope.calleefname,
              calleeuname: $scope.calleeuname,
              calleepic: $scope.calleepic,
              callendtype: '***Call Ended***',
              callstarttime: $scope.callstarttime
            });
            $popup.close();
          }
          navigator.mediaDevices.getUserMedia($scope.constraints).then(function(stream){
            $popup.getLocalVideo(stream);
            $scope.streamdata = stream;
            localVideo.srcObject = stream;
            stream.getTracks().forEach(function(track){
              $scope.stopcallertrack = pc.addTrack(track, stream);
            });
          }, onError);
          $scope.shareCallerScreen = function(){
            getScreenId(function (error, sourceId, screen_constraints) {
              navigator.mediaDevices.getUserMedia(screen_constraints).then(function(stream){
                localVideo.srcObject = stream;
                pc.removeTrack($scope.stopcallertrack);
                stream.getTracks().forEach(function(track){
                  $scope.screenshareoncaller = pc.addTrack(track, stream);
                });
                pc.onnegotiationneeded = function(){
                  pc.createOffer().then(localDescCreated).catch(onError);
                }
              }, onError);
            },true);
          }
          $scope.returnToCallOnCallerSide = function(){
            $scope.returntocallstreamend = 'end';
            navigator.mediaDevices.getUserMedia($scope.constraints).then(function(stream){
              $scope.streamdata1 = stream;
              localVideo.srcObject = stream;
              pc.removeTrack($scope.screenshareoncaller);
              stream.getTracks().forEach(function(track){
                $scope.stopcallertrack = pc.addTrack(track, stream);
              });
              pc.onnegotiationneeded = function(){
                pc.createOffer().then(localDescCreated).catch(onError);
              }
            }, onError);
          }
          $popup.shareScreen = function(){
            $scope.shareCallerScreen();
            $scope.socket.emit('hidesandrbtnoncalleeside', $scope.calleeId);
          }
          $popup.returnToCall = function(){
            $scope.returnToCallOnCallerSide();
            $scope.socket.emit('showsandrbtnoncalleeside', $scope.calleeId);
          }
          $scope.hidesandrbtnoncallerside = function(){
            $popup.hidesandrbtn();
          }
          $scope.showsandrbtnoncallerside = function(){
            $popup.showsandrbtn();
          }
          $popup.stickyNotes = function(stickydata){
            $scope.socket.emit('callerstickynotes', $scope.youName, $scope.calleeuname, $scope.callstarttime,stickydata);
            for(var i=0; i<$scope.callhistroydata.length; i++){
              if($scope.callhistroydata[i].calleruname == $scope.youName && $scope.callhistroydata[i].calleeuname == $scope.calleeuname && $scope.callhistroydata[i].callstarttime == $scope.callstarttime){
                if($scope.callhistroydata[i].callersticky == null){
                  $scope.callhistroydata[i].callersticky = stickydata;
                }
              }
            }
          }
          $popup.endCall =  function(callstarttime,stickydata,callendtime){
            $popup.stickyNotes(stickydata);
            $scope.streamdata.getTracks().map(function (val){
              val.stop();
            });
            if($scope.returntocallstreamend === 'end'){
              $scope.streamdata1.getTracks().map(function (val){
                val.stop();
              });
            }
            var startTime=moment(callstarttime, "h:mm:ss a dd MMM y");
            var endTime=moment(callendtime, "h:mm:ss a dd MMM y"); 
            var duration = moment.duration(endTime.diff(startTime));
            var hours = parseInt(duration.asHours());
            var minutes = parseInt(duration.asMinutes())-hours*60;
            var seconds = parseInt(duration.asSeconds())-minutes*60-hours*60*60;
            if(hours == 0){
              $scope.callduration = minutes+'min '+seconds+'sec';
            }else{
                $scope.callduration = hours+'hrs '+minutes+'min '+seconds+'sec';
            }
            if(minutes == 0){
                $scope.callduration = seconds+'sec';
            }
            if($scope.insertcallmessage === null){
              $scope.sendMessage('*/*/*Call Duration*/*/*');
            }
            $scope.socket.emit('updateduration', $scope.yourId, $scope.calleeId, $scope.youName, $scope.calleeuname, $scope.callstarttime, $scope.callduration, callendtime);
            $scope.socket.emit('endcall', $scope.calleeId);
            room.unsubscribe(roomName);
            $popup.close();
          }
          room.on('data', function(message, client){
            if (client.id === drone.clientId) {
              return;
            }
            if (message.sdp) {
              pc.setRemoteDescription(new RTCSessionDescription(message.sdp), function(){
                if (pc.remoteDescription.type === 'offer') {
                  pc.createAnswer().then(localDescCreated).catch(onError);
                }
              }, onError);
            } else if (message.candidate) {
              pc.addIceCandidate(
                new RTCIceCandidate(message.candidate), onSuccess, onError
              );
            }
          });
        }
        function localDescCreated(desc) {
          pc.setLocalDescription(
            desc,
            function(){sendMessage({'sdp': pc.localDescription})},
            onError
          );
        }
      }
    }
    else{
      $scope.notavailableforcall = 'Cannot Catch This Person Right Now...';
      $timeout(function () {
        $scope.notavailableforcall  = null;
      }, 3000);
    }
  }

  $scope.socket.on('accrejmodalclose', function(){
    angular.element('#videocall').modal('hide');
  });
  $scope.socket.on('rejectcall', function(){
    angular.element('#startvideocall').modal('hide');
    $scope.streamdata.getTracks().map(function (val){
      val.stop();
    });
    $scope.unsubscribeRoom();
    $scope.disableEndByCallerFun();
  });
  $scope.socket.on('hidesandrbtnoncalleeside', function(){
    $scope.hidesandrbtnoncalleeside();
  });
  $scope.socket.on('showsandrbtnoncalleeside', function(){
    $scope.showsandrbtnoncalleeside();
  });
  $scope.socket.on('hidesandrbtnoncallerside', function(){
    $scope.hidesandrbtnoncallerside();
  });
  $scope.socket.on('showsandrbtnoncallerside', function(){
    $scope.showsandrbtnoncallerside();
  });
  $scope.socket.on('endcall', function(){
    if($scope.streamdata !== null){
      $scope.streamdata.getTracks().map(function (val) {
        val.stop();
      });
      $scope.insertcallmessage = 'dontcallthefunction';
      $scope.unsubscribeRoom();
    }
  });

  // callee side
  $scope.socket.on('callerId', function(typeofcall, callerfname, callername, data, constraints, callerpic, callstarttime){
    $scope.callername = callername;
    const configuration = {
      iceServers: [{urls: 'stun:stunserver.org'},{urls: 'stun:stun.services.mozilla.com'}]
    };
    angular.element('#videocall').modal('show');
    $scope.rejectCall = function(){
      $scope.socket.emit('rejectcall',data);
      for(var i=0; i<$scope.clients.length; i++){
        if($scope.clients[i].id == data){
          $scope.selectedUserId = data;
          $scope.selectedUserName = $scope.clients[i].uniqueUserName;
          $scope.selectedUserFname = $scope.clients[i].userFirstName;
          $scope.selectedUserPic = $scope.clients[i].profilepic;
          $scope.sendMessage('***Call Rejected***');
          $scope.socket.emit('insertrejectcallrecord', {
            typeofcall: typeofcall,
            callerId: data,
            callerfname: $scope.clients[i].userFirstName,
            calleruname: $scope.clients[i].uniqueUserName,
            callerpic: $scope.clients[i].profilepic,
            calleeId: $scope.yourId,
            calleefname: $scope.you,
            calleeuname: $scope.youName,
            calleepic: $scope.profilePic,
            callendtype: '***Call Rejected***',
            callstarttime: callstarttime
          });
        }
      }
    }
    $scope.acceptCall = function(){
      $scope.returntocallstreamend = null;
      $scope.socket.emit('insertcheckavailability', $scope.youName, $scope.callername);
      var $popup = $window.open("../pages/childwindow.html", "popup", "width=700,height=700");
      $popup.typeofcall = typeofcall;
      $popup.name = $scope.youName;
      $popup.callerpic = $scope.profilePic;
      $popup.calleepic = callerpic;
      angular.element('#videocall').modal('hide');
      $scope.socket.emit('insertcalldurationrecord', {
        typeofcall: typeofcall,
        callerId: data,
        callerfname: callerfname,
        calleruname: callername,
        callerpic: callerpic,
        calleeId: $scope.yourId,
        calleefname: $scope.you,
        calleeuname: $scope.youName,
        calleepic: $scope.profilePic,
        callendtype: '*/*/*Call Duration*/*/*',
        callstarttime: callstarttime
      });
      const roomHash = data;
      const drone = new ScaleDrone('yiS12Ts5RdNhebyM');
      const roomName = 'observable-' + roomHash;
      let room;
      let pc;
      function onSuccess() {};
      function onError(error) {
        console.error(error);
      };
      drone.on('open', function(error){
        if (error) {return console.error(error)};
        room = drone.subscribe(roomName);
        room.on('open', function(error){
          if (error) {onError(error)};
        });
        room.on('members', function(members){
          const isOfferer = members.length === 2;
          startWebRTC(isOfferer);
        });
      });
      function sendMessage(message) {
        drone.publish({room: roomName,message});
      }
      function startWebRTC(isOfferer) {
        pc = new RTCPeerConnection(configuration);

        pc.onicecandidate = function(event){
          if (event.candidate) {
            sendMessage({'candidate': event.candidate});
          }
        };
        if (isOfferer) {
          pc.onnegotiationneeded = function(){
            pc.createOffer().then(localDescCreated).catch(onError);
          }
        }
        pc.ontrack = function(event){
          const stream = event.streams[0];
          if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
            remoteVideo.srcObject = stream;
            $popup.getRemoteVideo(stream);
          }
        };
        $scope.unsubscribeRoom = function(){
          room.unsubscribe(roomName);
        }
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
          $scope.streamdata = stream;
          $popup.getLocalVideo(stream);
          localVideo.srcObject = stream;
          stream.getTracks().forEach(function(track){
            $scope.stopcalleetrack = pc.addTrack(track, stream);
          });
        }, onError);
        $scope.shareCalleeScreen = function(){
          getScreenId(function (error, sourceId, screen_constraints) {
            navigator.mediaDevices.getUserMedia(screen_constraints).then(function(stream){
              localVideo.srcObject = stream;
              pc.removeTrack($scope.stopcalleetrack);
              stream.getTracks().forEach(function(track){
                $scope.screenshareoncallee = pc.addTrack(track, stream)
              });
              pc.onnegotiationneeded = function(){
                pc.createOffer().then(localDescCreated).catch(onError);
              }
            }, onError);
          },true);
        }
        $scope.returnToCallOnCalleeSide = function(){
          $scope.returntocallstreamend = 'end';
          navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
            $scope.streamdata1 = stream;
            localVideo.srcObject = stream;
            pc.removeTrack($scope.screenshareoncallee);
            stream.getTracks().forEach(function(track){
              $scope.stopcalleetrack = pc.addTrack(track, stream);
            });
            pc.onnegotiationneeded = function(){
              pc.createOffer().then(localDescCreated).catch(onError);
            }
          }, onError);
        }
        $popup.shareScreen = function(){
          $scope.shareCalleeScreen();
          $scope.socket.emit('hidesandrbtnoncallerside', data);
        }
        $popup.returnToCall = function(){
          $scope.returnToCallOnCalleeSide();
          $scope.socket.emit('showsandrbtnoncallerside', data);
        }
        $scope.hidesandrbtnoncalleeside = function(){
          $popup.hidesandrbtn();
        }
        $scope.showsandrbtnoncalleeside = function(){
          $popup.showsandrbtn();
        }
        $popup.stickyNotes = function(stickydata){
          $scope.socket.emit('calleestickynotes', $scope.callername, $scope.youName, callstarttime,stickydata);
          for(var i=0; i<$scope.callhistroydata.length; i++){
            if($scope.callhistroydata[i].calleruname == $scope.callername && $scope.callhistroydata[i].calleeuname == $scope.youName && $scope.callhistroydata[i].callstarttime == callstarttime){
              if($scope.callhistroydata[i].calleesticky == null){
                $scope.callhistroydata[i].calleesticky = stickydata;
              }
            }
          }
        }
        $popup.endCall =  function(callstarttime1,stickydata,callendtime){
          $popup.stickyNotes(stickydata);
          $scope.streamdata.getTracks().map(function (val){
            val.stop();
          });
          if($scope.returntocallstreamend === 'end'){
            $scope.streamdata1.getTracks().map(function (val){
              val.stop();
            });
          }
          for(var i=0; i<$scope.clients.length; i++){
            if($scope.clients[i].id == data){
              $scope.selectedUserId = data;
              $scope.selectedUserName = $scope.clients[i].uniqueUserName;
              $scope.selectedUserFname = $scope.clients[i].userFirstName;
              $scope.selectedUserPic = $scope.clients[i].profilepic;
              var startTime=moment(callstarttime1, "h:mm:ss a dd MMM y");
              var endTime=moment(callendtime, "h:mm:ss a dd MMM y"); 
              var duration = moment.duration(endTime.diff(startTime));
              var hours = parseInt(duration.asHours());
              var minutes = parseInt(duration.asMinutes())-hours*60;
              var seconds = parseInt(duration.asSeconds())-minutes*60-hours*60*60;
              if(hours == 0){
                $scope.callduration = minutes+'min '+seconds+'sec';
              }else{
                  $scope.callduration = hours+'hrs '+minutes+'min '+seconds+'sec';
              }
              if(minutes == 0){
                  $scope.callduration = seconds+'sec';
              }
              if($scope.insertcallmessage === null){
                $scope.sendMessage('*/*/*Call Duration*/*/*');
              }
              $scope.socket.emit('updateduration', data, $scope.yourId, $scope.clients[i].uniqueUserName, $scope.youName, callstarttime, $scope.callduration, callendtime);
              $scope.callduration = 'NULL';
            }
          }
          $scope.socket.emit('endcall', data);
          room.unsubscribe(roomName);
          $popup.close();
        }
        room.on('data', function(message, client){
          if (client.id === drone.clientId) {
            return;
          }
          if (message.sdp) {
            pc.setRemoteDescription(new RTCSessionDescription(message.sdp), function(){
              if (pc.remoteDescription.type === 'offer') {
                pc.createAnswer().then(localDescCreated).catch(onError);
              }
            }, onError);
          } else if (message.candidate) {
            pc.addIceCandidate(
              new RTCIceCandidate(message.candidate), onSuccess, onError
            );
          }
        });
      }
      function localDescCreated(desc) {
        pc.setLocalDescription(
          desc,
          function(){sendMessage({'sdp': pc.localDescription})},
          onError
        );
      }
    }
  });

  $scope.deleteCallhistory = function(deletecall){
    for(var i=0; i<$scope.callhistroydata.length; i++){
      if(($scope.callhistroydata[i].callstarttime == deletecall.callstarttime) && ($scope.callhistroydata[i].calleruname == deletecall.calleruname) && ($scope.callhistroydata[i].calleeuname == deletecall.calleeuname)){
        if(deletecall.calleruname == $scope.youName){
          $scope.callhistroydata[i].callerdelete = 'delete';
          $scope.calldeletecount += 1;
          if($scope.callhistroydata.length-1 == $scope.calldeletecount){
            $scope.hideselectofcall = 'callshide';
          }
        }
        if(deletecall.calleeuname == $scope.youName){
          $scope.callhistroydata[i].calleedelete = 'delete';
          $scope.calldeletecount += 1;
          if($scope.callhistroydata.length-1 == $scope.calldeletecount){
            $scope.hideselectofcall = 'callshide';
          }
        }
      }
    }
    if($scope.callhistroydata.length <= 1){
      $scope.hideselectofcall = 'callshide';
    }
    $scope.hidecallhistorydata = 'hidecallhistorydata';
    $scope.showgroupinput = null;
    $scope.socket.emit('deletecallhistory', deletecall, $scope.youName);
  }

  $scope.selecthistory = null;
  $scope.deletemultiplecalls = [];
  $scope.selectbtn = 'Select';
  $scope.showCheckForCallHistory = function(){
    if($scope.selectbtn == 'Select'){
      $scope.selectbtn = 'Unselect';
      $scope.selecthistory = 'selecthistory';
    }else{
      $scope.selectbtn = 'Select';
      $scope.selecthistory = null;
      $scope.deletemultiplecalls = [];
    }
  }

  $scope.selectcallcheckbox = function(checkedcalldata){
    var index = $scope.deletemultiplecalls.findIndex(x => x.callstarttime == checkedcalldata.callstarttime);
    if(index == -1){
      $scope.deletemultiplecalls.push(checkedcalldata);
    }else{
      $scope.deletemultiplecalls.splice(index, 1);
    }
  }

  $scope.selectAllCallhistory = function(){
    for(var i=0; i<$scope.callhistroydata.length; i++){
      var index = $scope.deletemultiplecalls.findIndex(x => x.callstarttime === $scope.callhistroydata[i].callstarttime);
      if(index == -1){
        $scope.deletemultiplecalls.push($scope.callhistroydata[i]);
      }
    }
  }
  $scope.callhistroyExists = function(chd){
    return $scope.deletemultiplecalls.indexOf(chd) > -1;
  }

  $scope.deleteMultipleCallHistory = function(){
    for(var i=0; i<$scope.deletemultiplecalls.length; i++){
      $scope.deleteCallhistory($scope.deletemultiplecalls[i]);
    }
    $scope.selectbtn = 'Select';
    $scope.selecthistory = null;
  }

  // End of Audio Video Calling
  // search filters

  $scope.searchlists = function (row) {
    if(row.fname){
    return !!((row.lname.toLowerCase().indexOf($scope.lists || '') !== -1 || row.fname.toLowerCase().indexOf($scope.lists || '') !== -1 || row.uname.toLowerCase().indexOf($scope.lists || '') !== -1));
    }
    if(row.groupname){
    return !!((row.groupname.toLowerCase().indexOf($scope.lists || '') !== -1));
    }
  }; 

  $scope.search = function (row) { 
    return !!((row.fromuname.toLowerCase().indexOf($scope.test || '') !== -1 || row.subject.toLowerCase().indexOf($scope.test || '') !== -1));
  };

  // calls search filter
  $scope.searchcalls = function (row) { 
    return !!((row.calleefname.toLowerCase().indexOf($scope.calls || '') !== -1 || row.callerfname.toLowerCase().indexOf($scope.calls || '') !== -1));
  }; 
   
  // files search filter
  $scope.searchfiles = function (row) { 
    return !!((row.originalname.toLowerCase().indexOf($scope.files || '') !== -1 ));
  };

  // meetings search filter
  $scope.searchmeetings = function (row) { 
    return !!((row.meetsubject.toLowerCase().indexOf($scope.meets || '') !== -1 ));
  };
  //search filters end

  // logout
  $scope.logout = function(logoutuser, selectedStatusItem){
    var logouttime = new Date();
    $scope.socket.emit('logout', {logoutuser: logoutuser, selectedStatusItem: selectedStatusItem, lastseen: logouttime});
    $http.get('/:uniqueUserName/logout').then(function(res){
      if(res.data.success){
        $window.location.href = "/";
      }                     
    });
  };
  // end of logout
});


app.directive('scrollToBottom', function($timeout, $window){
  return {
    scope: {
      scrollToBottom: "="
    },
    restrict: 'A',
    link: function(scope, element, attr) {
      scope.$watchCollection('scrollToBottom', function(newVal){
        if (newVal) {
          $timeout(function() {
              element[0].scrollTop =  element[0].scrollHeight;
          },0);
        }
      });
    }
  };
});

app.directive('fileModel', ['$parse', function ($parse){
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      if(attrs.fileModel === 'preprofilepic'){
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
        element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
          scope.uploadFile(scope.youName);
          scope.clear()
        });
      });
      }
      if(attrs.fileModel === 'pregrouppic'){
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
        element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
          scope.uploadGroupFile();
          scope.clear();
        });
      });
      }
      if(attrs.fileModel === 'preattachment'){
        var model = $parse(attrs.fileModel);
        var isMultiple = attrs.multiple;
        var modelSetter = model.assign;
        element.bind('change', function(){
        var values = [];
        angular.forEach(element[0].files, function (item) {
          values.push(item);
        });
        scope.$apply(function () {
          if (isMultiple) {
            modelSetter(scope, values);
          } else {
            modelSetter(scope, values[0]);
          }
          scope.attachment();
          scope.clear();
        });
      });
      }
      if(attrs.fileModel === 'pregroupattachment'){
        var model = $parse(attrs.fileModel);
        var isMultiple = attrs.multiple;
        var modelSetter = model.assign;
        element.bind('change', function(){
        var values = [];
        angular.forEach(element[0].files, function (item) {
          values.push(item);
        });
        scope.$apply(function () {
          if (isMultiple) {
            modelSetter(scope, values);
          } else {
            modelSetter(scope, values[0]);
          }
          scope.groupattachment();          
          scope.clear();
        });
      });
      }
      if(attrs.fileModel === 'premeetingattachment'){
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
        element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
          scope.meetattachment();
          scope.clear();
        });
      });
      }
      if(attrs.fileModel === 'sharefile'){
        var model = $parse(attrs.fileModel);
        var isMultiple = attrs.multiple;
        var modelSetter = model.assign;
        element.bind('change', function () {
          var values = [];
          angular.forEach(element[0].files, function (item) {
            values.push(item);
          });
          scope.$apply(function () {
            if (isMultiple) {
              modelSetter(scope, values);
            } else {
              modelSetter(scope, values[0]);
            }
            scope.shareFile();
            scope.clear();
          });
        });
      }
    }
  };
}]);

// Drag Drop

app.directive('dropOnMe',function dropOnMe() {
  var DDO = {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.on('dragover', function(event) {
        event.preventDefault();
        element.addClass('brd');
      });
      element.on('dragleave', function(event){
        event.preventDefault();
        element.removeClass('brd');
      });
      element.on('drop', function(event) {
        event.preventDefault();
        element.removeClass('brd');
        var dataTransfer =  event.originalEvent.dataTransfer;
        if(dataTransfer && dataTransfer.files.length) {
          var values = [];
          angular.forEach(dataTransfer.files, function (item) {
            values.push(item);
          });
          if(element[0].id === ''){
            scope.sharefile = values;
            scope.shareFile(); 
          }
          if(element[0].id === 'msg' || element[0].id === 'message'){
            scope.preattachment = values;
            scope.attachment();
          }
          if(element[0].id === 'gmsg' || element[0].id === 'groupmsg'){
            scope.pregroupattachment = values;
            scope.groupattachment();
          }
        }
      });
    }
  };
  return DDO;
});

// Directive To Match Password

app.directive('valueMatches', ['$parse', function ($parse) {
  return {
    require: 'ngModel',
      link: function (scope, elm, attrs, ngModel) {
        var originalModel = $parse(attrs.valueMatches),
          secondModel = $parse(attrs.ngModel);
        // Watch for changes to this input
        scope.$watch(attrs.ngModel, function (newValue) {
          ngModel.$setValidity(attrs.name, newValue === originalModel(scope));
        });
        // Watch for changes to the value-matches model's value
        scope.$watch(attrs.valueMatches, function (newValue) {
          ngModel.$setValidity(attrs.name, newValue === secondModel(scope));
        });
      }
    };
  }]);

// editing profile directiver

app.directive('clickToEdit', function($timeout, $rootScope) {
  return {
    require: 'ngModel',
    scope: {model: '=ngModel', type: '@type'}, 
    replace: true,
    transclude: false,
    template:
      '<div>'+
        '<div ng-show="!editState" ng-click="toggle()" class="model" style="outline: none;">{{model}}&nbsp;&nbsp;&nbsp;<div ng-click="pencil()" class="fa fa-pencil-square-o editicon"></div></div>'+
        '<input type="text" ng-model="localModel" ng-enter="save()" style="color:black; outline: none; border:none; border-bottom:2px solid rgba(39,49,66,0.5); outline: none;" aria-label="localModel" ng-show="editState && (type == \'fname\' || type == \'lname\' || type == \'phno\')" />' +
        '<span  ng-show="editState" style="margin-left:20px;">'+
            '<div class="fa fa-check" ng-click="save()" style="color:rgb(39,49,66);outline: none;"></div>&nbsp;&nbsp;'+
            '<div class="fa fa-times" ng-click="cancel()" style="color:rgb(39,49,66);outline: none;"></div>'+
        '</span>'+
        '<div style="color:red">{{error}}</div>'+
      '</div>',
    link: function (scope, element, attrs) {
      scope.editState = false;
      scope.save = function(){
        for(var i=0;i<2;i++){
          scope.save2();
          }
        scope.toggle();
      }
      scope.save2 = function(){
        if(scope.type === 'fname'){
          if(scope.localModel.length<20){
            $rootScope.socket.emit('updated-fname', scope.model);
            scope.model = scope.localModel;
            }else{
            scope.localModel = scope.model;
            scope.error = "Fname Must Be Less Than 20 Characters.";
            $timeout(function () {
              scope.error = "";
              }, 2000);
            }
        }
        if(scope.type === 'lname'){
          if(scope.localModel.length<20){
            $rootScope.socket.emit('updated-lname', scope.model);
            scope.model = scope.localModel;
          }else{
          scope.localModel = scope.model;
          scope.error = "Lname Must Be Less Than 20 Characters.";
          $timeout(function () {
              scope.error = "";
            }, 2000);
          }
        }
        if(scope.type === 'phno'){
          if(scope.localModel.length==10){
          $rootScope.socket.emit('updated-phno', scope.model);
          scope.model = scope.localModel;
          }else{
          scope.localModel = scope.model;
          scope.error = "Mobile Number Must Be 10 Digits.";
          $timeout(function () {
              scope.error = "";
            }, 2000);
          }
        }
      };
      scope.cancel = function() {scope.localModel = scope.model; scope.toggle();}
      scope.pencil = function() {scope.localModel = scope.model;}
      scope.toggle = function () {scope.editState = !scope.editState;}
    }
  }
 });
app.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});
app.filter("emptyToEnd", function () {
  return function (array, key) {
    var present = array.filter(function (item) {
      return item[key];
    });
    var empty = array.filter(function (item) {
      return !item[key]
    });
    return present.concat(empty);
  };
});
app.filter('myDateFilter', ['$filter',function($filter) {
  return function(input) {
    // set minutes to seconds
    var seconds = input
    // calculate (and subtract) whole days
    // var days = Math.floor(seconds / 86400);
    // seconds -= days * 86400;
    // calculate (and subtract) whole hours
    var hours = Math.floor(seconds / 21600) % 24;
    seconds -= hours * 3600;
    // calculate (and subtract) whole minutes
    var minutes = Math.floor(seconds / 60) % 60;
    var s= Math.floor(seconds % 60);
    if(hours === 0){
      return minutes+':'+s;
    }else{
      return hours+':'+minutes+':'+s;
    }
  }
}]);