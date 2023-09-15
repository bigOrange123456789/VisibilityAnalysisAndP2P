import * as THREE from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
// import { SubsurfaceScatteringShader } from 'three/examples/jsm/shaders/SubsurfaceScatteringShader.js'
import { SubsurfaceScatteringShader } from './SubsurfaceScatteringShader.js'

export class Building{
    constructor(scene){
		const self=this
		self.scene=scene
		self.sssMaterialList=[]
		self.material1=self.getMaterail(true)
		self.material2=self.getMaterail(false)
		
		self.model1=self.load1()
		self.model2=self.load2()
		self.model1.visible=false
    }
	useModel(type){
		if(type=="兔子"){
			this.model1.visible=true
			this.model2.visible=false
		}else{
			this.model1.visible=false
			this.model2.visible=true
		}
		console.log(this.model1,this.model2)
	}
	getMaterail(thicknessMapUse){
		const shader = SubsurfaceScatteringShader
		const uniforms = THREE.UniformsUtils.clone( shader.uniforms )

		uniforms[ 'thicknessColor' ].value = new THREE.Vector3( 0.5, 0.3, 0.0 )
		uniforms[ 'thicknessDistortion' ].value = 0.1
		uniforms[ 'thicknessAmbient' ].value = 0.4
		uniforms[ 'thicknessAttenuation' ].value = 0.8
		uniforms[ 'thicknessPower' ].value = 2.0;
		uniforms[ 'thicknessScale' ].value = 16.0;

		const material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: thicknessMapUse?shader.fragmentShader:shader.fragmentShader2,
			lights: true
		} )
		material.extensions.derivatives = true;
		this.sssMaterialList.push(material)
		return material
	}
	setMaterial(material,opt){
		for(let tag in opt)material.uniforms[tag].value=opt[tag]
	}
	load1(){
		const scene=new THREE.Object3D()
		this.scene.add(scene)
		const self=this
		const loaderFBX = new FBXLoader();
		loaderFBX.load( 'subsurface_scattering/stanford-bunny.fbx', function ( object ) {
			const model = object.children[ 0 ]
			model.position.set( 0, 0, 10 )
			model.scale.setScalar( 1 )
			model.material = self.material1
			scene.add( model )

			const loader = new THREE.TextureLoader();
			const imgTexture = loader.load( 'subsurface_scattering/white.jpg' )
			imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping
			const thicknessMap = loader.load( 'subsurface_scattering/bunny_thickness.jpg' )
			self.setMaterial(
				model.material,
				{
					map:imgTexture,
					thicknessMap:thicknessMap,
					diffuse:new THREE.Vector3( 1.0, 0.2, 0.2 ),
					shininess:500,

					thicknessColor:new THREE.Vector3( 0.5, 0.3, 0.0 )
				}
			)
		} )// initGUI( uniforms );
		return scene
	}
	load2(){
		const scene=new THREE.Object3D()
		this.scene.add(scene)
		const self=this
		const textureLoader = new THREE.TextureLoader();

		const diffuseMap = textureLoader.load( 'subsurface_scattering/LeePerrySmith/Map-COL.jpg' );
		diffuseMap.encoding = THREE.sRGBEncoding;

		const specularMap = textureLoader.load( 'subsurface_scattering/LeePerrySmith/Map-SPEC.jpg' );
		specularMap.encoding = THREE.sRGBEncoding;

		const normalMap = textureLoader.load( 'subsurface_scattering/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg' );

		// const material = new THREE.MeshPhongMaterial( {
		// 	color: 0xdddddd,
		// 	specular: 0x222222,
		// 	normalScale: new THREE.Vector2( 0.8, 0.8 )
		// } );
		const material = self.material2
		material.map=diffuseMap
		material.specularMap=specularMap
		material.normalMap=normalMap
		const k=0.25/2
		


		const loader = new GLTFLoader();
		loader.load( 'subsurface_scattering/LeePerrySmith/LeePerrySmith.glb', function ( gltf ) {

			createScene( gltf.scene.children[ 0 ].geometry, 100, material );
			// createScene( gltf.scene.children[ 0 ].geometry, 100, material );

		} );
		function createScene( geometry, scale, material ) {

			const mesh = new THREE.Mesh( geometry, material );

			mesh.position.y = - 50;
			mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

			scene.add( mesh );

			self.setMaterial(
				material,
				{
				map:diffuseMap,
				specularMap:specularMap,
				normalMap:normalMap,
				shininess:35,
	
				thicknessColor:new THREE.Vector3( 1*k, 0.06*k, 0.0 )
			})

		}
		return scene
	}
}
