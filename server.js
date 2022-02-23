const { readFileSync } = require('fs');
const { createServer } = require('https');
const { Server } = require('socket.io');

const options = {
    // options parameter for fun, to allow cors
    cors: {
        // pass in whatever domain client connects to (vrwikitest.com)
        origin: ['https://vrwikitest.com']
    }

};

const httpServer = createServer({
    key: readFileSync('/opt/bitnami/letsencrypt/certificates/www.vrwikitest.com.key'),
    cert: readFileSync("/opt/bitnami/letsencrypt/certificates/www.vrwikitest.com.crt")
})

const io = new Server(httpServer, options)

io.on('connection', (socket) => {
    // give all clients an id
    // console.log(socket.id);
    // have to be connected before sending event
    socket.on('controller', (data) => {
        // goal to broadcast this data to all clients except the one that sent it
        socket.broadcast.emit('send-controller', data)
        console.log(data);
    })
});

httpServer.listen(3000);