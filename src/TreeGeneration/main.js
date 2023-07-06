import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { TreeBuilder } from "./TreeBuilder";
import { CustomizeTree } from "./CustomizeTree";

async function main() {
  const canvas = document.getElementById('myCanvas')
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xffffff);

  const fov = 45;
  const aspect = 2;
  const near = 0.1;
  const far = 10000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(100, 70, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 10, 0);
  controls.update();

  const amLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(amLight);
  const dirlight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirlight.position.set(5, 15, 5);
  dirlight.castShadow = true;
  dirlight.shadow.camera.top = 20;
  dirlight.shadow.camera.right = 20;
  dirlight.shadow.camera.bottom = -20;
  dirlight.shadow.camera.left = -20;
  dirlight.shadow.camera.near = 1;
  dirlight.shadow.camera.far = 100;
  scene.add(dirlight);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const planeSize = 20;
  const plainGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 10, 10);
  plainGeometry.rotateX(-Math.PI / 2);
  const plain = new THREE.Mesh(
    plainGeometry,
    new THREE.MeshLambertMaterial({
      // color: "white",
      side: THREE.DoubleSide,
    })
  );
  // plain.castShadow = true;
  plain.receiveShadow = true;
  scene.add(plain);

  const builder = new TreeBuilder();


  const customizeTree = new CustomizeTree();
  let treeObj = customizeTree.getTree("普通乔木");

  builder.init(treeObj, true, "y-axis");
  let skeleton = builder.buildSkeleton();

  // skeleton line
  // const curve = new THREE.Group();
  // const pointGroup = new THREE.Group();
  // drawLine(skeleton.children[0], curve, pointGroup);
  // scene.add(curve);
  // scene.add(pointGroup);

  let singleTree = builder.buildTree(skeleton);
  singleTree.children.forEach((child) => {
    child.castShadow = true;
  });
  scene.add(singleTree);
  // lookAt(singleTree, camera, controls);
  console.log(singleTree);

  function buildtree(species) {
    scene.remove(singleTree);
    builder.clearMesh();
    treeObj = customizeTree.getTree(species);
    builder.init(treeObj, true);
    skeleton = builder.buildSkeleton();
    singleTree = builder.buildTree(skeleton);
    singleTree.children.forEach((child) => {
      child.castShadow = true;
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

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    // const pixelRatio = window.devicePixelRatio;
    // const width = (canvas.clientWidth * pixelRatio) | 0;
    // const height = (canvas.clientHeight * pixelRatio) | 0;
    const width =window.innerWidth//this.body.clientWidth
    const height = window.innerHeight//this.body.clientHeight
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {
    // 图像不随屏幕拉伸改变
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }
  animate();
}

main();
