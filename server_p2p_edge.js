const ioList=[]
var nodeStatic = require('node-static')
var http = require('http')
var fileServer = new(nodeStatic.Server)()
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res)
}).listen(8011)
var io = require('socket.io').listen(app)
io.sockets.on('connection', socket=> {
  socket.on('updateIoList', data => {
    updateIoList(data.ioUrlList)
  })
  socket.on('edge2edge', data => {
    send2Page(data)
  })
  socket.on('send', message=> {
    socket.broadcast.emit('receive', message)
    send2Edge(message)
  })
})
function updateIoList(ioUrlList ){
  ioUrlList.forEach(ioUrl => {
    const io = require('socket.io-client')("http://"+ioUrl+":8011")
    ioList.push(io)
  })
}
function send2Edge(data){
  ioList.forEach(io => {
    io.emit('edge2edge', data);
  })
}
function send2Page(data){
  const connectedClients = io.sockets.sockets
  for (const id in connectedClients) {
    const socket=connectedClients[id]
    socket.emit('receive',data)
  }
}