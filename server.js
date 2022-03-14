import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";

// replace these constants with your own config
const SERVER_PORT = 3000; 
const KEY_PATH = "/opt/bitnami/letsencrypt/certificates/www.vrwikitest.com.key";
const CERT_PATH =
  "/opt/bitnami/letsencrypt/certificates/www.vrwikitest.com.crt";
const SERVER_DOMAIN = "https://www.vrwikitest.com";

const options = {
  // allows cors (Cross-Origin-Resource Sharing) so client can connect to server
  cors: {
    // pass in whatever domain server is on
    origin: [SERVER_DOMAIN],
  },
};

// read the key and server stored in the aws lightsail in order to use secure connection
const httpServer = createServer({
  key: readFileSync(KEY_PATH),
  cert: readFileSync(CERT_PATH),
});
const io = new Server(httpServer, options);

io.on("connection", (socket) => {
  // when client connects, broadcast that to all other clients
  socket.broadcast.emit("user-joined", socket.id);
  console.log("New user id:", socket.id);
  socket.on("update-to", (userObj) => {
    socket.broadcast.emit("update-send", userObj, socket.id);
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("disconnect-send", socket.id);
  });
});

httpServer.listen(SERVER_PORT);
