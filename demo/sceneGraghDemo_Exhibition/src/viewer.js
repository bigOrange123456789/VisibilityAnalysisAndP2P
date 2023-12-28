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
import {MyUI} from "../lib/MyUI.js"
import Stats from "three/examples/jsm/libs/stats.module.js";//'../lib/three/examples/jsm/libs/stats.module.js';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";//'../lib/three/examples/jsm/controls/OrbitControls.js';
import {WanderControl} from "../lib/WanderControl";
// import {CustomizeTree} from "../lib/myTree/CustomizeTree";
// import {TreeBuilder} from "../lib/myTree/TreeBuilder";


import { Engine3D } from './main.js'
// import {MapLoader} from '../lib2/MapLoader.js'

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
      toneMappingExposure: 0.5
    });
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setClearColor(0x66ccff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    this.renderer.autoClear = false;
    this.renderer.toneMappingExposure = 1.25		//色调映射曝光度
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMapSoft = true
    // this.renderer.shadowMap.type = VSMSoftShadowMap;//PCFSoftShadowMap;//this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.unrealBloom=new Engine3D.UnrealBloom(this.defaultCamera,this.sceneEx,this.renderer)
    window.bloomPass=this.unrealBloom.bloomPass

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
    this.playerControl.mode.set("viewpoint")
    this.playerControl.speed.moveBoard =10//this.config.speed     //this.config.speed.moveBoard//1
    this.playerControl.speed.moveWheel0=0.03//this.config.speed*0.01//this.config.speed.moveWheel0//0.01


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

    this.onKeyDown = function (event){}

    this.onKeyUp = function (event){}

    this.onMouseMove = function(event){}

    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('keyup', this.onKeyUp, false);
    window.addEventListener('click', this.onMouseMove, true);


    this.getCubeMapTexture('assets/textures/environment/evn.jpg',this.renderer).then(
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

    // this.render();//this.renderer.render(this.sceneEx, this.activeCamera);this.renderer.clear();
    this.unrealBloom.render();
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

    window.content = this.content;

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

    this.defaultCamera.position.set(177.0634052345402,  336.70000000000005,  1081.1808734649335)
    this.defaultCamera.rotation.set(-0.4552590477483137,  0.17999422024547682,  0.08741917748230953)

    this.activeCamera = this.defaultCamera;
    window.camera=this.activeCamera

  }

  addLights ()
  {
    const directionalLight  = new DirectionalLight(0xFFFFFF, 3.2);//new DirectionalLight(0xFFFFFF, 1.2);
    this.sceneEx.add(directionalLight);
    directionalLight.position.set(-1000,900,400);
    // directionalLight.target = new Vector3(-100,-150,-400)
    let supportMesh = new Object3D();
    supportMesh.position.set(-100,-150+50,-400);
    window.t=supportMesh.position
    this.sceneEx.add(supportMesh);
    directionalLight.target = supportMesh;
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 800;
    directionalLight.shadow.camera.bottom = -600;
    directionalLight.shadow.camera.left = -1200;
    directionalLight.shadow.camera.right = 800;
    directionalLight.shadow.camera.near = 800;
    directionalLight.shadow.camera.far = 3000;
    const s=2
    directionalLight.shadow.mapSize.width = 1024*s;
    directionalLight.shadow.mapSize.height = 1024*s;
    // console.log(directionalLight.shadow.bias)
    directionalLight.shadow.bias = -0.01;
    // directionalLight.shadow.radius = 10;
    const helper = new CameraHelper(directionalLight.shadow.camera)
    this.sceneEx.add(helper)
    // var amb = new AmbientLight(0xffffff,0.5)
    // this.sceneEx.add(amb)
    this.directionalLight=directionalLight
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

    const bloomPass=window.bloomPass
    if(bloomPass){
      const params={}//this.params
      bloomPass.strength=0.83
      // bloomPass.threshold=0.;
      // bloomPass.bloomRadius=1
      params.bloomThreshold=bloomPass.threshold;
      params.bloomStrength=bloomPass.strength;
      params.bloomRadius=bloomPass.radius;
      params.enabled=bloomPass.enabled;
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
      folder.add( params, 'enabled').onChange(function(e) {
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
    
  }

  addMyUI()
  {
    var ui = new MyUI()
    var self = this;
    var width = window.innerWidth
    var height = window.innerHeight
    const config={
      

      "会议厅":{
        x: -350.5467885943361, y: -43.299999999999955, z: -1137.3976427856273,
        _x: -0.29696528191262844, _y: 0.8375093712015134, _z: 0.22356147002740034
      },
      "健身房":{
        x: 115.91262638118077, y: -33.299999999999955, z: -484.73772526711605,
        _x: -1.287739722761672, _y: -1.379163177039437, _z: -1.2827463554950445,
      },
      "展板":{
        x: 167.86014700644088, y: -33.299999999999955, z: -758.5875607781416,
        _x: -0.13140899519579097, _y: 0.1054272493189908, _z: 0.013907693581417224,
      },
      "回廊":{
        x: -650.2986268154245, y: -43.299999999999955, z: -286.104952193114,
        _x: -2.634168506636218, _y: -0.4472438726462172, _z: -2.90562015432945,
      },
      "楼梯":{
        _x: -2.4068199246970625, _y: 0.9762746471057729, _z: 2.4990423833237645,
        x: 160.7755119354716, y: -33.299999999999955, z: -270.1624004500886,
      },

      "走廊":{
        x: -27.768377341623648, y: -93.29999999999995, z: -977.0445354619216,
        _x: -1.2598171467937493, _y: 1.230553561928523, _z: 1.2422037445960972,
      },

      "盥洗室":{
        x:112.19219530185124, y: -163.29999999999995, z: -318.1176724182865,
        _x: -0.3461472452194621, _y: 0.5589346931393498, _z: 0.1889743670846886,
      },
      "休息区":{
        x: 32.85696504093701, y: -193.29999999999995, z: -476.56192812346495,
        _x: -0.029319437665568784, _y: 0.38355866506721825, _z: 0.010974709979953794
      },
      "3D沙盘":{
        x: -346.6456757742332, y: -163.29999999999995, z: -768.8531487176922,
        _x: -0.09956059591517652, _y: -0.10650733313967736, _z: -0.010618607145258795,
      },
      "大厅":{
        x: -241.33467863091684, y: -163.29999999999995, z: -673.5686187199714,
        _x: -0.06891166091567955, _y: -0.7492188376409682, _z: -0.04697331200981943,
      },
      "入口":{
        x: -560.7812431111262, y: -163.29999999999995, z: -594.6375316162984,
        _x: -0.9772559978539955, _y: -1.4259696869746545, _z: -0.9723669892298219,
      },

      "泳池":{
        x: -975.6504596579695, y: -113.29999999999995, z: -298.76121432542163,
        _x: -2.4771082121740404, _y: -1.0974014326651882, _z: -2.532767855115943,
      },
      "停车位":{
        x: -219.38710349708353, y: -103.29999999999995, z: 337.5033443147026,
        _x: -0.3720112986105769, _y: -0.05414025575357253, _z: -0.021110927398409085,
      },
      "全景":{
        x: 177.0634052345402, y: 336.70000000000005, z: 1081.1808734649335,
        _x: -0.4552590477483137, _y: 0.17999422024547682, _z: 0.08741917748230953
      }
      


    }

    let distanceId=0
    for(let id in config){
      distanceId++
      new ui.Button(id, "#888888", '#666666', '#DDDDDD',
          height/36, width/150,
          2*width/12, height/20,
          height/90,height-height/17*(distanceId+1.0),()=>{
            self.defaultCamera.position.set(config[id].x, config[id].y, config[id].z)
            self.defaultCamera.rotation.set(config[id]._x,config[id]._y,config[id]._z)
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

  // addTree()
  // {
  //   var self = this
  //   new FileLoader().load("assets/tree_pos.json", (json)=>{
  //     let cells = JSON.parse(json)
  //     // console.log(cells)
  //     for(let i=0; i<cells.length; i++){
  //       let vec = new Vector3(cells[i].x, cells[i].y, cells[i].z)
  //       // vec.applyMatrix4(matwor)
  //       cells[i] = {x:vec.x, y:vec.y, z:vec.z}
  //     }

  //     const customizeTree = new CustomizeTree()
  //     const treeObj = customizeTree.getTree("法国梧桐")
  //     const builder = new TreeBuilder(treeObj, true)

  //     let skeleton = builder.buildSkeleton()
  //     let tree = builder.buildTree(skeleton)
  //     // console.log(tree)
  //     let instancedMeshGroup = new Group()
  //     let instancedMeshes = []
  //     tree.children.forEach((child) => {
  //       // console.log(child.material.alphaTest)
  //       child.material.alphaTest = 0.25
  //       instancedMeshes.push(
  //           new InstancedMesh(child.geometry, child.material, cells.length)
  //       )
  //     })
  //     for(let i=0; i<cells.length; i++){
  //       let matrix = new Matrix4()
  //       matrix.makeRotationY(Math.random()*Math.PI)
  //       matrix.multiply(new Matrix4().makeScale(0.08,0.08,0.08))
  //       matrix.setPosition(cells[i].x, cells[i].y, cells[i].z)
  //       instancedMeshes.forEach((instancedMesh) => {
  //         instancedMesh.setMatrixAt(i, matrix)
  //       })
  //       instancedMeshes[0].setColorAt(i, new Color(0.4+Math.random()*0.1,0.3+Math.random()*0.1,0.1+Math.random()*0.1))
  //       instancedMeshes[1].setColorAt(i, new Color(0,0.2+Math.random()*0.6,0))
  //     }
  //     instancedMeshGroup.add(...instancedMeshes)
  //     self.sceneEx.add(instancedMeshGroup)
  //   })
  // }
}
