const { readFileSync } = require('fs');
const { createServer } = require('https');
const { Server } = require('socket.io');
// config = require('./config.json');
// Twitter = require('node-tweet-stream');
// t = new Twitter(config);

const options = {
    // options parameter for creating server port, to allow cors
    cors: {
        // pass in whatever domain client connects to (vrwikitest.com)
        origin: ['https://www.vrwikitest.com']
    }

};

// read the key and server stored in the aws lightsail, for using a secure ws connection
const httpServer = createServer({
    key: readFileSync('/opt/bitnami/letsencrypt/certificates/www.vrwikitest.com.key'),
    cert: readFileSync("/opt/bitnami/letsencrypt/certificates/www.vrwikitest.com.crt")
})
// create a new server and store it as an io object (TODO: why?)
const io = new Server(httpServer, options)
    // have to be connected before sending event, restricting our second event to only get handled when connection is active
    // connection gets passed socket obj automatically as argument
io.on('connection', (socket) => {
    // when client connects, broadcast that to all other clients 
    socket.broadcast.emit('user-joined', socket.id)
    console.log("New user id:", socket.id)
    // when the server receives a message on controller channel,
    socket.on('update-to', (userObj) => {
        // goal to broadcast this data to all clients except the one that sent it
        socket.broadcast.emit('update-send', userObj)
    })
});


// t.track('pizza');
// t.on('tweet', function(tweet){
//   console.log('Roger that. Tweets incoming!');
//   console.log(tweet);

//   io.emit('tweet', tweet);
// });

httpServer.listen(3000);