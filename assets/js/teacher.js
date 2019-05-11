// Google Sign-In
function onSignIn(googleUser) {
  window.location = "assets/html/teacher.html";

  var profile = googleUser.getBasicProfile();
  localStorage.setItem("userInfo", JSON.stringify([profile.getId(), profile.getName(), profile.getImageUrl(), profile.getEmail()]));
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    alert("signed out");
  });
}

function clickSignOut() {
  window.location = "../../index.html";
}

function onLoad() {
  gapi.load('auth2', function() {
    gapi.auth2.init();
  });
}

if(localStorage.getItem('userInfo') == null) {
  document.getElementById('body').style.display = "none";
  alert("NOT AUTHORIZED");
}

var userName = (JSON.parse(localStorage.getItem("userInfo"))[1]);

var url = document.URL;
var parts = url.split("/");
var file = parts[parts.length - 1];

if(file.indexOf("#") != -1) {
  file = file.substring(0, file.indexOf("#"));
}

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
room = user.join(userName);

// based on hisory of the current chat room, populate data boxes with messages
room.history().then((history) => {
  for(var h = history.length - 1; h >= 0; h--) {
    var data = history[h].data.message;
    if(history[h].uuid == userName) {
      createBoxForCurrUser(data.substring(0, data.indexOf(';')), false, data.substring(data.indexOf(';') + 1));
    }
    else{
      createBoxForOtherUser(data.substring(0, data.indexOf(';')), false, data.substring(data.indexOf(';') + 1));
    }
  }
});


// send message based on value in message box
function sendMessage() {
  var boxVal = document.getElementById('dmBox').value;

  if(boxVal != "") {
    room.message({message: boxVal + ";" + moment().format("hh:mm:ss A")});
    $('#dmBox').val("");
  }
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

// send automated message down to Student Services sending student down based on text box
function sendChildDown() {
  var studentName = document.getElementById('studentName').value;
  var eta = document.getElementById('ETA').value;

  if(!isNaN(eta)  && studentName != "") {
    swal("Done!", "You sent down " + studentName + ". Look for an automated message!", "success");
    if(studentName.indexOf(";") != -1){
      studentName = studentName.replace(";", "");
    }

    room.message({message: "Hey, just sent down " + studentName + ". Should be down within " + eta + " minutes;" + moment().format("hh:mm:ss A")});
    firebase.database().ref('studentsOut').push(studentName + ";false;" + userName);

    $('#studentName').val("");
    $('#ETA').val("");
    refreshBoxes();
  }
  else {
    swal("error!", "Invalid Entry Into Text Box", "error");
    $('#studentName').val("");
    $('#ETA').val("");
  }

}

// create message div for current user
function createBoxForCurrUser(data, currentSessionCall, timeStamp) {
  var box = document.createElement('div');
  box.className = "messageBox";
  box.id = "currUserMessageBox";
  var dm = document.getElementById("dm");

  var messageText = document.createElement('span');
  messageText.id = "currUserMessageText";

  var info = document.createElement('span');
  info.id = "currUserID";
  info.className = "messageInfo";

  if(currentSessionCall) {
    if(data.message.indexOf(';') == -1){
      messageText.innerHTML = data.message;
    }
    else{
      messageText.innerHTML = data.message.substring(0, data.message.indexOf(";"));
    }
    info.innerHTML = moment().format("hh:mm:ss A");
  }
  else {
    messageText.innerHTML = data;
    info.innerHTML = timeStamp;
  }

  box.appendChild(info);
  box.appendChild(messageText);
  dm.appendChild(box);
  dm.appendChild(document.createElement('br'));

  // auto scroll to bottom after message sent
  $(dm).scrollTop($(dm)[0].scrollHeight);
}

// create message div for receiving user
function createBoxForOtherUser(data, currentSessionCall, timeStamp) {
  var box = document.createElement('div');
  box.className = "messageBox";
  box.id = "otherUserMessageBox";
  var dm = document.getElementById("dm");

  var messageText = document.createElement('span');
  messageText.id = "otherUserMessageText";

  var info = document.createElement('span');
  info.id = "otherUserID";
  info.className = "messageInfo";

  if(currentSessionCall) {
    if(data.message.indexOf(';') == -1){
      messageText.innerHTML = data.message;
    }
    else{
      messageText.innerHTML = data.message.substring(0, data.message.indexOf(";"));
    }
    info.innerHTML = moment().format("hh:mm:ss A");
  }
  else {
    messageText.innerHTML = data;
    info.innerHTML = timeStamp;
  }

  box.appendChild(info);
  box.appendChild(messageText);
  dm.appendChild(box);
  dm.appendChild(document.createElement('br'));

  // auto scroll to bottom after message sent
  $(dm).scrollTop($(dm)[0].scrollHeight);
}

// listen for 'enter' keypress to send message
$(document).keypress(function(e) {
    if(e.which == 13) {
        sendMessage();
    }
});

// style div on top of DMBOX according to uuids
if(file == "teacher.html") {
  var uuidDivCurrUser = document.getElementById('currUser');
  uuidDivCurrUser.innerHTML = userName;
}

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
  else if(splitString[1] == "true"){
    statusCircle.style.color = "#4bd859";
  }
  else {
    statusCircle.style.color = "red";
  }

  var useTimes = document.createElement('a');
  useTimes.href = "javascript:removeEntry(\"" + name + "\")";
  useTimes.style.textDecoration = "none";

  useTimes.className = "fas fa-times";
  useTimes.id = "times";
  useTimes.style.cursor = "pointer";
  useTimes.style.marginLeft = "40px";

  var studentBox = document.createElement('div');

  if(file != "teacher.html") {
    (function() {
      studentBox.onclick = function() {
        clearAllBoxes();
        room = user.join(splitString[2]);

        var uuidDivCurrUser = document.getElementById('otherUser');
        uuidDivCurrUser.innerHTML = splitString[2];

        room.history().then((history) => {
          for(var h = history.length - 1; h >= 0; h--) {
            var data = history[h].data.message;
            createBoxForCurrUser(data.substring(0, data.indexOf(';')), false, data.substring(data.indexOf(';') + 1));
          }
        });
      };
    })();
    studentBox.style.cursor = "pointer";
  }

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

  if(file == "teacher.html") {
    status.innerHTML = "Status: ";

    status.appendChild(statusCircle);
    status.appendChild(useTimes);

    status.style.float = "right";
    status.style.paddingRight = "20px";
  }
  else {
    var accept = document.createElement('a');
    var reject = document.createElement('a');

    accept.innerHTML = "Arrived";
    accept.href = "javascript:accept(\"" + splitString[0] + "\")";

    accept.style.marginRight = "40px";
    accept.style.color = "green";
    accept.style.fontSize = "20px";

    reject.innerHTML = "Didn't Arrive";
    reject.href = "javascript:reject(\"" + splitString[0] + "\")";

    reject.style.color = "red";
    reject.style.fontSize = "20px";

    status.appendChild(accept);
    status.appendChild(reject);

    status.appendChild(useTimes);

    status.style.float = "right";
    status.style.paddingRight = "20px";
  }

  studentBox.appendChild(span);
  studentBox.appendChild(status);

  statusBox.appendChild(document.createElement('br'));
  statusBox.appendChild(studentBox);
}

