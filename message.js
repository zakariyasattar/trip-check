let user = rltm({
service: 'pubnub',
config: {
    publishKey: 'pub-c-0dda1bca-3013-459f-8333-32b487e74ab4',
    subscribeKey: 'sub-c-f43f4c62-5c6c-11e9-af7f-e675e2b0822b'
      }
});

room = user.join('room-name');

function submit() {
  var val = document.getElementById("submitButton").value;
  alert(val);
  // room.message({hello: val}).then(() => {
  // });
  room.message(val);

  room.on('message', (uuid, data) => {
      document.write(data.hello);
  });
}
