import{MyUI} from "../../../lib/ui/MyUI_sim.js"
export class Panel{
  constructor(main){
      this.main=main
      this.prePathId=-1
      this.addMyUI()
      // this.show
  }
  addMyUI()
  {
    //完成设置个数
    var width=window.innerWidth
    var height=window.innerHeight
    var self=this;
    var ui=new MyUI()
    ui.init()
    for(let id=0;id<self.main.wanderList.length;id++)
      new ui.Button('path'+(id+1), //'自动漫游',//
        "#3498DB", 
        '#2980B9', 
        0x01DFD7,
          (width/10)/6, 150,
          width/10, (width/10)/4,//大小
          0,500+id*50,(b)=>{//位置
            self.setWander(id)
          })
  }
  setWander(id){
    console.log(id,this.prePathId)
    if(id==this.prePathId){
      for(let i=0;i<this.main.wanderList.length;i++)
        if(i!==id)this.main.wanderList[i].stopFlag=true
      const wander=this.main.wanderList[id]
      wander.stopFlag=!wander.stopFlag
    }else{
      for(let i=0;i<this.main.wanderList.length;i++)
        this.main.wanderList[i].stopFlag=true
      this.main.wanderList[id].joinPath()
    }
    window.pathId=id
    if(window.updateGroupId)window.updateGroupId(id)
    this.prePathId=id
  }
}