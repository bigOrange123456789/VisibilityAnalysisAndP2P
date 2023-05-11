class PageList{
  constructor(){
    this.count=0
    this.pageOwn={}
    const self=this
    setInterval(()=>{
      if(self.count==0) self.pageOwn={}
      else              self.count=0
    },10*60*1000)
  }
  initConn(socket,config){
    const pageId=config.pageId
    const groupId=config.groupId
    if(typeof pageId=="undefined"||typeof groupId=="undefined"){
      console.log("initConn 输入参数错误")
      return
    }
    socket.pageId=pageId
    socket.groupId=groupId
    if(!this.pageOwn[pageId])
      this.pageOwn[pageId]={}
  }
  _nonRepeated(socket,packId){
    return true
    if(typeof packId !== 'number')
      return false
    const pageId=socket.pageId
    if(!pageId)return false
    const page=this.pageOwn[pageId]
    if(page&&!page[packId]){
      page[packId]=true
      return true
    }else return false
  }
  needSend(socket,pack){
    this.count++
    // console.log(pack.groupId==io.groupId,pack.groupId,io.groupId,io.id)
    if(pack.groupId==socket.groupId)//同一个分组
      if(pack.originId!==socket.pageId)//不能原路返回
          if(this._nonRepeated(socket,pack.cid)){//if(!socket.cidList[cid]){
            return true
          }
    return false
  }
}
const pageList=new PageList()
const port=8011
let count={
  in:0,
  out:0
}

const ioList=[]
var nodeStatic = require('node-static')
var http = require('http')
var fileServer = new(nodeStatic.Server)()
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res)
}).listen(port)
console.log("p2p_edge(version 02) port:",port)
var io = require('socket.io').listen(app)
io.sockets.on('connection', socket=> {
  // console.log('新的连接已建立');
  // console.log('建立新的连接为:',socket.id);
  // socket.cidList={}
  socket.on('updateIoList', data => {//根据p2p_controller
    updateIoList(data.ioUrlList)
  })
  socket.on('pageConfig', config => {
    pageList.initConn(socket,config)
  })
  socket.on('edge2edge', data => {
    count.in++
    send2Client(data)
  })
  socket.on('client2edge', message=> {
    count.in++
    message.originId=socket.id
    send2Client(message)//socket.broadcast.emit('edge2client', message)
    send2Edge(message)
  })
  socket.on('getLoadCount', () => {
    socket.emit('loadCount', count);
    count.in=0;count.out=0;
  })
  socket.on('disconnect', () => {
    // console.log('与服务器的连接已断开');
  });
  socket.on('reconnect', () => {
    // console.log('已重新连接到服务器');
  });
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
      count.out++
  })
}
function send2Client(data){
  const connectedClients = io.sockets.sockets
  for (const id in connectedClients) {
    const socket=connectedClients[id]
    if(pageList.needSend(socket,data)){
      socket.emit('edge2client',data)
      count.out++
    }
  }
}