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

    // Get ir command streams

    var irStream = Kefir.fromEvents(lirc_node, 'KEY_UP', function (data) { return 'up' })
    streams.push(irStream)
    var irStream = Kefir.fromEvents(lirc_node, 'KEY_DOWN', function (data) { return 'down' })
    streams.push(irStream)
    var irStream = Kefir.fromEvents(lirc_node, 'KEY_LEFT', function (data) { return 'left' })
    streams.push(irStream)
    var irStream = Kefir.fromEvents(lirc_node, 'KEY_RIGHT', function (data) { return 'right' })
    streams.push(irStream)
    var irStream = Kefir.fromEvents(lirc_node, 'KEY_BACK', function (data) { return 'back' })
    streams.push(irStream)
    var irStream = Kefir.fromEvents(lirc_node, 'KEY_OK', function (data) { return 'ok' })
    streams.push(irStream)

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

    socket.on('state', function (state) {
        socket.broadcast.emit('state', state);
    });
        
})

console.log(
  '\n' +
  'Server is running\n' +
  'In this machine: http://localhost:' + port + '\n' +
  'In local network: http://' + ip.address() + ':' + port + '\n' +
  'To stop server, press Ctrl+C\n'

)