const { ElectronServer }= require('../../lib/electron/server/ElectronServer.js')
new ElectronServer({
  dirname:__dirname,
  pathHTML:"lightWeight/index.html",
}).start()