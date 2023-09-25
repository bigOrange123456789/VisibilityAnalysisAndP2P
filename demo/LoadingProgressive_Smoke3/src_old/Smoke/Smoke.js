import * as THREE from 'three';
import { ImprovedNoise } from './ImprovedNoise.js';//import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

import {fs} from "./shader/fs.js"
import {vs} from "./shader/vs.js"

export class Smoke{
    constructor(scene,camera){
		const sizex=40, sizey=1, sizez=12
		// const sizex=1, sizey=1, sizez=1
        let mesh=this.#initMesh(sizex, sizey, sizez)
		mesh.scale.set(2.5,2.5,2.5)
		mesh.position.set(11.036844703233468,  55,  24.360768880533755)
        scene.add( mesh );

		// const mesh2=this.#initMesh(1, 1, 1)
		// mesh2.scale.set(2.5*sizex,2.5,2.5*sizez)
		// mesh2.position.set(11.036844703233468,  55+5,  24.360768880533755)
        // scene.add( mesh2 );
        
		let time=0
        function animate() {
            time+=0.01

			mesh.material.uniforms.frame.value=time
			mesh.material.uniforms.cameraPos.value.copy( camera.position )
			// mesh2.material.uniforms.frame.value=time
			// mesh2.material.uniforms.cameraPos.value.copy( camera.position )
			requestAnimationFrame( animate )
        }
        animate()
    }
	#initTextureOld(){
		const size = 128;
		const data = new Uint8Array( size * size * size );

		let i = 0;
		const scale =0.1// 0.05;
		const perlin = new ImprovedNoise();
		const vector = new THREE.Vector3();

		for ( let z = 0; z < size; z ++ ) {
			for ( let y = 0; y < size; y ++ ) {
				for ( let x = 0; x < size; x ++ ) {
					const d = 1.0 - vector.set( x, y, z ).subScalar( size / 2 ).divideScalar( size ).length();
					// console.log(d)
					// data[ i ] = ( 128 + 128 * perlin.noise( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
					// data[ i ] = Math.floor(Math.random()*255);//( 128 + 128 * 1. ) * d * d;
					data[i]=this.noise(  x/size,y/size,z/size )*255
					i ++;
				}
			}
		}
		console.log("data",data)

		const texture = new THREE.Data3DTexture( data, size, size, size );
		texture.format = THREE.RedFormat;
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.unpackAlignment = 1;
		texture.needsUpdate = true;
		return texture
	}
	#initTextureold2(){
		const size = 128;
		const data = new Uint8Array( size * size * size );

		let i = 0;

		for ( let z = 0; z < size; z ++ ) {
			for ( let y = 0; y < size; y ++ ) {
				for ( let x = 0; x < size; x ++ ) {
					data[i]=90//9999*this.noise(  x/size,y/size,z/size )*255+9999
					i ++;
				}
			}
		}
		console.log("data .",data)

		const texture = new THREE.Data3DTexture( data, size, size, size );
		// let map2 = new THREE.DataTexture()
		// texture.type = THREE.HalfFloatType
		texture.format = THREE.RedFormat;
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.unpackAlignment = 1;
		texture.needsUpdate = true;
		return texture
	}
	#initTexture(){ // Texture
		const size = 32//8//128//256//512//
		const data = new Uint8Array( size * size * size );//new Uint16Array( size * size * size );//
		let i = 0;
		const scale = 0//0.01;//0.05;
		const perlin = new ImprovedNoise();
		const vector = new THREE.Vector3();
		for ( let z = 0; z < size; z ++ ) {
			for ( let y = 0; y < size; y ++ ) {
				for ( let x = 0; x < size; x ++ ) {
					const k=10
					// data[ i ] = this.fbm_4(  [k*x/size,k*y/size,k*z/size] )*255
					// console.log(this.fbm_4(  [k*x/size,k*y/size,k*z/size] ))
					// data[ i ] = this.noise(  x/size,y/size,z/size )*255
					// this.noise(  100.01*x,100.01*y,100.01*z )//*255//( 128 + 128 * perlin.noise( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
					const d = 1.0 - vector.set( x, y, z ).subScalar( size / 2 ).divideScalar( size ).length();//到原点的距离
					data[ i ] = ( 128 + 128 * perlin.noise( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
					const noise=perlin.noise( x  / 1.5, y , z / 1.5 )+0.5
					data[ i ] =noise*255

					i ++;
				}
			}
		}
		console.log("data .",data)

		const texture = new THREE.Data3DTexture( data, size, size, size );
		texture.format = THREE.RedFormat;
		// texture.type = THREE.HalfFloatType
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.unpackAlignment = 1;
		texture.needsUpdate = true;
		//////////////////////
		//////////////////////
		return texture
	}

    #initMesh(sizex, sizey, sizez){
        const geometry = new THREE.BoxGeometry( sizex, sizey, sizez );
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
				sizex: { value: sizex },
				sizey: { value: sizey },
				sizez: { value: sizez },
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