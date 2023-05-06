const port=8195
console.log("listening to port:",port)
const nodeStatic = require('node-static')
const http = require('http')
const fileServer = new(nodeStatic.Server)()
const app = http.createServer(function(req, res) {
  fileServer.serve(req, res)
}).listen(port)
var io = require('socket.io').listen(app)
io.sockets.on('connection', socket=> {
  socket.emit("userCount",io.engine.clientsCount)
  socket.broadcast.emit("userCount",io.engine.clientsCount)
  socket.on('page2server', data => {
    if(data instanceof Array)send2Client_list(data)
    else send2Client(socket,data)
  })
})
function send2Client(socket,data){
  socket.broadcast.emit('server2page', data)
  socket.emit('server2page', data)
}
function send2Client_old2(data){
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
function send2Client_list(dataList){
  const connectedClients = io.sockets.sockets
  let i=0
  for (const id in connectedClients) {
    const socket=connectedClients[id]
    socket.emit('server2page', dataList[i])
    i++
    if(i==dataList.length)return
  }
}