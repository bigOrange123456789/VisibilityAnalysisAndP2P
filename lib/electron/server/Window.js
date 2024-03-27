const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const { SplitCompress } = require("./SplitCompress");
class Window{
    constructor(opt){
        this.opt=opt
        this.start()
    }
    start(){
        // 创建浏览器窗口
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false,
            },
            maximizable: false,
            transparent: false,
            frame: true,
            //icon:this.opt.dirname + "/assets/favicon.ico",
        });
        win.setBackgroundColor("#000000");
        win.setMenu(null);

        process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
        process.env["ELECTRON_NO_ATTACH_CONSOLE"] = "true";
        process.noDeprecation = true;

        ipcMain.on("getCommandLineArgs", (event, arg) => {
            event.returnValue = process.argv; //收到消息后将命令行参数返回给渲染进程
        });

        
        ipcMain.on("debug", (event, arg) => {//将信息发送的控制台
            process.stdout.write(arg);
        });

        this.outputDir = app.isPackaged?process.argv[2]:process.argv[3]


        for(let i in this._serverOn){
            ipcMain.on(i,this._serverOn[i])
        }
        ipcMain.handle("exportGltf", this._serverOn["downloadJSON"])
  

        // 并且为你的应用加载index.html
        win.loadFile(this.opt.dirname +"/"+this.opt.pathHTML);//this.opt.dirname +"/index.html"

        // 打开开发者工具
        win.webContents.openDevTools();
    }
    _serverOn={
        quit:async (event, arg) => {//退出程序
            const self=this
            //console.log(arg);
            console.log("Model splitting has been completed!!!")
            setTimeout(function () {
                new SplitCompress({
                    savePath:self.outputDir+"/../"
                })
                if(false)
                if(this.opt.finish)this.opt.finish()
                else if(false)app.quit();
            }, 500); //收到退出消息后等待500毫秒再退出
        },
        
        downloadJSON:async (event, arg) => {
            let pro = () => {
                return new Promise((resolve, reject) => {
                    let result = JSON.parse(arg);
                    let dataBuffer = result.data;
                    let name = result.name;
                    process.stdout.write("\rsaving:  " + name+"                  ")
                    fs.writeFileSync(this.outputDir + "/" + name, dataBuffer);
                    resolve(name);
                });
            };
            return await pro()
        }
    }
}
module.exports = {
    Window
}