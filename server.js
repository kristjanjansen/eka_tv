var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var ip = require('ip')
var keypress = require('keypress')
var Kefir = require('kefir')
var HID = require('node-hid');
var devices = HID.devices()

// var device = new HID.HID('USB_040b_6533_14100000');

var port = 7000

app.use(express.static('public'))
server.listen(port)

io.on('connection', function (socket) {

    keypress(process.stdin)
    
    var consoleKeymap = {
        a: 'left',
        s: 'right',
        q: 'quit'
    }

    var consoleStream = Kefir
        .fromEvents(process.stdin, 'keypress', (ch, key) => {
            if (key.name === 'c' && key.ctrl) {
                process.exit()
            }
            return consoleKeymap[key.name] ?  consoleKeymap[key.name] : 'other'
        })
    
    /*
    var joystickStream = Kefir
        .fromEvents(device, 'data', (data) => {
            var key = 'other'
            if (data[0] == 0) key = 'right'
            if (data[0] == 255) key = 'left'
            if (data[1] == 0) key = 'down'
            if (data[1] == 255) key = 'up'
            return key
        })
    */

    Kefir.merge([consoleStream/*, joystickStream*/])
        .onValue(value => {
            socket.emit('key', value)
        })
        .log()
        
})


process.stdin.setRawMode(true);
process.stdin.resume();

console.log(
  '\n' +
  'Server is running\n' +
  'In this machine: http://localhost:' + port + '\n' +
  'In local network: http://' + ip.address() + ':' + port + '\n' +
  'To stop server, press Ctrl+C\n'

)