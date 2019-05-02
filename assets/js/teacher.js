// // Google Sign-In
// function onSignIn(googleUser) {
//   window.location = "assets/html/teacher.html";
//
//   var profile = googleUser.getBasicProfile();
//   localStorage.setItem("userInfo", JSON.stringify([profile.getId(), profile.getName(), profile.getImageUrl(), profile.getEmail()]));
// }
//
// function signOut() {
//   onLoad();
//   var auth2 = gapi.auth2.getAuthInstance();
//   auth2.signOut().then(function () {
//     window.location = "../../index.html";
//   });
// }
//
// function onLoad() {
//   gapi.load('auth2', function() {
//     gapi.auth2.init();
//   });
// }
//
// if(localStorage.getItem('userInfo') == null) {
//   document.getElementById('body').style.display = "none";
//   alert("NOT AUTHORIZED");
// }

var userName = "zak";//(JSON.parse(localStorage.getItem("userInfo"))[1]);

// Everytime there is a db update, refresh
firebase.database().ref('studentsOut').on('value', function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    refreshBoxes();
  });
});

var idDiv = document.getElementById('idDiv');
idDiv.innerHTML = 'Logged in as ' + userName;


// initiate user variable to send/receive messages
let user = rltm({
service: 'pubnub',
config: {
    publishKey: 'pub-c-0dda1bca-3013-459f-8333-32b487e74ab4',
    subscribeKey: 'sub-c-f43f4c62-5c6c-11e9-af7f-e675e2b0822b',
    uuid: (userName) + ""
  }
});

// join room with Student Services rep
room = user.join(("testing-a"));

// room.here().then((users) => {
//   var arr = Array.prototype.slice.call( users );
//   console.log(arr);
// });

// based on hisory of the current chat room, populate data boxes with messages
room.history().then((history) => {
  for(var h = history.length - 1; h > 0 ; h--) {
    var data = history[h].data.message;

    var dateTime = data.substring(data.indexOf(";") + 1);
    data = data.substring(0, data.indexOf(";"))
    console.log(dateTime, data);

    createBoxForCurrUser(data, false, dateTime);
  }
});


// send message based on value in message box
function sendMessage() {
  var boxVal = document.getElementById('dmBox').value;

  if(boxVal != "") {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    room.message({message: boxVal + ";" + dateTime});
    $('#dmBox').val("");
  }
}

// send automated message down to Student Services sending student down based on text box
function sendChildDown() {
  var studentName = document.getElementById('studentName').value;

  if(studentName != "") {
    room.message({message: "Hey, just sent down <i>" + studentName + "</i>"});
    firebase.database().ref('studentsOut').push(studentName + ";false;" + userName);
  }
  $('#studentName').val("");

  refreshBoxes();
}

// check if room receives message and style based on who sent it
room.on('message', (uuid, data) => {
  if(uuid == userName){
    createBoxForCurrUser(data, true);
  }
  else{
    createBoxForOtherUser(data, true);
  }
});

// create message div for current user
function createBoxForCurrUser(data, currentSessionCall, timeStamp) {
  var box = document.createElement('div');
  box.id = "currUserMessageBox";
  var dm = document.getElementById("dm");

  var messageText = document.createElement('span');
  messageText.id = "currUserMessageText";

  var info = document.createElement('span');
  info.id = "currUserID";

  dm.appendChild(document.createElement('br'));

  if(currentSessionCall) {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    messageText.innerHTML = data.message.substring(0, data.message.indexOf(";"));
    info.innerHTML = dateTime;
  }
  else {
    messageText.innerHTML = data.message;
    info.innerHTML = timeStamp;
  }

  dm.appendChild(info);
  box.appendChild(messageText);
  dm.appendChild(box);

}


// create message div for receiving user
function createBoxForOtherUser(data, currentSessionCall, timeStamp) {
  var box = document.createElement('div');
  box.id = "otherUserMessageBox";
  var dm = document.getElementById("dm");

  var messageText = document.createElement('span');
  messageText.id = "otherUserMessageText";

  var info = document.createElement('span');
  info.id = "otherUserID";

  dm.appendChild(document.createElement('br'));
  dm.appendChild(document.createElement('br'));

  if(currentSessionCall) {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    messageText.innerHTML = data.message.substring(0, data.message.indexOf(";"));
    info.innerHTML = dateTime;
  }
  else {
    messageText.innerHTML = data.message;
    info.innerHTML = timeStamp;
  }

  dm.appendChild(info);
  box.appendChild(messageText);
  dm.appendChild(box);
}


// listen for 'enter' keypress to send message
$(document).keypress(function(e) {
    if(e.which == 13) {
        sendMessage();
    }
});

// style div on top of DMBOX according to uuids
var uuidDivCurrUser = document.getElementById('currUser');

uuidDivCurrUser.innerHTML = userName;

//create boxes based on who teachers send out
function refreshBoxes() {
  var statusBox = document.getElementById('status').innerHTML = "";

	firebase.database().ref('studentsOut').once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
      createSendBox(childSnapshot.val());
	   });
	});
}

//create div box for students out
function createSendBox(name) {
  var splitString = name.split(";");

  var statusBox = document.getElementById('status');
  var span = document.createElement('span');
  var status = document.createElement('span');

  var statusCircle = document.createElement('i');

  statusCircle.className = "fas fa-circle";
  statusCircle.style.borderRadius = "100%";

  if(splitString[1] == "false") {
    statusCircle.style.color = "#f2e341";
  }
  else {
    statusCircle.style.color = "#4bd859";
  }

  var useTimes = document.createElement('a');
  useTimes.href = "javascript:removeEntry(\"" + name + "\")";
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
