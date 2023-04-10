var nodeStatic = require('node-static')
var http = require('http')
var fileServer = new(nodeStatic.Server)()
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res)
}).listen(8011)
var io = require('socket.io').listen(app)
io.sockets.on('connection', socket=> {
  socket.on('send', message=> socket.broadcast.emit('receive', message))
})
function test(){
  const connectedClients = io.sockets.sockets
  for (const id in connectedClients) {
    const socket=connectedClients[id]
    console.log(id,socket.number)
  }
}