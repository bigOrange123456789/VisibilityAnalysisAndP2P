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

    window.orbitControl = this.orbitControl = new OrbitControls(this.defaultCamera, this.renderer.domElement);
    this.orbitControl.autoRotate = false;
    this.orbitControl.autoRotateSpeed = -10;
    this.orbitControl.screenSpacePanning = true;
    this.orbitControl.target = new Vector3(-70.0,-150,-400)

    this.el.appendChild(this.renderer.domElement);

    var _self = this;
    // setTimeout(()=>{
    //   _self.addGUI();
    // },1000)
    // this.addGUI();
    // this.addMyUI();

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

    var camera_pos = [
      new Vector3(0.0,471.4,432.3),
      new Vector3(-122.6,9.7,99.4),
      new Vector3(368.5,8.6,161.4),
      new Vector3(82.2,-29.7,-69.4),
      new Vector3(-18.6,-5.0,-37.0),
    ]
    var camera_tar = [
      new Vector3(0,-150,0),
      new Vector3(-50.2,-120.1,-50.6),
      new Vector3(183.2,-117.1,59.8),
      new Vector3(115.7,-120.2,-197.5),
      new Vector3(-114.1,-108.0,-195.3),
    ]
    var inf = {
      '5th':4,
      '4th':3,
      '3rd':2,
      '2nd':1,
      '1st':0
    }

    var names=Object.keys(inf)
    for(let i=0; i<names.length; i++){
      new ui.Button(names[i], "#888888", '#666666', '#DDDDDD',
          height/36, width/150,
          width/12, height/20,
          height/90,height-height/15*(i+1.5),()=>{
            var id = inf[names[i]]
            self.defaultCamera.position.copy(camera_pos[id])
            self.defaultCamera.lookAt(camera_tar[id])
            self.orbitControl.target = camera_tar[id].clone()
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
