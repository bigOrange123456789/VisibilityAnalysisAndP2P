const fs=require("fs")
class PackCache{
  constructor(sceneId){
    this.sceneId=sceneId+"/"
    this.pathPre="dist/assets/"+this.sceneId
    this.data={}
    this.load()
  }
  load(){
    for (const fileId of fs.readdirSync(this.pathPre)) {
      if(fileId.split(".zip").length>1)
        this.data[fileId]=fs.readFileSync(this.pathPre+fileId) 
      process.stdout.write(this.pathPre+fileId+'\t\t\r')
    }
    console.log()
  }
  get(path){
    if(path.split(this.sceneId).length>1){
      const fileId=path.split(this.sceneId)[1]
      return this.data[fileId]
    }else return null
  }
}
class PackCacheList{
  constructor(sceneIdList){
    this.data=[]
    this.load(sceneIdList)
  }
  load(sceneIdList){
    console.log("正在加载缓存")
    for(let i=0;i<sceneIdList.length;i++){
      const sceneId=sceneIdList[i]
      console.log("正在加载:"+sceneId)
      this.data.push(new PackCache(sceneId))
    }
    console.log("完成缓存加载")
  }
  get(path){
    for(let i=0;i<this.data.length;i++){
      const d=this.data[i].get(path)
      if(d)return d
    }
    return null
  }
}
const cache=new PackCacheList(["space8Zip","space7Zip"])
const server=require('http').createServer(function (request, response) {
    let filePath;
    response.setHeader("Access-Control-Allow-Origin", "*");
    request.on('data', function (data) {//接受请求
        filePath=String.fromCharCode.apply(null,data)
    });
    request.on('end', function () {//返回数据
      const buffer=cache.get(filePath)
      if(buffer){//有缓存
        response.write(buffer)
        response.end()
      }else{
        console.log("没有缓存",filePath)
      }
    });
}).listen(8081, '0.0.0.0', function () {
    console.log("listening to client:8081");
});
server.on('close',()=>{
  console.log('服务关闭')
})
server.on('error',()=>{
  console.log('服务发送错误')
})
server.on('connection',()=>{
  // console.log('服务连接')
})
server.on('timeout',()=>{
  // console.log("监听超时")
})