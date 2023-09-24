import * as THREE from 'three';
import { ImprovedNoise } from './ImprovedNoise.js';//import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

import {fs} from "./shader/fs.js"
import {vs} from "./shader/vs.js"

export class Smoke{
	//f(0)=f(1)
	//g(x)+g(1-x)
	sizex=40
	sizey=1
	sizez=12
    constructor(scene,camera){
        const mesh=this.#initMesh()
        mesh.position.set(
            camera.position.x,
            camera.position.y,
            camera.position.z
        )
        // const mesh=this.mesh
		window.smoke=mesh
		mesh.scale.set(2.5,2.5,2.5)
		mesh.position.set(11.036844703233468,  55,  24.360768880533755)
        scene.add( mesh );
        
		const material=mesh.material
		let time=0
        function animate() {
            time+=0.01
			// if(time>1)time=0;
			// if(time<1)material.uniforms.frame.value=time
			// else material.uniforms.frame.value=time//2-time

			material.uniforms.frame.value=time
			// console.log(material.uniforms.frame.value)
			material.uniforms.cameraPos.value.copy( camera.position )
            // mesh.rotation.y = - performance.now() / 7500
            // material.uniforms.frame.value ++

			// material.uniforms.frame.value+=0.001
			// if(material.uniforms.frame.value>1)material.uniforms.frame.value=0
            // console.log(material.uniforms.frame)
			requestAnimationFrame( animate )
        }
        animate()
    }
	#initTexture(){
		const size = 128;
		const data = new Uint8Array( size * size * size );

		let i = 0;
		const scale = 0.05;
		const perlin = new ImprovedNoise();
		const vector = new THREE.Vector3();

		for ( let z = 0; z < size; z ++ ) {
			for ( let y = 0; y < size; y ++ ) {
				for ( let x = 0; x < size; x ++ ) {
					const d = 1.0 - vector.set( x, y, z ).subScalar( size / 2 ).divideScalar( size ).length();
					data[ i ] = ( 128 + 128 * perlin.noise( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
					// data[ i ] = ( 128 + 128 * 1. ) * d * d;
					i ++;
				}
			}
		}

		const texture = new THREE.Data3DTexture( data, size, size, size );
		texture.format = THREE.RedFormat;
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.unpackAlignment = 1;
		texture.needsUpdate = true;
		return texture
	}
    #initMesh(){
        const geometry = new THREE.BoxGeometry( this.sizex, this.sizey, this.sizez );
		const material = new THREE.RawShaderMaterial( {
			glslVersion: THREE.GLSL3,
			uniforms: {
				base: { value: new THREE.Color( 0x798aa0 ) },
				map: { value: this.#initTexture() },
				cameraPos: { value: new THREE.Vector3() },
				threshold: { value: 0.25 },
				opacity: { value: 0.25 },
				range: { value: 0.1 },
				steps: { value: 100 },
				frame: { value: 0 },
				sizex: { value: this.sizex },
				sizey: { value: this.sizey },
				sizez: { value: this.sizez },
			},
			vertexShader:vs.shader,
			fragmentShader:fs.shader,
			side: THREE.BackSide,
			transparent: true
		} );			
        const mesh=new THREE.Mesh( geometry, material )
		// const mesh=new THREE.InstancedMesh( geometry, material ,1)
		// for(let i=0;i<10;i++){
		// 	const matrix=new THREE.Matrix4()
		// 	matrix.set( 
		// 		1,0,0,0,
		// 		0,i*10,0,0,
		// 		0,0,1,0,
		// 		0,0,0,1,
		// 	)
		// 	mesh.setMatrixAt ( i, matrix  )
		// }
		return mesh
    }
}