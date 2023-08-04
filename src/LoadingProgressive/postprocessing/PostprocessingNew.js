import { program } from "gltf-pipeline/lib/ForEach";
import * as THREE from "three"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import * as POSTPROCESSING from 'postprocessing'
import { SSGIEffect, TRAAEffect, MotionBlurEffect, VelocityDepthNormalPass, SSAOEffect, SSREffect } from "realism-effects"
import { UnrealBloom } from './UnrealBloom'

import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { WebGLRenderer } from "three";
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { MySSAOPass } from "./src/MySSAOPass";
import { WebGLRenderTarget } from "three/src/renderers/WebGLRenderTarget";
import { DepthtoNormal, GodRayShader } from "./DepthtoNormal"
import {WaterNormalCreator} from './WaterNormal'
import { Water } from "three/examples/jsm/objects/Water.js";

import { SSRDebugGUI } from "./SSRDebugGUI"

export class PostprocessingNew {
    constructor(scene, camera, renderer) {
        this.waterNormalCreator = new WaterNormalCreator();
        
        this.clock = new THREE.Clock();
        this.clock.start();
        this.renderer = renderer
        this.camera = camera
        this.scene = scene
        this.SetTonemap();
        this.initWater();
        this.initComposer1();
    }
    SetTonemap()
    {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.5;


        // Set CustomToneMapping to Uncharted2
        // source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
        THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
            'vec3 CustomToneMapping( vec3 color ) { return color; }',
            `#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
					float toneMappingWhitePoint = 1.0;
					vec3 CustomToneMapping( vec3 color ) {
						color *= toneMappingExposure;
						return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );
					}`
        );
    }
    initWater()
    {
        // this.waterNormalCreator.composer.readBuffer.texture.wrapS = THREE.RepeatWrapping;
        // this.waterNormalCreator.composer.readBuffer.texture.wrapT = THREE.RepeatWrapping;
        // this.waterNormalCreator.composer.readBuffer.texture.needsUpdate=false
        // this.waterNormalCreator.composer.readBuffer.texture.repeat = new THREE.Vector2(0.001, 0.001);

        this.ischange = false;
    }
    initComposer0()
    {
        const canvas = document.getElementById('myCanvas')

        //renderer.autoClear = false;
        
        this.texture = new THREE.CanvasTexture(canvas);
        this.composer = new EffectComposer(renderer)
        this.composer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setPixelRatio(window.devicePixelRatio);
        this.composer.renderToScreen = true;
        this.tempTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            depthTexture: new THREE.DepthTexture()
        })

        const texturePass = new TexturePass(this.texture);
        this.composer.addPass(texturePass)

        // this.composer.addPass(new ShaderPass({

        //     uniforms: {
        //         'cameraNear': { value: 1 },
        //         'cameraFar':{value:100},
        //         'tDiffuse': { value: null },
        //         'opacity': { value: 1.0 },
        //         'depthTexture':{value:this.finalTarget.depthTexture}
        //     },

        //     vertexShader: /* glsl */`
        //             varying vec2 vUv;
        //             void main() {
        //                 vUv = uv;
        //                 gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        //             }`,
        //     fragmentShader: /* glsl */`

        // uniform float cameraNear;
        // uniform float cameraFar;
        // uniform sampler2D depthTexture;
        // varying vec2 vUv;

        // #include <packing>

        // float getLinearDepth( const in vec2 screenPosition ) {

        // 	float fragCoordZ = texture2D( depthTexture, screenPosition ).x;
        // 	float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
        // 	return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        // }

        // void main() {

        // 	float depth = getLinearDepth( vUv );
        // 	gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

        // }`
        // }))

        // this.composer.addPass(new ShaderPass(DepthtoNormal));

        this.GodRayShader = GodRayShader;
        this.GodRayPass = new ShaderPass(this.GodRayShader)
        this.composer.addPass(this.GodRayPass);
        DepthtoNormal.uniforms['u_Near'].value = 1.0;
        DepthtoNormal.uniforms['u_Far'].value = 100.0;
        DepthtoNormal.uniforms['u_Fov'].value = 1;
        DepthtoNormal.uniforms['u_WindowWidth'].value = window.innerWidth;
        DepthtoNormal.uniforms['u_WindowHeight'].value = window.innerHeight;
        //DepthtoNormal.uniforms['u_DepthTexture'].value = this.composer.writeBuffer.texture;

        //this.composer.addPass(new ShaderPass(CopyShader))
        //this.waterNormal=scene.

    }
    initComposer1()
    {
        const scene = this.scene;
        const camera = this.camera;
        const composer = new POSTPROCESSING.EffectComposer(renderer)
        
        const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
        composer.addPass(new POSTPROCESSING.RenderPass(scene, camera))
        const canvas = document.getElementById('myCanvas')
        // this.tempTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        //     depthTexture: new THREE.DepthTexture()
        // })
        // this.texture = new THREE.CanvasTexture(canvas);   
        //composer.addPass(new POSTPROCESSING.TextureEffect(POSTPROCESSING.BlendFunction.ADD,this.texture))

        //composer.addPass(velocityDepthNormalPass)
        // SSGI
        //const ssgiEffect = new SSGIEffect(scene, camera, velocityDepthNormalPass, options ?)
        const msaaPass = new POSTPROCESSING.EffectPass(camera)
        const ctx = renderer.getContext()
        composer.multisampling = Math.min(4, ctx.getParameter(ctx.MAX_SAMPLES))
        //composer.addPass(msaaPass)
        this.renderer.logarithmicDepthBuffer = true;
        // TRAA
        const traaEffect = new TRAAEffect(scene, camera, velocityDepthNormalPass)

        // Motion Blur
        //const motionBlur = new MotionBlurEffect(velocityDepthNormalPass)
        
        // SSAO
        const ssaoEffect = new SSAOEffect(composer, camera, scene)

        // HBAO
        //const hbaoEffect = new HBAOEffect(composer, camera, scene)
        const ssrEffect = new SSREffect(scene, camera, velocityDepthNormalPass)
        //var gui = new SSRDebugGUI(ssrEffect)
        //const effectPass = new POSTPROCESSING.EffectPass(camera)

        //composer.addPass(effectPass)
        this.composer = composer;
    }
    
    render() {
        
        this.waterNormalCreator.GetTexture(this.clock.getElapsedTime()*0.3);
        if (!this.ischange&&window.waterMaterial) {
            //window.waterMaterial.map = this.waterNormalCreator.target.texture;
            window.waterMaterial.normalMap = this.waterNormalCreator.composer.readBuffer.texture;
            this.ischange = true;
            console.log(window.waterMaterial);
        }
        //this.render0()
        this.composer.render();
    }
    render0()
    {
        this.GodRayShader.uniforms['iTime'].value = this.clock.elapsedTime;
        //this.GodRayPass.material.uniforms['iTime'].value = GodRayShader.uniforms['iTime'].value;
        this.GodRayPass.material.uniforms['decay'].value = GodRayShader.uniforms['decay'].value;
        this.GodRayPass.material.uniforms['density'].value = GodRayShader.uniforms['density'].value;
        this.GodRayPass.material.uniforms['weight'].value = GodRayShader.uniforms['weight'].value;

        this.renderer.setRenderTarget(null);
        //this.scene.overrideMaterial = window.material;
        this.renderer.render(this.scene, this.camera);
        //console.log(this.renderer.info.render);
        this.texture.needsUpdate = true;
        this.renderer.setRenderTarget(null);
        this.composer.render();
        //this.renderer.clear();
        //this.composer2.render();
    }
}