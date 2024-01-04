import {CrossDomain} from './CrossDomain.js';
import {RequestOrderManager} from './RequestOrderManager.js';

var crossDomain=new CrossDomain()

var requestOrderManager=new RequestOrderManager({
  loaded:[],
  stackSize:10000,
  waitNumberMax:600,//200,//150,
  crossDomain:crossDomain
})
setTimeout(()=>{
  requestOrderManager.waitNumberMax=300//150
},500)
setTimeout(()=>{
  requestOrderManager.waitNumberMax=250//100
},2000)


onmessage=ev=>{
  // console.log(ev)
  if(ev.data.type==""){
  }else if(ev.data.type=="start"){
    // requestOrderManager.addDemand(
    //   //[944,907,908,909,946]
    //   Array.from(Array(1000)).map((e, i) => i),
    //   ev.data.sceneName
    // )
    postMessage({
      "first":true
      // "meshIndex":this.meshIndex,
      // "myArray":myArray,
      // "matrixConfig":json0.matrixConfig,//matrixConfig,
      // "structdesc0":json0.structdesc0,//structdesc0

      // "jsonDataAll":jsonDataAll
    }) 
  }else if(ev.data.type=="list"){
    requestOrderManager.addDemand(ev.data.list,ev.data.sceneName)
  }
  
}