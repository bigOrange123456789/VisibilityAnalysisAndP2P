const port=8396
console.log("listening to port:",port)
const nodeStatic = require('node-static')
const http = require('http')
const fileServer = new(nodeStatic.Server)()
const app = http.createServer(function(req, res) {
  fileServer.serve(req, res)
}).listen(port)
var io = require('socket.io').listen(app)
io.sockets.on('connection', socket=> {
  socket.emit("userCount",io.engine.clientsCount)
  socket.broadcast.emit("userCount",io.engine.clientsCount)
  socket.on('page2server', data => {
    if(data instanceof Array)send2Client_list(data)
    else send2Client(socket,data)
  })
})
function send2Client(socket,data){
  socket.broadcast.emit('server2page', data)
  socket.emit('server2page', data)
}
function send2Client_old2(data){
  const num=data.num
  const connectedClients = io.sockets.sockets
  let i=0
  for (const id in connectedClients) {
    const socket=connectedClients[id]
    socket.emit('server2page', data)
    i++
    if(i==num)return
  }
}
function send2Client_list(dataList){
  const connectedClients = io.sockets.sockets
  let i=0
  for (const id in connectedClients) {
    const socket=connectedClients[id]
    socket.emit('server2page', dataList[i])
    i++
    if(i==dataList.length)return
  }
}
function test(n){//npm install puppeteer
  if(n==0)return
  const puppeteer = require('puppeteer');
  (async () => {
    const browserPromises = []; // 存储浏览器实例的Promise数组
    // 创建5个浏览器窗口
    for (let i = 0; i < n; i++) {
      browserPromises.push(puppeteer.launch());
    }
    // 等待所有浏览器窗口都打开
    const browsers = await Promise.all(browserPromises);
    // 可以在此处对每个浏览器窗口进行操作
    for (let i = 0; i < browsers.length; i++) {
      const browser = browsers[i];
      const page = await browser.newPage();
      await page.goto('http://localhost:'+port);
      // 在每个浏览器窗口中执行其他操作
    }
    // 关闭所有浏览器窗口
    // await Promise.all(browsers.map(browser => browser.close()));
  })();
}test(100)