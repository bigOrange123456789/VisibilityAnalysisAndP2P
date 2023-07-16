// Postprocessing
import * as THREE from "three"
import { 
    GodRaysGenerateShader 
} from 'three/examples/jsm/shaders/GodRaysShader.js';

import { Shader } from "./Shader.js";
export class Postprocessing{
    constructor(){

        this.godrays_stength={ value: 0.2 }
        this.init()
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
            

            this.materialTest = new THREE.ShaderMaterial( {
                uniforms: {
                    iTime: {value: 0},                    
                    iResolution: {
                        value: new THREE.Vector2(1, 1)//(1900, 1900)
                    },
                    iChannel0: { type: 't', value: load('img.png',0) },
                    iChannel1: { type: 't', value: load('img1.jpg',1) },
                    iChannel2: { type: 't', value: load('img2.jpg',2) },
                    iChannel3: { type: 't', value: load('img3.jpg',3) },
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
        this.scene.overrideMaterial = this.materialTest
        renderer.setRenderTarget( null )
        renderer.render( this.scene, this.camera )
    }
}