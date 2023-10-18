import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
// import { PlayerControl } from '../../lib/playerControl/PlayerControl.js'
import {MapControls,OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
//RGBMLoader
import { Building } from './Building.js'
import { LightProducer } from './LightProducer.js'
import config from '../config/config.json'
import {Panel } from './Panel.js'
export class Main{
    constructor(body){
        this.config=window.configALL.main
        this.body = body
        this.canvas = document.getElementById('myCanvas')
        window.addEventListener('resize', this.resize.bind(this), false)
        this.panel=new Panel(this)
        this.initScene()        
    }
    async initScene(){
        this.renderer = new THREE.WebGLRenderer({
            alpha:true,
            antialias: true,
            canvas:this.canvas,
            preserveDrawingBuffer:true
        })
        // console.log(this.body.clientWidth,this.body.clientHeight)

        // this.renderer.setSize(
        //     this.body.clientWidth,//window.innerWidth,//
        //     this.body.clientHeight//window.innerHeight//
        //     )
        // this.resize()
        
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
            50,
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
        this.resize()

        // this.playerControl=new PlayerControl(this.camera)
        // this.playerControl.target.set(
        //     this.config.camera.target.x,
        //     this.config.camera.target.y,
        //     this.config.camera.target.z
        // )
        // this.playerControl.mode.set("viewpoint")
        // this.playerControl.speed.moveBoard=100

        this.orbitControl = new OrbitControls(this.camera,this.renderer.domElement)
        // this.orbitControl.target = camera_tar[id].clone()

        new LightProducer(this.scene,this.config.camera.target)
        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)

        this.building=new Building(this.scene,this.panel)
    }
    animate(){
        this.stats.update()
        this.renderer.render(this.scene,this.camera)
        requestAnimationFrame(this.animate)
    }
    resize(){
        this.canvas.width = this.body.clientWidth//window.innerWidth;//
        this.canvas.height = window.innerHeight;//this.body.clientHeight//
        this.camera.aspect = this.canvas.width/this.canvas.height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.canvas.width, this.canvas.height)
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // console.log(
    //         "window.innerHeight:",window.innerHeight,
    //         "document.body.clientHeight:",document.body.clientHeight)
    window.configALL=config
    new Main(document.body)
    console.log(config)
})
import { Engine3D } from '../../../lib/Engine3D.js'
export {Engine3D}