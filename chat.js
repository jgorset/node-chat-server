net    = require("net");

config = require("./config");
client = require("client");
chat   = require("chat");

Client = client.Client;
Chat   = chat.Chat;

port = process.argv[2] || 8000

server = net.Server(function(socket) {

  var client = new Client(socket);

  client.administrator = config.administrators.some(function(administrator) {
    return administrator == client.ip;
  });

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
      } else {
        client.send("Command not found: " + command + "\n", "! ");
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

server.listen(port);
