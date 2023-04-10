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
  socket.on('groupId', data => {
    socket.groupId=data
  })
  socket.on('edge2edge', data => {
    send2Client(data)
  })
  socket.on('client2edge', message=> {
    message.originId=socket.id
    send2Client(message)//socket.broadcast.emit('edge2client', message)
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
function send2Client(data){
  const connectedClients = io.sockets.sockets
  for (const id in connectedClients) {
    const socket=connectedClients[id]
    if(data.groupId==socket.groupId)//同一个分组
    if(data.originId!==socket.id)//不能原路返回
    socket.emit('edge2client',data)
  }
}