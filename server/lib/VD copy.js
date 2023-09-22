// class VD{
//     isId(id){
//       return this.id==id
//     }
//     getEvd(posIndex){
//       return this.databaseEvd[posIndex]
//     }
//     constructor(areaInf,usePVD){
//       this.usePVD=usePVD
//       this.id=areaInf.sceneId+"&"+areaInf.areaId
//       this.areaInf={
//         "min": [areaInf.x[0],areaInf.y[0],areaInf.z[0]],
//         "max": [areaInf.x[1],areaInf.y[1],areaInf.z[1]],
//         "step": [
//             (areaInf.x[1]-areaInf.x[0])/areaInf.x[2],
//             (areaInf.y[1]-areaInf.y[0])/areaInf.y[2],
//             (areaInf.z[1]-areaInf.z[0])/areaInf.z[2]
//         ]
//       }
//       this.#load(areaInf.path)
//     }
//     #load(path){
//       const self=this
//       // self.VisibleArea
//       self.databaseEvd={}
//       if(this.usePVD)
//       self.databasePvd={}
//       require('jsonfile').readFile(
//           path, 
//           (err, jsonData)=>{
//             if (err) throw err
//             for(let vid in jsonData){
//               const d=jsonData[vid]
//               self.databaseEvd[self.#getPosIndex(vid)]={
//                 "1":d["1"],
//                 "2":d["2"],
//                 "3":d["3"],
//                 "4":d["4"],
//                 "5":d["5"],
//                 "6":d["6"],
//                 // "a":VisibleArea[vid]//visible area
//               }
//               if(self.usePVD)
//               self.databaseEvd[self.#getPosIndex(vid)]['pvd']=d["pvd"]
//               // console.log(self.usePVD)
//               // self.databasePvd[self.#getPosIndex(vid)]=d["pvd"]
//               // console.log(d["pvd"])
//             }
//             console.log("初始化完成")
//       });
//     }
//     #getPosIndex(vid){
//       const arr=vid.split(",")
//       let x=parseInt(arr[0])
//       let y=parseInt(arr[1])
//       let z=parseInt(arr[2])
//       const min =this.areaInf.min
//       const step=this.areaInf.step
//       const max =this.areaInf.max
//       if(x>max[0]||y>max[1]||z>max[2]||x<min[0]||y<min[1]||z<min[2]){
//           if(x>max[0])x=max[0]
//           if(y>max[1])y=max[1]
//           if(z>max[2])z=max[2]
//           if(x<min[0])x=min[0]
//           if(y<min[1])y=min[1]
//           if(z<min[2])z=min[2]
//       }
//       var dl=[]
//       for(var i=0;i<3;i++)
//         dl.push(
//             step[i]==0?0:
//             (max[i]-min[i])/step[i]
//         )
//       var xi=dl[0]==0?0:Math.round((x-min[0])/dl[0])
//       var yi=dl[1]==0?0:Math.round((y-min[1])/dl[1])
//       var zi=dl[2]==0?0:Math.round((z-min[2])/dl[2])
//       // console.log(xi,yi,zi)
//       var s=step
//       var index=xi*(s[1]+1)*(s[2]+1)+yi*(s[2]+1)+zi
//       // if(index==1350)console.log(1350,vid)//-116000,1000,12000
//       return index// return [xi,yi,zi,index]
//     }   
// }
class VD{
  isId(id){
    return this.id==id
  }
  // getEvd(posIndex){
  //   if(this.databaseEvd){
  //     return this.databaseEvd[posIndex]
  //   }else{


  //   }
  // }
  getEvd(posIndex,cb){
    if(this.databaseEvd){
      cb(this.databaseEvd[posIndex]) 
    }else{
      const self=this
      const name =this.#getPosVid(posIndex)
      require('jsonfile').readFile(
        self.path+name+".json", 
        (err, jsonData)=>{
          if(!jsonData)console.log("没有找到:",self.path+name+".json",posIndex)
          cb(jsonData)
        }
      );
    }
  }

  constructor(areaInf,usePVD){
    this.usePVD=usePVD
    this.id=areaInf.sceneId+"&"+areaInf.areaId
    this.areaInf={
      "min": [areaInf.x[0],areaInf.y[0],areaInf.z[0]],
      "max": [areaInf.x[1],areaInf.y[1],areaInf.z[1]],
      "step": [
          (areaInf.x[1]-areaInf.x[0])/areaInf.x[2],
          (areaInf.y[1]-areaInf.y[0])/areaInf.y[2],
          (areaInf.z[1]-areaInf.z[0])/areaInf.z[2]
      ]
    }
    if(areaInf.RealTimeLoading){
      this.path=areaInf.path
      console.log("实时从外存中加载可见列表")
    }else{
      this.#load(areaInf.path)
    }
    
  }
  #load(path){
    const self=this
    // self.VisibleArea
    self.databaseEvd={}
    if(this.usePVD)
    self.databasePvd={}
    require('jsonfile').readFile(
        path, 
        (err, jsonData)=>{
          if (err) throw err
          for(let vid in jsonData){
            const d=jsonData[vid]
            self.databaseEvd[self.#getPosIndex(vid)]={
              "1":d["1"],
              "2":d["2"],
              "3":d["3"],
              "4":d["4"],
              "5":d["5"],
              "6":d["6"],
              // "a":VisibleArea[vid]//visible area
            }
            if(self.usePVD)
            self.databaseEvd[self.#getPosIndex(vid)]['pvd']=d["pvd"]
            // console.log(self.usePVD)
            // self.databasePvd[self.#getPosIndex(vid)]=d["pvd"]
            // console.log(d["pvd"])
          }
          console.log("初始化完成")
    });
  }
  #getPosIndex(vid){
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
    var s=step
    var index=xi*(s[1]+1)*(s[2]+1)+yi*(s[2]+1)+zi
    // if(index==1350)console.log(1350,vid)//-116000,1000,12000
    return index// return [xi,yi,zi,index]
  }   
  #getPosVid(index){
    const min =this.areaInf.min
    const step=this.areaInf.step//步数
    const max =this.areaInf.max
    var dl=[]//步长
    for(var i=0;i<3;i++)
      dl.push(
          step[i]==0?0:
          (max[i]-min[i])/step[i]
      )
    const A=(step[1]+1)*(step[2]+1)
    const B=(step[2]+1)

    const xi=Math.floor(index/A)
    index=index-(xi*A)
    const yi=Math.floor(index/B)
    index=index-(yi*B)
    const zi=index    
    return (min[0]+dl[0]*xi)+","+(min[1]+dl[1]*yi)+","+(min[2]+dl[2]*zi)
  }  
}
module.exports = {
    VD
}