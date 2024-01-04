import MyUI_config from '../config/MyUI_config.json'
import {
  PMREMGenerator, 
  Scene, 
  WebGLRenderer,
  
} from "../lib/threeEx/three";//'../lib/three/build/three';
import {
  PerspectiveCamera, CameraHelper,
  Raycaster,Vector3, SphereBufferGeometry,
  ACESFilmicToneMapping,
  DirectionalLight,  MathUtils,
  Mesh, MeshBasicMaterial,
  Object3D, PCFSoftShadowMap,
  sRGBEncoding, Vector2,
  TextureLoader, 
} from "three";//'../lib/three/build/three';

import {GUI} from 'dat.gui';
import Stats from "three/examples/jsm/libs/stats.module.js";//'../lib/three/examples/jsm/libs/stats.module.js';
// import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";//'../lib/three/examples/jsm/controls/OrbitControls.js';
import {WanderControl} from "../lib/WanderControl";
// import {CustomizeTree} from "../lib/myTree/CustomizeTree";
// import {TreeBuilder} from "../lib/myTree/TreeBuilder";


import { Engine3D } from './main.js'
// import {AvatarManager } from './AvatarManager.js'
import { TreeManager } from "./TreeBuilder/TreeManager";
import {Lensflares}from"./Lensflares"
export class Viewer
{
  constructor (el, options)
  {
    this.el = el;
    this.options = options;

    this.lights = [];
    this.content = null;

    this.gui = null;

    this.prevTime = 0;

    this.stats = new Stats();
    this.stats.dom.height = '48px';
    [].forEach.call(this.stats.dom.children, (child) => (child.style.display = ''));

    this.scene = new Scene();

    const fov = 60;
    this.defaultCamera = new PerspectiveCamera(fov, el.clientWidth / el.clientHeight, 1, 5000);
    this.activeCamera = this.defaultCamera;
    this.activeCamera.layers.enableAll();
    this.defaultCamera.up.set(0,1,0)

    this.sceneEx = new Scene();
    window.scene=this.sceneEx
    this.sceneEx.add(this.defaultCamera);
    

    this.renderer = window.renderer = new WebGLRenderer({
      antialias: true,
      toneMapping: ACESFilmicToneMapping,
      // toneMappingExposure: 0.5
    });
    window.renderer=this.renderer
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setClearColor(0x66ccff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    this.renderer.autoClear = false;
    // this.renderer.toneMappingExposure = 10//1.25		//色调映射曝光度
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMapSoft = true
    // this.renderer.shadowMap.type = VSMSoftShadowMap;//PCFSoftShadowMap;//this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.unrealBloom=new Engine3D.UnrealBloom(this.defaultCamera,this.sceneEx,this.renderer)

    // window.orbitControl = this.orbitControl = new OrbitControls(this.defaultCamera, this.renderer.domElement);
    // this.orbitControl.autoRotate = false;
    // this.orbitControl.autoRotateSpeed = -10;
    // this.orbitControl.screenSpacePanning = true;
    // this.orbitControl.target = new Vector3(-70.0,-150,-400)

    this.playerControl=new Engine3D.PlayerControl(this.defaultCamera,false,true)
    // this.playerControl.target.set(
    //         this.config.camera.target.x,
    //         this.config.camera.target.y,
    //         this.config.camera.target.z
    // )
    this.playerControl.mode.set("model")
    this.playerControl.speed.moveBoard =5//10//this.config.speed     //this.config.speed.moveBoard//1
    this.playerControl.speed.moveWheel0=0.015//0.03//this.config.speed*0.01//this.config.speed.moveWheel0//0.01
    this.playerControl.speed.rotateMouse=0.0025//0.005
    this.playerControl.target.x= -123.64630374290675 
    this.playerControl.target.y= -163.29999999999995 
    this.playerControl.target.z= -799.796117750895
    // alert(this.playerControl.speed.moveDrag)


    this.el.appendChild(this.renderer.domElement);

    var _self = this;
    // setTimeout(()=>{
    //   _self.addGUI();
    // },1000)
    // this.addGUI();
    this.addMyUI();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener('resize', this.resize.bind(this), false);

    this.setupScene();

    /**************************************************************/

    this.getCubeMapTexture('assets/textures/environment/env2.jpg',this.renderer).then(
        //this.getCubeMapTexture('assets/textures/environment/footprint_court_2k.hdr').then(
        ({ envMap }) => {
          console.log(envMap)
          envMap.flipY=false
          _self.sceneEx.environment = envMap
          // _self.sceneEx.background = envMap
          // _self.sceneEx.background = envMap//test
          // _self.sceneEx.backgroundIntensity=0//0.1
          //   self.scene.backgroundIntensity=0.1
          //   self.unrealBloom.bloomPass.strength=1.5
        }
    )
    this.getCubeMapTexture('assets/textures/environment/skybox2.jpg',this.renderer).then(
      //this.getCubeMapTexture('assets/textures/environment/footprint_court_2k.hdr').then(
      ({ envMap }) => {
        envMap.flipY=false
        _self.sceneEx.background = envMap
        window.ss=_self.sceneEx
        // _self.sceneEx.backgroundIntensity=1//0.1
        // _self.sceneEx.background = envMap//test
        // _self.sceneEx.backgroundIntensity=0//0.1
        //   self.scene.backgroundIntensity=0.1
        //   self.unrealBloom.bloomPass.strength=1.5
      }
  )

  this.lensflares=new Lensflares()
  _self.sceneEx.add(this.lensflares)
  // this.avatar=new AvatarManager(
  //   _self.sceneEx,
  //   _self.defaultCamera,
  //   null,
  //   ()=>{
  //       console.log("avatar加载完成")
  //   },
  //   _self.playerControl//self.orbitControl
  // )
  // this.loadJson(
  //   "LoadingProgressive/pos2.json",
  //   data=>{
  //       new TreeManager(_self.sceneEx).init(data) 
  //   }
  // )
  // -877.4427031689956, y: -103.29999999999995, z: 523.0552598721591
  new TreeManager(_self.sceneEx).init({}) 

  this.addGUI();
  }
  getCubeMapTexture(path,renderer) {
    return new Promise((resolve, reject) => {//'.exr'
      new TextureLoader()
          //.setDataType(THREE.FloatType)
          .load(
              path,
              texture => {
                const pmremGenerator = new PMREMGenerator(renderer)
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

  animate()
  {
    requestAnimationFrame(this.animate);
    

    this.stats.update();
    // return

    // this.render();//this.renderer.render(this.sceneEx, this.activeCamera);this.renderer.clear();
    if(this.unrealBloom&&this.unrealBloom.bloomPass.enabled)
      this.unrealBloom.render()
    else {
      this.renderer.render(this.sceneEx, this.defaultCamera);
    }
  }

  resize()
  {
    const {clientHeight, clientWidth} = this.el.parentElement;

    this.defaultCamera.aspect = clientWidth / clientHeight;
    this.defaultCamera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  }

  setupScene()
  {
    this.setCamera();

    this.addLights();

    // if(window.projectName==="TAILUN")
    //   this.addTree();

    // this.canvas = document.getElementsByTagName('canvas')[0];
    // // console.log(this.canvas)
    // this.canvas.addEventListener('dblclick', this.pick3.bind(this));
    //
    // this.treePos = []
    // window.trees=()=>{
    //   console.log(JSON.stringify(this.treePos));
    // }
  }
  pick3(event){
    var pos = {
      x: event.clientX,
      y: event.clientY,
    }
    // console.log(pos.x,pos.y)
    let width = this.canvas.width/2
    let height = this.canvas.height/2

    var rayCaster = new Raycaster()
    rayCaster.setFromCamera(new Vector2(pos.x/width*2-1, -pos.y/height*2+1), this.defaultCamera)
    // console.log(rayCaster)

    // var arrow = new ArrowHelper(rayCaster.ray.direction.clone(),rayCaster.ray.origin.clone(),1000,0x222222)
    // this.sceneEx.add(arrow)

    var res = rayCaster.intersectObjects(this.sceneEx.children)
    // console.log(this.sceneEx.children)
    // console.log(res)

    if(res.length) {
      // this.sceneEx.remove(res[0].object)
      // console.log(res[0].object)
      console.log(res[0]);
      let mesh = new Mesh(new SphereBufferGeometry(10), new MeshBasicMaterial({color:0xff0000}));
      mesh.position.copy(res[0].point);
      this.treePos.push(res[0].point);
      this.sceneEx.add(mesh);
    }
  }

  setCamera()
  {
    this.defaultCamera.position.set(35.5,786.7,854.6),
    this.defaultCamera.lookAt(-70.0,-150,-400)

    this.defaultCamera.position.set( -103.74156919209977,  222.10498628761275,  1679.7421074368945)
    this.defaultCamera.rotation.set(-0.15420026400520798,  0.007932180982387772,  0.001232918478221312)

    this.activeCamera = this.defaultCamera;
    window.camera=this.activeCamera

  }

  addLights ()
  {
    let supportMesh = new Object3D();
    supportMesh.position.set(-100,-100,-400);
    
    const directionalLight  = new DirectionalLight(0xFFFFFF, 3.2);//new DirectionalLight(0xFFFFFF, 1.2);
    window.ll=directionalLight
    this.sceneEx.add(directionalLight);
    directionalLight.position.set(-1000,900,400);
    
    // directionalLight.target = new Vector3(-100,-150,-400)
    this.sceneEx.add(supportMesh);
    directionalLight.target = supportMesh;
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 800;
    directionalLight.shadow.camera.bottom = -600;
    directionalLight.shadow.camera.left = -1200;
    directionalLight.shadow.camera.right = 800;
    directionalLight.shadow.camera.near = 0//0.00000001/1//800;
    directionalLight.shadow.camera.far = 3000;
    const s=2
    directionalLight.shadow.mapSize.width = 1024*s;
    directionalLight.shadow.mapSize.height = 1024*s;
    // console.log(directionalLight.shadow.bias)
    directionalLight.shadow.bias = -0.01;
    // directionalLight.shadow.radius = 10;
    // const helper = new CameraHelper(directionalLight.shadow.camera)
    // this.sceneEx.add(helper)
    directionalLight.shadow.autoUpdate=false
    window.shadow=directionalLight.shadow
    window.shadow.needsUpdate=true


    
    // var amb = new AmbientLight(0xffffff,0.5)
    // this.sceneEx.add(amb)
    this.directionalLight=directionalLight
    directionalLight.getT=()=>{
      const x=directionalLight.target.position.x-directionalLight.position.x
      const y=directionalLight.target.position.y-directionalLight.position.y
      const z=directionalLight.target.position.z-directionalLight.position.z
      console.log("lx:"+x+",ly:"+y+",lz:"+z+",")
    }
    window.directionalLight=directionalLight
  }

  addGUI()
  {
    const gui = this.gui = new GUI({autoPlace: false, width: 260, hideable: true});

    const perfFolder = gui.addFolder('Performance');
    const perfLi = document.createElement('li');
    this.stats.dom.style.position = 'static';
    perfLi.appendChild(this.stats.dom);
    perfLi.classList.add('gui-stats');
    perfFolder.__ul.appendChild( perfLi );

    const guiWrap = document.createElement('div');
    this.el.appendChild( guiWrap );
    guiWrap.classList.add('gui-wrap');
    guiWrap.appendChild(gui.domElement);
    gui.open();

    
    if(this.unrealBloom&&this.unrealBloom.bloomPass){
      const bloomPass=this.unrealBloom.bloomPass
      bloomPass.strength=0.83
      // bloomPass.threshold=0.;
      // bloomPass.bloomRadius=1
      const params={
        bloomThreshold:bloomPass.threshold,
        bloomStrength:bloomPass.strength,
        bloomRadius:bloomPass.radius,
        open:bloomPass.enabled,
      }//this.params
      const folder = gui.addFolder("辉光")
      folder.add( params, 'bloomStrength', 0.0, 1.5 ).step( 0.005 ).onChange( function ( value ) {
        bloomPass.strength = Number( value );
      } );
      folder.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
        bloomPass.threshold = Number( value );
      } );
      folder.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
        bloomPass.radius = Number( value );
      } );
      folder.add( params, 'open').onChange(function(e) {
        bloomPass.enabled = e;
      } );
    }
    if(this.lensflares){
      const lensflares=this.lensflares
      const params={
        "光晕":lensflares.visible
      }
      const folder = gui
      folder.add( params, '光晕').onChange(function(e) {
        lensflares.visible = e;
      } );
    }

    if(this.directionalLight){
      const directionLight=this.directionalLight
      const target=this.directionalLight.target
      const params={
        "X方向":target.position.x-directionLight.position.x,
        "Y方向":target.position.y-directionLight.position.y,
        "Z方向":target.position.z-directionLight.position.z,
        "阴影open":directionLight.castShadow,// = true;
        "阴影auto":directionLight.shadow.autoUpdate,
        "方向光open":directionLight.visible
      }
      const folder = gui.addFolder("方向光")
      folder.add( params, 'X方向', -1000, 1000 ).step( 1 ).onChange( function ( value ) {
        target.position.x = value+directionLight.position.x;
        if(window.shadow)window.shadow.needsUpdate=true
      } );
      folder.add( params, 'Y方向', -1000, 1000 ).step( 1 ).onChange( function ( value ) {
        target.position.y = value+directionLight.position.y;
        if(window.shadow)window.shadow.needsUpdate=true
      } );
      folder.add( params, 'Z方向', -1000, 1000 ).step( 1 ).onChange( function ( value ) {
        target.position.z = value+directionLight.position.z;
        if(window.shadow)window.shadow.needsUpdate=true
      } );
      folder.add( params, '阴影open').onChange(function(e) {
        directionLight.castShadow = e;
      } );
      folder.add( params, '阴影auto').onChange(function(e) {
        directionLight.shadow.autoUpdate = e;
      } );
      folder.add( params, '方向光open').onChange(function(e) {
        directionLight.visible = e;
      } );
      
    }
    if(false)if(this.renderer){
      const renderer=this.renderer//this.unrealBloom.composer.renderer//
      const params={
        "tone":renderer.toneMappingExposure,
        "shadowMap":renderer.shadowMap.enabled
      }
      const folder = gui.addFolder("渲染器")
      folder.add( params, 'tone', 0, 2 ).step( 0.001 ).onChange( function ( value ) {
        renderer.toneMappingExposure = value
      } );
      folder.add( params, 'shadowMap').onChange(function(e) {
        renderer.shadowMap.enabled = e;
      } );
    }


    const self=this
    document.addEventListener("mouseup", function(){
      self.playerControl.enable=true
    });
    document.getElementsByClassName("dg main")[0].addEventListener("mousedown", function(){
      self.playerControl.enable=false
    });
  }

  addMyUI()
  {
    var ui = new Engine3D.MyUI()
    var self = this;
    var width = window.innerWidth
    var height = window.innerHeight
    const config=MyUI_config// Engine3D.Building.Tool.saveJson(config,".json")

    let distanceId=0
    for(let id in config){
      distanceId++
      new ui.Button(id, "#888888", '#666666', '#DDDDDD',
          height/36, width/150,
          2*width/12, height/20,
          height/90,height-height/17*(distanceId+1.0),()=>{
            self.defaultCamera.position.set(config[id].x, config[id].y, config[id].z)
            self.defaultCamera.rotation.set(config[id]._x,config[id]._y,config[id]._z)
            if(id=="全景"){
              this.playerControl.mode.set("model")
              this.unrealBloom.bloomPass.strength=0.83
            }else{
              this.playerControl.mode.set("viewpoint")
              this.directionalLight.position.set(
                this.activeCamera.position.x,
                this.activeCamera.position.y,
                this.activeCamera.position.z,
              )
              this.unrealBloom.bloomPass.strength=0.4
            }
            if(typeof config[id].lx!="undefined"){
              self.directionalLight.target.position.set(
                self.directionalLight.position.x+config[id].lx,
                self.directionalLight.position.y+config[id].ly,
                self.directionalLight.position.z+config[id].lz,
              )
            }
            if(window.shadow)window.shadow.needsUpdate=true
          });
    }

    var route = [
      new Vector3(0,-1800,550),
      new Vector3(29.8,-1490.9,-87.4),
      new Vector3(-263.9,-1490.0,-192.1),
      new Vector3(-262.3,-1494.6,275.4),
      new Vector3(-259.2,-1387.8,268.4),
      new Vector3(-259.2,-1319.1,16.8),
      new Vector3(-259.7,-1329.6,-26.1),
      new Vector3(-246.0,-1311.0,-252.3),
      new Vector3(-244.6,-828.1,-274.5),
      new Vector3(181.7,-764.0,-168.7),
      new Vector3(314.1,-1241.7,-193.1),
      new Vector3(-1.2,-1419.8,-168.2),
      new Vector3(0,-1800,550),
      new Vector3(0,-1050,-100)
    ]
    return
    this.wanderControl = new WanderControl(this.defaultCamera, route, 300)

    // new ui.Button("自动漫游", "#F4A460", '#666666', '#FFD700',
    //     height/36, width/150,
    //     width/12, height/20,
    //     height/90, 13.5*height/15, (b)=>{
    //       if(!this.wanderControl.wander){
    //         console.log("start wander")
    //         this.wanderControl.init()
    //         this.wanderControl.startWander()
    //       } else {
    //         console.log("stop wander")
    //         this.wanderControl.wander = false
    //       }
    //     });

    window.ondblclick = function(){
      if(!self.wanderControl.wander){
        // console.log("start wander")
        // self.wanderControl.init()
        // self.wanderControl.startWander()
      } else {
        self.wanderControl.wander = false
      }
    }
  }
}
