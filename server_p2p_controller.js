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
  console.log({"ioUrlList":io.ioUrlList})
})
