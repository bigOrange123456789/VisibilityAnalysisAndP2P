import{MyUI} from "../../lib/ui/MyUI_sim.js"
export class Panel{
  constructor(main){
      this.main=main
      this.addMyUI()
      this.show
  }
  addMyUI()
  {
    //完成设置个数
    var width=window.innerWidth
    var height=window.innerHeight
    var self=this;
    var ui=new MyUI()
    ui.init()
    const button1=new ui.Button('展示模型', "#3498DB", '#2980B9', '#01DFD7',
          (width/10)/6, 150,
          width/10, (width/10)/4,
          0,500,(b)=>{//位置
            // alert("test")
            // if(self.showModel)self.showModel()
            self.main.building.modelShow()
          }).element
    const button2=new ui.Button('展示墙壁', "#3498DB", '#2980B9', '#01DFD7',
          (width/10)/6, 150,
          width/10, (width/10)/4,
          0,550,(b)=>{//位置
            // alert("test")
            // if(self.showModel)self.showModel()
            self.main.building.wallShow()
          }).element
    const button3=new ui.Button('准确可见集', "#3498DB", '#2980B9', '#01DFD7',
          (width/10)/6, 150,
          width/10, (width/10)/4,
          0,600,(b)=>{//位置
            if(window.showVDbyColor=="evd"){
              window.showVDbyColor="pvd"
              b.innerHTML="潜在可见集"
            }else{
              window.showVDbyColor="evd"
              b.innerHTML="准确可见集"
            }
            
            // alert("test")
            // if(self.showModel)self.showModel()
            console.log(b)
            window.b=b
          }).element

      // 设置按钮的样式
  button1.style.width = "100px";
  button1.style.height = "50px";
  button1.style.fontSize = "16px";
  button1.style.marginBottom = "10px";
  button1.style.position = "absolute";
  button1.style.left = 0 + "px";//window.innerWidth / 2 - 50 + "px";
  button1.style.top = height/ 2 - 150 + "px";//"50%";

  button2.style.width = "100px";
  button2.style.height = "50px";
  button2.style.fontSize = "16px";
  button2.style.marginBottom = "10px";
  button2.style.position = "absolute";
  button2.style.left = 0 + "px";//window.innerWidth / 2 - 50 + "px";
  button2.style.top = height/ 2 - 50 + "px";//"50%";

  button3.style.width = "100px";
  button3.style.height = "50px";
  button3.style.fontSize = "16px";
  button3.style.position = "absolute";
  button3.style.left = 0 + "px";//window.innerWidth / 2 - 50 + "px";
  button3.style.top = height/ 2 + 50 + "px";//"50%";
    
  }
}