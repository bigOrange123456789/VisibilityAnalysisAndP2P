//localhost:8080
var data0=""
require('http').createServer(function (request, response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    request.on('data', function (data) {//接受请求
        data=data.toString()
        try{
            saveJson(JSON.parse(data0))//saveStr(data0)//
        }catch (e) {
            data0=data0+data
            try{
                saveJson(JSON.parse(data0))//saveStr(data0)//
                data0=""
            }catch(e){
            }
        }
    });
    request.on('end', function () {//返回数据
        response.write("finish");//发送字符串
        response.end();
    });
}).listen(9999, '0.0.0.0', function () {
    console.log("Listening port: 9999");
});

function saveJson(json0) {
    var name="detection/"+Math.random()+".json"
    var fs=require('fs')
    try{
        fs.writeFile(name,JSON.stringify(json0 , null, "\t"), function(){});
        // fs.writeFile(name, JSON.stringify(json0 , null, "\t") , function(){});
    }catch (e) {
        console.log(2,e)
    }
}
function saveStr(str0) {
    console.log("0")
    var name="detection/"+Math.random()+".json"
    var fs=require('fs')
    try{
        console.log("str0",str0)
        fs.writeFile(name,str0, function(){});
        // fs.writeFile(name, JSON.stringify(json0 , null, "\t") , function(){});
    }catch (e) {
        console.log(2,e)
    }
}