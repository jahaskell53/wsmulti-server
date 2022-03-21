import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";
import Twitter from "twitter";
import "dotenv/config";

const client = new Twitter({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_KEY_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});
const res = client.get("statuses/user_timeline", {});
console.log(res);
// config details (defined in your .env file)
const SERVER_PORT = process.env.SERVER_PORT;
const KEY_PATH = process.env.KEY_PATH;
const CERT_PATH = process.env.CERT_PATH;
const CLIENT_URL = process.env.CLIENT_URL;

const options = {
  // allows cors (Cross-Origin-Resource Sharing) so client can connect to server
  cors: {
    // passes in whatever domain client is on
    origin: [CLIENT_URL],
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
