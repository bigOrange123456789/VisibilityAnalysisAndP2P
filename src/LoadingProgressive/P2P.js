import config from '../../config/configOP.json'
export class P2P{
    constructor(){
        this.useP2P=true
        console.log("useP2P:",this.useP2P)
        // if(this.useP2P)alert("使用P2P")
        // else alert("不用P2P")
        const self=this
        this.parse=data=>console.log(data)
        this.socketURL=config.src.P2P.urlP2pServer//"http://114.80.207.60:8011"//this.urlP2pServer
        if(this.useP2P){
            this.socket = this.initSocket(this.socketURL)
            this.socket.on('receive', data=> self.parse(data))  
        }
    }
    initSocket(socketURL){
        var scope=this
        var socket = io.connect(socketURL,{transports:['websocket','xhr-polling','jsonp-polling']})
        socket.on('receive',  data=> {
            scope.parse(data)
        })
        return socket
    }
    send(message){
        if(this.useP2P)
            this.socket.emit('send',message)
    }
}