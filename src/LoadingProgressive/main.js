import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { PlayerControl } from '../../lib/playerControl/PlayerControl.js'
import {MapControls,OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
//RGBMLoader
import { Building } from './Building.js'
import { LightProducer } from './LightProducer.js'
import config from '../../config/configOP.json'
import {Panel } from './Panel.js'
import {AvatarManager } from './AvatarManager.js'
import { MoveManager } from '../../lib/playerControl/MoveManager.js'
export class Loader{
    constructor(body){
        this.config=config.src.main
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
        this.wanderList=[
            new MoveManager(this.camera, [
            [-116237.6,-1530.26,11978.66,   -0.11063,-1.49565,-0.11032, 1000]
            ,[-54865.63,-1530.26,13039.32,  -2.1177,-1.5529,-2.11778,   1000]
            ,[-36767.63,-1530.26,-1362.69   ,-0.00625,-1.0161,-0.00531, 1000]
            ,[55787.57,-1530.26,-1737.73,   1.8086,-1.5059,1.80908,    1000]
            ,[-44907.4,-1530.26,12147.79,2.04046,1.51057,-2.0412,1000]
            ]),
            new MoveManager(this.camera, [
                [-32115.98,-7430.26,13644.9,1.52432,-1.38584,1.52352,1000],
                [13590.9,-7430.26,13247.66,1.52432,-1.38584,1.52352,1000],
                [85050.92,-7430.26,12626.6,0.26428,0.39225,-0.10309,1000],
                [85167.57,-7430.26,-1571.08,1.02457,1.26256,-1.00292,1000],
                [11514.32,-7430.26,-2564.01,1.54904,1.39331,-1.5487,1000],
                [-35731.63,-7430.26,-2748.36,2.87731,-0.45912,3.02224,1000]
            ]),
            new MoveManager(this.camera, [
                [-54079.8,-12230.26,14735.95,0.61764,-1.22167,0.58858,1000],
                [96813.41,-12230.26,12620.34,0.19579,0.89129,-0.15308,1000],
                [94847.93,-12230.26,-3258.34,0.93118,1.47867,-0.92916,1000],
                [-51565.47,-12230.26,-2663.95,1.87617,1.43547,-1.87883,1000]
            ])
        ]
        
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
        this.playerControl.speed.moveBoard=1

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
    new Loader(document.body)
})
