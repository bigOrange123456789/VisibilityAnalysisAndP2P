// Postprocessing
import * as THREE from "three"
import { 
    GodRaysFakeSunShader, GodRaysDepthMaskShader, GodRaysCombineShader, GodRaysGenerateShader 
} from 'three/examples/jsm/shaders/GodRaysShader.js';

// import {PostprocessingNew} from './PostprocessingNew.js';

import{Godrays}from"./Godrays.js"
import{UnrealBloom}from"./UnrealBloom.js"

export class Postprocessing{
    constructor(camera,scene,renderer){
        this.godrays_stength={ value: 0.2 }
        // this.PostprocessingNew = new PostprocessingNew(scene, camera, renderer);

        this.unrealBloom=new UnrealBloom(camera,scene,renderer)
        this.godrays = new Godrays(camera, scene)
        this._camera = camera;
     
        if(this.unrealBloom)this.init(camera,scene)
        }
    init(){
        const scene = new THREE.Scene()
		const camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, - 10000, 10000 )
		camera.position.z = 100
		scene.add( camera )

        this.uniforms=THREE.UniformsUtils.clone( GodRaysGenerateShader.uniforms )
        const quad = new THREE.Mesh(//？
            new THREE.PlaneGeometry( 1.0, 1.0 ),
            new THREE.ShaderMaterial( {//生成
                uniforms: this.uniforms,
                vertexShader: GodRaysGenerateShader.vertexShader,
                fragmentShader: GodRaysGenerateShader.fragmentShader
            })
        );
        // quad.material.transparent=true
        quad.position.z = - 9900
        scene.add( quad )
        this.scene=scene
        this.camera=camera
    }
    render(){
        // this.test(this.godrays.getTexture())
        if(this.unrealBloom){
            this.mix(
                this.unrealBloom.getTexture(),
                this.godrays.getTexture()
            )  
        }else{
           this.PostprocessingNew.render() 
        }
        
        // 
        //this.renderer.render(this.scene, this.camera);
        //this.godrays.getTexture()
        
        // this.mix(

        //      this.PostprocessingNew.render(),//unrealBloom.getTexture(),
        //      null
            
        //  )  
        // this.unrealBloom.render()//getTexture()    
    }
    mix(textureGodrays, textureBloom){
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
                        vec4 bloom=texture2D( textureBloom, vUv );
                        bloom=1.-bloom;
                        bloom=2.*bloom-0.6;
                        if(bloom.x<0.)bloom=bloom*0.;
                        if(bloom.x>1.)bloom=bloom*0.+1.;
                        
                        //gl_FragColor =texture2D( textureGodrays, vUv );
                       
                        //gl_FragColor=texture2D( textureGodrays, vUv );
                        // if(bloom.r>0.3)bloom=vec4(0.3);
                        gl_FragColor =godrays_stength*bloom +texture2D( textureGodrays, vUv );
                        gl_FragColor.a = 1.0;
                        // gl_FragColor.r = 1.0;
                    }`
            } )
        }
        this.materialTest.uniforms[ 'textureBloom'   ].value=textureBloom//renderTarget.texture
        this.materialTest.uniforms[ 'textureGodrays' ].value=textureGodrays
        this.scene.overrideMaterial = this.materialTest

        // console.log(this._camera.rotation);
        renderer.setRenderTarget(null)
        
        renderer.render(this.scene, this.camera)

        // console.log(this._camera.rotation);
    }
}