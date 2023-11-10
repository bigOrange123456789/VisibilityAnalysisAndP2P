// import{MyUI} from "../../../lib/ui/MyUI_sim.js"
import { Engine3D } from './main.js'
export class Panel{
  constructor(main){
      this.main=main
      this.prePathId=-1
      this.addMyUI_Follow()
      this.addMyUI_Escape()
      this.addMyUI()
      // this.show
  }
  addMyUI_Follow()
  {
    window.followFlag=true
    //完成设置个数
    var width=window.innerWidth
    var height=window.innerHeight
    var self=this;
    var ui=new Engine3D.MyUI()
    ui.init()
    // for(let id=0;id<self.main.wanderList.length;id++)
      new ui.Button('视点跟随',//'漫游路径'+(id+1), 
        "#3498DB", 
        '#2980B9', 
        0x01DFD7,
          (width/10)/6, 150,
          width/10, (width/10)/4,//大小
          0,500-50,(b)=>{//位置
            
            for(let i=0;i<self.main.wanderList.length;i++){
              self.main.wanderList[i].stopFlag=true
            }

            if(!window.followFlag)window.followFlag=true
            else window.followFlag=false
            // self.setWander(id)
          })
  }
  addMyUI_Escape()
  {
    let first=true
    //完成设置个数
    var width=window.innerWidth
    var height=window.innerHeight
    var ui=new Engine3D.MyUI()
    ui.init()
    // for(let id=0;id<self.main.wanderList.length;id++)
      new ui.Button('开始逃生',//'漫游路径'+(id+1), 
        "#3498DB", 
        '#2980B9', 
        0x01DFD7,
          (width/10)/6, 150,
          width/10, (width/10)/4,//大小
          0,500-2*50,(b)=>{//位置
            if(first)
              if(window.findpath){
                window.findpath.start()
                first=false
              }
            
            if(!window.escapeFlag)window.escapeFlag=true
            else window.escapeFlag=false
            // self.setWander(id)
          })
  }
  addMyUI()
  {
    //完成设置个数
    var width=window.innerWidth
    var height=window.innerHeight
    var self=this;
    var ui=new Engine3D.MyUI()
    ui.init()
    for(let id=0;id<self.main.wanderList.length;id++)
      new ui.Button('自动漫游',//'漫游路径'+(id+1), 
        "#3498DB", 
        '#2980B9', 
        0x01DFD7,
          (width/10)/6, 150,
          width/10, (width/10)/4,//大小
          0,500+id*50,(b)=>{//位置
            window.followFlag=false
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