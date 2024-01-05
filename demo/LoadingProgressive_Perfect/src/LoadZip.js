import {
    LoadingManager,
    Mesh
} from "three";
// import { GLTFLoaderEx } from "./threeEx/GLTFLoaderEx.js";
// import { GLTFLoader } from "./threeEx/GLTFLoader2";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'//
import {CrossDomain} from './myWorker/CrossDomain.js';
import {RequestOrderManager} from './myWorker/RequestOrderManager.js';
// const loadSubZip3_worker0=new Worker("./myWorker/loadSubZip.js")
import { DRACOLoader } from './myWorker/dracoLoader/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('assets/textures/draco/');
dracoLoader.setDecoderConfig({ type: "js" });
dracoLoader.preload();

export class LoadZip{
    sceneName="space8Zip"
    type=2//0//2//1//2
    constructor(back){
        if(this.type==1){//单线程
            this._loadSubZip3_init_single(back)
            this.load=this._loadSubZip3_single
        } else if (this.type==2){//双线程
            this._loadSubZip3_init_double(back)
            this.load=this._loadSubZip3_double
        } else if (this.type==0){//初始使用单线程 然后过渡到双线程
            this._loadSubZip3_init_single(back)
            this.load=this._loadSubZip3_single
            
            this._loadSubZip3_init_double(back)
        } else {
            console.log("LoadZip type错误")
        }
    }
    load(list){}

    initDoubleFinish=false
    _loadSubZip3_init_double (back){
        console.log("双线程")
        const self=this
        // if(typeof loadSubZip3_worker0!=undefined)this._loadSubZip3_worker1=loadSubZip3_worker0
        // else 
        this._loadSubZip3_worker1=new Worker("./myWorker/loadSubZip.js")
        this._loadSubZip3_worker1.onmessage=ev=>{
            if(ev.data.first){
                self.initDoubleFinish=true
                self.load=self._loadSubZip3_double
                console.log("double_init",Math.round(performance.now()-window.time0))
                return
            }
            var matrixConfig=ev.data.matrixConfig
            var structdesc0=ev.data.structdesc0
            var meshIndex=ev.data.meshIndex
            const manager = new LoadingManager();
            var loader//=new GLTFLoader(manager)
            ///////////////////////////////////////////
            const useDraco=true//false//true
            if(useDraco){
                // THREE.Cache.enabled = true;
                
                loader = new GLTFLoader(manager);
                
                loader.setDRACOLoader(dracoLoader);
            }else{
                loader = new GLTFLoader(manager);
            }
            ///////////////////////////////////////////
            loader.parse( 
                ev.data.myArray, 
                "./",
                gltf=>{
                    var m1 = null//gltf.scene.children[0].children[0]
                    gltf.scene.traverse(o=>{
                        if(o instanceof Mesh){ m1=o }
                    })
                    // console.log("double",Math.round(performance.now()-window.time0))
                    back(m1,meshIndex,matrixConfig,structdesc0,ev.data.jsonDataAll)
            })
        }
        this._loadSubZip3_worker1.postMessage({//开始请求
            type:"start",
            "sceneName":this.sceneName
        })
    }
    _loadSubZip3_double (list){
        this._loadSubZip3_worker1.postMessage({//开始请求
            type:"list",
            list:list,
            "sceneName":this.sceneName
        })
    }
    _loadSubZip3_init_single (back){//单线程
        console.log("单线程")
        var crossDomain=new CrossDomain()
        var requestOrderManager=new RequestOrderManager({
              loaded:[],
              stackSize:10000,
              waitNumberMax:9000,//300,//100,//150,
              crossDomain:crossDomain
        })
        // setTimeout(()=>{
        //       requestOrderManager.waitNumberMax=600//300
        // },500)
        this._requestOrderManager1=requestOrderManager
    
        window.loadSubZip3_worker_onmessage1=opt=>{
            var matrixConfig=opt.matrixConfig
            var structdesc0=opt.structdesc0
            var meshIndex=opt.meshIndex
            var m1 = null//opt.glb.scene.children[0].children[0]
            opt.glb.scene.traverse(o=>{
                if(o instanceof Mesh){ m1=o }
            })
            // console.log("single",Math.round(performance.now()-window.time0))
            back(m1,meshIndex,matrixConfig,structdesc0,opt.jsonDataAll)
        }
    }
    _loadSubZip3_single (list){//单线程
        this._requestOrderManager1.addDemand(list,this.sceneName)
    }
}