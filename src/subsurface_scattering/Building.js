import * as THREE from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
// import { SubsurfaceScatteringShader } from 'three/examples/jsm/shaders/SubsurfaceScatteringShader.js'
import { SubsurfaceScatteringShader } from './SubsurfaceScatteringShader.js'

export class Building{
    constructor(scene){
		const self=this
		self.material=self.getMaterail()
		const loaderFBX = new FBXLoader();
		loaderFBX.load( 'subsurface_scattering/stanford-bunny.fbx', function ( object ) {
			const model = object.children[ 0 ]
			model.position.set( 0, 0, 10 )
			model.scale.setScalar( 1 )
			model.material = self.material
			scene.add( model )
		} )// initGUI( uniforms );
    }
	getMaterail(){
		const loader = new THREE.TextureLoader();
		const imgTexture = loader.load( 'subsurface_scattering/white.jpg' )
		imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping

		const shader = SubsurfaceScatteringShader
		// console.log(shader.fragmentShader)
		const uniforms = THREE.UniformsUtils.clone( shader.uniforms )

		uniforms[ 'map' ].value = imgTexture
		uniforms[ 'diffuse' ].value = new THREE.Vector3( 1.0, 0.2, 0.2 )
		uniforms[ 'shininess' ].value = 500

		uniforms[ 'thicknessMap' ].value = loader.load( 'subsurface_scattering/bunny_thickness.jpg' )
		uniforms[ 'thicknessColor' ].value = new THREE.Vector3( 0.5, 0.3, 0.0 )
		uniforms[ 'thicknessDistortion' ].value = 0.1
		uniforms[ 'thicknessAmbient' ].value = 0.4
		uniforms[ 'thicknessAttenuation' ].value = 0.8
		uniforms[ 'thicknessPower' ].value = 2.0;
		uniforms[ 'thicknessScale' ].value = 16.0;

		const material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			lights: true
		} )
		material.extensions.derivatives = true;
		return material
	}
}
