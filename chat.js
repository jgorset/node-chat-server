net = require("net");

Client = function(socket) {

  return {
    ip: socket.remoteAddress,
    nick: socket.remoteAddress,
    socket: socket,
    commands: {
      nick: function(name) {
        Chat.send(this.nick + " is now known as " + name + ".\n", "! ");

        this.nick = name;
      }
    }
  }
}

Chat = {
  clients: [],

  // Connect the given client.
  //
  // client - A Client instance.
  connect: function(client) {
    this.clients.push(client);

    this.send(client.nick + " connected.\n", "+ ");
  },

  // Disconnect the given client.
  //
  // client - A Client instance.
  disconnect: function(client) {
    var index = this.clients.indexOf(client);

    this.clients.splice(index, 1);

    this.send(client.nick + " disconnected.\n", "- ");
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
      command = message.substr(1, message.length);

      command = command.replace("\r", "");
      command = command.replace("\n", "");

      components = command.split(" ");

      command    = components[0];
      parameters = components.splice(1, components.length);

      if(client.commands[command]) {
        client.commands[command].apply(client, parameters);
      }
    } else {
      Chat.send(message, client.nick + "> ");
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
