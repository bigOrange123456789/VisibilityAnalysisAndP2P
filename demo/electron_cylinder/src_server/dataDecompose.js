const fs = require('fs')
const type="cylinder"
const { readFileSync } = require('fs');
const data = readFileSync('./data/'+type+'.json');
console.log("data",data)
const param=JSON.parse(data.toString())
// console.log("param",param)
for(let id in param){
  try {
    console.log(id)
    const data0 = JSON.stringify(param[id])//JSON.stringify(param[id], null, 4);
    fs.writeFileSync('./data/'+type+'/'+id+'.json', data0);
  } catch (error) {
    console.error(id,error);
  }
}
console.log("finish!")