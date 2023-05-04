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
export class Loader{
    constructor(body){
        this.config=window.configALL.src.main
        this.body = body
        this.canvas = document.getElementById('myCanvas')
        window.addEventListener('resize', this.resize.bind(this), false)
        
        this.initScene()
        this.initWander()
        this.panel=new Panel(this)
        this.building=new Building(this.scene,this.camera)
        // if(!new URLSearchParams(window.location.search).has("autoMove"))
        //     new AvatarManager(this.scene,this.camera)
    }
    initWander() {
        this.wanderList=[]
        for(let i=0;i<this.config.pathList.length;i++)
            this.wanderList.push(
                new MoveManager(this.camera, this.config.pathList[i])
            )
        if(window.location.search.split("autoMove=true").length>1){
            const pathId=Math.floor(Math.random()*this.wanderList.length)
            this.wanderList[pathId].stopFlag=false
        }
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
        if(!(window.location.search.split("render=false").length>1))
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
}
document.addEventListener('DOMContentLoaded', () => {
    window.configALL=config
    new Loader(document.body)
})
