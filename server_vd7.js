class VD{
  constructor(areaInf){
    this.id=areaInf.sceneId+"&"+areaInf.areaId
    console.log('version:02(node --max_old_space_size=8192 server_vd)')
    this.areaInf={
      "min": [areaInf.x[0],areaInf.y[0],areaInf.z[0]],
      "max": [areaInf.x[1],areaInf.y[1],areaInf.z[1]],
      "step": [
          (areaInf.x[1]-areaInf.x[0])/areaInf.x[2],
          (areaInf.y[1]-areaInf.y[0])/areaInf.y[2],
          (areaInf.z[1]-areaInf.z[0])/areaInf.z[2]
      ]
    }
    this.load(areaInf.path)
  }
  load(path){
    const self=this
    // self.VisibleArea
    self.databaseEvd={}
    // self.databasePvd={}
    require('jsonfile').readFile(
        path, 
        (err, jsonData)=>{
          if (err) throw err
          for(let vid in jsonData){
            const d=jsonData[vid]
            self.databaseEvd[self.getPosIndex(vid)]={
              "1":d["1"],
              "2":d["2"],
              "3":d["3"],
              "4":d["4"],
              "5":d["5"],
              "6":d["6"],
              // "a":VisibleArea[vid]//visible area
            }
            // databasePvd[getPosIndex(vid)]=d["pvd"]
          }
          console.log("初始化完成")
    });
  }
  getPosIndex(vid){
    const arr=vid.split(",")
    let x=parseInt(arr[0])
    let y=parseInt(arr[1])
    let z=parseInt(arr[2])
    const min =this.areaInf.min
    const step=this.areaInf.step
    const max =this.areaInf.max
    if(x>max[0]||y>max[1]||z>max[2]||x<min[0]||y<min[1]||z<min[2]){
        if(x>max[0])x=max[0]
        if(y>max[1])y=max[1]
        if(z>max[2])z=max[2]
        if(x<min[0])x=min[0]
        if(y<min[1])y=min[1]
        if(z<min[2])z=min[2]
    }
    var dl=[]
    for(var i=0;i<3;i++)
      dl.push(
          step[i]==0?0:
          (max[i]-min[i])/step[i]
      )
    var xi=dl[0]==0?0:Math.round((x-min[0])/dl[0])
    var yi=dl[1]==0?0:Math.round((y-min[1])/dl[1])
    var zi=dl[2]==0?0:Math.round((z-min[2])/dl[2])
    // console.log(xi,yi,zi)
    var s=step
    var index=xi*(s[1]+1)*(s[2]+1)+yi*(s[2]+1)+zi
    // if(index==1350)console.log(1350,vid)//-116000,1000,12000
    return index// return [xi,yi,zi,index]
  }
  static getVdList(configList){
    const vdList=[]
    for(let i=0;i<configList.length;i++)
      vdList.push(new VD(configList[i]))
    return vdList
  } 
  static getEvd(info,vdList){
    if(typeof info=="undefined"||typeof info.sceneId=="undefined"||typeof info.areaId=="undefined"){
      console.log("系统版本未更新")
      return null
    }
    const id=info.sceneId+"&"+info.areaId
    const posIndex=info.posIndex
    for(let i=0;i<vdList.length;i++){
      const vd0=vdList[i]
      if(id==vd0.id)return vd0.databaseEvd[posIndex]//vd0.getPosIndex(posIndex)
    }
    return null
  }
}
const configList=[
  {
    sceneId:"haiNing",
    areaId:0,
    "x": [
        -124000,
        126000,
        2000
    ],
    "y": [
        -19000,
        3000,
        2000
    ],
    "z": [
        -20000,
        24000,
        2000
    ],
    path:"dist/assets/configVVD-model7.json"
  }
]
const vdList=VD.getVdList(configList)
////////////
const ip=8091
const server=require('http').createServer(function (request, response) {
    // let index;
    let info;
    response.setHeader("Access-Control-Allow-Origin", "*");
    request.on('data', function (dataFromPage) {//接受请求
      // index=parseInt(String.fromCharCode.apply(null,dataFromPage))
      info=JSON.parse(String.fromCharCode.apply(null,dataFromPage))
    });
    request.on('end', function () {//返回数据
      let data=VD.getEvd(info,vdList)//vd.databaseEvd[index]
      if(data){//有缓存
        // console.log(index)
        response.write(JSON.stringify(data));
        response.end();
      }else{
        console.log("error 没有找到对应数据",info)
      }
    });
}).listen(ip, '0.0.0.0', function () {
  console.log("listening to client:"+ip);
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