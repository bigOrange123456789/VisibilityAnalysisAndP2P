import * as THREE from '../build/three.module'
// import * as THREE from 'three'
import { GLTFLoader } from '../three/jsm/loaders/GLTFLoader'
import {IndirectMaterial} from "./IndirectMaterial"
import {UI} from "./UI"
import {Control} from "./Control"
import {Communication} from "./Communication"
import {Light} from "./Light"
class Loader{
    constructor(){
		this.initScene()
		this.controls = new Control(this.camera, this.renderer)
		this.models = []
		const self=this
		const ui=new UI()
		const light=new Light()
		
		
		
		this.resize  = this.resize.bind(self)
		this.animate = this.animate.bind(self)
		
		IndirectMaterial.pre(()=>{
			const rtxgiNetwork = new Communication();
			rtxgiNetwork.onready=()=>{
					ui.init(rtxgiNetwork,light.directionalLightGroup,light.pointLightGroup,light.spotLightGroup,self.models)//initGui(rtxgiNetwork);//
					self.updateCamera(rtxgiNetwork)
					self.loadRoom(rtxgiNetwork,light,self.models)
					light.init(rtxgiNetwork,self.scene)//initLight();
					
					window.onresize = self.resize;
					self.rtxgiNetwork=rtxgiNetwork
					self.animate()
			}
			rtxgiNetwork.init(self.camera,ui,light,self.models)
		})
    }
	loadRoom(rtxgiNetwork,light,models){
		/*Directional Light y offset*/
		var directionalYOffset = 15.0;
		const self=this
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
				console.log(node.material)
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
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		//告诉渲染器需要阴影效果
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMapSoft = true;
		this.renderer.setClearColor(0xcccccc)
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // BasicShadowMap,PCFSoftShadowMap, PCFShadowMap,VSMShadowMap
		this.renderer.shadowMap.autoUpdate = true;
		this.renderer.tonemapping = THREE.NoToneMapping;
		this.renderer.setScissorTest = true;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		document.body.appendChild(this.renderer.domElement)
		
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
    }
	updateCamera(rtxgiNetwork){
		this.camera.fov=rtxgiNetwork.cameraFov
		this.camera.updateProjectionMatrix ()
		this.camera.position.x = rtxgiNetwork.cameraPosition.x;
		this.camera.position.y = rtxgiNetwork.cameraPosition.y;
		this.camera.position.z = rtxgiNetwork.cameraPosition.z;
		this.controls = new Control(this.camera, this.renderer)
	}
	render(){
		const models=this.models
		const renderer=this.renderer
		const scene=this.scene
		const camera=this.camera
		const litRenderTarget=this.litRenderTarget

		for (var i = 0; i < models.length; i++) {
			models[i].material = models[i].diffuseMaterial
		}
		// renderer.setRenderTarget(litRenderTarget)
		// renderer.render(scene, camera)
		// for (var i = 0; i < models.length; i++) {
		// 	models[i].indirectMaterial.uniforms.screenWidth.value = renderer.domElement.width;
		// 	models[i].indirectMaterial.uniforms.screenHeight.value = renderer.domElement.height;
		// 	models[i].indirectMaterial.uniforms.GBufferd.value = litRenderTarget.texture;
		// 	models[i].material = models[i].indirectMaterial//models[i].indirectShader;
		// }
		// renderer.setRenderTarget(null)
		renderer.render(scene, camera)
	}
    animate(){
		if(this.rtxgiNetwork.isDescTouch)this.render()
		this.controls.run()
        requestAnimationFrame(this.animate)
    }
    resize(){
		const models=this.models
		const renderer=this.renderer
		const camera=this.camera
		
        for (var i = 0; i < models.length; i++) {
			models[i].indirectMaterial.uniforms.screenWidth.value = window.innerWidth
			models[i].indirectMaterial.uniforms.screenHeight.value = window.innerHeight
		}
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize(window.innerWidth, window.innerHeight)
		this.render()
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new Loader(document.body)
})