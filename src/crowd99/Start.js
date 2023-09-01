
// import pos from './postprocessing/pos.json'
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { PlayerControl } from '../../lib/playerControl/PlayerControl.js'
import {MapControls,OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
//RGBMLoader
import { Building } from './Building_new.js'
import { LightProducer } from './LightProducer.js'
import {Panel } from './Panel.js'
import {UI } from './UI.js'
import {AvatarManager } from './AvatarManager.js'
import { MoveManager } from '../../lib/playerControl/MoveManager.js'
import { SkyController  } from '../../lib/threejs/SkyController'
import {MyUI} from "./MyUI.js"
import{Postprocessing}from"./postprocessing/Postprocessing.js"
// import{PostprocessingNew}from"./postprocessing/PostprocessingNew"
// const Postprocessing=PostprocessingNew
import{UnrealBloom}from"./postprocessing/UnrealBloom.js"

// import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { TreeManager } from "./TreeManager";
import {CSM} from "../../lib/three/examples/jsm/csm/CSM.js";
THREE.CSM = CSM;
import { TreeBuilder } from "./TreeBuilder";


export class Start{
    constructor(body){
        this.addTool(window)
        this.speed=1
        this.config=window.configALL.src.main
        this.body = body
        this.canvas = document.getElementById('myCanvas')
        window.addEventListener('resize', this.resize.bind(this), false)

        const self=this
        this.initScene();
        
        
        // this.postprocessing=new Postprocessing(this.camera,this.scene,this.renderer)
        this.unrealBloom=new UnrealBloom(this.camera,this.scene,this.renderer)

        self.init()
        this.addMyUI()

        
    }
    addMyUI()
    {
      var ui=new MyUI()
      var height=window.innerHeight
  
      var camera_pos = [
        new THREE.Vector3(48.55640273290092-2,  1.9142025592268763+1,  -7.314690567468844),
        new THREE.Vector3(47.298827892375-2,  1.7232932395224025+1,  -7.348360792773678),
        new THREE.Vector3( -58.92759054201366, 39.57529059951184,  -130.21318894586796),
        new THREE.Vector3(-1.0911605157232827,  0.7075214699744158+1,  -99.90313103529786-0.5),
        new THREE.Vector3( -64.39189399430883,  8.99856114154391+1,  -74.3016535116766),
        new THREE.Vector3( -1.5994877198648538,  1.4997407676957795+0.5,  -77.1512219063800),
        new THREE.Vector3( -54.63874349381954,  18.532468360185952,  46.071540822),
        
        
      ]
      var camera_tar = [
        new THREE.Vector3( 51.03516532171532-2,  2.290497364346837+1,  -7.248324342451475),
        new THREE.Vector3( 51.03516532171532-2,  2.290497364346837+1,  -7.248324342451475),
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(-0.9868855788301696,  0.7075214699744165+1,  -99.03513139079297-0.5),
        new THREE.Vector3( -65.34712509322323,  9.472649100434154+1,  -69.41033714095124),
        new THREE.Vector3(-1.9992580266994615,  1.6314769709077197+0.5,  -59.25814512545),
        new THREE.Vector3( -66.03747192556759,  9.679838586814231,  41.845030134054),
        
      ]
      var inf = {
        '视点7':6,
        '视点6':5,
        '视点5':4,
        '视点4':3,
        '视点3':2,
        '视点2':1,
        '视点1':0,
      }
  
      var self = this;
      var names=Object.keys(inf)
      for(let i=0; i<names.length; i++){
        new ui.Button(names[i], "#D4D80B", '#DAA520', '#FFFACD',
            30, 10,
            150, 45,
            10,height-60*(i+1.5),()=>{
              var id = inf[names[i]]
              self.camera.position.copy(camera_pos[id])
              self.camera.lookAt(camera_tar[id])
              self.orbitControl.target = camera_tar[id].clone()
            });
      }
    }
    init(){
        const self=this
        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)
        // this.test()
        
        // this.initSky()
        this.initWander()
        if(false)
        this.panel = new Panel(this)
        this.lightProducer=new LightProducer(this.scene,this.camera)
        // this.loadJson(
        //     "LoadingProgressive/pos.json",
        //     data=>{
                let data=null
                // setTimeout(()=>{
                //     console.log("data",data)
                // new TreeManager(self.scene).init(data) 
                // })
                // if(typeof AvatarManager!=="undefined")
                // for(let i=0;i<2;i++)
                    new AvatarManager(self.scene,self.camera,data)
                // self.TreeManager.init(data) 
            // }
        // )
        // self.TreeManager = new TreeManager(self.scene,data) 
          
        this.initCSM();

        this.building = new Building(this.scene, this.camera)
        this.ui=new UI(this)
        // console.log(this.csm)
        // console.log(this.lightProducer.ambient)
        // window.capture=()=>{
        //     self.capture()
        // }
        // new Test2(this.scene)

        
        // this.getCubeMapTexture('assets/textures/environment/skybox.hdr').then(
        //     ({ envMap }) => {
        //       self.scene.background = envMap
        //       self.scene.backgroundIntensity=0.8
        //     }
        //   )
        // this.getCubeMapTexture('assets/textures/environment/skybox.jpg').then(
        //     ({ envMap }) => {
        //       self.scene.background = envMap
        //       self.scene.backgroundIntensity=0.8

        //       self.scene.backgroundIntensity=0.4
        //       self.unrealBloom.bloomPass.strength=0.55
        //     }
        // )
        this.getCubeMapTexture('assets/textures/environment/skybox.jpg').then(
        //this.getCubeMapTexture('assets/textures/environment/footprint_court_2k.hdr').then(
            ({ envMap }) => {
              self.scene.environment = envMap
              self.scene.background = envMap//test
              self.scene.backgroundIntensity=0.1
              self.unrealBloom.bloomPass.strength=1.5
              window.scene=self.scene
            }
        )
    }
    initScene(){
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
            45,//(this.config["FlipY"]?-1:1)*30,//50,
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
        // this.camera.position.set(-308.56840222832017, 10, 166.02712517757053)
        // this.camera.rotation.set( -2.291182507503793,  1.0271322042424738, 2.368845340479064)
        // this.camera.position.set(-397.3510808960445,  10,  232.54895927846817)
        this.camera.rotation.set( -0.676092545575108,  -0.9466703787193923,  -0.5770638807113051)
        this.camera.position.set(-619.3575551181109,  131.13974398725637,  -20.75165234572438)

        window.camera=this.camera
        
        this.scene.add(this.camera)
        window.scene=this.scene

        // this.playerControl=new PlayerControl(this.camera,this.config["FlipY"])
        // this.playerControl.target.set(
        //     this.config.camera.target.x,
        //     this.config.camera.target.y,
        //     this.config.camera.target.z
        // )
        // this.playerControl.mode.set("viewpoint")
        // this.playerControl.speed.moveBoard =this.config.speed     //this.config.speed.moveBoard//1
        // this.playerControl.speed.moveWheel0=this.config.speed*0.01//this.config.speed.moveWheel0//0.01

        this.orbitControl = new OrbitControls(this.camera,this.renderer.domElement)
        window.orbitControl=this.orbitControl
        // this.orbitControl.target.set(
        //     -340.67888298324596, 
        //     8.573750000000038,  
        //     199.38166396137652
        // )
        // this.camera.lookAt(
        //     -340.67888298324596, 
        //     8.573750000000038,  
        //     199.38166396137652
        // )
        this.camera.position.set(-43.486343682038736,  2.127206120237504,  -8.698678933445201)
        this.camera.lookAt(0,0,0)

        // this.playerControl.target.set(
        //     this.config.camera.target.x,
        //     this.config.camera.target.y,
        //     this.config.camera.target.z
        // )
        // this.orbitControl.target = camera_tar[id].clone()

        


    }

    initCSM() {

        //window.material.side = THREE.BackSide;
        this.csm = new THREE.CSM({
            fade: true,
            maxFar: this.camera.far,
            cascades: 4,//4,
            shadowMapSize: 1024,//1024,
            lightDirection: new THREE.Vector3(0.5, -1, 1).normalize(),
            camera: this.camera,
            parent: this.scene,
            lightIntensity: 2.9,
            // lightColor: new THREE.Color(0xf7f2d9),
            shadowBias: -0.0004,
            mode: 'practical',
            lightMargin: 200
        });
        window.csm=this.csm
        //this.csm.lightIntensity = 1000;
        //let mesh = new THREE.Mesh(new THREE.BoxGeometry(), material);
        //mesh.castShadow = true;
        //mesh.receiveShadow = true;

        //this.scene.add(mesh);();
    }
    getCubeMapTexture_old(path) {
        return new Promise((resolve, reject) => {//'.exr'
            new THREE.TextureLoader()
            //.setDataType(THREE.FloatType)
            .load(
                path,
                texture => {

                const envMap =texture

                resolve({ envMap })
                },
                undefined,
                reject
            )
        })
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