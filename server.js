const io = require('socket.io')(3000, {
    // options parameter for fun, to allow cors
    cors: {
        // pass in whatever domain client connects to (vrwikitest.com)
        origin: ['http://vrwikitest.com']
    }

})

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