const { ElectronServer }= require('../../lib/electron/server/ElectronServer.js')
// new ElectronServer()
// class ElectronServer2 extends ElectronServer{}
new ElectronServer({
  dirname:__dirname,
  pathHTML:"lightWeight/index.html",
}).start()