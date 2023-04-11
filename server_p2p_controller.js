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
    socket.feature=data.feature
    socket.edgeIp=ioUrlList[Math.floor(Math.random() * ioUrlList.length)]
    socket.groupId=Math.floor(Math.random() * groupNum)
    socket.emit('userConfig', {
      "edgeIp":socket.edgeIp,
      "groupId":socket.groupId
    });
  })
  socket.on('updateFeature', data => {
    socket.feature=data.feature
  })
})
///////////////////////////////////
setInterval(()=>{
  const data=[]
  const socketList=[]
  const connectedClients = io.sockets.sockets
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
  const groupIdList=kmeans(data, groupNum, 100)
  for(let i=0;i<socketList.length;i++){
    const socket=socketList[i]
    socket.groupId=groupIdList[i]
    socket.emit('userConfigUpdate', {
      "edgeIp":socket.edgeIp,
      "groupId":socket.groupId
    });
  }
},20*1000)
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
  }else return 0
}
