import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { UI } from "./UI";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { LightProducer } from './LightProducer.js'
import { Building } from './Building.js'
export class Main{
  constructor(body){
      this.initScene(body)
      this.initCameraControl()
      // this.initLight()
      // new UI(this)
      new LightProducer(this.scene)
      this.buiding=new Building(this.scene,this.camera)
      new UI(this.buiding)
      this.animate = this.animate.bind(this)
      requestAnimationFrame(this.animate)
  }
  initCameraControl(){
    const controls = new OrbitControls(this.camera, this.canvas);
    controls.target.set(0, 10, 0);
    controls.update();
  }
  initScene(body){
      this.body = body
      this.canvas = document.getElementById('myCanvas')

      // this.renderer = new THREE.WebGLRenderer({ 
      //     antialias: true,//抗锯齿
      //     alpha:true,
      //     canvas:this.canvas
      // })
      // this.renderer.setPixelRatio(window.devicePixelRatio)
      // this.renderer.setSize(window.innerWidth,window.innerHeight)
      // // 告诉渲染器需要阴影效果
      // this.renderer.shadowMap.enabled = true
      // this.renderer.shadowMapSoft = true;
      // this.renderer.setClearColor(0xcccccc)
      // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap 
      // this.renderer.shadowMap.autoUpdate = true;
      // this.renderer.tonemapping = THREE.NoToneMapping
      // this.renderer.setScissorTest = true;
      // this.body.appendChild(this.renderer.domElement)

      this.renderer = new THREE.WebGLRenderer( { 
        antialias: true ,
        canvas:this.canvas
      } );
			this.renderer.setPixelRatio( window.devicePixelRatio );
			this.renderer.setSize( window.innerWidth, window.innerHeight );
			this.body.appendChild( this.renderer.domElement );
			this.renderer.outputEncoding = THREE.sRGBEncoding;


      this.stats = new Stats();
      this.stats.domElement.style.position = 'absolute'
      this.stats.domElement.style.left = '0px'
      this.stats.domElement.style.top = '0px'
      var statsContainer = document.createElement('div')
      statsContainer.id = 'stats-container'
      statsContainer.appendChild(this.stats.domElement)
      this.body.appendChild(statsContainer)

      this.scene = new THREE.Scene()
      const fov = 45;
      const near = 0.1;
      const far = 10000;

      this.camera = new THREE.PerspectiveCamera(
          fov,//50,
          window.innerWidth/window.innerHeight,
          near,
          far)
      this.camera.position.set( -814,  239,  554)
      window.camera=this.camera
      this.scene.add(this.camera)

      window.addEventListener('resize', this.resize.bind(this), false)
  }
  animate(){
      this.stats.update()
      this.renderer.render(this.scene,this.camera)
      requestAnimationFrame(this.animate)
  }
  resize(){
      this.canvas.width = window.innerWidth;//this.body.clientWidth
      this.canvas.height = window.innerHeight;//this.body.clientHeight
      this.camera.aspect = this.canvas.width/this.canvas.height;//clientWidth / clientHeight
      this.camera.updateProjectionMatrix()
      if(this.renderer)this.renderer.setSize(this.canvas.width, this.canvas.height)
  }
}
new Main(document.body)
document.getElementById("LoadProgress").innerHTML=""