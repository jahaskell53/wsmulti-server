const { readFileSync } = require('fs');
const { createServer } = require('https');
const { Server } = require('socket.io');

const options = {
    // options parameter for creating server port, to allow cors
    cors: {
        // pass in whatever domain client connects to (vrwikitest.com)
        origin: ['https://www.vrwikitest.com']
    }

};

// read the key and server stored in the aws lightsail, for using a secure ws connection
const keyPath = '/opt/bitnami/letsencrypt/certificates/www.vrwikitest.com.key'
const certPath = "/opt/bitnami/letsencrypt/certificates/www.vrwikitest.com.crt"
const httpServer = createServer({
    key: readFileSync(keyPath),
    cert: readFileSync(certPath)
})
// create a new server and store it as an io object
const io = new Server(httpServer, options)
    // have to be connected before sending event, restricting our second event to only get handled when connection is active
    // connection gets passed socket obj automatically as argument
io.on('connection', (socket) => {
    // when client connects, broadcast that to all other clients 
    socket.broadcast.emit('user-joined', socket.id)
    console.log("New user id:", socket.id)
    // when the server receives a message on controller channel,
    socket.on('update-to', (userObj) => {
        // broadcasts this data to all clients except the one that sent it
        socket.broadcast.emit('update-send', userObj)
    })
});

httpServer.listen(3000);