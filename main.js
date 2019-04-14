let user = rltm({
service: 'pubnub',
config: {
    publishKey: 'pub-c-0dda1bca-3013-459f-8333-32b487e74ab4',
    subscribeKey: 'sub-c-f43f4c62-5c6c-11e9-af7f-e675e2b0822b'
      }
});

room = user.join('trip-check');

function submit() {
  var boxVal = document.getElementById("dmBox").value;

  if(boxVal != "") {
    room.message({hello: boxVal});
    $('#dmBox').val("");
  }
}

// room.here().then((users) => {
//     console.log('users online', users);
// });

room.on('message', (uuid, data) => {
  alert(data.hello);
});

// room.history().then((history) => {
//   console.log('got array of all messages in channel', history);
// });

$(document).keypress(function(e) {
    if(e.which == 13) {
        submit();
    }
});
