const usePVD=true
const configList=[
  // {
  //   sceneId:"haiNing0",
  //   areaId:0,
  //   "x": [
  //     -121000,
  //     117000,
  //     2000
  //   ],
  //   "y": [
  //     2286,//2286.5,
  //     2286,//2286.5,
  //     2000
  //   ],
  //   "z": [
  //     -4000,
  //     16000,
  //     2000
  //   ],
  //   vdFileName:"configVVD-model6.json"
  // },
  // {
  //   sceneId:"haiNing",
  //   areaId:0,
  //   "x": [
  //       -124000,
  //       126000,
  //       2000
  //   ],
  //   "y": [
  //       -19000,
  //       3000,
  //       2000
  //   ],
  //   "z": [
  //       -20000,
  //       24000,
  //       2000
  //   ],
  //   vdFileName:"configVVD-model7.json"
  // },
  // {
  //   sceneId:"gkd",
  //   areaId:0,
  //   x: [
  //     -815,879,
  //     11
  //   ],
  //   y: [
  //       16,16,
  //       11
  //   ],
  //   z: [
  //       -962,1084,
  //       11
  //   ],
  //   vdFileName:"configVVD-model8.json"
  // },
  // {
  //   sceneId:"gkd",
  //   areaId:1,
  //   "x": [
  //     -880,880,
  //     110
  //   ],
  //   "y": [
  //     -110,440,
  //     110
  //   ],
  //   "z": [
  //     -990,1100,
  //     110
  //   ],
  //   vdFileName:"configVVD-model8_1.json"
  // },
  {
    sceneId:"KaiLiNan",
    areaId:0,
    "x": [
      -173,183,
      4
    ],
    "y": [
      8,108,
      4
    ],
    "z": [
      -92,112,
      4
    ],
    vdFileName:"KaiLiNan_new/",
    RealTimeLoading:true
  }
]
const vdDataPath="./vd_data/"  //"../dist/assets/"
for(let i of configList){
  i.path=vdDataPath+i.vdFileName
}
console.log('version:09.20(node --max_old_space_size=8192 server_vd)')
const VDList = require('./lib/VDList').VDList
const vdList=VDList.getVdList(configList,usePVD)
////////////////////////////////////////////////////////////
const port=8092
const fs = require('fs');
function center(request, response) {
  // let index;
  let info;
  response.setHeader("Access-Control-Allow-Origin", "*");
  request.on('data', function (dataFromPage) {//接受请求
    // index=parseInt(String.fromCharCode.apply(null,dataFromPage))
    info=JSON.parse(String.fromCharCode.apply(null,dataFromPage))
  });
  request.on('end', function () {//返回数据
    // let data=VDList.getEvd(info,vdList)//vd.databaseEvd[index]
    // if(data){//有缓存
    //   // console.log(index)
    //   response.write(JSON.stringify(data));
    //   response.end();
    // }else{
    //   console.log("error 没有找到对应数据",info)
    // }
    VDList.getEvd(info,vdList,data=>{
      if(data){//有缓存
        // console.log(index)
        response.write(JSON.stringify(data));
        response.end();
      }else{
        console.log("error 没有找到对应数据",info)
      }
    })//vd.databaseEvd[index]
    
  });
}
let server
if(false){
  const options = {
    key: fs.readFileSync('ssl/private.key'),
    cert: fs.readFileSync('ssl/certificate.crt')
  };
  server=require('https').createServer(options, center).listen(port, '0.0.0.0', function () {
    console.log("listening to client:"+port);
  })
}else{
  server=require('http').createServer(center).listen(port, '0.0.0.0', function () {
  console.log("listening to client:"+port);
  });
}


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