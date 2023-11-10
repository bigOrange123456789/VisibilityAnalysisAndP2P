// Postprocessing
import * as THREE from "three"
import { 
    GodRaysGenerateShader 
} from 'three/examples/jsm/shaders/GodRaysShader.js';
import { ImprovedNoise } from './ImprovedNoise.js';
import { Shader } from "./Shader.js";
export class Postprocessing{
    constructor(){
        this.mouse=this.getMouse()


        this.godrays_stength={ value: 0.2 }
        this.init()
    }
    getMouse(){
        const mouse = new THREE.Vector2();
        window.addEventListener( 'mousemove', event=>{//鼠标移动事件
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1 ;
        }, false );
        return mouse
    }
    #initTexture(res){ // Texture
		const size = res//32//8//128//256//512//
		const data = new Uint8Array( size * size * size );//new Uint16Array( size * size * size );//
		let i = 0;
		const perlin = new ImprovedNoise();
		for ( let z = 0; z < size; z ++ ) {
			for ( let y = 0; y < size; y ++ ) {
				for ( let x = 0; x < size; x ++ ) {
					const noise=perlin.noise( x  / 1.5, y/ 1.5 , z / 1.5 )+0.5
					data[ i ] =noise*255

					i ++;
				}
			}
		}
		const texture = new THREE.DataTexture( data, size, size );
		// texture.format = THREE.RedFormat;
		// texture.type = THREE.HalfFloatType
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.unpackAlignment = 1;
		texture.needsUpdate = true;

        // texture.minFilter = THREE.NearestFilter;
        // texture.magFilter = THREE.NearestFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
		return texture
	}
    init(){
        this.scene = new THREE.Scene()
		this.camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, - 10000, 10000 )
		this.camera.position.z = 100
		this.scene.add( camera )

        this.uniforms=THREE.UniformsUtils.clone( GodRaysGenerateShader.uniforms )

        this.quad = new THREE.Mesh(//？
            new THREE.PlaneGeometry( 1.0, 1.0 ),
            new THREE.ShaderMaterial( {//生成
                uniforms: this.uniforms,
                vertexShader: GodRaysGenerateShader.vertexShader,
                fragmentShader: GodRaysGenerateShader.fragmentShader
            })
        );
        this.quad.position.z = - 9900
        this.scene.add( this.quad )
    }
    render(){
        this.mix(null)    
    }
    mix(){
        if(!this.materialTest){
            // alert(111)
            const load=(name,id)=>{
                const loader = new THREE.TextureLoader()
                const url='./shadertory/'+name
                const texture = loader.load(url)
                texture.minFilter = THREE.NearestFilter;
                texture.magFilter = THREE.NearestFilter;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                
                // console.log(texture)
                // texture.wrapS = THREE.RepeatWrapping;
                // texture.wrapT = THREE.RepeatWrapping;
                // texture.repeat.set(10, 10);
                
                return texture
            }
            console.log(this.#initTexture(64))
            console.log(load('img.png',0))

            this.materialTest = new THREE.ShaderMaterial( {
                uniforms: {
                    iTime: {value: 100},                    
                    iResolution: {
                        value: new THREE.Vector2(1, 1)//(1900, 1900)
                    },
                    iChannel0: { value: this.#initTexture(64) },
                    // iChannel0: { type: 't', value: load('img.png',0) },
                    iChannel1: { type: 't', value: load('img1.jpg',1) },
                    iChannel2: { type: 't', value: load('img2.jpg',2) },
                    iChannel3: { type: 't', value: load('img3.jpg',3) },
                    iMouse:{
                        value: new THREE.Vector2(1, 1)
                    }
                },
                vertexShader: /* glsl */`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }`,
                fragmentShader: new Shader().fragmentShader
            } )
        }
        this.materialTest.uniforms[ 'iTime'   ].value+=(1/60)
        this.materialTest.uniforms[ 'iMouse'   ].value=this.mouse


        this.scene.overrideMaterial = this.materialTest
        renderer.setRenderTarget( null )
        renderer.render( this.scene, this.camera )
    }
}