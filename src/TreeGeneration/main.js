import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { TreeBuilder } from "./TreeBuilder";
import { CustomizeTree } from "./CustomizeTree";
import Stats from "three/examples/jsm/libs/stats.module.js";
export class Main{
  constructor(body){
      this.initScene(body)
      this.initCameraControl()
      this.initLight()
      this.initPlane()
      this.initTree()
      this.animate = this.animate.bind(this)
      requestAnimationFrame(this.animate)
  }
  initTree(){
    const scene=this.scene
    const builder = new TreeBuilder();
    const customizeTree = new CustomizeTree();
    let singleTree

    function buildtree(species) {
      if(singleTree)scene.remove(singleTree);
      builder.clearMesh();
      const treeObj = customizeTree.getTree(species);
      builder.init(treeObj, true);
      const skeleton = builder.buildSkeleton();
      singleTree = builder.buildTree(skeleton);
      singleTree.children.forEach((child) => {
        child.castShadow = true;
        child.receiveShadow = true;
      });
      scene.add(singleTree);
      console.log(singleTree);
    }

    const guiobj = {
      "Ordinary tree": function () {
        buildtree("普通乔木");
      },
      "Chinese huai": function () {
        buildtree("国槐");
      },
      "Gui flower": function () {
        buildtree("桂花");
      },
      "Red maple": function () {
        buildtree("红枫");
      },
      "Sweet zhang": function () {
        buildtree("香樟");
      },
      "Mu Furong": function () {
        buildtree("木芙蓉");
      },
    };
    const gui = new GUI();
    const tree_selector = gui.addFolder("tree");
    tree_selector.add(guiobj, "Ordinary tree");
    tree_selector.add(guiobj, "Chinese huai");
    tree_selector.add(guiobj, "Gui flower");
    tree_selector.add(guiobj, "Red maple");
    tree_selector.add(guiobj, "Sweet zhang");
    tree_selector.add(guiobj, "Mu Furong");
  }
  initPlane(){
    const planeSize = 20;
    const plainGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 10, 10);
    plainGeometry.rotateX(-Math.PI / 2);
    const plain = new THREE.Mesh(
      plainGeometry,
      new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
      })
    );
    plain.receiveShadow = true;
    this.scene.add(plain);
  }
  initCameraControl(){
    const controls = new OrbitControls(this.camera, this.canvas);
    controls.target.set(0, 10, 0);
    controls.update();
  }
  initLight(){
    const amLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(amLight);
    const dirlight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirlight.position.set(5, 15, 5);
    dirlight.castShadow = true;
    dirlight.shadow.camera.top = 20;
    dirlight.shadow.camera.right = 20;
    dirlight.shadow.camera.bottom = -20;
    dirlight.shadow.camera.left = -20;
    dirlight.shadow.camera.near = 1;
    dirlight.shadow.camera.far = 100;
    this.scene.add(dirlight);
  }
  initScene(body){
      this.body = body
      this.canvas = document.getElementById('myCanvas')
      
      this.renderer = new THREE.WebGLRenderer({ 
          antialias: true,//抗锯齿
          alpha:true,
          canvas:this.canvas
      })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth,window.innerHeight)
      // 告诉渲染器需要阴影效果
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMapSoft = true;
      this.renderer.setClearColor(0xcccccc)
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap 
      this.renderer.shadowMap.autoUpdate = true;
      this.renderer.tonemapping = THREE.NoToneMapping
      this.renderer.setScissorTest = true;
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
      const fov = 45;
      const near = 0.1;
      const far = 10000;

      this.camera = new THREE.PerspectiveCamera(
          fov,//50,
          window.innerWidth/window.innerHeight,
          near,
          far)
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