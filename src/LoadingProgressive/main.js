import config from '../../config/configOP8.json'
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { PlayerControl } from '../../lib/playerControl/PlayerControl.js'
import {MapControls,OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
//RGBMLoader
import { Building } from './Building.js'
import { LightProducer } from './LightProducer.js'
import {Panel } from './Panel.js'
import {AvatarManager } from './AvatarManager.js'
import { MoveManager } from '../../lib/playerControl/MoveManager.js'
import { Sky } from '../../lib/threejs/Sky.js'
export class Loader{
    constructor(body){
        this.config=window.configALL.src.main
        this.body = body
        this.canvas = document.getElementById('myCanvas')
        window.addEventListener('resize', this.resize.bind(this), false)

        this.initScene()
        this.initSky()
        this.initWander()
        this.panel=new Panel(this)
        this.building=new Building(this.scene,this.camera)
        new AvatarManager(this.scene,this.camera)
    }
    async initScene(){
        this.renderer = new THREE.WebGLRenderer({
            alpha:true,
            antialias: true,
            canvas:this.canvas,
            preserveDrawingBuffer:true
        })

        this.renderer.setSize(this.body.clientWidth,this.body.clientHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        window.renderer=this.renderer
        this.body.appendChild(this.renderer.domElement)


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
            (config["FlipY"]?-1:1)*50,
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

        this.playerControl=new PlayerControl(this.camera,config["FlipY"])
        this.playerControl.target.set(
            this.config.camera.target.x,
            this.config.camera.target.y,
            this.config.camera.target.z
        )
        this.playerControl.mode.set("viewpoint")
        this.playerControl.speed.moveBoard=this.config.speed.moveBoard//1
        this.playerControl.speed.moveWheel0=this.config.speed.moveWheel0//0.01

        // this.orbitControl = new OrbitControls(this.camera,this.renderer.domElement)
        // this.orbitControl.target = camera_tar[id].clone()


        this.light=new LightProducer().scene
        this.scene.add(this.light)
        this.animate = this.animate.bind(this)
        
        requestAnimationFrame(this.animate)
    }
    animate(){
        this.light.position.set(this.camera.position.x,this.camera.position.y,this.camera.position.z)
        this.stats.update()
        // console.log(this.config)
        if(this.config.render!=="false")
            this.renderer.render(this.scene,this.camera)
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
        const self=this
        let sky = new Sky();
        sky.scale.setScalar( 450000 );
        this.scene.add( sky );
        let sun = new THREE.Vector3();
        let effectController = {
            turbidity: 0.01,//1,//10,//光晕强度
            rayleigh: 0.5,//1,//3,//红色强度
            mieCoefficient: 0.0001,//0.005,//光晕强度
            mieDirectionalG: 0.01,//0.7,//光晕强度
            elevation: 20,//5,//2,  //俯仰角
            azimuth: 180,      //偏航角
            exposure: this.renderer.toneMappingExposure/100 //this.renderer.toneMappingExposure
        }
        function guiChanged(effectController,sun) {
            const uniforms = sky.material.uniforms;
            uniforms[ 'turbidity' ].value = effectController.turbidity;
            uniforms[ 'rayleigh' ].value = effectController.rayleigh;
            uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
            uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

            const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
            const theta = THREE.MathUtils.degToRad( effectController.azimuth );

            sun.setFromSphericalCoords( 1, phi, theta );

            uniforms[ 'sunPosition' ].value.copy( sun );

            self.renderer.toneMappingExposure = effectController.exposure;
            self.renderer.render( self.scene, self.camera );
        }
        guiChanged(effectController,sun)
    }
    initWander() {
        this.wanderList=[]
        for(let i=0;i<this.config.pathList.length;i++)
            this.wanderList.push(
                new MoveManager(this.camera, this.config.pathList[i])
            )
        if(this.config.autoMove=="true"){
            const pathId=Math.floor(Math.random()*this.wanderList.length)
            this.wanderList[pathId].stopFlag=false
        }else if(this.config.autoMove!==null){
            const pathId=parseInt(this.config.autoMove)
            console.log(this.config.autoMove,pathId)
            this.wanderList[pathId].stopFlag=false
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const getParam=id=>{
        id=id+"="
        return window.location.search.split(id).length>1?
                window.location.search.split(id)[1].split("&")[0]:
                null
    }
    config.src.main.autoMove=getParam('autoMove')
    config.src.main.render  =getParam('render')
    config.src.Detection.backURL=getParam('backURL')
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
    window.configALL=config
    new Loader(document.body)
})
