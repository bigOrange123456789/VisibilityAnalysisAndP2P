import {
    FileLoader,
    Group, InstancedMesh,
    LoadingManager, Object3D,
    Matrix4, 
    Vector3, CylinderGeometry, 
    MeshStandardMaterial,MeshBasicMaterial,
    BufferGeometry,BufferAttribute,Color,CanvasTexture,Vector2,
    TextureLoader,RepeatWrapping
} from "three";
import { Engine3D } from '../src/main.js'
import { ZipLoader } from "./ziploader.js";
import { GLTFLoaderEx } from "./threeEx/GLTFLoaderEx.js";
import {Water} from "./threeEx/Water2.js";

import {CrossDomain} from './myWorker/CrossDomain.js';
import {RequestOrderManager} from './myWorker/RequestOrderManager.js';
export class LoadZip{
    sceneName="ExhibitionHall"
    type=2
    constructor(back){
        if(this.type==1)this._loadSubZip3_init_single(back)
        else this._loadSubZip3_init_double(back)
        //back(m1,meshIndex,matrixConfig,structdesc0)
    }
    load(list){
        if(this.type==1)this._loadSubZip3_single (list)
        else this._loadSubZip3_double(list)
    }
    _loadSubZip3_init_double (back){
        console.log("双线程")
        if(window.loadSubZip3_worker0)window.loadSubZip3_worker=window.loadSubZip3_worker0
        else window.loadSubZip3_worker=new Worker("./myWorker/loadSubZip.js")
        window.loadSubZip3_worker.onmessage=ev=>{
            var matrixConfig=ev.data.matrixConfig
            var structdesc0=ev.data.structdesc0
            var meshIndex=ev.data.meshIndex
            const manager = new LoadingManager();
            var loader=new GLTFLoaderEx(manager)
            loader.parse( 
                ev.data.myArray, 
                "./",
                gltf=>{
                    var m1 = gltf.scene.children[0].children[0]
                    // console.log(m1,meshIndex,matrixConfig,structdesc0,ev.data.jsonDataAll)
                    // return
                    back(m1,meshIndex,matrixConfig,structdesc0,ev.data.jsonDataAll)
            })
        }
        const self=this
        window.loadSubZip3_worker.postMessage({//开始请求
            type:"start",
            "sceneName":self.sceneName//:window.param.projectName
        })
    }
    _loadSubZip3_double (list){
        window.loadSubZip3_worker.postMessage({//开始请求
            type:"list",
            list:list,
            "sceneName":this.sceneName//window.param.projectName
        })
    }
    _loadSubZip3_init_single (back){//单线程
        console.log("单线程")
        var crossDomain=new CrossDomain()
        var requestOrderManager=new RequestOrderManager({
              loaded:[],
              stackSize:10000,
              waitNumberMax:300,//100,//150,
              crossDomain:crossDomain
        })
        setTimeout(()=>{
              requestOrderManager.waitNumberMax=600//300
        },500)
        // requestOrderManager.addDemand(
        // 	Array.from(Array(1000)).map((e, i) => i)
        // )
        window.requestOrderManager=requestOrderManager
    
        window.loadSubZip3_worker_onmessage=opt=>{
            var matrixConfig=opt.matrixConfig
            var structdesc0=opt.structdesc0
            var meshIndex=opt.meshIndex
            // const manager = new LoadingManager();
            // var loader=new GLTFLoaderEx(manager)
            // loader.parse( 
            // 	opt.myArray, 
            // 	"./",
            // 	gltf=>{
            // 		var m1 = gltf.scene.children[0].children[0]
            // 		back(m1,meshIndex,matrixConfig,structdesc0)
            // })
            // console.log(opt.jsonDataAll,"...")
            var m1 = opt.glb.scene.children[0].children[0]
            // console.log(m1)
            back(m1,meshIndex,matrixConfig,structdesc0,opt.jsonDataAll)
        }
    }
    _loadSubZip3_single (list){//单线程
        window.requestOrderManager.addDemand(list,"ExhibitionHall")
        // window.requestOrderManager.addDemand(list,window.param.projectName)
    }
}