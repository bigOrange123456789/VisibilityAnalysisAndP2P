const fs = require('fs')
const count=275809
const result=[]
for(let i=0;i<count;i++){
    result.push(0)
}
let files = fs.readdirSync("./cube");
for(let i=0;i<files.length;i++){
    const f=files[i].split(".json")[0]
    const j=parseInt(f)
    result[j]=1
}
files = fs.readdirSync("./cylinder");
for(let i=0;i<files.length;i++){
    const f=files[i].split(".json")[0]
    const j=parseInt(f)
    result[j]=2
}
const str=JSON.stringify(result)
fs.writeFile(__dirname + "/" + "result.json", str, function (err) {
    if (err) {
      console.log(err);
    } else {
      //console.log("save success");
    }
  });