// const VDList = require('./lib/VDList').VDList
const fs = require("fs");
class Test{
    constructor(){}
    f(){
        console.log(123)
    }
}
class Stack{
    dataStore = [];    //初始化为空
    top = 0;           //记录栈顶位置
    push( element ){
        this.dataStore[this.top++] = element;
    }
    pop(){
        if( this.top > 0 ) return this.dataStore[--this.top];
        else return 'Empty';
    }
    peek(){//查看栈顶元素
        if( this.top > 0 ) return this.dataStore[this.top-1];
        else return 'Empty';
    }
    length(){//查看栈内元素总数
        return this.top;
    }
    clear(){//清空栈
        delete this.dataStore;
        this.dataStore = [];
        this.top = 0;
    }
}
class DownloadJSONStack extends Stack{
    start=false
    count=0//存储的文件数量
    constructor(){
        super()
        const self=this
        setInterval(()=>{
            const arg=self.pop()
            if(arg!="Empty")self.save(arg)
            else{
                if(this.start){
                    this.start=false
                    console.log("The number of successfully stored files is:",self.count)
                }
            }
        },5)
    }
    save(arg){
        this.start=true
        const self=this
        let result = JSON.parse(arg);
        let dataBuffer = result.data;
        let name = result.name;
        fs.writeFile(__dirname + "/../" + name, dataBuffer, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("save:"+name+"\t;len:",self.length())
                self.count++
            }
        });
    }


}
module.exports = {
    Stack,
    DownloadJSONStack
}