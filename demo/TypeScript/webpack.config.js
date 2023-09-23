//https://blog.csdn.net/lyy180236/article/details/115553624
//npm install webpack --save-dev
//npm install webpack-cli --save-dev

//common JS模块
// const path="LoadingProgressive"
// const path="crowd99"
// const path="crowdEditor"
module.exports = {
    mode: 'development',// 模式，不给会黄色警告！
    entry: './src/main.js',
    output: {
        path: __dirname ,  
        filename: 'index.js'  
    },
    module: {
        rules: [
          {
            test: /\.tsx?$/, // 匹配 .ts 或 .tsx 文件
            use: 'ts-loader', // 使用 ts-loader 处理 TypeScript 文件
            exclude: /node_modules/, // 排除 node_modules 目录
          },
        ],
      },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'], // 解析这些文件的扩展名
    },
};
//ES6 模块
//....