import * as THREE from '../build/three.module'
// import * as THREE from 'three'
import { OrbitControls } from '../three/jsm/controls/OrbitControls'
import { GLTFLoader } from '../three/jsm/loaders/GLTFLoader'
import ComboControls from '@cognite/three-combo-controls'
import { RTXGINetwork } from './network/RTXGINetwork';
import { StateCode } from "./network/StateCode"
import {IndirectMaterial} from "./IndirectMaterial"
import {UI} from "./UI"
////////////////////////////////////////////////////
const litRenderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType
    }
  )
// litRenderTarget.texture.type = 1015
// litRenderTarget.texture.format = 1023
///////////////////////////////////////////////////////
const ui=new UI()

import {Light} from "./Light"
const light=new Light()

// THREE.MeshStandardMaterial
// console.log(THREE.ShaderChunk)
var renderer
/*lights manager*/
/*listener light change*/

/*split scene and scene name*/
var models = []
var asyncScene = false;
/*box3d*/
let sceneBox;
var camera;
var controls;
var scene
var rtxgiNetwork;
/*Directional Light y offset*/
var directionalYOffset = 15.0;
/*record camera and directionalLight*/

var isPC = checkAgent_isPC();

/*check agent*/
init();
import {Communication} from "./Communication"
IndirectMaterial.pre(()=>{
	animate();
})

/**
* syncClientVolumeDescToServer
*/
function syncClientVolumeDescToServer()
{
	let volumeDescReqJson = 
	{
		type: StateCode.C2S_RTXGI_VolumeDesc,
		sceneId: rtxgiNetwork.sceneId
	};
	var jsonStr = JSON.stringify(volumeDescReqJson);
	var enc = new TextEncoder();
	var jsonUint8 = enc.encode(jsonStr);
	var msg = new Uint8Array(jsonUint8.length);
	msg.set(jsonUint8, 0);
	/*send data*/
	if(rtxgiNetwork != undefined && rtxgiNetwork.ready())
		rtxgiNetwork.C2SSocket.send(msg);
}



/**
* initRender
*/
function initRender() {
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  //告诉渲染器需要阴影效果
  renderer.shadowMap.enabled = true
  renderer.shadowMapSoft = true;
  renderer.setClearColor(0xcccccc)
  renderer.shadowMap.type = THREE.PCFSoftShadowMap // BasicShadowMap,PCFSoftShadowMap, PCFShadowMap,VSMShadowMap
  renderer.shadowMap.autoUpdate = true;
  renderer.tonemapping = THREE.NoToneMapping;
  renderer.setScissorTest = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement)
  
  //scene parse
  var filestr = rtxgiNetwork.sceneName;
  var sptr = filestr.split('.'); 
  var folder = sptr[0];
  var sUrl = 'Models/' + folder + '/' + filestr;
//   sUrl='Models/Sponza/Sponza.glb';
  //scene loader
  const modelLoader = new GLTFLoader()
  modelLoader.load(sUrl, function(gltf) {
    gltf.scene.traverse(function(node) {
      if (node.isMesh) {
		node.geometry.computeVertexNormals()
        node.castShadow = true
        node.receiveShadow = true
		let indirectMaterial = new IndirectMaterial(node.material,rtxgiNetwork)//indirectShader//.clone();//new IndirectMaterial0({rtxgiNetwork:rtxgiNetwork})//new THREE.MeshStandardMaterial({color:{r:1,g:0.5,b:0}})//
        node.litMaterial = node.material
		window.material=indirectMaterial
        node.diffuseMaterial = node.material
		node.indirectMaterial = indirectMaterial
		// node.material=node.indirectMaterial
		models.push(node)
      }
    })
    scene.add(gltf.scene)
	/*reset shadowMap and directionalLight*/
	if(rtxgiNetwork.directionalLightCt == 1){
		sceneBox = new THREE.Box3().expandByObject(gltf.scene);
		let offsetX = (sceneBox.min.x + sceneBox.max.x) / 2.0;
		let offsetZ = (sceneBox.min.z + sceneBox.max.z) / 2.0;
		light.directionalLightGroup[0].position.set(offsetX, sceneBox.max.y + directionalYOffset, offsetZ);
	}
  })
}

/**
* initCamera
*/
function initCamera() {
  camera = new THREE.PerspectiveCamera(
    rtxgiNetwork.cameraFov,
    window.innerWidth / window.innerHeight,
    0.1,
    100000
  )
  camera.position.x = rtxgiNetwork.cameraPosition.x;
  camera.position.y = rtxgiNetwork.cameraPosition.y;
  camera.position.z = rtxgiNetwork.cameraPosition.z;
  //camera.lookAt(new THREE.Vector3(0, 0, 0));
}

