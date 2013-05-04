net = require("net");

Chat = {
  peers: [],

  // Connect the given socket.
  //
  // socket - A Socket instance.
  connect: function(socket) {
    this.peers.push(socket);

    this.send(socket.remoteAddress + " connected.\n", "+ ");
  },

  // Disconnect the given socket.
  //
  // socket - A Socket instance.
  disconnect: function(socket) {
    var index = this.peers.indexOf(socket);

    this.peers.splice(index, 1);

    this.send(socket.remoteAddress + " disconnected.\n", "- ");
  },

  // Send the given message to peers.
  //
  // message - A string describing a message.
  // prefix  - A String describing how to prefix the message. Defaults to "> ".
  send: function(message, prefix) {
    if(!prefix) prefix = "> "

    for(var i in this.peers) {
      var peer = this.peers[i];

      if(peer.writable) {
        peer.write(prefix + message);
      }
    }
  }
}

server = net.Server(function(socket) {
  Chat.connect(socket);

  socket.on("data", function(data) {
    message = data.toString();

    if(message[0] == "/") {
      command = message.substr(1, data.length);

      Chat.command(command);
    } else {
      Chat.send(message, socket.remoteAddress + "> ");
    }
  });

  socket.on("error", function(error) {
    console.log("Ignoring error: " + error);
  });

  socket.on("close", function(had_error) {
    Chat.disconnect(socket);
  });
});

server.listen(8000);