// set corresponding db option to true
function accept(name) {
  firebase.database().ref('studentsOut').once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
      if(name == childSnapshot.val().split(";")[0]) {
        room.message({message: name + " has arrived " + ";" + moment().format("hh:mm:ss A")});
        firebase.database().ref("studentsOut/" + childSnapshot.key).set(name + ";true;" + childSnapshot.val().split(";")[2]);
      }
	  });
	});
}

// remove corresponding db option
function reject(name) {
  firebase.database().ref('studentsOut').once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.val().substring(0, childSnapshot.val().indexOf(';')) == name) {
        room.message({message: name + " has not arrived" + ";" + moment().format("hh:mm:ss A")});
        firebase.database().ref("studentsOut/" + childSnapshot.key).set(name + ";red;" + childSnapshot.val().split(";")[2]);
      }
	  });
	});
  refreshBoxes();
}

function clearAllBoxes() {
  var boxes = document.getElementsByClassName("messageBox");
  var timeStamps = document.getElementsByClassName("messageInfo");

  while(boxes.length > 0) {
    var elem = document.getElementById("currUserMessageBox");
    if(elem == null ) {
      while(boxes.length > 0){
      var elem2 = document.getElementById("otherUserMessageBox");
      elem2.remove();
      $('br').remove();
    }
  }
  else{
    elem.remove();
    $('br').remove();
  }
    var dm = document.getElementById('dm');

    for(var i = 0; i < boxes.length; i++) {
      dm.removeChild(boxes[i]);
    }
  }

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
