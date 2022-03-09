"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var https_1 = require("https");
var socket_io_1 = require("socket.io");
// TOOD: replace with immutable data types in TS
var PORT = 3000;
var KEY_PATH = "/opt/bitnami/letsencrypt/certificates/www.vrwikitest.com.key";
var CERT_PATH = "/opt/bitnami/letsencrypt/certificates/www.vrwikitest.com.crt";
var SERVER_DOMAIN = "https://www.vrwikitest.com";
var options = {
    // options parameter for creating server port, to allow cors
    cors: {
        // pass in whatever domain client connects to (vrwikitest.com)
        origin: [SERVER_DOMAIN]
    }
};
// read the key and server stored in the aws lightsail, for using a secure ws connection
var httpServer = (0, https_1.createServer)({
    key: (0, fs_1.readFileSync)(KEY_PATH),
    cert: (0, fs_1.readFileSync)(CERT_PATH)
});
// create a new server and store it as an io object
var io = new socket_io_1.Server(httpServer, options);
// have to be connected before sending event, restricting our second event to only get handled when connection is active
// connection gets passed socket obj automatically as argument
io.on("connection", function (socket) {
    // when client connects, broadcast that to all other clients
    socket.broadcast.emit("user-joined", socket.id);
    console.log("New user id:", socket.id);
    // when the server receives a message on controller channel,
    socket.on("update-to", function (userObj) {
        // broadcasts this data to all clients except the one that sent it
        socket.broadcast.emit("update-send", userObj, socket.id);
    });
    socket.on("disconnect", function () {
        socket.broadcast.emit("disconnect-send", socket.id);
    });
});
httpServer.listen(PORT);
