// {
//     "imports": {
//         "three": "../build/three.module.js",
//         "three/addons/": "./jsm/",
//         "three/nodes": "./jsm/nodes/Nodes.js"
//     }
// }
import * as THREE from 'three';
import { mix, range, normalWorld, oscSine, timerLocal } from '../../lib/three/examples/jsm/nodes/Nodes.js';

import WebGPU from '../../lib/three/examples/jsm/capabilities/WebGPU.js';
import WebGPURenderer from '../../lib/three/examples/jsm/renderers/webgpu/WebGPURenderer.js';

			let camera, scene, renderer;

			let mesh;
			const amount = parseInt( window.location.search.slice( 1 ) ) || 10;
			const count = Math.pow( amount, 3 );

			init().then( ()=>{
                //animate
            } ).catch( ()=>{
                console.error( error )
            } );

			async function init() {

				if ( WebGPU.isAvailable() === false ) {

					document.body.appendChild( WebGPU.getErrorMessage() );

					throw new Error( 'No WebGPU support' );

				}


				const material = new THREE.MeshBasicMaterial();

				const randomColors = range( new THREE.Color( 0x000000 ), new THREE.Color( 0xFFFFFF ) );
				material.colorNode = mix( normalWorld, randomColors, oscSine( timerLocal( .1 ) ) );

                const geometry=new THREE.ConeGeometry( 5, 20, 32 ); 
				{

					geometry.computeVertexNormals();
					geometry.scale( 0.5, 0.5, 0.5 );

					mesh = new THREE.InstancedMesh( geometry, material, count );
					scene.add( mesh );

				} 

				//
				renderer = new WebGPURenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );


				return renderer.init();

			}

			function render() {

				

				renderer.render( scene, camera );

			}

			function error( error ) {

				console.error( error );

			}
export class Test2{
    constructor(scene){

    }

}