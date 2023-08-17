import { createRequire } from 'module';
const require = createRequire(import.meta.url);
class EdgeNetController{
  constructor(edgeSeverList){
    this.edgeSeverList=edgeSeverList
    this.initEdgeCloud1()
    this.groupNum=2
    this.io=this.createIo()
    const self=this
    setInterval(()=>{
      self.update()
    },20*1000)
  }
  initEdgeCloud0(){
    for(let id in this.edgeSeverList){
      const edgeSever=this.edgeSeverList[id]
      const neighbourIpList=[]
      for(let i=0;i<edgeSever.neighbour.length;i++){
        const neighbourId=edgeSever.neighbour[i]
        const neighbourIp=this.edgeSeverList[neighbourId].ip
        neighbourIpList.push(neighbourIp)
      }
      edgeSever.io=require('socket.io-client')("http://"+edgeSever.ip+":8011")
      edgeSever.io.emit('updateIoList', {"ioUrlList":neighbourIpList})
    }
  }
  initEdgeCloud1(){
    const ipList=[]
    for(let id in this.edgeSeverList){
      const edgeSever=this.edgeSeverList[id]
      ipList.push(edgeSever.ip)
    }
    for(let id in this.edgeSeverList){
      const edgeSever=this.edgeSeverList[id]
      edgeSever.io=require('socket.io-client')("http://"+edgeSever.ip+":8011")
      edgeSever.io.emit('updateIoList', {"ioUrlList":ipList})
    }
    // let ioList=[]
    // for(let i=0;i<ioUrlList.length;i++){
    //   let ioList0=[]
    //   for(let j=0;j<ioUrlList.length;j++)
    //     if(j!==i)ioList0.push(ioUrlList[j])
    //   const io = require('socket.io-client')("http://"+ioUrlList[i]+":8011")
    //   io.ioUrlList=ioList0
    //   ioList.push(io)
    // }
    // ioList.forEach(io => {
    //   io.emit('updateIoList', {"ioUrlList":io.ioUrlList})
    // })
  }
  bindEdgePage(){
    const ipList=[]
    for(let id in this.edgeSeverList){
      const edgeSever=this.edgeSeverList[id]
      ipList.push(edgeSever.ip)
    }
    return ipList[Math.floor(Math.random() * ipList.length)]
  }
  createIo(){
    var nodeStatic = require('node-static')
    var http = require('http')
    var fileServer = new(nodeStatic.Server)()
    var app = http.createServer(function(req, res) {
      fileServer.serve(req, res)
    }).listen(8010)
    var io = require('socket.io').listen(app)
    io.sockets.on('connection', socket=> {
      socket.on('addUser', data => {
        socket.feature=data.feature
        socket.edgeIp=this.bindEdgePage()
        socket.groupId=Math.floor(Math.random() * this.groupNum)
        socket.emit('userConfig', {
          "edgeIp":socket.edgeIp,
          "groupId":socket.groupId
        });
      })
      socket.on('updateFeature', data => {
        socket.feature=data.feature
      })
    })
    return io
  }
  update(){
    this.groupNum=Math.ceil(this.io.engine.clientsCount/5)//五个用户一组
    const data=[]
    const socketList=[]
    const connectedClients = this.io.sockets.sockets
    for (const id in connectedClients) {
      const socket=connectedClients[id]
      socketList.push(socket)
      if(socket.feature){
        for(let i=0;i<socket.feature.length;i++)
          if(!socket.feature[i])socket.feature[i]=0
      }else{
        socket.feature=[0,0,0]
      }
      data.push(socket.feature)    
    }
    const groupIdList=kmeans(data, this.groupNum, 100)
    for(let i=0;i<socketList.length;i++){
      const socket=socketList[i]
      socket.groupId=groupIdList[i]
      socket.emit('userConfigUpdate', {
        "edgeIp":socket.edgeIp,
        "groupId":socket.groupId
      });
    }
  }
}
new EdgeNetController({
  "NanJing":{
    "ip":"47.122.19.36",
    "neighbour":["HanZhou","ShangHai","ChengDu"]
  },
  "HangZhou":{
    "ip":"120.55.83.175",
    "neighbour":["ShangHai","NanJing","GuangZhou"]
  },
  "ChengDu":{
    "ip":"47.109.92.188",
    "neighbour":["NanJing","GuangZhou"]
  },
  "GuangZhou":{
    "ip":"8.134.117.255",
    "neighbour":["ChengDu","HangZhou"]
  },
  "ShangHai":{
    "ip":"106.14.198.71",
    "neighbour":["NanJing","HangZhou"]
  }
})
///////////////////////////////////
function kmeans(data, k, maxIter) {
  // 随机初始化质心
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push(data[Math.floor(Math.random() * data.length)]);
  }
  for (let iter = 0; iter < maxIter; iter++) {
    // 分配每个样本点到最近的质心所属的簇
    let clusters = new Array(k).fill().map(() => []);
    for (let i = 0; i < data.length; i++) {
      let minDist = Infinity, minIdx = -1;
      for (let j = 0; j < k; j++) {
        let dist = euclideanDist(data[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          minIdx = j;
        }
      }
      clusters[minIdx].push(data[i]);
    }

    // 重新计算每个簇的质心
    let newCentroids = [];
    for (let i = 0; i < k; i++) {
      let cluster = clusters[i];
      if (cluster.length === 0) {
        newCentroids.push(centroids[i]);
      } else {
        let sum = cluster.reduce((acc, cur) => acc.map((d, idx) => d + cur[idx]));
        if(sum)//sum不知道为啥有时为空
          newCentroids.push(sum.map(d => d / cluster.length));
      }
    }

    // 判断是否收敛
    if (centroids.every((d, idx) => euclideanDist(d, newCentroids[idx]) < 1e-6)) {
      break;
    } else {
      centroids = newCentroids;
    }
  }

  // 返回簇的标号
  return data.map(point => {
    let minDist = Infinity, minIdx = -1;
    for (let j = 0; j < k; j++) {
      let dist = euclideanDist(point, centroids[j]);
      if (dist < minDist) {
        minDist = dist;
        minIdx = j;
      }
    }
    return minIdx;
  });
}
function euclideanDist(a, b) {
  if(a&&b){
    sum = a.reduce((acc, cur, idx) => acc + (cur - b[idx]) ** 2, 0);
    return Math.sqrt(sum);
  }else return 0//程序出错
}
