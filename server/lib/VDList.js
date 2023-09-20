const VD = require('./VD').VD
class VDList{
  constructor(){}
  static getVdList(configList,usePVD){
    const vdList=[]
    for(let i=0;i<configList.length;i++)
      vdList.push(new VD(configList[i],usePVD))
    return vdList
  } 
  // static getEvd(info,vdList){
  //   if(typeof info=="undefined"||typeof info.sceneId=="undefined"||typeof info.areaId=="undefined"){
  //     console.log("系统版本未更新")
  //     return null
  //   }
  //   const id=info.sceneId+"&"+info.areaId
  //   const posIndex=info.posIndex
  //   for(let i=0;i<vdList.length;i++){
  //     const vd0=vdList[i]
  //     if(vd0.isId(id))return vd0.getEvd(posIndex)//vd0.#getPosIndex(posIndex)
  //   }
  //   return null
  // }
  static getEvd(info,vdList,cb){
    if(typeof info=="undefined"||typeof info.sceneId=="undefined"||typeof info.areaId=="undefined"){
      console.log("系统版本未更新")
      cb(null);return;
    }
    const id=info.sceneId+"&"+info.areaId
    const posIndex=info.posIndex
    for(let i=0;i<vdList.length;i++){
      const vd0=vdList[i]
      console.log(vd0.isId(id))
      if(vd0.isId(id)){
        vd0.getEvd(posIndex,cb);return
      }//vd0.#getPosIndex(posIndex)
    }
    cb(null);return
  }
}
module.exports = {
    VDList
}