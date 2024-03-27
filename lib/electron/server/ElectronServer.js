const { app, BrowserWindow, ipcMain } = require("electron");
const { Window } = require("./Window");
class ElectronServer{
    constructor(opt){
        opt.dirname=opt.dirname?opt.dirname:__dirname
        opt.pathHTML=opt.pathHTML?opt.pathHTML:"index.html"
        this.createWindow=()=>{
            new Window(opt)
        }
        // this.start()
    }
    start(){
        app.whenReady().then(this.createWindow);
        for(let i in this._serverConfig){
            app.on(i,this._serverConfig[i])
        }
    }
    _serverConfig={
        'window-all-closed':() => {//当所有窗口都被关闭后退出
            // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
            // 否则绝大部分应用及其菜单栏会保持激活。
            if (process.platform !== "darwin") {
                if(false)app.quit();
            }
        },
        'activate':() => {
            // 在macOS上，当单击dock图标并且没有其他窗口打开时，
            // 通常在应用程序中重新创建一个窗口。
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createWindow();
            }
        },
    }
}
module.exports = {
    ElectronServer
}