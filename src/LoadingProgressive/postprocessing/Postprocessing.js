// Postprocessing
import * as THREE from "three"
import { 
    GodRaysFakeSunShader, GodRaysDepthMaskShader, GodRaysCombineShader, GodRaysGenerateShader 
} from 'three/examples/jsm/shaders/GodRaysShader.js';

import{Godrays}from"./Godrays.js"
import{UnrealBloom}from"./UnrealBloom.js"

export class Postprocessing{
    constructor(camera,scene,renderer){
        this.godrays_stength={ value: 0.2 }
        this.unrealBloom=new UnrealBloom(camera,scene,renderer)
        this.godrays=new Godrays(camera,scene)
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
        // this.test(this.godrays.getTexture())   
        // this.mix(
        //     this.unrealBloom.getTexture(),
        //     this.godrays.getTexture()
        // )  
        this.mix(
            this.godrays.getTexture(),
            this.unrealBloom.getTexture(),
        )  
        // this.unrealBloom.render()//getTexture()    
    }
    mix(textureGodrays,textureBloom){
        // console.log(texture)
        if(!this.materialTest){
            this.materialTest = new THREE.ShaderMaterial( {//假太阳？
                uniforms: {
                    textureBloom: {value: null},
                    textureGodrays:{value: null},
                    godrays_stength: this.godrays_stength,
                },
                vertexShader: /* glsl */`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }`,
                fragmentShader: /* glsl */`
                    varying vec2 vUv;
                    uniform sampler2D textureBloom;
                    uniform sampler2D textureGodrays;
                    uniform float godrays_stength;
                    void main() {
                        vec4 godrays=texture2D( textureGodrays, vUv );
                        godrays=1.-godrays;
                        godrays=2.*godrays-0.6;
                        if(godrays.x<0.)godrays=godrays*0.;
                        if(godrays.x>1.)godrays=godrays*0.+1.;
                        gl_FragColor =godrays_stength*godrays +texture2D( textureBloom, vUv );
                        gl_FragColor.a = 1.0;
                        // gl_FragColor.r = 1.0;
                    }`
            } )
        }
        this.materialTest.uniforms[ 'textureBloom'   ].value=textureBloom//renderTarget.texture
        this.materialTest.uniforms[ 'textureGodrays' ].value=textureGodrays
        this.scene.overrideMaterial = this.materialTest
        renderer.setRenderTarget( null )
        renderer.render( this.scene, this.camera )
    }
}