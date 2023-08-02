import config_haiNing0 from '../../config/LoadingProgressive/configOP6.json';
import config_haiNing from '../../config/LoadingProgressive/configOP7.json';
import config_gkd     from '../../config/LoadingProgressive/configOP8.json';
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { PlayerControl } from '../../lib/playerControl/PlayerControl.js'
// import {MapControls,OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
//RGBMLoader
import { Building } from './Building.js'
import { LightProducer } from './LightProducer.js'
import {Panel } from './Panel.js'
import {UI } from './UI.js'
import {AvatarManager } from './AvatarManager.js'
import { MoveManager } from '../../lib/playerControl/MoveManager.js'
import { SkyController  } from '../../lib/threejs/SkyController'

import{Postprocessing}from"./postprocessing/Postprocessing.js"
// import{PostprocessingNew}from"./postprocessing/PostprocessingNew"
// const Postprocessing=PostprocessingNew
import{UnrealBloom}from"./postprocessing/UnrealBloom.js"

// import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { TreeManager } from "./TreeManager";
import {CSM} from "../../lib/three/examples/jsm/csm/CSM.js";

import { TreeBuilder } from "./TreeBuilder";
// import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
export class Main{
    addTool(obj){
        obj.loadJson=(path,cb)=>{
            console.log(path)
            var xhr = new XMLHttpRequest()
            xhr.open('GET', path, true)
            xhr.send()
            xhr.onreadystatechange = ()=> {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var json_data = JSON.parse(xhr.responseText)
                    cb(json_data)
                }
            }
        }
    }
    constructor(body){
        this.addTool(window)
        this.speed=1
        this.config=window.configALL.src.main
        this.body = body
        this.canvas = document.getElementById('myCanvas')
        window.addEventListener('resize', this.resize.bind(this), false)

        this.initScene()
        this.postprocessing=new Postprocessing(this.camera,this.scene,this.renderer)
        //this.unrealBloom=new UnrealBloom(this.camera,this.scene,this.renderer)

        const self=this
        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)
        // this.test()
        
        // this.initSky()
        this.initWander()
        this.panel=new Panel(this)
        this.lightProducer=new LightProducer(this.scene,this.camera)
        // this.building=new Building(this.scene,this.camera)

        this.loadJson(
            "LoadingProgressive/pos.json",
            data=>{
                // setTimeout(()=>{
                //     console.log("data",data)
                // new TreeManager(self.scene).init(data) 
                // })
                // if(typeof AvatarManager!=="undefined")
                    new AvatarManager(self.scene,self.camera,data)
                // self.TreeManager.init(data) 
            }
        )
        // self.TreeManager = new TreeManager(self.scene,data) 
          

        // this.initCSM();
        this.ui=new UI(this)
        
    }
    async initScene(){
        // this.renderer = new THREE.WebGLRenderer({
        //     alpha:true,
        //     antialias: true,
        //     canvas:this.canvas,
        //     preserveDrawingBuffer:true
        // })
        // this.renderer.setSize(this.body.clientWidth,this.body.clientHeight)
        // this.renderer.setPixelRatio(window.devicePixelRatio)
        // this.body.appendChild(this.renderer.domElement)

        // // 渲染器开启阴影效果
        // this.renderer.shadowMap.enabled = true

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,//抗锯齿
            alpha:true,
            canvas:this.canvas
        })
        // this.renderer = new WebGPURenderer()
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)//this.body.clientWidth,this.body.clientHeight)
		// 告诉渲染器需要阴影效果
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMapSoft = true;
		this.renderer.setClearColor(0xcccccc)
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // BasicShadowMap,PCFSoftShadowMap, PCFShadowMap,VSMShadowMap
		this.renderer.shadowMap.autoUpdate = true;
		this.renderer.tonemapping = THREE.NoToneMapping;
        //this.renderer.toneMapping = THREE.ReinhardToneMapping;this.renderer.toneMappingExposure=2.14
		this.renderer.setScissorTest = true;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        this.body.appendChild(this.renderer.domElement)
        window.renderer=this.renderer
        //////////////////////////////////////
		// this.litRenderTarget = new THREE.WebGLRenderTarget(
		// 	window.innerWidth,
		// 	window.innerHeight,
		// 	{
		// 	minFilter: THREE.NearestFilter,
		// 	magFilter: THREE.NearestFilter,
		// 	format: THREE.RGBAFormat,
		// 	type: THREE.FloatType
		// 	}
		// )
        //////////////////


        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute'
        this.stats.domElement.style.left = '0px'
        this.stats.domElement.style.top = '0px'
        var statsContainer = document.createElement('div')
        statsContainer.id = 'stats-container'
        statsContainer.appendChild(this.stats.domElement)
        this.body.appendChild(statsContainer)

        this.scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera(
            (this.config["FlipY"]?-1:1)*30,//50,
            this.body.clientWidth/this.body.clientHeight,
            this.config.camera.near,
            this.config.camera.far)

        window.camera=this.camera
        this.camera.position.set(
            this.config.camera.position.x,
            this.config.camera.position.y,
            this.config.camera.position.z
        )
        this.camera.rotation.set(
            this.config.camera.rotation.x,
            this.config.camera.rotation.y,
            this.config.camera.rotation.z
        )

        window.camera=this.camera
        
        this.scene.add(this.camera)
        window.scene=this.scene

        this.playerControl=new PlayerControl(this.camera,this.config["FlipY"])
        this.playerControl.target.set(
            this.config.camera.target.x,
            this.config.camera.target.y,
            this.config.camera.target.z
        )
        this.playerControl.mode.set("viewpoint")
        this.playerControl.speed.moveBoard =this.config.speed     //this.config.speed.moveBoard//1
        this.playerControl.speed.moveWheel0=this.config.speed*0.01//this.config.speed.moveWheel0//0.01

        // this.orbitControl = new OrbitControls(this.camera,this.renderer.domElement)
        // this.orbitControl.target = camera_tar[id].clone()

        const self=this
        this.getCubeMapTexture('assets/textures/environment/skybox.hdr').then(
            ({ envMap }) => {
              self.scene.background = envMap
              self.scene.backgroundIntensity=0.8
            }
          )
        this.getCubeMapTexture('assets/textures/environment/evn.hdr').then(
        //this.getCubeMapTexture('assets/textures/environment/footprint_court_2k.hdr').then(
            ({ envMap }) => {
              self.scene.environment = envMap
            }
        )


    }

    initCSM() {
        this.csm = new CSM({
            maxFar: this.camera.far,
            cascades: 2,
            shadowMapSize: 1024,
            lightDirection: new THREE.Vector3(1, -1, 1).normalize(),
            camera: this.camera,
            parent: this.scene,
            lightIntensity:1
        });
        let material = new THREE.MeshPhongMaterial(); // works with Phong and Standard materials
        this.csm.setupMaterial(material); // must be called to pass all CSM-related uniforms to the shader
        
    }
    getCubeMapTexture(path) {
        var scope = this
        return new Promise((resolve, reject) => {//'.exr'
            new RGBELoader()
            .setDataType(THREE.FloatType)
            .load(
                path,
                texture => {
                const pmremGenerator = new THREE.PMREMGenerator(scope.renderer)
                pmremGenerator.compileEquirectangularShader()

                const envMap =
                    pmremGenerator.fromEquirectangular(texture).texture
                pmremGenerator.dispose()

                resolve({ envMap })
                },
                undefined,
                reject
            )
        })
    }
    animate() {
        if(this.csm)this.csm.update(this.camera.matrix);
        if(this.stats)this.stats.update()
        if(this.config.render!=="false"){
                if(this.config.useIndirectMaterial){
                    this.scene.traverse(node=>{
                        if(node instanceof THREE.Mesh)
                            if(node.material2)node.material = node.material1
                    })
                    renderer.setRenderTarget(this.litRenderTarget)
                    renderer.render(this.scene, this.camera)
                    this.scene.traverse(node=>{
                        if(node instanceof THREE.Mesh){
                            if(node.material1){
                                node.material = node.material2
                                node.material.uniforms.screenWidth.value = renderer.domElement.width;
                                node.material.uniforms.screenHeight.value = renderer.domElement.height;
                                node.material.uniforms.GBufferd.value = this.litRenderTarget.texture;
                            }
                        }
                    })  
                    renderer.setRenderTarget(null)
                    renderer.render(this.scene,this.camera)
                } else {

                    //const size = renderer.getSize(new THREE.Vector2());
                    //console.log("render size:" + size.width+" "+size.height)
                    //renderer.render(this.scene,this.camera)
                    if(this.unrealBloom)this.unrealBloom.render()//this.composer.render()//
                    else if(this.postprocessing) this.postprocessing.render()
                    else this.renderer.render(this.scene,this.camera)
                    //this.godrays.render()
                }                  
        }
        requestAnimationFrame(this.animate)
    }
    resize(){
        return
        this.canvas.width = window.innerWidth;//this.body.clientWidth
        this.canvas.height = window.innerHeight;//this.body.clientHeight
        this.camera.aspect = this.canvas.width/this.canvas.height;//clientWidth / clientHeight
        this.camera.updateProjectionMatrix()
        if(this.renderer)this.renderer.setSize(this.canvas.width, this.canvas.height)
    }
    initSky() {
        if(this.config.render=="false")return
        new SkyController(this.scene,this.camera,this.renderer)
    }
    setSpeed(){
        if(this.config.pathList)
        for(let i=0;i<this.config.pathList.length;i++)
            for(let j=0;j<this.config.pathList[i].length;j++){
                this.config.pathList[i][j][6]/=this.speed
            }
    }
    initWander() {
        this.setSpeed()
        this.wanderList=[]
        if(this.config.pathList)
        for(let i=0;i<this.config.pathList.length;i++){
            this.wanderList.push(
                new MoveManager(this.camera, this.config.pathList[i])
            )
        }
        const self=this
        setTimeout(()=>{
            if(self.config.autoMove=="true"){
                const pathId=Math.floor(Math.random()*self.wanderList.length)
                // this.wanderList[pathId].stopFlag=false
                // window.pathId=pathId
                self.panel.setWander(pathId)
            }else if(self.config.autoMove!==null){
                const pathId=parseInt(self.config.autoMove)
                // this.wanderList[pathId].stopFlag=false
                // window.pathId=pathId
                self.panel.setWander(pathId)
            }
        },100)
        
    }
    loadJson(path,cb){
        // console.log(path)
        var xhr = new XMLHttpRequest()
        xhr.open('GET', path, true)
        xhr.send()
        xhr.onreadystatechange = ()=> {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var json_data = JSON.parse(xhr.responseText)
                cb(json_data)
            }
        }
    }
}
// document.addEventListener('DOMContentLoaded', () => {
    const getParam=id=>{
        id=id+"="
        return window.location.search.split(id).length>1?
                window.location.search.split(id)[1].split("&")[0]:
                null
    }
    const config=
        getParam('scene')=="haiNing0"?config_haiNing0:
        getParam('scene')=="haiNing"?config_haiNing:
        config_gkd
    config.src.main.speed       =getParam('speed')?getParam('speed'):config.src.main.speed
    config.src.main.autoMove    =getParam('autoMove')
    config.src.main.render      =getParam('render')
    config.src.Detection.backURL=getParam('backURL')
    if(getParam('list2Len'))
        config.src.Visibility.list2Len=parseFloat(getParam('list2Len'))
    if(getParam('testTime'))
        config.src.Detection.testTime=parseFloat(getParam('testTime'))
    if(getParam('maxBackDelay'))
        config.src.Detection.maxBackDelay=parseFloat(getParam('maxBackDelay'))
    if(getParam('backURL')!==null){//backURL需要将autoMove参数传回
        let backURL=getParam('backURL')
        const add=(tag)=>{
            const value=getParam(tag)
            if(value!==null){
                if(backURL.split('?').length>1)backURL+="&"
                else backURL+="?"
                backURL=backURL+tag+"="+value
            }
        }
        add('autoMove')
        add('userId') 
        config.src.Detection.backURL=backURL    
    }
    config.src.main.useIndirectMaterial = config.src.Building_new.useIndirectMaterial
    config.src.Building_new.NUMBER=getParam('NUMBER')
    config.src.Building_new.TIME=getParam('TIME')

    window.configALL=config
    new Main(document.body)
// })
