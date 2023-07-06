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
            const loader = new THREE.TextureLoader();
            const texture = loader.load('./grass_texture.jpg');
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            this.materialTest = new THREE.ShaderMaterial( {//假太阳？
                uniforms: {
                    iTime: {value: 0},
                    iChannel0: { value: texture },
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