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
        this.process0("cube",opt.cube)
        this.process0("cylinder",opt.cube)
    }
    emptyFolder(folderPath) {
        console.log("Clearing folder:",folderPath)
        const self=this
        // 读取文件夹中的所有文件和子文件夹
        const files = fs.readdirSync(folderPath);
        // 遍历文件和子文件夹并删除
        for (const file of files) {
          const curPath = folderPath+"/"+file//path.join(folderPath, file);
          if (fs.lstatSync(curPath).isDirectory()) {
            // 递归删除子文件夹
            self.emptyFolder(curPath);
            // 删除空文件夹
            fs.rmdirSync(curPath);
          } else {
            // 删除文件
            fs.unlinkSync(curPath);
          }
        }
    }
    process0(type,param){
        // const type="cube"
        // const { readFileSync } = require('fs');
        // const data = readFileSync('./data/'+type+'.json');
        // console.log("data",data)
        // const param=JSON.parse(data.toString())
        this.emptyFolder(__dirname + '/../data/'+type)
        let testNum=0
        const testNumMax=Object.keys(param).length
        console.log()
        for(let id in param){
        try {
            testNum++
            // process.stdout.write((100*testNum/testNumMax).toFixed(2)+"%\t",testNum+"/"+testNumMax);
            process.stdout.write((100*testNum/testNumMax).toFixed(2)+"%\t"+testNum+"/"+testNumMax+"\t\t\r");
            const data0 = JSON.stringify(param[id])//JSON.stringify(param[id], null, 4);
            fs.writeFileSync(__dirname + '/../data/'+type+'/'+id+'.json', data0);
        } catch (error) {
            console.error(id,error);
        }
        }
        console.log()
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