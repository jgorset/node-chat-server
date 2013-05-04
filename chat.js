net = require("net");

Client = function(socket) {

  return {
    ip: socket.remoteAddress,
    socket: socket
  }
}

Chat = {
  clients: [],

  // Connect the given client.
  //
  // client - A Client instance.
  connect: function(client) {
    this.clients.push(client);

    this.send(client.ip + " connected.\n", "+ ");
  },

  // Disconnect the given client.
  //
  // client - A Client instance.
  disconnect: function(client) {
    var index = this.clients.indexOf(client);

    this.clients.splice(index, 1);

    this.send(client.ip + " disconnected.\n", "- ");
  },

  // Send the given message to all clients.
  //
  // message - A string describing a message.
  // prefix  - A String describing how to prefix the message. Defaults to "> ".
  send: function(message, prefix) {
    if(!prefix) prefix = "> "

    for(var i in this.clients) {
      var client = this.clients[i];

      if(client.socket.writable) {
        client.socket.write(prefix + message);
      }
    }
  }
}

server = net.Server(function(socket) {
  var client = new Client(socket);

  Chat.connect(client);

  socket.on("data", function(data) {
    message = data.toString();

    if(message[0] == "/") {
      command = message.substr(1, data.length);

      Chat.command(command);
    } else {
      Chat.send(message, client.ip + "> ");
    }
  });

  socket.on("error", function(error) {
    console.log("Ignoring error: " + error);
  });

  socket.on("close", function(had_error) {
    Chat.disconnect(client);
  });
});

server.listen(8000);
