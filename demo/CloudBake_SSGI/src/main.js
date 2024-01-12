import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {IndirectMaterial} from "./IndirectMaterial"
import {UI} from "./UI"
import {MapControls,OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {Communication} from "./Communication"
import {Light} from "./Light"
// import config_sh from '../config/sh.json';
// console.log("config_sh",config_sh)
window.loadJson=(path,cb)=>{
	if(!path)path="./CloudBake/sh.json"
	var xhr = new XMLHttpRequest()
	xhr.open('GET', path, true)
	xhr.send()
	xhr.onreadystatechange = ()=> {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var json_data = JSON.parse(xhr.responseText)
			console.log("json_data:",json_data)
			if(cb)cb(json_data)
		}
	}
}
class Loader{
	SSGITestPram={
		width: 1280,
		height: 720,
		camera:{//fov , aspect , near , far 
			fov:60,
			near:0.1,
			far:512,

			pos : [-0.5, 5.0, 3.5],
			rot : [-15, 120, 0],
			// mat : [
			// 	-0.5, 		0.224144, 	-0.836516, 	0, 
			// 	0, 			0.965926, 	0.258819, 	0, 
			// 	0.866025, 	0.12941, 	-0.482963, 	0, 
			// 	3.28109, 	-4.48877, 	-2.56621, 	1
			// ],
			mat:[
				-0.5, 7.45058e-09, 0.866025, -0, 
				0.224144, 0.965926, 0.12941, 0, 
				-0.836516, 0.258819, -0.482963, 0, 
				0.5, 5, -3.5, 1
			],
			matrix:[
				0.5, 		7.45058e-09, -0.866025, -0, 
				-0.224144, 	0.965926, 	 -0.12941, 0, 
				0.836516, 	0.258819, 	 0.482963, 0, 
				-0.5, 		5, 			 3.5, 1
			],
			//-0.5, 0.224144, -0.836516, 0, 0, 0.965926, 0.258819, 0, 0.866025, 0.12941, -0.482963, 0, 3.28109, -4.48877, -2.56621, 1
			mat3:[
				0.9899494936611666, 6.938893903907228e-18, 0.1414213562373095, 0, 
				0.11547005383792514, 0.5773502691896258, -0.808290376865476, 0, 
				-0.08164965809277261,0.8164965809277259,0.5715476066494083,0,
				-0.5				,5.0			   ,3.5				  , 1
			],
			flipY:true,
		}
	}
	uniforms={
		dGI: { value: true },
		probeIrradiance: {value: null}, //IndirectMaterial.prototype.probeIrradiance0//null 
		probeDistance:{value: null}, // probeDistance: { type: 't', value: null },
		
		rtaoBufferd: { value: null },
		useRtao: { value: true ,value0:true},

		GBufferd: { value: true },
		screenWidth: { value: window.innerWidth },
		screenHeight: { value: window.innerHeight },
	}
    constructor(){
		window.SSGITestPram=this.SSGITestPram
		this.initScene()
		window.camera=this.camera
		
		if(!this.SSGITestPram)
		this.orbitControl = new OrbitControls(this.camera,this.renderer.domElement)

		this.models = []
		const self=this
		const ui=new UI({
			renderer:this.renderer,
			camera:this.camera,
			scene:this.scene,
			orbitControl:this.orbitControl
		})
		const light=new Light()
		
		this.resize  = this.resize.bind(self)
		this.animate = this.animate.bind(self)

		const rtxgiNetwork = new Communication(self.camera,ui,light,this.uniforms);
		rtxgiNetwork.onready=()=>{
				ui.init(rtxgiNetwork,light.directionalLightGroup,light.pointLightGroup,light.spotLightGroup,this.uniforms)//initGui(rtxgiNetwork);//
				self.updateCamera(rtxgiNetwork)
				self.loadRoom(rtxgiNetwork,light,self.models)
				light.init(rtxgiNetwork,self.scene)//initLight();
					
				window.onresize = self.resize;
				self.rtxgiNetwork=rtxgiNetwork
				self.animate()
		}
    }
	loadRoom(rtxgiNetwork,light,models){
		/*Directional Light y offset*/
		var directionalYOffset = 15.0;
		const self=this
		//scene parse
		var filestr = rtxgiNetwork.sceneName;
		var sptr = filestr.split('.'); 
		var folder = sptr[0];
		var sUrl = 'CloudBake/' + folder + '/' + filestr;
		//   sUrl='CloudBack/Sponza/Sponza.glb';
		//scene loader
		const modelLoader = new GLTFLoader()
		
		modelLoader.load(sUrl, function(gltf) {
			gltf.scene.traverse(function(node) {
				if (node.isMesh) {
					// console.log(node.material)
					node.geometry.computeVertexNormals()
					node.castShadow = true
					node.receiveShadow = true
					let indirectMaterial = new IndirectMaterial(node.material,rtxgiNetwork,self.uniforms)//indirectShader//.clone();//new IndirectMaterial0({rtxgiNetwork:rtxgiNetwork})//new THREE.MeshStandardMaterial({color:{r:1,g:0.5,b:0}})//
					node.litMaterial = node.material
					// console.log(node.material)
					window.material=indirectMaterial
					node.diffuseMaterial = 
						new THREE.MeshStandardMaterial({map:node.material.map,color:node.material.color})
						node.material
					node.indirectMaterial = indirectMaterial//node.material//
					// console.log(node.diffuseMaterial,"node.diffuseMaterial")
					// node.diffuseMaterial.onBeforeCompile = function ( shader ) {
					// 	for(let tag in indirectMaterial.uniforms){
					// 		shader.uniforms[tag]=indirectMaterial.uniforms[tag]
					// 	}
					// 	shader.vertexShader=indirectMaterial.vertexShader
					// 	shader.fragmentShader=indirectMaterial.fragmentShader
						
					// }
					// node.material=node.indirectMaterial
					models.push(node)
					  
				}
			})
			self.scene.add(gltf.scene)
			/*reset shadowMap and directionalLight*/
			if(rtxgiNetwork.directionalLightCt == 1){
				const sceneBox = new THREE.Box3().expandByObject(gltf.scene);
				let offsetX = (sceneBox.min.x + sceneBox.max.x) / 2.0;
				let offsetZ = (sceneBox.min.z + sceneBox.max.z) / 2.0;
				light.directionalLightGroup[0].position.set(offsetX, sceneBox.max.y + directionalYOffset, offsetZ);
			}
		})
	}
	initScene(){
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setPixelRatio(window.devicePixelRatio)
		if(this.SSGITestPram)
			this.renderer.setSize(this.SSGITestPram.width, this.SSGITestPram.height)
		else 
			this.renderer.setSize(window.innerWidth, window.innerHeight)
		//告诉渲染器需要阴影效果
		if(!this.SSGITestPram){
			this.renderer.shadowMap.enabled = true
			this.renderer.shadowMapSoft = true;
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // BasicShadowMap,PCFSoftShadowMap, PCFShadowMap,VSMShadowMap
			this.renderer.shadowMap.type = THREE.VSMShadowMap;
			this.renderer.shadowMap.autoUpdate = true;
		}
		this.renderer.setClearColor(0xcccccc)
		

		this.renderer.tonemapping = THREE.NoToneMapping;
		this.renderer.setScissorTest = true;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		document.body.appendChild(this.renderer.domElement)
		if(this.SSGITestPram){
			this.camera = new THREE.PerspectiveCamera(
				this.SSGITestPram.camera.fov,
				this.SSGITestPram.width/ this.SSGITestPram.height,
				this.SSGITestPram.camera.near,
				this.SSGITestPram.camera.far
			)
			// this.camera.position.set(
			// 	this.SSGITestPram.camera.pos[0],  
			// 	this.SSGITestPram.camera.pos[1],  
			// 	this.SSGITestPram.camera.pos[2])
			// // this.camera.rotation.set( -1.7197971157282994,  0.87205804959785,  1.7643994826736955)
			// this.camera.rotation.set(
			// 	this.SSGITestPram.camera.rot[0]/180,  
			// 	this.SSGITestPram.camera.rot[1]/180,  
			// 	this.SSGITestPram.camera.rot[2]/180)
			const m=new THREE.Matrix4()
			m.elements = this.SSGITestPram.camera.matrix
			this.camera.applyMatrix4(m)
			console.log(this.camera.rotation.x,this.camera.rotation.y,this.camera.rotation.z)
		}else
			this.camera = new THREE.PerspectiveCamera(
				50,
				window.innerWidth / window.innerHeight,
				0.1,
				100000
			)
		
		this.scene= new THREE.Scene()
		//////////////////////////////////////
		this.litRenderTarget = new THREE.WebGLRenderTarget(
			window.innerWidth,
			window.innerHeight,
			{
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType
			}
		)
		this.uniforms.GBufferd.value = this.litRenderTarget.texture;
    }
	updateCamera(rtxgiNetwork){
		if(this.SSGITestPram)return
		this.camera.fov=rtxgiNetwork.cameraFov
		this.camera.updateProjectionMatrix ()
		this.camera.position.x = rtxgiNetwork.cameraPosition.x;
		this.camera.position.y = rtxgiNetwork.cameraPosition.y;
		this.camera.position.z = rtxgiNetwork.cameraPosition.z;

		this.camera.position.set(6.265035706784675,  5.205148632325065,  -0.7813622315003345)
		this.camera.rotation.set( -1.7197971157282994,  0.87205804959785,  1.7643994826736955)
	}
	render(){
		if(this.SSGITestPram){
			for (var i = 0; i < this.models.length; i++) {
				this.models[i].material = this.models[i].diffuseMaterial
			}
			this.renderer.setRenderTarget(null)
			this.renderer.render(this.scene, this.camera)
			return
		}
		this.uniforms.screenWidth.value = this.renderer.domElement.width;
		this.uniforms.screenHeight.value = this.renderer.domElement.height;

		const models=this.models
		const renderer=this.renderer
		window.renderer=renderer
		const scene=this.scene
		const camera=this.camera
		const litRenderTarget=this.litRenderTarget

		for (var i = 0; i < models.length; i++) {
			models[i].material = models[i].diffuseMaterial
		}
		renderer.setRenderTarget(litRenderTarget)
		renderer.render(scene, camera)
		
		for (var i = 0; i < models.length; i++) {
			models[i].material = models[i].indirectMaterial//models[i].indirectShader;
		}
		renderer.setRenderTarget(null)
		renderer.render(scene, camera)
	}
    animate(){
		if(this.rtxgiNetwork.isDescTouch)this.render()
        requestAnimationFrame(this.animate)
    }
    resize(){
		const renderer=this.renderer
		const camera=this.camera
		
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize(window.innerWidth, window.innerHeight)
		this.litRenderTarget.setSize(window.innerWidth, window.innerHeight)
		this.render()
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new Loader(document.body)
})
// export{THREE}