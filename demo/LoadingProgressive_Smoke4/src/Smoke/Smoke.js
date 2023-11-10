import * as THREE from 'three';
import { ImprovedNoise } from './ImprovedNoise.js';//import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

import {fs} from "./shader/fs.js"
import {vs} from "./shader/vs.js"

export class Smoke{
    constructor(scene,camera){
		// const sizex=7, sizey=1, sizez=4
		const sizex=1, sizey=1, sizez=1
        let mesh=this.#initMesh(sizex, sizey, sizez)
		mesh.scale.set(10,10,10)//mesh.scale.set(4,2.5,4)
		mesh.position.set(11.036844703233468,  54,  24.360768880533755)
		mesh.rotation.y=-0.5
        scene.add( mesh );
		window.smoke=mesh;
        
		let time=0
        function animate() {
            time+=0.01*0.0001

			mesh.material.uniforms.frame.value=time
			mesh.material.uniforms.cameraPos.value.copy( camera.position )
			requestAnimationFrame( animate )
        }
        animate()
    }
	#initTexture(res){ // Texture
		const size = res//32//8//128//256//512//
		const data = new Uint8Array( size * size * size );//new Uint16Array( size * size * size );//
		let i = 0;
		const perlin = new ImprovedNoise();
		for ( let z = 0; z < size; z ++ ) {
			for ( let y = 0; y < size; y ++ ) {
				for ( let x = 0; x < size; x ++ ) {
					const noise=perlin.noise( x  / 1.5, y , z / 1.5 )+0.5
					data[ i ] =noise*255

					i ++;
				}
			}
		}
		const texture = new THREE.Data3DTexture( data, size, size, size );
		texture.format = THREE.RedFormat;
		// texture.type = THREE.HalfFloatType
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.unpackAlignment = 1;
		texture.needsUpdate = true;
		return texture
	}

    #initMesh(sizex, sizey, sizez){
		const res=64
        const geometry = new THREE.BoxGeometry( sizex, sizey, sizez );
		const material = new THREE.RawShaderMaterial( {
			glslVersion: THREE.GLSL3,
			uniforms: {
				base: { value: new THREE.Color( 0x899ab0 ) },//( 0x798aa0 ) },
				map: { value: this.#initTexture(res) },
				cameraPos: { value: new THREE.Vector3() },
				threshold: { value: 0.25 },
				opacity: { value: 0.5 },
				range: { value: 0.1 },
				steps: { value: 100 },//steps: { value: 50 },
				frame: { value: 0 },
				sizex: { value: sizex },
				sizey: { value: sizey },
				sizez: { value: sizez },
				res: { value: res },
			},
			vertexShader:vs.shader,
			fragmentShader:fs.shader,
			side: THREE.BackSide,
			transparent: true
		} );			
        const mesh=new THREE.Mesh( geometry, material )
		return mesh
    }
	fbm_4(  x )//分形布朗运动
	{//不是噪声，但是可以让噪声有更多的细节。
		const f = 2.0;
		const s = 0.5;
		let a = 0.0;
		let b = 0.5;
		
		const  m3  = [
			[ 0.00,  0.80,  0.60],
			[-0.80,  0.36, -0.48],
			[-0.60, -0.48,  0.64]
		];
		for( let i=0; i<4; i++ )//for( int i=min(0, iFrame); i<4; i++ )
		{//把不同比例位置的一张噪声合并在一起
			var n = this.noise(x[0],x[1],x[2]);//texture( map, x ).r;//2.*texture( map, x ).r-1.;//
			console.log(x,"x")
			a += b*n;
			b *= s;
			// x = f*m3*x;
			x=[
				 0.00*x[0] +  0.80*x[1] +  0.60*x[2],
				-0.80*x[0] +  0.36*x[1] + -0.48*x[2],
				-0.60*x[0] + -0.48*x[1] +  0.64*x[2]
			];
			x=[
				f*x[0],f*x[1],f*x[2]
			]
		}
		// console.log(a)
		return a;
	}
	noise(  x,y,z )//0-1?
	{// https://www.shadertoy.com/view/4ttSWf
		function fract( i ){
			return i-Math.floor(i)
		}
		
		var p = {
			x:Math.floor(x),
			y:Math.floor(y),
			z:Math.floor(z),
		};
		var w = {
			x:fract(x),
			y:fract(y),
			z:fract(z),
		};
		
		var u = {
			x:w.x*w.x*w.x*(w.x*(w.x*6.0-15.0)+10.0),
			y:w.y*w.y*w.y*(w.y*(w.y*6.0-15.0)+10.0),
			z:w.z*w.z*w.z*(w.z*(w.z*6.0-15.0)+10.0)
		}
		
		var n = p.x + 317.0*p.y + 157.0*p.z;

		function hash1( i )
		{// https://www.shadertoy.com/view/4ttSWf
			return fract( i*17.0*fract( i*0.3183099 ) );
		}
		var a = hash1(n+0.0);
		var b = hash1(n+1.0);
		var c = hash1(n+317.0);
		var d = hash1(n+318.0);
		var e = hash1(n+157.0);
		var f = hash1(n+158.0);
		var g = hash1(n+474.0);
		var h = hash1(n+475.0);

		var k0 =   a;
		var k1 =   b - a;
		var k2 =   c - a;
		var k3 =   e - a;
		var k4 =   a - b - c + d;
		var k5 =   a - c - e + g;
		var k6 =   a - b - e + f;
		var k7 = - a + b + c - d + e - f - g + h;
		return (k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z);
		// return -1.0+2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z);
	}
}