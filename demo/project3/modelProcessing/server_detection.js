const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require('path');
const archiver = require('archiver');

function createWindow() {
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
    // icon: __dirname + "/assets/favicon.ico",
  });

  if(false)win.hide();

  win.setBackgroundColor("#000000");

  win.setMenu(null);

  process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

  process.env["ELECTRON_NO_ATTACH_CONSOLE"] = "true";

  process.noDeprecation = true;

  ipcMain.on("getCommandLineArgs", (event, arg) => {
    event.returnValue = process.argv; //收到消息后将命令行参数返回给渲染进程
  });

  //将信息发送的控制台
  ipcMain.on("debug", (event, arg) => {
    process.stdout.write(arg);
  });

  var outputDir = "";

  if (app.isPackaged) {
    outputDir = process.argv[2];
  } else {
    outputDir = process.argv[3];
  }
  console.log("process.argv:",process.argv)
  // outputDir=__dirname+outputDir
  console.log("inputDir:",process.argv[2])
  console.log("outputDir:",outputDir)

  ipcMain.on("console",(event, arg) => {
    console.log(arg);
  });

  //退出程序
  ipcMain.on("quit", (event, arg) => {
    function isFolderEmpty(folderPath) {
      const files = fs.readdirSync(folderPath);
      return files.length === 0;
    }

    function deleteFolder(folderPath) {
      if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath + "\\matrix").forEach((file, index) => {
          const curPath = path.join(folderPath + "\\matrix", file);
            fs.unlinkSync(curPath); // 删除文件
        });
        fs.readdirSync(folderPath + "\\model").forEach((file, index) => {
          const curPath = path.join(folderPath + "\\model", file);
          fs.unlinkSync(curPath); // 删除文件
        });
        let interval = setInterval(function(){
          if(isFolderEmpty(folderPath + "\\matrix") && isFolderEmpty(folderPath + "\\model")){
            fs.rmdirSync(folderPath + "\\matrix"); // 删除文件夹本身
            fs.rmdirSync(folderPath + "\\model"); // 删除文件夹本身
            setTimeout(function () {
              fs.rmdirSync(folderPath);
            }, 100);

            setTimeout(function () {
              app.quit();
            }, 500); //收到退出消息后等待500毫秒再退出，清理中间文件
          }
        }, 1000)
        
      }
    }

    let folderPath = outputDir + "\\" + arg + "\\input";
    setTimeout(function () {
      deleteFolder(folderPath);
    }, 3000);


  });

  ipcMain.on("createDir",(event, arg) => {
    function emptyDir(path) {
      const files = fs.readdirSync(path);
      files.forEach(file => {
          const filePath = `${path}/${file}`;
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) {
              emptyDir(filePath);
          } else {
              fs.unlinkSync(filePath);
          }
      });
    }
    const path=outputDir + "\\" + arg
    fs.access(path, (err) => {
      if (err) {
        fs.mkdir(path, err => {})//"不存在"
      } else {
        emptyDir(path)//"存在"
      }
    })
  });

  ipcMain.on("downloadJSON", (event, arg) => {
    let result = JSON.parse(arg);
    let dataBuffer = result.data;
    let name = result.name;
    fs.writeFile(outputDir + "\\" + name, dataBuffer, function (err) {
      if (err) {
        console.log(err);
      } else {
        //console.log("save success");
      }
    });
  });

  ipcMain.handle("exportGltf", async (event, arg) => {
    let pro = () => {
      return new Promise((resolve, reject) => {
        let result = JSON.parse(arg);
        let dataBuffer = result.data;
        let name = result.name;
        fs.writeFileSync(outputDir + "\\" + name, dataBuffer);
        resolve(name);
      });
    };
    const result = await pro();
    return result;
  });

  ipcMain.handle("exportJSON", async (event, arg) => {
    let pro = () => {
      return new Promise((resolve, reject) => {
        let result = JSON.parse(arg);
        let data = result.data;
        let name = result.name;
        fs.writeFileSync(outputDir + "\\" + name, data);
        resolve(name);
      });
    };
    return await pro();
  });

  ipcMain.handle("compressFiles", async (event, arg) => {
    let pro = () => {
      return new Promise((resolve, reject) => {
        let result = JSON.parse(arg);
        let name = result.name;
        let index = result.index;

        let output = fs.createWriteStream(outputDir + "\\" + name+"\\"+index.toString()+'.zip')
        // let output = fs.createWriteStream(outputDir + "\\" + name+"\\"+name+"\\"+index.toString()+'.zip')
        var archive = archiver('zip', {zlib:{level:9}})
        archive.pipe(output)
        var filename1 = 'matrix'+index.toString()+'.json'
        archive.append(fs.createReadStream(
            outputDir + "\\" + name + "\\input\\matrix\\matrix" + index.toString()+".json"
        ), {name:filename1})
        var filename2 = 'model'+index.toString()+'.gltf'
        archive.append(fs.createReadStream(
            outputDir + "\\" + name + "\\input\\model\\model" + index.toString()+'.gltf'
        ), {name:filename2})
        archive.finalize()
        resolve(index);
      });
    };
    return await pro();
  })

  console.log("Start.");

  // 并且为你的应用加载index.html
  win.loadFile(__dirname+"/index.html");

  // 打开开发者工具
  win.webContents.openDevTools();
}

// Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow);

//当所有窗口都被关闭后退出
app.on("window-all-closed", () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 您可以把应用程序其他的流程写在在此文件中
// 代码 也可以拆分成几个文件，然后用 require 导入。
