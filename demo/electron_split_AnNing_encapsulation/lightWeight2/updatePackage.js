const { readFileSync } = require('fs');
const { writeFileSync } = require('fs');
// const filepath='./package.json'
// const file = readFileSync(filepath)
// const data=JSON.parse(file)
// const insertPath=process.argv[2]//electron_split_AnNing_encapsulation/lightWeight2
// data.main="./demo/"+insertPath+"/server_detection.js"
// const str=JSON.stringify(data, null, 2)
// writeFileSync(filepath, str, 'utf8');
  
function update(filepath,cb){
    const file = readFileSync(filepath)
    const data=JSON.parse(file)
    cb(data)//data.main="./demo/"+insertPath+"/server_detection.js"
    const str=JSON.stringify(data, null, 2)
    writeFileSync(filepath, str, 'utf8');
}
const insertPath=process.argv[2]//electron_split_AnNing_encapsulation/lightWeight2
update("./package.json",data=>{
    data.main="./demo/"+insertPath+"/server_detection.js"
    return data
})
const sceneName=process.argv[3]
update("./demo/"+insertPath+"/task.json",data=>{
    data.main="./demo/"+insertPath+"/server_detection.js"
    data.id= sceneName+"_output"
    data.inputObjFileFullName= "assets\\models\\"+sceneName+"\\"+sceneName+".obj"
    return data
})