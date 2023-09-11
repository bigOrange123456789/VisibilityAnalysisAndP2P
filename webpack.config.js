//https://blog.csdn.net/lyy180236/article/details/115553624
//npm install webpack --save-dev
//npm install webpack-cli --save-dev

//common JS模块
// const path="LoadingProgressive"
// const path="crowd99"
const path="crowdEditor"
module.exports = {
    entry: './src/'+path+'/main.js',
    output: {
        path: __dirname + '/src/'+path+'',  
        filename: 'index.js'  
    }
};
//ES6 模块
//....