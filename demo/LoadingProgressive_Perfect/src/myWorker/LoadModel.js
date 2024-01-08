// import { GLTFLoaderEx } from "../threeEx/GLTFLoaderEx";//import { GLTFLoaderEx } from '../three/examples/jsm/loaders/GLTFLoaderEx.js';//import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
// import { GLTFLoader } from "../threeEx/GLTFLoader2";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'//
// import { Engine3D } from '../main.js'
import { GLTFLoader } from './GLTFLoaderSim'//
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'//
import { CoderDecoder } from './CoderDecoder.js';
// import JSZip from 'jszip'
import JSZip from 'jszip';
// import { Engine3D } from '../main.js'
import {
    FileLoader,
    LoaderUtils,
    LoadingManager,
    DefaultLoadingManager
    } from "three";//from '../three/build/three';
import { DRACOLoader } from './dracoLoader/DRACOLoader.js';

class LoadModel {//对一个构件的加载处理
  constructor(params) {
    this.crossDomain=params.crossDomain
    this.url=params.url
    this.meshIndex=params.meshIndex
    this.finish_cb=params.finish_cb
    this.arrayBuffers=[] //二进制数据
    this.fileMap={} //储存原始路径和对应blob
    this.modelUrl='' //gltf文件路径
    this.init()
  }
  async init(){
    await this.loadZipFile()
    await this.fileToBlob()
    this.findFile()
    // return
    this.runLoader()
  }
  request0(socket0,cb){//跨域访问请求
    //var path="dist/assets/models/huayi/"+this.meshIndex+".zip"//"assets/models/"+sceneName+"/"+pack_id+".zip",
    var path="dist/"+this.url
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "http://"+socket0, true);
    oReq.responseType = "arraybuffer";
    oReq.onload = ()=>{
        this.arrayBuffers=oReq.response;//ArrayBuffer
        cb()
    }//接收数据
    oReq.onerror=e=>{//异常处理
      setTimeout(()=>{
        this.request0(
          this.crossDomain.getSocket(),//换一台服务器请求
          cb
        )//重新请求
      },1000*(0.5*Math.random()+1))//1~1.5秒后重新加载
      console.log("error",e,path)
    }
    oReq.send(path);//发送请求
  }
  loadZipFile(){
    var socket0=this.crossDomain.getSocket()
    if(socket0){//跨域访问请求
      return new Promise(resolve=>{
        this.request0(
          socket0,
          ()=>resolve()
        )
      })
    }else{//同源访问请求
      return new Promise(resolve => {
        new FileLoader(DefaultLoadingManager)
          .setResponseType("arraybuffer")
          .load(
            this.url,
            data => {
              this.arrayBuffers=data
              resolve()
            },
          )
      })
    }
  }
  async fileToBlob(){
    //zip.js加载文件流生成对应文件:
    const zip = new JSZip();
    const promise = JSZip.external.Promise;
    const baseUrl = 'blob:' + LoaderUtils.extractUrlBase(this.url);
    const pendings = [];
    await zip.loadAsync(this.arrayBuffers);
    //转成blob文件，用URL.createObjectURL创建文件的url
    for (let file in zip.files) {
      const entry = zip.file(file);
      if (entry === null) continue;
      pendings.push(entry.async('blob').then(((file, blob) => {
        this.fileMap[baseUrl + file] = URL.createObjectURL(blob);
      }).bind(this, file)))
    }
    //监听所有请求结束
    await promise.all(pendings);
  }
  findFile(){
    const modelUrl1 = Object.keys(this.fileMap).find(item => /\.(glb)$/.test(item));//模型文件url
    const modelUrl2 = Object.keys(this.fileMap).find(item => /\.(gltf)$/.test(item));//模型文件url
    this.modelUrl = modelUrl1?modelUrl1:modelUrl2
    this.jsonUrl=Object.keys(this.fileMap).find(item => /\.(json)$/.test(item));
  }
  runLoader(){ 
    var scope=this
    const manager = new LoadingManager();//转换处理，传入的是后台返回的路径，需找到对应blob
    manager.setURLModifier(url => {
      return this.fileMap[url] ? this.fileMap[url] : url;
    })
    /////////////////////
        const useDraco=true//false//true
        if(useDraco){
            // THREE.Cache.enabled = true;
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('assets/textures/draco/');
            dracoLoader.setDecoderConfig({ type: "js" });
            this.glbLoader = new GLTFLoader(manager);
            dracoLoader.preload();
            this.glbLoader.setDRACOLoader(dracoLoader);
        }else{
            this.glbLoader = new GLTFLoader(manager);
        }
    /////////////////////
    this.gltfLoader = this.glbLoader//new GLTFLoader(manager)
    // console.log("this.modelUrl",this.modelUrl)
    // return
    // this.modelUrl="blob:assets/models/" +self.projectName +"/model" +index +".gltf"
    this.gltfLoader.load(this.modelUrl, (glb)=> {
      var myArray=this.gltfLoader.myArray
      // console.log("myArray",myArray,glb)
      // console.log("glb",glb)
      // return
      if(!scope.jsonUrl){
        if(typeof(window)!=="undefined"){//单线程
          // console.log("this.meshIndex",this.meshIndex)
          if(window.loadSubZip3_worker_onmessage1)
          window.loadSubZip3_worker_onmessage1({
            "meshIndex":this.meshIndex,
            "myArray":myArray,
            // "matrixConfig":json0.matrixConfig,//matrixConfig,
            // "structdesc0":json0.structdesc0,//structdesc0
            "glb":glb,

            // "jsonDataAll":jsonDataAll
          }) 
        }else{//双线程
            postMessage({
              "meshIndex":this.meshIndex,
              "myArray":myArray,
              "code":CoderDecoder.encoderGltf(glb)
              // "matrixConfig":json0.matrixConfig,//matrixConfig,
              // "structdesc0":json0.structdesc0,//structdesc0

              // "jsonDataAll":jsonDataAll
            }) 
        }
      } else{
        var loadingManager2 = new LoadingManager();
        loadingManager2.setURLModifier(url => {
          return this.fileMap[url] ? this.fileMap[url] : url;
        })
        new FileLoader(loadingManager2).load(
          scope.jsonUrl,
          data0=>{
            var json0=JSON.parse(data0)
            const jsonDataAll=json0
            if(Array.isArray(json0)){
              var matrixConfig={'0':[[],json0]}
              var structdesc=[{'n':'0'}]
              json0={
                matrixConfig:matrixConfig,
                structdesc0:structdesc
              }
            }
            if(typeof(window)!=="undefined"){//单线程
              // console.log("this.meshIndex",this.meshIndex)
              if(window.loadSubZip3_worker_onmessage1)
              window.loadSubZip3_worker_onmessage1({
                "meshIndex":this.meshIndex,
                "myArray":myArray,
                "matrixConfig":json0.matrixConfig,//matrixConfig,
                "structdesc0":json0.structdesc0,//structdesc0
                "glb":glb,

                "jsonDataAll":jsonDataAll
              }) 
            }else{//双线程
                postMessage({
                  "meshIndex":this.meshIndex,
                  "myArray":myArray,
                  "matrixConfig":json0.matrixConfig,//matrixConfig,
                  "structdesc0":json0.structdesc0,//structdesc0

                  "jsonDataAll":jsonDataAll
                }) 
            }
            
            if(scope.finish_cb)scope.finish_cb(this.meshIndex)
          }
        )
      }
      

    })

    

  }
}
export{LoadModel}