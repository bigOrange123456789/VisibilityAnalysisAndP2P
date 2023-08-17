//https://blog.csdn.net/lyy180236/article/details/115553624
//npm install webpack --save-dev
//npm install webpack-cli --save-dev

//common JS模块
module.exports = {
    entry: './src/LoadingProgressive/main.js',
    output: {
        path: __dirname + '/src/LoadingProgressive',  
        filename: 'index.js'  
    }
};
//ES6 模块
//....