const { readFileSync } = require('fs');
const { writeFileSync } = require('fs');
const filepath='./package.json'
const file = readFileSync(filepath)
const data=JSON.parse(file)
const insertPath=process.argv[2]//electron_split_AnNing_encapsulation/lightWeight2
data.main="./demo/"+insertPath+"/server_detection.js"
const str=JSON.stringify(data, null, 2)
writeFileSync(filepath, str, 'utf8');
  