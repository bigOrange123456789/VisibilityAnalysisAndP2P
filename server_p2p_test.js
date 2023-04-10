const io1 = require('socket.io')();

const ioList = [
  'http://localhost:8030',
  'http://localhost:8031',
//   'http://localhost:8032',
  'http://localhost:8033',
  'http://localhost:8034',
];

io1.on('connection', socket => {
  console.log(`[${socket.id}] connected to server 1`);

  socket.on('message', data => {
    console.log(socket.id+` received data: `+data);
  });
});
setImmediate(()=>{
    ioList.forEach(ioUrl => {
        const io = require('socket.io-client')(ioUrl);
        io.emit('message', ioUrl);
      });
},5000)
io1.listen(8032);
console.log('Server 2 is running.');