/**
* initScene
*/
function initScene() {
  scene = new THREE.Scene()
}

/* initControls */
function initControls() {
  
  if(isPC){
	controls = new ComboControls(camera, renderer.domElement)
	controls.keyboardPanSpeed = 1.0
	controls.keyboardDollySpeed = 0.5
	controls.minZoom = -50 // minimum zoom distance, only available when camera is orthographic
	controls.maxZoom = 50
	controls.minPolarAngle = 0 // minium polar angle around the target (radians)
	controls.maxPolarAngle = Math.PI // maximum polar angle around the target (radians)
	controls.minAzimuthAngle = -Infinity // minimum azimuth angle around the target (radians)
	controls.maxAzimuthAngle = Infinity // maximum azimuth angle around the target (radians)
	controls.dynamicTarget = true
	controls.minDistance = 0.1 // minimum distance to the target (see also dynamicTarget)
	controls.maxDistance = 50 // maximum distance to the target
	controls.keyboardSpeedFactor = 0.4
  }else{
	controls = new OrbitControls(camera, renderer.domElement);

	// 如果使用animate方法时，将此函数删除
	//controls.addEventListener( 'change', render );
	// 使动画循环使用时阻尼或自转 意思是否有惯性
	controls.enableDamping = true;
	//动态阻尼系数 就是鼠标拖拽旋转灵敏度
	controls.dampingFactor = 0.25;
	//是否可以缩放
	controls.enableZoom = true;
	//是否自动旋转
	controls.autoRotate = false;
	//设置相机距离原点的最远距离
	controls.minDistance = 0.1;
	//设置相机距离原点的最远距离
	controls.maxDistance = 100;
	//是否开启右键拖拽
	controls.enablePan = true;
  }
}

/**
* initRTXGINetwork
*/
function initRTXGINetwork()
{
  /*initialized network*/
  rtxgiNetwork = new RTXGINetwork(this);
}

/**
* render
*/
function render() {

      for (var i = 0; i < models.length; i++) {
		models[i].material = models[i].diffuseMaterial
	  }
	  renderer.setRenderTarget(litRenderTarget)
	  renderer.render(scene, camera)
	  for (var i = 0; i < models.length; i++) {
		models[i].indirectMaterial.uniforms.screenWidth.value = renderer.domElement.width;
		models[i].indirectMaterial.uniforms.screenHeight.value = renderer.domElement.height;
		models[i].indirectMaterial.uniforms.GBufferd.value = litRenderTarget.texture;
		models[i].material = models[i].indirectMaterial//models[i].indirectShader;
	  }
	  renderer.setRenderTarget(null)
	  renderer.render(scene, camera)

}

/**
* onWindowResize
*/
function onWindowResize() {
  for (var i = 0; i < models.length; i++) {
	models[i].indirectMaterial.uniforms.screenWidth.value = window.innerWidth
	models[i].indirectMaterial.uniforms.screenHeight.value = window.innerHeight
  }

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()

}
/**
* animate
*/
function animate() {
  requestAnimationFrame(animate); 
  
  /*volume desc async*/
  if(rtxgiNetwork != undefined &&
  rtxgiNetwork.ready() &&!rtxgiNetwork.isDescTouch)
  {
	syncClientVolumeDescToServer();
  }
  
  /*init threejs evi*/
  if(rtxgiNetwork.isDescTouch && !asyncScene)
  {
	ui.init(rtxgiNetwork,light.directionalLightGroup,light.pointLightGroup,light.spotLightGroup,models)//initGui(rtxgiNetwork);//
	initRender();
	initScene();
	light.init(rtxgiNetwork,scene)//initLight();
	initCamera();
	new Communication(camera,rtxgiNetwork,ui,light,models)
	initControls();

	window.onresize = onWindowResize;
	asyncScene = true;
  }
  
  if(rtxgiNetwork.isDescTouch)
  {
	// 更新控制器
	render();
	if(isPC){
	var clock = new THREE.Clock();
	var deltaTime = clock.getDelta();
	controls.update(deltaTime);
  }else{
	controls.update();
  }
 }
}

/**
* init
*/
function init() {
  initRTXGINetwork();
  rtxgiNetwork.sceneId = window.location.href.split('/').pop()
}

/**
* agent
*/
function checkAgent_isPC()
{
	var userAgent = navigator.userAgent.toLowerCase();
	if(userAgent.indexOf('android') == -1 &&
	userAgent.indexOf('iphone') == -1 &&
	userAgent.indexOf('ipad') == -1 &&
	userAgent.indexOf('macintosh') == -1 &&
	userAgent.indexOf('mac os x') == -1){
		isPC = true;
	}else{
		isPC = false;
	}
	return isPC
}
