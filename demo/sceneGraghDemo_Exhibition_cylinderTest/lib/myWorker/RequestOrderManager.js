import {LoadModel} from './LoadModel.js';
class  SimplifiedQueue{
    constructor(list,sceneName){
        this.sceneName=sceneName
        this.front=-1
        this.list=list
    }
    de(){
        this.front++
        return this.list[this.front]
    }
    isEmpty(){
        return this.front==this.list.length
    }
}
class  Stack{
    constructor(maxLength){
        this.maxLength=maxLength
        this.data=new Array(maxLength)
        this.top=0
        this.base=0
    }
    next(n){
        return (n+1)%this.maxLength
    }
    isEmpty(){
        return this.top==this.base
    }
    isFull(){
        return this.next(this.top)==this.base
    }
    push(element){
        if(this.isFull()){
            this.base=this.next(this.base)//舍弃一条旧的记录
        }
        this.data[this.top]=element
        this.top=this.next(this.base)
    }
    pop(){
        if(this.isEmpty()){
            return null
        }else{
            this.top--//=this.next(this.base)
            if(this.top<0)this.top=this.maxLength-1
            var element=this.data[this.top]
            return element
        }
    }
    show(){
        if(this.isEmpty()){
            return null
        }else{
            var i=this.top-1
            if(i<0)i=this.maxLength-1
            var element=this.data[i]
            return element
        }
    }
}
export class RequestOrderManager{
    constructor(opt){//{loaded:[],stackSize:1000,waitNumberMax:100,request:null,crossDomain:crossDomain}
        var scope=this
        this.loaded={}//loaded中记录了已经被预先通过其它方式完成了加载（或者已经发出了请求）的数据包编号
        for(var i=0;i<opt.loaded.length;i++)
            this.loaded[opt.loaded[i]]=true
        this.data=new Stack(opt.stackSize)//1000
        this.waitNumber=0
        this.waitNumberMax=opt.waitNumberMax//100
        this.crossDomain=opt.crossDomain
        this.request=(pack_id,sceneName)=>{
            // console.log("test","assets/models/"+sceneName+"/"+pack_id+".zip")
            new LoadModel({
                url:"assets/models/"+sceneName+"/"+pack_id+".zip",
                meshIndex:pack_id,
                finish_cb:(packId)=>{scope.endOneWaiting(packId)},
                crossDomain:scope.crossDomain
            })
        }//opt.request//null
        this.spaceLoadNumber=0
    }
    addDemand(list,sceneName){//出现了新的需求//This list is of array type
        // console.log(list)
        if(list.length>0){
            this.data.push(new SimplifiedQueue(list,sceneName))
            // console.log(this.data)
            // for(var ii=0;ii<Math.min(200,list.length/2)&&!this.data.isEmpty();ii++)
            //     this._makeOneRequest()
            var count=Math.max(this.waitNumber,this.waitNumberMax)+Math.min(list.length,this.waitNumberMax)//请求数量
            while(this.waitNumber<count&&!this.data.isEmpty())//出现新需求的时候会暂时将请求线程的数量提高一倍
                this._makeOneRequest()
        }
    }
    _makeOneRequest(){
        var element=this.data.show()
        var packId=element.de()
        if(this.request&&!this.loaded[packId]&&typeof(packId)!=="undefined"){
            this.loaded[packId]=true//防止对数据包的重复请求
            this.request(packId,element.sceneName)
            this.waitNumber++
        }
        if(element.isEmpty())this.data.pop()
        return packId
    }
    endOneWaiting(packId){
        this.loaded[packId]=true
        this.spaceLoadNumber++
        this.waitNumber--
        if(this.waitNumber<0)this.waitNumber=0
        while(this.waitNumber<this.waitNumberMax&&!this.data.isEmpty())
            this._makeOneRequest()
    }
}
