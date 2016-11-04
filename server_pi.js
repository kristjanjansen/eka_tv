var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var ip = require('ip')
var keypress = require('keypress')
var Kefir = require('kefir')
var lirc_node = require('lirc_node');

lirc_node.init();

// Server setup

var port = 7000

app.use(express.static('public'))
server.listen(port)

var streams = []

io.on('connection', function (socket) {

    // Get ir command stream

    var keys = {
        KEY_UP: 'up',
        KEY_RIGHT: 'right',
        KEY_DOWN: 'down',
        KEY_LEFT: 'left',
        KEY_OK: 'ok',
        KEY_BACK: 'back'
    }
    
    for (var key in keys) {
        var irStream = Kefir.fromEvents(lirc_node, key, function (data) { return keys[key] })
        streams.push(irStream)
    }

    // Get key command streams from clients

    var socketStream = Kefir.fromEvents(socket, 'key')
    streams.push(socketStream)

    // Merge the key command streams and send them to clients

    Kefir.merge(streams)
        .onValue(function (value) {
            socket.broadcast.emit('key', value)
        })
        .log()

    // Stage feedback, optional

    socket.on('stage', function (stage) {
        socket.broadcast.emit('stage', stage);

    });
        
})

console.log(
  '\n' +
  'Server is running\n' +
  'In this machine: http://localhost:' + port + '\n' +
  'In local network: http://' + ip.address() + ':' + port + '\n' +
  'To stop server, press Ctrl+C\n'

)