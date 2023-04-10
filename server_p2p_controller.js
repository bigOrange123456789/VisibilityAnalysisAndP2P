const ioUrlList = [
  "114.80.207.60",
  "1.13.198.213"
]
let ioList=[]
for(let i=0;i<ioUrlList.length;i++){
  let ioList0=[]
  for(let j=0;j<ioUrlList.length;j++)
    if(j!==i)ioList0.push(ioUrlList[j])
  const io = require('socket.io-client')("http://"+ioUrlList[i]+":8011")
  io.ioUrlList=ioList0
  ioList.push(io)
}
ioList.forEach(io => {
  io.emit('updateIoList', {"ioUrlList":io.ioUrlList})
})
///////////////////////////////
const groupNum=2;
var nodeStatic = require('node-static')
var http = require('http')
var fileServer = new(nodeStatic.Server)()
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res)
}).listen(8010)
var io = require('socket.io').listen(app)
io.sockets.on('connection', socket=> {
  socket.on('addUser', data => {
    const edgeIp=ioUrlList[Math.floor(Math.random() * ioUrlList.length)]
    socket.emit('userConfig', {
      "edgeIp":edgeIp,
      "groupId":Math.floor(Math.random() * groupNum)
    });
  })
})