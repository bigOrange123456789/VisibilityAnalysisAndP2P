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
    directionalLight.shadow.camera.near = 800;
    directionalLight.shadow.camera.far = 3000;
    const s=2
    directionalLight.shadow.mapSize.width = 1024*s;
    directionalLight.shadow.mapSize.height = 1024*s;
    // console.log(directionalLight.shadow.bias)
    directionalLight.shadow.bias = -0.01;
    // directionalLight.shadow.radius = 10;
    // const helper = new CameraHelper(directionalLight.shadow.camera)
    // this.sceneEx.add(helper)


    
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
        x: -611.7278997402186, y: -8.299999999999955, z: -991.8703100197723,
        _x: -0.4595177766655146, _y: 0.9351284649468279, _z: 0.37894699828256995,
      },
      "健身房":{
        x: -220.40853318635703, y: -8.299999999999955, z: -446.2481895862788,
        _x: -2.879695796991123, _y: -1.3947286318204442, _z: -2.8835660728168215, 
      },
      "展板":{
        x: -415.54690309966884, y: 11.700000000000045, z: -985.8859488244095,
        _x: -2.772586563236666, _y: -1.0403056132677122, _z: -2.81963008356382,
      },
      "回廊":{
        x: -951.518822290356, y: 1.7000000000000455, z: -246.06212147826005,
        _x: -2.631336910247565, _y: -0.4628900581469155, _z: -2.8966858087663017,
      },
      "楼梯":{
        _x: -2.761248661969031, _y: -1.4187110845296473, _z: -2.7652338596964983,
        x: -695.6420432481111, y: 86.70000000000005, z: -314.8606618932473,
      },

      "走廊":{
        x: -523.7169964224255, y: -73.29999999999995, z: -934.4046215208,
        _x: -2.38325232201822, _y: 1.2485585387315845, _z: 2.4095851860017667, 
      },

      "盥洗室":{
        x: -287.564663844875, y: -133.29999999999995, z: -294.19837678647093,
        _x: -0.5977010984592044, _y: -1.076166245007891, _z: -0.5398115091406686,
      },
      "办公室":{
        x: 34.75463528178357, y: -133.29999999999995, z: -232.47315250400808,
        _x: -1.8894438749306073, _y: 1.4249512479569035, _z: 1.8926329490071203,
      },
      "休息区":{
        x: -287.77798524818036, y: -123.29999999999995, z: -388.4728149475557,
        _x: -0.296511175682145, _y: 0.09545404161333833, _z: 0.02911040654961064, 
      },
      "3D沙盘":{
        x: -517.6401039024837, y: -123.29999999999995, z: -707.6378335253324,
        _x: -0.22895130436582797, _y: 0.661921534807753, _z: 0.1422650528360352,
      },
      "大厅":{
        x: -631.7760430042864, y: -113.29999999999995, z: -542.7510312624997,
        _x: -0.16740930972230977, _y: -0.8534364865423268, _z: -0.1266604255389059,
      },
      "入口":{
        x: -855.4164092525988, y: -123.29999999999995, z: -523.2196177322234,
        _x: -1.120200465674534, _y: -1.408038622686094, _z: -1.1149633815768025,
      },

      "泳池":{
        x: -1263.0643619464583, y: -113.29999999999995, z: -246.01514352935746,
        _x: -2.6410167587579307, _y: -1.0909375271610826, _z: -2.689801023321253,
      },
      "停车位":{
        x: -650.4383146958382, y: -93.29999999999995, z: 352.4810519687936,
        _x: -0.14924857580109704, _y: -0.27269335137388234, _z: -0.04047558464798968,
      },
      "全景":{
        x: -103.74156919209977, y: 222.10498628761275, z: 1679.7421074368945,
        _x: -0.15420026400520798, _y: 0.007932180982387772, _z: 0.001232918478221312
      }
      


    }

    // const m1=[]
    // const m2=[0.0022514882337224904, 0, 0, 0, 0, 0.0022514882337224904, 0, 0, 0, 0, 0.0022514882337224904, 0, -194.0903874961349, -121.49264898080712, -262.07706497119597, 1]

    // camera.applyMatrix4(m1)

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
            }else{
              this.playerControl.mode.set("viewpoint")
            }
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
