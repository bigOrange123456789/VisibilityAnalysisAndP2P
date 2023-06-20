import config_haiNing0 from '../../config/LoadingProgressive/configOP6.json';
import config_haiNing from '../../config/LoadingProgressive/configOP7.json';
import config_gkd     from '../../config/LoadingProgressive/configOP8.json';
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { PlayerControl } from '../../lib/playerControl/PlayerControl.js'
import {MapControls,OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
//RGBMLoader
import { Building } from './Building.js'
import { LightProducer } from './LightProducer.js'
import {Panel } from './Panel.js'
// import {AvatarManager } from './AvatarManager.js'
import { MoveManager } from '../../lib/playerControl/MoveManager.js'
import { SkyController  } from '../../lib/threejs/SkyController'

import { RenderPass } from "../../lib/threejs/postprocessing/RenderPass.js";
import { ShaderPass } from "../../lib/threejs/postprocessing/ShaderPass.js";
import { UnrealBloomPass} from "../../lib/threejs/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "../../lib/threejs/postprocessing/EffectComposer.js";

export class Loader{
    constructor(body){
        this.speed=1
        this.config=window.configALL.src.main
        this.body = body
        this.canvas = document.getElementById('myCanvas')
        window.addEventListener('resize', this.resize.bind(this), false)

        this.initScene()
        

        
        // this.building=new Building(this.scene,this.camera)
        // return
        this.initSky()
        this.setSpeed()
        this.initWander()
        this.panel=new Panel(this)
        this.building=new Building(this.scene,this.camera)
        if(typeof AvatarManager!=="undefined")
            new AvatarManager(this.scene,this.camera)
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
            antialias: true,
            alpha:true,
            canvas:this.canvas
        })
        this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(this.body.clientWidth,this.body.clientHeight)
		// 告诉渲染器需要阴影效果
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMapSoft = true;
		this.renderer.setClearColor(0xcccccc)
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // BasicShadowMap,PCFSoftShadowMap, PCFShadowMap,VSMShadowMap
		this.renderer.shadowMap.autoUpdate = true;
		this.renderer.tonemapping = THREE.NoToneMapping;
		this.renderer.setScissorTest = true;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.body.appendChild(this.renderer.domElement)
        window.renderer=this.renderer
        //////////////////
        //////////////////////////////////////
		this.litRenderTarget = new THREE.WebGLRenderTarget(
			window.innerWidth,
			window.innerHeight,
			{
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType
			}
		)
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


        this.lightProducer=new LightProducer(this.scene)
        this.animate = this.animate.bind(this)
        this.composer =this.initComposer()
        this.composer2=this.initComposer2()
        
        requestAnimationFrame(this.animate)
    }
    initComposer(){//设置光晕
        var composer = new EffectComposer(renderer)//效果组合器
        composer.addPass(
            new RenderPass(scene, camera)
        );
        composer.addPass(
            new UnrealBloomPass(//创建通道
                new THREE.Vector2(window.innerWidth, window.innerHeight),//参数一：泛光覆盖场景大小，二维向量类型
                0.4,    //参数二：bloomStrength 泛光强度，值越大明亮的区域越亮，较暗区域变亮的范围越广
                2,//0.3,//参数三：bloomRadius 泛光散发半径
                0//0.75//参数四：bloomThreshold 泛光的光照强度阈值，如果照在物体上的光照强度大于该值就会产生泛光
            )
        );
        return composer
    }
    initComposer2(){//设置光晕
        console.log(this.composer)

        // 最终真正渲染到屏幕上的效果合成器 finalComposer 
        const vs="varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}"
        const fs="uniform sampler2D baseTexture;uniform sampler2D bloomTexture;varying vec2 vUv;void main() {gl_FragColor = ( vec4( 0.0 ) * texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );}"
        const shaderPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {//renderTarget1 renderTarget2
                  baseTexture: { value: this.litRenderTarget.texture },
                  bloomTexture: { value: this.composer.renderTarget2.texture },
                },
                vertexShader: vs,
                fragmentShader: fs,
                defines: {},
            }),
            'baseTexture',
        ); // 创建自定义的着色器Pass，详细见下
        shaderPass.needsSwap = true;
        console.log(this.renderer,this.composer.renderTarget2.texture)
            
        const finalComposer = new EffectComposer(renderer)
        finalComposer.addPass(shaderPass)
        // finalComposer.render()
        return finalComposer
    }
    animate(){
        // this.light.position.set(this.camera.position.x,this.camera.position.y,this.camera.position.z)
        this.lightProducer.setPos(this.camera.position)
        this.stats.update()
        // console.log(this.config)
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
                }else{
                    // renderer.render(this.scene,this.camera)

                    // this.camera.layers.set(0);
                    
                    // this.camera.layers.set(1);   
                    // renderer.render(this.scene,this.camera)

                    // renderer.setRenderTarget(this.litRenderTarget)
                    // renderer.render(this.scene,this.camera)
                    this.composer.render()
                    // this.composer2.render()
                    // renderer.setRenderTarget(null)


                }
                  
        }
        requestAnimationFrame(this.animate)
    }
    resize(){
        this.canvas.width = window.innerWidth;//this.body.clientWidth
        this.canvas.height = window.innerHeight;//this.body.clientHeight
        this.camera.aspect = this.canvas.width/this.canvas.height;//clientWidth / clientHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.canvas.width, this.canvas.height)
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
    window.configALL=config
    new Loader(document.body)
// })
