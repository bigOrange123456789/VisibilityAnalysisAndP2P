var nodeStatic = require('node-static')
var http = require('http')
var fileServer = new(nodeStatic.Server)()
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res)
}).listen(8011)
var io = require('socket.io').listen(app)
io.sockets.on('connection', socket=> {
  socket.on('send', message=> {
    socket.broadcast.emit('receive', message)
    send2Edge(message)
  })
})
function send2Page(data){
  const connectedClients = io.sockets.sockets
  for (const id in connectedClients) {
    const socket=connectedClients[id]
    socket.emit('receive',data)
  }
}

const ioUrlList = [
  "114.80.207.60",
  "1.13.198.213"
]
const ioList=[]
ioUrlList.forEach(ioUrl => {
  const io = require('socket.io-client')("http://"+ioUrl+":8032")
  ioList.push(io)
})
const io1 = require('socket.io')()
io1.listen(8032);
io1.on('connection', socket => {
  socket.on('edge2edge', data => {
    send2Page(data)
  })
})
function send2Edge(data){
  ioList.forEach(io => {
    io.emit('edge2edge', data);
  })
}
