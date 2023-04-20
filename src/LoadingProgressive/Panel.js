import{MyUI} from "../../lib/ui/MyUI_sim.js"
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
    new ui.Button('漫游路径1', "#3498DB", '#2980B9', '#01DFD7',
          (width/10)/6, 150,
          width/10, (width/10)/4,
          0,500,(b)=>{//位置
            const id=0
            for(let i=0;i<self.main.wanderList.length;i++)
              if(i!==id)self.main.wanderList[i].stopFlag=true
            const wander=self.main.wanderList[id]
            wander.stopFlag=!wander.stopFlag
          })
    new ui.Button('漫游路径2', "#3498DB", '#2980B9', '#01DFD7',
          (width/10)/6, 150,
          width/10, (width/10)/4,
          0,550,(b)=>{//位置
            const id=1
            for(let i=0;i<self.main.wanderList.length;i++)
              if(i!==id)self.main.wanderList[i].stopFlag=true
            const wander=self.main.wanderList[id]
            wander.stopFlag=!wander.stopFlag

          })
    new ui.Button('漫游路径3', "#3498DB", '#2980B9', '#01DFD7',
          (width/10)/6, 150,
          width/10, (width/10)/4,
          0,600,(b)=>{//位置
            const id=2
            for(let i=0;i<self.main.wanderList.length;i++)
              if(i!==id)self.main.wanderList[i].stopFlag=true
            const wander=self.main.wanderList[id]
            wander.stopFlag=!wander.stopFlag

          })

  }
}