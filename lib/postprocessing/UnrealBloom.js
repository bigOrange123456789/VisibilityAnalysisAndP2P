import * as THREE from "three"
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js';
import { SSRPass  } from 'three/examples/jsm/postprocessing/SSRPass.js';
import { BokehPass  } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass.js';
import { MyEffectComposer } from "./src/MyEffectComposer.js";
import { MyUnrealBloomPass} from "./src/MyUnrealBloomPass.js";


import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

import * as POSTPROCESSING from "./src2/postprocessing"
import { VelocityDepthNormalPass } from "./src2/temporal-reproject/pass/VelocityDepthNormalPass"
import { HBAOEffect } from "./src2/hbao/HBAOEffect"
import { SSAOEffect } from "./src2/ssao/SSAOEffect"
import { HBAODebugGUI } from "./src2/HBAODebugGUI"
import { SSAODebugGUI } from "./src2/SSAODebugGUI"
import { HBAOSSAOComparisonEffect } from "./src2/HBAOSSAOComparisonEffect"
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';

import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';

export class UnrealBloom{
    constructor(camera, scene, renderer) {
        // alert(111)
        
        this.camera=camera
        this.scene = scene
        this.renderer=renderer
        // this.renderTarget=new THREE.WebGLRenderTarget( window.innerWidth , window.innerHeight )
         this.composer=this.initComposer0(renderer)
        // this.composer2=this.initComposer2()
        
    }
    initComposer1(renderer){
        const scene=this.scene
        const camera=this.camera
        const hbaoOptions = {
            resolutionScale: 1,
            spp: 16,
            distance: 2.1399999999999997,
            distancePower: 1,
            power: 2,
            bias: 39,
            thickness: 0.1,
            color: 0,
            useNormalPass: false,
            velocityDepthNormalPass: null,
            normalTexture: null,
            iterations: 1,
            samples: 5
        }
        const ssaoOptions = {
            resolutionScale: 1,
            spp: 16,
            distance: 1,
            distancePower: 0.25,
            power: 2,
            bias: 250,
            thickness: 0.075,
            color: 0,
            useNormalPass: false,
            velocityDepthNormalPass: null,
            normalTexture: null,
            iterations: 1,
            samples: 5
        }
        const composer = new POSTPROCESSING.EffectComposer(renderer)
        const renderPass = new POSTPROCESSING.RenderPass(scene, camera)
        composer.addPass(renderPass)
    
        const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
        composer.addPass(velocityDepthNormalPass)
        
        // const hbaoEffect = new HBAOEffect(composer, camera, scene, hbaoOptions)
        // const hbaoPass = new POSTPROCESSING.EffectPass(camera, hbaoEffect)
        // composer.addPass(hbaoPass)
        // const gui3 = new HBAODebugGUI(hbaoEffect, hbaoOptions)
        // gui3.pane.containerElem_.style.right = "8px"
        // gui3.pane.containerElem_.style.top = "5px"

        
        const ssaoEffect = new SSAOEffect(composer, camera, scene, ssaoOptions)
        console.log("ssaoEffect",ssaoEffect)
        const ssaoPass = new POSTPROCESSING.EffectPass(camera, ssaoEffect)
        composer.addPass(ssaoPass)
        this.ssaoPass2=ssaoEffect//SSAOEffect.DefaultOptions//ssaoPass
        // const gui4 = new SSAODebugGUI(ssaoEffect, ssaoOptions)
		// gui4.pane.containerElem_.style.left  = "8px"
		// gui4.pane.containerElem_.style.top = "5px"

    
        // const hbaoSsaoComparisonEffect = new HBAOSSAOComparisonEffect(hbaoEffect, ssaoEffect)
        // composer.addPass(new POSTPROCESSING.EffectPass(camera, hbaoSsaoComparisonEffect))

        

		

        return composer
    }
    initComposer0(renderer){//设置光晕
        // alert(111)
        // console.log(renderer)
        const scene=this.scene
        const camera=this.camera
        this.renderPass=new RenderPass(scene, camera)
        // this.renderPass.setClearColor(0xcccccc)
        this.bloomPass=new MyUnrealBloomPass(//创建辉光通道
                new THREE.Vector2(window.innerWidth, window.innerHeight),//参数一：泛光覆盖场景大小，二维向量类型
                0.31,//0.65,//0.4,    //参数二：bloomStrength 泛光强度，值越大明亮的区域越亮，较暗区域变亮的范围越广
                2,//0.3,//参数三：bloomRadius 泛光散发半径
                0//0.75//参数四：bloomThreshold 泛光的光照强度阈值，如果照在物体上的光照强度大于该值就会产生泛光
            )
        
        // this.ssrPass=this.getSSR()
        // this.saoPass=this.getSAO()
        // this.ssaoPass=this.getSSAO()
        //this.bokehPass=this.getDOF()
        // this.lutPass = this.getLUT()
        // renderer.setClearColor(0xcccccc)
        // renderer.flag=10001
        // this.ssaaPass=this.getSSAA()

        var composer = new MyEffectComposer(renderer)//效果组合器
        window.composer=composer
        // this.dotPass=new DotScreenPass()
       
        if(this.ssaoPass)composer.addPass(
            this.ssaoPass//屏幕空间环境光遮蔽
        )

        if(this.lutPass)composer.addPass(
            this.lutPass
        )

        if(this.renderPass)composer.addPass(
            this.renderPass
        )
        //  if(this.dotpass)composer.addPass(
        //     this.dotpass
        // )
        if(this.ssrPass)composer.addPass(
            this.ssrPass//屏幕空间反射
        )
        
        // composer.addPass(
        //     this.bokehPass
        // )
        
        if(this.bloomPass)composer.addPass(
            this.bloomPass//辉光
        )
        // if(this.ssaaPass)composer.addPass(this.ssaaPass)



        
        // composer.setPixelRatio( 5 ); // ensure pixel ratio is always 1 for performance reasons
		// const ssaaRenderPassP = new SSAARenderPass( scene, camera );
		// composer.addPass( ssaaRenderPassP );
		// const copyPass = new ShaderPass( CopyShader );
		// composer.addPass( copyPass );
        
        return composer
    }
    getSSAO(){//https://juejin.cn/post/7224683165989732412
        let ssaoPass = new SSAOPass(this.scene, this.camera, window.innerWidth, window.innerHeight);
        ssaoPass.kernelRadius = 32
        ssaoPass.minDistance = 0.001
        ssaoPass.maxDistance = 0.3
        console.log(
            this.scene, this.camera, window.innerWidth, window.innerHeight
        )
        // console.log(SSAOPass.OUTPUT)
        // saoPass.params.output = SSAOPass.OUTPUT.Default;
        // saoPass.params.saoBias = 0.5;
        // saoPass.params.saoIntensity = 0.05;
        // saoPass.params.saoScale = 100;
        // saoPass.params.saoKernelRadius = 10;
        // saoPass.params.saoMinResolution = 0;
        // saoPass.params.saoBlur = true;
        return ssaoPass
    }
    getSAO(){
        const saoPass = new SAOPass( this.scene, this.camera, false, true );
        //(scene: Scene, camera: Camera, depthTexture?: boolean, useNormals?: boolean, resolution?: Vector2);
        saoPass.saoBias=0.5
        saoPass.saoIntensity=0.18
        saoPass.saoScale=1

        saoPass.saoKernelRadius=100
        saoPass.saoMinResolution=0
        saoPass.saoBlur=true

        saoPass.saoBlurRadius=8
        saoPass.saoBlurStdDev=4
        saoPass.saoBlurDepthCutoff=0.001
        return saoPass
    }
    getSSR(){
        // console.log(this.renderer,this.scene,this.camera)
        
        const ssrPass = new SSRPass( {
            renderer:this.renderer,
            scene:this.scene,
            camera:this.camera,
            width: window.innerWidth,
            height: window.innerHeight,
            groundReflector: null,//params.groundReflector ? groundReflector : null,
            selects: null//params.groundReflector ? selects : null
        } );
        ssrPass.opacity = 0.1
        ssrPass.distanceAttenuation = true
        ssrPass.maxDistance = 100//.1;
        return ssrPass
    }
    getDOF(){//depth of field with bokeh 散焦景深
        const bokehPass = new BokehPass( scene, camera, {
            focus: 0.5,//1.0,
            aperture: 0,//0.025,
            maxblur: 0.01,

            width: window.innerWidth,
            height: window.innerHeight
        } );
        
        return bokehPass
    }
    getLUT(){//
        const lutPass=new LUTPass();
        lutPass.uniforms.intensity.value=0//0.1
        // lutPass.uniforms.intensity=1
        // lutPass.uniforms.lut=1
        // lutPass.uniforms.lut3d=1
        // lutPass.uniforms.lutSize=1
        // lutPass.uniforms.tDiffuse=1
        // console.log(lutPass,"lutPass")
        return lutPass
    }
    getSSAA(){//
        const SSAARenderPass=new SSAARenderPass();
        SSAARenderPass.sampleLevel =5
        return SSAARenderPass
    }
    initComposer2(){//设置光晕
        this.litRenderTarget = new THREE.WebGLRenderTarget(
			window.innerWidth,
			window.innerHeight,
			{
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType
			}
		)
        // 最终真正渲染到屏幕上的效果合成器 finalComposer 
        const vs=/* glsl */`
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`
        const fs=/* glsl */`
            uniform sampler2D baseTexture;
            uniform sampler2D bloomTexture;
            varying vec2 vUv;
            void main() {
                gl_FragColor = 1.0 * texture2D( baseTexture, vUv ) + 0.0 * texture2D( bloomTexture, vUv );
                gl_FragColor.a=1.;
                gl_FragColor.r=1.;
            }`
        const shaderPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {//renderTarget1 renderTarget2
                  baseTexture: { value: this.litRenderTarget.texture },
                  bloomTexture: { value: this.composer.renderTarget2.texture },
                },
                vertexShader: vs,
                fragmentShader: fs,
                defines: {},
            }),
            'baseTexture',
        ); // 创建自定义的着色器Pass，详细见下
        shaderPass.needsSwap = true;
            
        const finalComposer = new MyEffectComposer(renderer)
        finalComposer.addPass(shaderPass)
        // finalComposer.render()
        return finalComposer
    }
    render(){
        this.composer.render()
        //this.composer.renderTarget2.texture
        // renderer.clear()
        // this.composer2.render()
    }
    // getTexture(){
    //     renderer.setRenderTarget(this.renderTarget)
    //     this.composer.renderToScreen=false
    //     this.render()
    //     return this.renderTarget.texture
    // }
    getTexture(){
        this.composer.renderToScreen=false
        this.render()
        return this.composer.readBuffer.texture
    }
    getTexture1(){
        this.composer.renderToScreen=false
        this.render()
        return this.composer.renderTarget2.texture
    }
}