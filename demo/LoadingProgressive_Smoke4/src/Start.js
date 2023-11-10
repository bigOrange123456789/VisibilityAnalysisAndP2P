// import pos from './postprocessing/pos.json'
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
let PlayerControl//import { PlayerControl } from '../../../lib/playerControl/PlayerControl.js'
// import {MapControls,OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
//RGBMLoader
import { Smoke }    from './Smoke/Smoke.js'
import { Building } from './Building.js'
import { LightProducer } from './LightProducer.js'
import {Panel } from './Panel.js'
import {UI } from './UI.js'
// import {AvatarManager } from './AvatarManager.js'
// import {AvatarManager } from './AvatarManager2.js'
// import {Car } from './Car.ts'
// window.car=new Car()
let MoveManager//import { MoveManager } from '../../../lib/playerControl/MoveManager.js'
let SkyController//import { SkyController  } from '../../../lib/threejs/SkyController'

// import{Postprocessing}from"../../lib/postprocessing/Postprocessing.js"
// import{PostprocessingNew}from"../../lib/postprocessing/PostprocessingNew"
// import{UnrealBloom}from"../../lib/postprocessing/UnrealBloom.js"

// import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
// import { TreeManager } from "./TreeManager";
import {CSM} from "three/examples/jsm/csm/CSM.js";//import {CSM} from "../../../lib/three/examples/jsm/csm/CSM.js";
THREE.CSM = CSM;
import { Engine3D } from './main.js'
export class Start{
    constructor(body){
        PlayerControl=Engine3D.PlayerControl
        MoveManager=Engine3D.MoveManager
        SkyController=Engine3D.SkyController

        this.addTool(window)
        this.speed=1
        this.config=window.configALL.main
        this.body = body
        this.canvas = document.getElementById('myCanvas')
        window.addEventListener('resize', this.resize.bind(this), false)

        const self=this
        this.initScene();
        
        // this.postprocessing   =new Postprocessing(this.camera,this.scene,this.renderer)
        // this.postprocessingNew=new PostprocessingNew(this.camera,this.scene,this.renderer)
        // this.unrealBloom=new UnrealBloom(this.camera,this.scene,this.renderer)

        self.init()

    }
    init(){
        const self=this
        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)
        // this.test()
        
        // this.initSky()
        this.initWander()
        // if(false)
        this.panel = new Panel(this)
        this.lightProducer=new LightProducer(this.scene,this.camera)
        
        new Smoke(this.scene,this.camera)
        
        this.getCubeMapTexture('assets/textures/environment/skybox.jpg').then(
            ({ envMap }) => {
              self.scene.background = envMap
              self.scene.backgroundIntensity=0.8
              self.scene.backgroundIntensity=0.4
              if(self.unrealBloom)if(self.unrealBloom.bloomPass)
              self.unrealBloom.bloomPass.strength=0.55
            }
        )
        this.getCubeMapTexture('assets/textures/environment/footprint_court_2k.jpg').then(
            ({ envMap }) => {
              self.scene.environment = envMap
              window.scene=self.scene
            }
        )
    }
    initScene(){
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,//抗锯齿
            alpha:true,
            canvas:this.canvas
        })
        // this.renderer.flag=11102
        // this.renderer = new WebGPURenderer({ 
        //     antialias: true,//抗锯齿
        //     alpha:true,
        //     canvas:this.canvas
        // })
        // this.renderer = new WebGPURenderer()
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)//this.body.clientWidth,this.body.clientHeight)
		// 告诉渲染器需要阴影效果
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMapSoft = true;
		this.renderer.setClearColor(0xcccccc)
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // BasicShadowMap,PCFSoftShadowMap, PCFShadowMap,VSMShadowMap
		this.renderer.shadowMap.autoUpdate = true;
		//this.renderer.tonemapping = THREE.NoToneMapping;
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
            this.config.camera.near,//3,//
            this.config.camera.far//200,//
            )
            // ( 65, width / height, 3, 10 )

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

        this.playerControl=new PlayerControl(this.camera,this.config["FlipY"],true)
        this.playerControl.target.set(
            this.config.camera.target.x,
            this.config.camera.target.y,
            this.config.camera.target.z
        )
        this.playerControl.mode.set("viewpoint")
        this.playerControl.speed.moveBoard =this.config.speed     //this.config.speed.moveBoard//1
        this.playerControl.speed.moveWheel0=this.config.speed*0.01//this.config.speed.moveWheel0//0.01
    }
    getCubeMapTexture(path) {
        var scope = this
        return new Promise((resolve, reject) => {//'.exr'
            new THREE.TextureLoader()
            //.setDataType(THREE.FloatType)
            .load(
                path,
                texture => {
                const pmremGenerator = new THREE.PMREMGenerator(scope.renderer)
                pmremGenerator.compileEquirectangularShader()

                const envMap =//texture
                    pmremGenerator.fromEquirectangular(texture).texture
                pmremGenerator.dispose()

                resolve({ envMap })
                },
                undefined,
                reject
            )
        })
    }
    getCubeMapHDR(path) {
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
                    else if(this.postprocessingNew) this.postprocessingNew.render()
                    else this.renderer.render(this.scene,this.camera)
                    //this.godrays.render()
                }                  
        }
        requestAnimationFrame(this.animate)
    }
    resize(){
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
            const a=this.config.pathList[i]
            for(let j=0;j<a.length;j++){
                a[j][6]*=2//速度减慢
            }
            this.wanderList.push(
                new MoveManager(this.camera, this.config.pathList[i])
            )
        }
        const self=this
        // setTimeout(()=>{
            if(false)
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
        // },1)
        
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
    downloadCanvas(){
        var imgURL = canvas.toDataURL({format: "image/png", quality:1, width:12000, height:4000});
        var dlLink = document.createElement('a');
        dlLink.download = "fileName";
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
    }
    capture() {
        // const canvas = this.renderer.domElement
        // this.camera.aspect = canvas.clientWidth / canvas.clientHeight
        // this.camera.updateProjectionMatrix()
        // const texture = this.unrealBloom.getTexture()
        // const image=texture.image
        // console.log(texture)
        // return

        // const canvas = document.createElement("canvas");
        // canvas.width = image.width;
        // canvas.height = image.height;
        // const context = canvas.getContext("2d");
        // // console.log(context)
        // context.drawImage(image , 0,0);// context.drawImage(image , 0,0,image.width,image.height);

        // let url = canvas.toDataURL("image/jpeg")
        // let a = document.createElement("a"); // 生成一个a元素
        // let event = new MouseEvent("click"); // 创建一个单击事件
        // a.download = "photo.jpg"; // 设置图片名称
        // a.href = url; // 将生成的URL设置为a.href属性
        // a.dispatchEvent(event); // 触发a的单击事件
        // return


        // document.body.appendChild(image);

        this.renderer.render(this.scene, this.camera)
        // console.log(image.toDataURL("image/png"))
        console.log(this.renderer.domElement)
        const imageURL = this.renderer.domElement.toDataURL("image/png")
        const anchor = document.createElement("a")
        anchor.href = imageURL
        anchor.download = "capture.png"
        anchor.click()
      }
}