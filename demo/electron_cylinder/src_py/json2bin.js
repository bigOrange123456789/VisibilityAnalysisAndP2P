if(false){
    var exec = require('child_process').exec;
    function execute(cmd){
        exec(cmd, function(error, stdout, stderr) {
            if(error){
                console.error(error);
            }
            else{
                console.log("stdout:",stdout)
                console.log("success");
            }
        });
    }
    execute('json2bin.bat');
}

//https://www.zhihu.com/question/584477910/answer/2897496866

if(true){
    console.log=str=>{
        process.stdout.write(str+"\r")
    }
    const { spawn } = require('child_process');
    const ls = spawn('json2bin.bat', []);

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    // ls.stderr.on('data', (data) => {
    // console.error(`stderr: ${data}`);
    // });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}
if(false){
    const { execFile } = require('child_process');
    execFile('json2bin.bat', [], (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        stdout.on('data', (data) => {
            console.log(data); 
        });
    });
}

// const { spawn } = require('child_process');

// // 定义 Python 脚本路径和参数
// const pythonScriptPath = 'json2bin.py';
// const pythonScriptArgs = ['arg1', 'arg2', 'arg3'];

// // 创建子进程，运行 Python 脚本
// const pythonProcess = spawn('python', [pythonScriptPath, ...pythonScriptArgs]);

// // 将 Python 脚本的输出打印出来
// pythonProcess.stdout.on('data', (data) => {
//   console.log(`Python script output: ${data}`);
// });

// // 处理 Python 脚本的错误输出
// pythonProcess.stderr.on('data', (data) => {
//   console.error(`Python script error: ${data}`);
// });

// // 处理 Python 脚本的退出事件
// pythonProcess.on('close', (code) => {
//   console.log(`Python script exited with code ${code}`);
// });