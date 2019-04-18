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
    room.message({message: "Hey, just sent down " + studentName});
      localStorage['currentOut'] += studentName + ",";
  }
  $('#studentName').val("");

  refreshBoxes();
}

// room.here().then((users) => {
//     console.log('users online', users);
// });

// check if room receives message and style based on who sent it
room.on('message', (uuid, data) => {
  if(uuid == 'test_user'){
    createBoxForCurrUser(data, uuid);
  }
  else{
    createBoxForOtherUser(data, uuid);
  }
});

// room.history().then((history) => {
//   console.log('got array of all messages in channel', history);
// });

// create message div for current user
function createBoxForCurrUser(data, uuid) {
  var box = document.createElement('div');
  var dm = document.getElementById("dm");

  var messageText = document.createElement('span');
  var info = document.createElement('span');

  dm.appendChild(document.createElement('br'));
  dm.appendChild(document.createElement('br'));

  box.style.background = "white";
  box.style.borderRadius = "10px 10px 0 10px";

  box.style.float = "right"
  box.style.position = "relative";
  box.style.right = "-108px";

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  messageText.innerHTML = data.message;
  info.innerHTML = dateTime;

  info.style.float = "right";
  info.style.position = "relative";
  info.style.bottom = "30px";
  info.style.right = "15px";
  info.style.color = "#a5a4a5";

  messageText.style.paddingRight = "20px";
  messageText.style.paddingLeft = "20px";
  messageText.style.paddingTop = "20px";
  messageText.style.paddingBottom = "20px";
  messageText.style.width = "27vw";


  dm.appendChild(info);
  box.appendChild(messageText);
  dm.appendChild(box);
  dm.appendChild(document.createElement('br'));
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

  box.style.float = "left";
  box.style.position = "relative";
  box.style.right = "7.7vw";

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  messageText.innerHTML = data.message;
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
  var storage = localStorage['currentOut'].split(',');

  for(var i = 0; i < storage.length - 1; i++) {
    createDivBox(storage[i]);
  }
}

//create div box for students out
function createDivBox(name) {
  var statusBox = document.getElementById('status');
  var span = document.createElement('span');

  span.innerHTML = name;
  span.style.borderBottom = "1px solid black";

  statusBox.appendChild(document.createElement('br'));
  statusBox.appendChild(span);

}
