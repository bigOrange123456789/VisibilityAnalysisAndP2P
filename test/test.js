var nodeStatic = require('node-static')
var http = require('http')
var fileServer = new(nodeStatic.Server)()
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res)
}).listen(8091)
var io = require('socket.io').listen(app)
io.sockets.on('connection', socket=> {
  socket.emit("userCount",io.engine.clientsCount)
  socket.broadcast.emit("userCount",io.engine.clientsCount)
  socket.on('page2server', data => {
    send2Client(data)
    //socket.broadcast.emit('server2page', data)
    //socket.emit('server2page', data)
  })
})
function send2Client(data){
  const num=data.num
  const connectedClients = io.sockets.sockets
  let i=0
  for (const id in connectedClients) {
    const socket=connectedClients[id]
    socket.emit('server2page', data)
    i++
    if(i==num)return
  }
}