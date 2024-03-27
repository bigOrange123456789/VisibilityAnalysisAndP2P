const inpath="../../../dist/assets/project1/temp"
const outpath="../../../dist/assets/project1"

var fs = require('fs');
var archiver = require('archiver');

const start = 0
var matrix_list = []

readJSON()
// compress()

function readJSON(){
    fs.readFile(inpath+"/structdesc.json","utf8",(err,dataStr1)=>{
        let struct_desc = JSON.parse(dataStr1)
        fs.readFile(inpath+"/smatrix.json","utf8",(err,dataStr2)=>{
            let matrix_map = JSON.parse(dataStr2)
            for(let i=0; i<struct_desc.length; i++)
                for(let j=0; j<struct_desc[i].length; j++)
                    matrix_list.push(matrix_map[struct_desc[i][j].n].it)
            splitJSON()
        })
    })
}

function splitJSON(){
    var i = start
    end = matrix_list.length
    var processing = setInterval(()=>{
        process.stdout.write("W "+i+"\t / "+end+"\r")
        const result = JSON.stringify(matrix_list[i])
        fs.writeFile(inpath+"/matrix"+i+".json",result,(err)=>{})
        // fs.writeFile("./input/matrix/matrix"+i+".json",result,(err)=>{})
        if(++i===end){
            clearInterval(processing)
            compress()
        }
    },10)
}

function compress(){
    process.stdout.write("              \r")
    var i = start
    var processing = setInterval(()=>{
        process.stdout.write("C "+i+"\r")
        zip(i)
        if(++i===end) clearInterval(processing)
    },50)
}

function zip(index){
    let output = fs.createWriteStream(outpath+'/'+index.toString()+'.zip')
    // let output = fs.createWriteStream('output/'+index.toString()+'.zip')
    var archive = archiver('zip', {zlib:{level:9}})
    archive.pipe(output)
    var filename1 = 'matrix'+index.toString()+'.json'
    archive.append(fs.createReadStream(inpath+'/matrix'+index.toString()+'.json'), {name:filename1})
    //archive.append(fs.createReadStream('./input/matrix/matrix'+index.toString()+'.json'), {name:filename1})
    var filename2 = 'model'+index.toString()+'.gltf'
    archive.append(fs.createReadStream(inpath+'/model'+index.toString()+'.gltf'), {name:filename2})
    // archive.append(fs.createReadStream('./input/model/model'+index.toString()+'.gltf'), {name:filename2})
    archive.finalize()
}
