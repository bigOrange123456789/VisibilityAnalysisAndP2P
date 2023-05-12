const port=8396
// const puppeteer = require('puppeteer');
// function test2(n){//npm install puppeteer
//   console.log("n:",n)
//   if(n==0)return
//   (async () => {
    // setTimeout(()=>{
    //     test2(n-1)
    // },500)
//       const browser = await Promise.all([puppeteer.launch()]);
//       const page = await browser.newPage();
//       await page.goto('http://localhost:'+port);
//       console.log(43473)
      
//     // 关闭所有浏览器窗口
//     // await Promise.all(browsers.map(browser => browser.close()));
//   })();
// }test2(1)
const puppeteer = require('puppeteer');
function test2(n){//npm install puppeteer
  console.log(n)
  if(n==0)return
  (async () => {
    setTimeout(()=>{
      test2(n-1)
    },500)
    const browserPromises = []; // 存储浏览器实例的Promise数组
    // 创建5个浏览器窗口
    for (let i = 0; i < 1; i++) {
      browserPromises.push(puppeteer.launch());
    }
    // 等待所有浏览器窗口都打开
    const browsers = await Promise.all(browserPromises);
    // 可以在此处对每个浏览器窗口进行操作
    for (let i = 0; i < browsers.length; i++) {
      const browser = browsers[i];
      const page = await browser.newPage();
      await page.goto('http://localhost:'+port);
      // setTimeout(()=>{
      //   test(n-1)
      // },1000)
      // 在每个浏览器窗口中执行其他操作
    }
    // 关闭所有浏览器窗口
    // await Promise.all(browsers.map(browser => browser.close()));
  })();
}test2(250)