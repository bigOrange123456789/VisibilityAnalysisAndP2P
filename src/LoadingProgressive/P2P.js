import config from '../../config/configOP.json'
export class P2P{
    constructor(){
        this.useP2P=true
        if(new URLSearchParams(window.location.search).has("useP2P"))
            this.useP2P=new URLSearchParams(window.location.search).get('useP2P')
        console.log("useP2P:",this.useP2P)
        // if(this.useP2P)alert("使用P2P")
        // else alert("不用P2P")
        const self=this
        this.parse=data=>console.log(data)
        const urlP2p=config.src.P2P.urlP2pServer
        this.socketURL=urlP2p[Math.floor(Math.random() * urlP2p.length)]//"http://114.80.207.60:8011"//this.urlP2pServer
        console.log("this.socketURL",this.socketURL)
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