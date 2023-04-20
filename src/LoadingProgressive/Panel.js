import{MyUI} from "../../lib/ui/MyUI_sim.js"
import { MoveManager } from '../../lib/playerControl/MoveManager.js'
export class Panel{
  constructor(main){
      this.main=main
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
    let prePathId=-1
    for(let id=0;id<self.main.wanderList.length;id++)
    new ui.Button('漫游路径'+(id+1), "#3498DB", '#2980B9', '#01DFD7',
          (width/10)/6, 150,
          width/10, (width/10)/4,//大小
          0,500+id*50,(b)=>{//位置
            if(prePathId==-1||id==prePathId){
              for(let i=0;i<self.main.wanderList.length;i++)
                if(i!==id)self.main.wanderList[i].stopFlag=true
              const wander=self.main.wanderList[id]
              wander.stopFlag=!wander.stopFlag
            }else{
              for(let i=0;i<self.main.wanderList.length;i++)
                self.main.wanderList[i].stopFlag=true
              self.main.wanderList[id].joinPath()
            }
            
            prePathId=id
          })
  }
}