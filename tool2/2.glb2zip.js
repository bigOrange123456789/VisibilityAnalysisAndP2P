class FileProcessor{
    //构造函数
    constructor() {
        this.fs=require('fs')
        this.archiver  = require('archiver');//用于文件压缩
        this.path=require('path')//用于文件压缩
    }
    //类中函数
    read(url){
        this.fs.readFile(url, 'utf8' , function (err , data) {
            console.log(err , data)
        });
    }
    writeJson(name,data){
        this.fs.writeFile(name, JSON.stringify(data) , function(){});
        //this.fs.writeFile(name, JSON.stringify(data , null, "\t") , function(){});
    }
    clear(path) {
        var scope=this;
        if(this.fs.existsSync(path)) {
            this.fs.readdirSync(path).forEach(function (file) {
                let curPath = path + "/" + file;
                if(scope.fs.statSync(curPath).isDirectory()) scope.clear(curPath)
                else scope.fs.unlinkSync(curPath)//stat.isFile()
            })
            this.fs.rmdirSync(path)
        }
    }
    //文件夹处理
    createFolder(folder){
        try{this.fs.accessSync(folder)}//检测文件是否存在
        catch(e){this.fs.mkdirSync(folder)}// 文件夹不存在，创建文件夹
    }
    //文件名处理
    rename(url1,url2){
        this.fs.renameSync(url1,url2)
    }
    getSize(url){
        var stats=this.fs.statSync(url)
        return stats.size;
    }
    getAllName(path){
        var names=[]
        this.fs.readdirSync(path).forEach(function (name) {
            names.push(name)
        });
        return names
    }
    zip(url, name, cb){
        // init
        var output = this.fs.createWriteStream(name);//创建数据流
        output.on('close',()=> cb('finish'));//创建完成
        // zip
        var archive = this.archiver('zip', {zlib: { level: 9 }});//设置压缩格式和等级
        archive.on('error', err=> cb(err));
        archive.pipe(output);
        if(this.fs.statSync(url).isFile()) archive.file(url, {name : this.path.basename(url)});
        else archive.directory(url, url);//archive.directory(url, false);
        archive.finalize();
    }
    //静态函数
    static test_compress(){
        var fp=new FileProcessor()
        var rootPath="./zip"
        var all=fp.fs.readdirSync(rootPath)
        var i=0;
        var si=setInterval(()=>{
            var s=all[i];
            console.log("s",s)
            //var arr=s.split(".gltf");
            //if(arr.length>1)
                fp.zip(
                    rootPath+"/"+s, 
                    rootPath+"/"+s+".zip", (s)=> {})
            i++;
            process.stdout.write(i+"/"+all.length+"\r")
            if(i===all.length)clearInterval(si)
        },1)
    }
    static test1(){
        const path1="F:/gitHubRepositories/VisibilityAnalysisAndP2P/dist/assets/space7GLB_sim/"
        const path2="F:/gitHubRepositories/VisibilityAnalysisAndP2P/dist/assets/space7Zip_sim/"
        var fp=new FileProcessor()
        var all=fp.fs.readdirSync(path1)
        var i=0;
        var si=setInterval(()=>{
            fp.zip(
                path1+"/"+s, 
                path2+"/"+s.split(".")[0]+".zip", 
                (s)=> {}
            )
            i++;
            process.stdout.write(i+"/"+all.length+"\r")
            if(i===all.length)clearInterval(si)
        },100)
    }
    static test2(){
        const path1="F:/gitHubRepositories/VisibilityAnalysisAndP2P/dist/assets/space8GLB/"
        const path2="F:/gitHubRepositories/VisibilityAnalysisAndP2P/dist/assets/space8Zip/"
        var fp=new FileProcessor()
        var all=fp.fs.readdirSync(path1)
        var i=0;
        var si=setInterval(()=>{
            fp.zip(
                path1+"/"+all[i], 
                path2+"/"+all[i].split(".")[0]+".zip", 
                (s)=> {}
            )
            i++;
            process.stdout.write(i+"/"+all.length+"\r")
            if(i===all.length)clearInterval(si)
        },500)
    }
}
FileProcessor.test2()



