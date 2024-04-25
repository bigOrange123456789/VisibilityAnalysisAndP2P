const { readFileSync } = require('fs');
const { writeFileSync } = require('fs');
  
function update(filepath,cb){
    const file = readFileSync(filepath)
    const data=JSON.parse(file)
    cb(data)
    const str=JSON.stringify(data, null, 2)
    writeFileSync(filepath, str, 'utf8');
}
const insertPath=process.argv[2]
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