var fs = require('fs');
var archiver = require('archiver');
class SplitCompress{
    constructor(opt){
        opt.inpath=opt.inpath?opt.inpath:opt.savePath+"/temp"
        opt.outpath=opt.outpath?opt.outpath:opt.savePath
        this.opt=opt
        this.start = 0
        this.matrix_list = []
        this.end

        const self=this
        fs.readFile(self.opt.inpath+"/structdesc.json","utf8",(err,dataStr1)=>{
            let struct_desc = JSON.parse(dataStr1)
            fs.readFile(self.opt.inpath+"/smatrix.json","utf8",(err,dataStr2)=>{
                let matrix_map = JSON.parse(dataStr2)
                for(let i=0; i<struct_desc.length; i++)
                    for(let j=0; j<struct_desc[i].length; j++)
                        self.matrix_list.push(matrix_map[struct_desc[i][j].n].it)
                self._splitJSON()
            })
        })
    }
    _splitJSON(){
        const self=this
        var i = this.start
        this.end = this.matrix_list.length
        var processing = setInterval(()=>{
            process.stdout.write("W "+i+"\t / "+self.end+"\r")
            const result = JSON.stringify(self.matrix_list[i])
            fs.writeFile(self.opt.inpath+"/matrix"+i+".json",result,(err)=>{})
            // fs.writeFile("./input/matrix/matrix"+i+".json",result,(err)=>{})
            if(++i===self.end){
                clearInterval(processing)
                self._compress()
            }
        },10)
    }
    _compress(){
        process.stdout.write("              \r")
        const self=this
        var i = this.start
        var processing = setInterval(()=>{
            process.stdout.write("C "+i+"\r")
            self._zip(i)
            if(++i===self.end) {
                clearInterval(processing)
                console.log("Program execution completed!")
                if(self.opt.app)self.opt.app.quit();
            }
        },50)
    }
    _zip(index){
        let output = fs.createWriteStream(this.opt.outpath+'/'+index.toString()+'.zip')
        // let output = fs.createWriteStream('output/'+index.toString()+'.zip')
        var archive = archiver('zip', {zlib:{level:9}})
        archive.pipe(output)
        var filename1 = 'matrix'+index.toString()+'.json'
        archive.append(fs.createReadStream(this.opt.inpath+'/matrix'+index.toString()+'.json'), {name:filename1})
        //archive.append(fs.createReadStream('./input/matrix/matrix'+index.toString()+'.json'), {name:filename1})
        var filename2 = 'model'+index.toString()+'.gltf'
        archive.append(fs.createReadStream(this.opt.inpath+'/model'+index.toString()+'.gltf'), {name:filename2})
        // archive.append(fs.createReadStream('./input/model/model'+index.toString()+'.gltf'), {name:filename2})
        archive.finalize()
    }
}
// new SplitCompress()
module.exports = {
    SplitCompress
}