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
class Decompose{
    constructor(opt){
        this.process("cube",opt.cube)
        this.process("cylinder",opt.cube)
    }
    process(type,param){
        // const type="cube"
        // const { readFileSync } = require('fs');
        // const data = readFileSync('./data/'+type+'.json');
        // console.log("data",data)
        // const param=JSON.parse(data.toString())

        for(let id in param){
        try {
            console.log(id)
            const data0 = JSON.stringify(param[id])//JSON.stringify(param[id], null, 4);
            fs.writeFileSync(__dirname + '/../data/'+type+'/'+id+'.json', data0);
        } catch (error) {
            console.error(id,error);
        }
        }
        console.log("finish!")
    }
}
class GetIndex{
    constructor(count){
        const self=this
        setTimeout(()=>{
            self.start(count)
        },1000)
    }
    start(count){
        //const count=275809
        const result=[]
        for(let i=0;i<count;i++){
            result.push(0)
        }
        let files = fs.readdirSync(__dirname + "/../data/cube");
        for(let i=0;i<files.length;i++){
            const f=files[i].split(".json")[0]
            const j=parseInt(f)
            result[j]=1
        }
        files = fs.readdirSync(__dirname + "/../data/cylinder");
        for(let i=0;i<files.length;i++){
            const f=files[i].split(".json")[0]
            const j=parseInt(f)
            result[j]=2
        }
        const str=JSON.stringify(result)
        fs.writeFile(__dirname + "/../data/" + "parameter.json", str, function (err) {
            if (err) {
            console.log(err);
            } else {
            console.log("save success");
            }
        });
    }
}
module.exports = {
    Stack,
    DownloadJSONStack,
    Decompose,
    GetIndex
}