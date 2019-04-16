let user = rltm({
service: 'pubnub',
config: {
    publishKey: 'pub-c-0dda1bca-3013-459f-8333-32b487e74ab4',
    subscribeKey: 'sub-c-f43f4c62-5c6c-11e9-af7f-e675e2b0822b',
    uuid: 'test_user'
  }
});

room = user.join('trip-check');

function sendMessage() {
  var boxVal = document.getElementById('dmBox').value;

  if(boxVal != "") {
    room.message({message: boxVal});
    $('#dmBox').val("");
  }
}


function sendChildDown() {
  alert(document.getElementById('studentName').value);

  var studentSelectBox = document.getElementById('studentSelectBox');
  var dm = document.getElementById('dm');

  if(studentName != "") {
    studentSelectBox.style.display = "none";
    dm.style.display = "initial";
  }
}

// room.here().then((users) => {
//     console.log('users online', users);
// });

room.on('message', (uuid, data) => {
  if(uuid == 'test_user'){
    createBoxForCurrUser(data, uuid);
  }
  //else{
    createBoxForOtherUser(data, uuid);
  //}
});

// room.history().then((history) => {
//   console.log('got array of all messages in channel', history);
// });
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
  box.style.position = "absolute";
  box.style.right = "20px";

  messageText.innerHTML = data.message;
  info.innerHTML = uuid;

  info.style.float = "right";
  info.style.position = "relative";
  info.style.bottom = "30px";
  info.style.right = "15px";
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
  box.style.right = "60px";

  messageText.innerHTML = data.message;
  info.innerHTML = uuid;

  info.style.float = "left";
  info.style.position = "relative";
  info.style.bottom = "30px";
  info.style.left = "15px";
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


$(document).keypress(function(e) {
    if(e.which == 13) {
        sendMessage();
    }
});
