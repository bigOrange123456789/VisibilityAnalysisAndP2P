const { ElectronServer }= require('../../lib/electron/server/ElectronServer.js')
// new ElectronServer()
// class ElectronServer2 extends ElectronServer{}
new ElectronServer({
  dirname:__dirname
}).start()
// import ElectronServer from './electron/server/ElectronServer.js'