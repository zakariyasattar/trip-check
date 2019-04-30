
// Google Sign-In
function onSignIn(googleUser) {
  window.location = "assets/html/teacher.html";

  var profile = googleUser.getBasicProfile();
  localStorage.setItem("userInfo", JSON.stringify([profile.getId(), profile.getName(), profile.getImageUrl(), profile.getEmail()]));
}

function signOut() {
  function init() {
    gapi.load('auth2', function() {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        window.location = "/index.html";
      });
    });
  }
}

// Everytime there is a db update, refresh
firebase.database().ref('studentsOut').on('value', function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    refreshBoxes();
  });
});

var idDiv = document.getElementById('idDiv');
idDiv.innerHTML = 'Logged in as ' + JSON.parse(localStorage.getItem("userInfo"))[1];


// initiate user variable to send/receive messages
let user = rltm({
service: 'pubnub',
config: {
    publishKey: 'pub-c-0dda1bca-3013-459f-8333-32b487e74ab4',
    subscribeKey: 'sub-c-f43f4c62-5c6c-11e9-af7f-e675e2b0822b',
    uuid: 'test_user'
  }
});

// join room with Student Services rep
room = user.join('trip-check');

room.here().then((users) => {
  users = JSON.parse(users);
  console.log((users));
});

room.history().then((history) => {
  console.log(history);
});

// send message based on value in message box
function sendMessage() {
  var boxVal = document.getElementById('dmBox').value;

  if(boxVal != "") {
    room.message({message: boxVal});
    $('#dmBox').val("");
  }
}

// send automated message down to Student Services sending student down based on text box
function sendChildDown() {
  var studentName = document.getElementById('studentName').value;

  if(studentName != "") {
    room.message({message: "Hey, just sent down <i>" + studentName + "</i>"});
    firebase.database().ref('studentsOut').push(studentName + ";false");
  }
  $('#studentName').val("");

  refreshBoxes();
}

// check if room receives message and style based on who sent it
room.on('message', (uuid, data) => {
  if(uuid == 'test_user'){
    createBoxForCurrUser(data, uuid);
  }
  else{
    createBoxForOtherUser(data, uuid);
  }
});

// create message div for current user
function createBoxForCurrUser(data, uuid) {
  var box = document.createElement('div');
  box.id = "currUserMessageBox";
  var dm = document.getElementById("dm");

  var messageText = document.createElement('span');
  messageText.id = "currUserMessageText";

  var info = document.createElement('span');
  info.id = "currUserID";

  dm.appendChild(document.createElement('br'));

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date + ' ' + time;

  messageText.innerHTML = data.message;
  info.innerHTML = dateTime;

  dm.appendChild(info);
  box.appendChild(messageText);
  dm.appendChild(box);

}


// create message div for receiving user
function createBoxForOtherUser(data, uuid) {
  var box = document.createElement('div');
  var dm = document.getElementById("dm");

  var messageText = document.createElement('span');
  var info = document.createElement('span');

  dm.appendChild(document.createElement('br'));
  dm.appendChild(document.createElement('br'));

  box.style.background = "#3264fc";
  box.style.color = "white";
  box.style.borderRadius = "10px 10px 10px 0px";

  box.style.wordWrap= "normal";
  box.style.maxWidth = "20vw";

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  messageText.innerHTML = data.message;
  messageText.style.width = "20vw";
  messageText.style.wordWrap= "break-word";

  info.innerHTML = dateTime;

  info.style.float = "left";
  info.style.position = "relative";
  info.style.bottom = "30px";
  info.style.left = "10px";
  info.style.color = "#a5a4a5";

  messageText.style.paddingRight = "20px";
  messageText.style.paddingLeft = "20px";
  messageText.style.paddingTop = "20px";
  messageText.style.paddingBottom = "20px";


  dm.appendChild(info);
  box.appendChild(messageText);
  dm.appendChild(box);
  dm.appendChild(document.createElement('br'));
}


// listen for 'enter' keypress to send message
$(document).keypress(function(e) {
    if(e.which == 13) {
        sendMessage();
    }
});

// style div on top of DMBOX according to uuids
var uuidDivCurrUser = document.getElementById('currUser');

uuidDivCurrUser.innerHTML = user.pubnub.getUUID();

//create boxes based on who teachers send out
function refreshBoxes() {
  var statusBox = document.getElementById('status').innerHTML = "";

	firebase.database().ref('studentsOut').once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
      createDivBox(childSnapshot.val());
	   });
	});

}


//create div box for students out
function createDivBox(name) {
  var statusBox = document.getElementById('status');
  var span = document.createElement('span');
  var status = document.createElement('span');

  var statusCircle = document.createElement('i');

  statusCircle.className = "fas fa-circle";
  statusCircle.style.borderRadius = "100%";

  firebase.database().ref('studentsOut').once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.val() == name){
        if(childSnapshot.val().substring(childSnapshot.val().indexOf(";") + 1) == "false") {
          statusCircle.style.color = "#f2e341";
        }
        else {
          statusCircle.style.color = "#4bd859";
        }
      }
	   });
	});


  var useTimes = document.createElement('a');
  useTimes.href = "javascript:removeEntry(\""  +name +"\")";
  useTimes.style.textDecoration = "none";

  useTimes.className = "fas fa-times";
  useTimes.id = "times";
  useTimes.style.cursor = "pointer";
  useTimes.style.marginLeft = "40px";

  var studentBox = document.createElement('div');

  var divWidth = statusBox.offsetWidth;

  studentBox.style.width = divWidth;

  studentBox.style.borderBottom = "1px solid black";

  var x = window.matchMedia("(max-width: 600px)");
  myFunction(x); // Call listener function at run time
  x.addListener(myFunction); // Attach listener function on state changes

  studentBox.className = "studentBox";

  span.innerHTML = name.substring(0, name.indexOf(';'));
  span.value = "name";
  span.style.paddingLeft = "20px";

  status.innerHTML = "Status: ";

  status.appendChild(statusCircle);
  status.appendChild(useTimes);

  status.style.float = "right";
  status.style.paddingRight = "20px";

  studentBox.appendChild(span);
  studentBox.appendChild(status);

  statusBox.appendChild(document.createElement('br'));
  statusBox.appendChild(studentBox);

}

function myFunction(x) {
  var studentBox = document.createElement('div');
  if (x.matches) { // If media query matches
    studentBox.style.height = "4vw";
  } else {
    studentBox.style.height = "2vw";
  }
}

function removeEntry(nameToRemove) {
  nameToRemove = nameToRemove.substring(0, nameToRemove.indexOf(';'));

  var boxes = document.getElementById('status').getElementsByClassName('studentBox');
  var finalString = "";

  for(var i = 0; i < boxes.length; i++) {
    var name = $(boxes[i]).text().substring(0, $(boxes[i]).text().indexOf("Status"));
    if(name == nameToRemove) {
      boxes[i].style.display = "none";
      break;
    }
  }

  firebase.database().ref('studentsOut').once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.val().substring(0, childSnapshot.val().indexOf(';')) == nameToRemove) {
        firebase.database().ref('studentsOut').child(childSnapshot.key).remove();
      }
	  });
	});

}
