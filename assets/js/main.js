let user = rltm({
service: 'pubnub',
config: {
    publishKey: 'pub-c-0dda1bca-3013-459f-8333-32b487e74ab4',
    subscribeKey: 'sub-c-f43f4c62-5c6c-11e9-af7f-e675e2b0822b',
    uuid: 'test_user'
  }
});

room = user.join('trip-check');

function submit() {
  var boxVal = document.getElementById("dmBox").value;

  if(boxVal != "") {
    room.message({message: boxVal});
    $('#dmBox').val("");
  }
}

// room.here().then((users) => {
//     console.log('users online', users);
// });

room.on('message', (uuid, data) => {
  if(uuid == 'test_user'){
    createBoxForCurrUser(data, uuid);
  }
  createBoxForOtherUser(data, uuid);
});

// room.history().then((history) => {
//   console.log('got array of all messages in channel', history);
// });
function createBoxForCurrUser(data, uuid) {
  var box = document.createElement('div');
  var dm = document.getElementById("dm");
  var span = document.createElement('span');

  dm.appendChild(document.createElement('br'));
  dm.appendChild(document.createElement('br'));

  box.style.background = "white";
  box.style.borderRadius = "10px 10px 0 10px";

  box.style.float = "right"
  box.style.position = "relative";
  box.style.right = "20px";

  span.innerHTML = data.message;

  span.style.paddingRight = "20px";
  span.style.paddingLeft = "20px";
  span.style.paddingTop = "20px";
  span.style.paddingBottom = "20px";

  box.appendChild(span);
  dm.appendChild(box);
}

function createBoxForOtherUser(data, uuid) {
  var box = document.createElement('div');
  var dm = document.getElementById("dm");
  var span = document.createElement('span');

  dm.appendChild(document.createElement('br'));
  dm.appendChild(document.createElement('br'));

  box.style.background = "blue";
  box.style.color = "white";
  box.style.borderRadius = "10px 10px 10px 0px";
  box.style.paddingRight = "10px";
  box.style.paddingLeft = "10px";
  box.style.float = "left"

  span.innerHTML = data.message;

  span.style.paddingRight = "20px";
  span.style.paddingLeft = "20px";
  span.style.paddingTop = "20px";
  span.style.paddingBottom = "20px";

  box.appendChild(span);
  dm.appendChild(box);
}

$(document).keypress(function(e) {
    if(e.which == 13) {
        submit();
    }
});
