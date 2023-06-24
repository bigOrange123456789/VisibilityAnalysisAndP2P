import * as THREE from "three"
import { 
    GodRaysFakeSunShader, GodRaysDepthMaskShader, GodRaysCombineShader, GodRaysGenerateShader 
} from 'three/examples/jsm/shaders/GodRaysShader.js';
export class Godrays{
    constructor(camera,scene){
        this.filterLen=1
        this.TAPS_PER_PASS=6
        this.camera=camera
        this.scene=scene
        this.clipPosition = new THREE.Vector4();
        this.screenSpacePosition=new THREE.Vector3()
        this.materialDepth = new THREE.MeshDepthMaterial();
        this.postprocessing=this.initPostprocessing()
    }
    initPostprocessing(){
        const renderTargetWidth  = window.innerWidth 
        const renderTargetHeight = window.innerHeight
        const godrayRenderTargetResolutionMultiplier = 1.0 / 4.0;
        const adjustedWidth = renderTargetWidth * godrayRenderTargetResolutionMultiplier;
        const adjustedHeight = renderTargetHeight * godrayRenderTargetResolutionMultiplier;

        const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, - 10000, 10000 );
		camera.position.z = 100;
		scene.add( camera );
        const postprocessing = { 
            enabled: true ,
            scene : scene,
            camera: camera,
            rtTextureColors:new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight ),//基本渲染结果
            rtTextureDepth : new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight ),    //深度信息
            rtTextureDepthMask : new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight ),//有些位置没有深度?

            rtTextureGodRays1 : new THREE.WebGLRenderTarget( adjustedWidth, adjustedHeight ),
            rtTextureGodRays2 : new THREE.WebGLRenderTarget( adjustedWidth, adjustedHeight ),//云隙光
            godrayMaskUniforms : THREE.UniformsUtils.clone( GodRaysDepthMaskShader.uniforms ),
            godrayGenUniforms  : THREE.UniformsUtils.clone( GodRaysGenerateShader.uniforms ),
            godrayCombineUniforms : THREE.UniformsUtils.clone( GodRaysCombineShader.uniforms ),
            godraysFakeSunUniforms : THREE.UniformsUtils.clone( GodRaysFakeSunShader.uniforms ),
        };

        // god-ray shaders
        postprocessing.materialGodraysDepthMask = new THREE.ShaderMaterial( {//深度？
            uniforms: postprocessing.godrayMaskUniforms,
            vertexShader: GodRaysDepthMaskShader.vertexShader,
            fragmentShader: GodRaysDepthMaskShader.fragmentShader
        } );
        postprocessing.materialGodraysGenerate = new THREE.ShaderMaterial( {//生成
            uniforms: postprocessing.godrayGenUniforms,
            vertexShader: GodRaysGenerateShader.vertexShader,
            fragmentShader: GodRaysGenerateShader.fragmentShader
        } );       
        postprocessing.materialGodraysFakeSun = new THREE.ShaderMaterial( {//假太阳？
            uniforms: postprocessing.godraysFakeSunUniforms,
            vertexShader: GodRaysFakeSunShader.vertexShader,
            fragmentShader: GodRaysFakeSunShader.fragmentShader
        } );
        postprocessing.materialGodraysCombine = new THREE.ShaderMaterial( {//合并
            uniforms: postprocessing.godrayCombineUniforms,
            vertexShader: GodRaysCombineShader.vertexShader,
            fragmentShader: GodRaysCombineShader.fragmentShader
        } );
        postprocessing.godraysFakeSunUniforms.bgColor.value.setHex(  0x000511 );//背景颜色
        postprocessing.godraysFakeSunUniforms.sunColor.value.setHex( 0xffee00 );//太阳颜色
        postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.2//0.75;//云隙光强度

        postprocessing.quad = new THREE.Mesh(//？
            new THREE.PlaneGeometry( 1.0, 1.0 ),
            postprocessing.materialGodraysGenerate//生成
        );
        postprocessing.quad.position.z = - 9900;
        postprocessing.scene.add( postprocessing.quad );
        
        this.postprocessing=postprocessing        
        return postprocessing
    }
    getSunPos(){
        const clipPosition=this.clipPosition
        //开始计算太阳在屏幕上的位置
        clipPosition.x = 0  //sunPosition.x;
        clipPosition.y = 1000 //sunPosition.y;
        clipPosition.z =-1000 //sunPosition.z;
        const sunPosition = new THREE.Vector3( 0, 1000*100, - 1000*100 );
        clipPosition.x = sunPosition.x;
        clipPosition.y = sunPosition.y;
        clipPosition.z = sunPosition.z;
        clipPosition.w = 1
        clipPosition.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );
        clipPosition.x /= clipPosition.w;
        clipPosition.y /= clipPosition.w;

        const screenSpacePosition=this.screenSpacePosition
        screenSpacePosition.x = ( clipPosition.x + 1 ) / 2; // transform from [-1,1] to [0,1]
        screenSpacePosition.y = ( clipPosition.y + 1 ) / 2; // transform from [-1,1] to [0,1]
        screenSpacePosition.z = clipPosition.z; // needs to stay in clip space for visibilty checks
        return screenSpacePosition
    }
    render(){
        if ( !this.postprocessing.enabled )return
        const postprocessing=this.postprocessing
        const camera=this.camera
        const scene=this.scene
        const screenSpacePosition=this.getSunPos()
        // Give it to the god-ray and sun shaders
        postprocessing.godrayGenUniforms[ 'vSunPositionScreenSpace' ].value.copy( screenSpacePosition );
        postprocessing.godraysFakeSunUniforms[ 'vSunPositionScreenSpace' ].value.copy( screenSpacePosition );
        
        function filterGodRays( inputTex, renderTarget, stepSize ) {
            postprocessing.scene.overrideMaterial = postprocessing.materialGodraysGenerate;
            postprocessing.godrayGenUniforms[ 'fStepSize' ].value = stepSize;
            postprocessing.godrayGenUniforms[ 'tInput' ].value = inputTex;
            renderer.setRenderTarget( renderTarget );
            renderer.render( postprocessing.scene, postprocessing.camera );
            postprocessing.scene.overrideMaterial = null;
        }
        function getStepSize( filterLen, tapsPerPass, pass ) {
            return filterLen * Math.pow( tapsPerPass, - pass );
        }
        
        // -- Draw sky and sun --
        // Clear colors and depths, will clear to sky color
        renderer.setRenderTarget( postprocessing.rtTextureColors );
        renderer.clear( true, true, false );//color , depth , stencil模具//清除缓冲区。默认为true
        
        postprocessing.godraysFakeSunUniforms[ 'fAspect' ].value = window.innerWidth / window.innerHeight;
        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysFakeSun;
        renderer.setRenderTarget( postprocessing.rtTextureColors );
        renderer.render( postprocessing.scene, postprocessing.camera );
        
        
        // -- Draw scene objects --
        // Colors
        scene.overrideMaterial = null;
        renderer.setRenderTarget( postprocessing.rtTextureColors );
        renderer.render( scene, camera );

        // this.test(postprocessing.rtTextureColors)
        // return
        
        // Depth
        renderer.setRenderTarget( postprocessing.rtTextureDepth );
        renderer.render( scene, camera );
        //
        postprocessing.godrayMaskUniforms[ 'tInput' ].value = postprocessing.rtTextureDepth.texture;
        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysDepthMask;
        renderer.setRenderTarget( postprocessing.rtTextureDepthMask );
        renderer.render( postprocessing.scene, postprocessing.camera );
        
        // -- Render god-rays --
        // Maximum length of god-rays (in texture space [0,1]X[0,1])
        const filterLen = 1.0;
        // Samples taken by filter
        const TAPS_PER_PASS = 6.0;
        filterGodRays( postprocessing.rtTextureDepthMask.texture, postprocessing.rtTextureGodRays2, getStepSize( filterLen, TAPS_PER_PASS, 1.0 ) );
        // pass 2 - render into second ping-pong target
        filterGodRays( postprocessing.rtTextureGodRays2.texture, postprocessing.rtTextureGodRays1, getStepSize( filterLen, TAPS_PER_PASS, 2.0 ) );
        // pass 3 - 1st RT
        filterGodRays( postprocessing.rtTextureGodRays1.texture, postprocessing.rtTextureGodRays2, getStepSize( filterLen, TAPS_PER_PASS, 3.0 ) );
        
        // final pass - composite god-rays onto colors
        postprocessing.godrayCombineUniforms[ 'tColors' ].value = postprocessing.rtTextureColors.texture;
        postprocessing.godrayCombineUniforms[ 'tGodRays' ].value = postprocessing.rtTextureGodRays2.texture;
        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysCombine;
        renderer.setRenderTarget( null );
        renderer.render( postprocessing.scene, postprocessing.camera );
        
        // this.test(postprocessing.rtTextureColors)
        // this.test(postprocessing.rtTextureGodRays2)

        
    }
    getTexture(){
        if ( !this.postprocessing.enabled )return
        const postprocessing=this.postprocessing
        const camera=this.camera
        const scene=this.scene
        const screenSpacePosition=this.getSunPos()
        // Give it to the god-ray and sun shaders
        postprocessing.godrayGenUniforms[ 'vSunPositionScreenSpace' ].value.copy( screenSpacePosition );
        postprocessing.godraysFakeSunUniforms[ 'vSunPositionScreenSpace' ].value.copy( screenSpacePosition );
        
        function filterGodRays( inputTex, renderTarget, stepSize ) {
            postprocessing.scene.overrideMaterial = postprocessing.materialGodraysGenerate;
            postprocessing.godrayGenUniforms[ 'fStepSize' ].value = stepSize;
            postprocessing.godrayGenUniforms[ 'tInput' ].value = inputTex;
            renderer.setRenderTarget( renderTarget );
            renderer.render( postprocessing.scene, postprocessing.camera );
            postprocessing.scene.overrideMaterial = null;
        }
        function getStepSize( filterLen, tapsPerPass, pass ) {
            return filterLen * Math.pow( tapsPerPass, - pass );
        }
        
        // -- Draw sky and sun --
        // Clear colors and depths, will clear to sky color
        renderer.setRenderTarget( postprocessing.rtTextureColors );
        renderer.clear( true, true, false );//color , depth , stencil模具//清除缓冲区。默认为true
        
        postprocessing.godraysFakeSunUniforms[ 'fAspect' ].value = window.innerWidth / window.innerHeight;
        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysFakeSun;
        renderer.setRenderTarget( postprocessing.rtTextureColors );
        renderer.render( postprocessing.scene, postprocessing.camera );
        
        
        // -- Draw scene objects --
        // Colors
        scene.overrideMaterial = null;
        renderer.setRenderTarget( postprocessing.rtTextureColors );
        renderer.render( scene, camera );

        
        // Depth
        renderer.setRenderTarget( postprocessing.rtTextureDepth );
        renderer.render( scene, camera );
        //
        postprocessing.godrayMaskUniforms[ 'tInput' ].value = postprocessing.rtTextureDepth.texture;
        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysDepthMask;
        renderer.setRenderTarget( postprocessing.rtTextureDepthMask );
        renderer.render( postprocessing.scene, postprocessing.camera );
        
        // -- Render god-rays --
        // Maximum length of god-rays (in texture space [0,1]X[0,1])
        const filterLen =this.filterLen// 1.0//1.0;
        // Samples taken by filter
        const TAPS_PER_PASS =this.TAPS_PER_PASS// 6//6.0; //filterLen * Math.pow( tapsPerPass, - pass );
        filterGodRays( postprocessing.rtTextureDepthMask.texture, postprocessing.rtTextureGodRays2, getStepSize( filterLen, TAPS_PER_PASS, 1.0 ) );
        filterGodRays( postprocessing.rtTextureGodRays2.texture, postprocessing.rtTextureGodRays1, getStepSize( filterLen, TAPS_PER_PASS, 2.0 ) );
        filterGodRays( postprocessing.rtTextureGodRays1.texture, postprocessing.rtTextureGodRays2, getStepSize( filterLen, TAPS_PER_PASS, 3.0 ) );

        // filterGodRays( postprocessing.rtTextureDepthMask.texture, postprocessing.rtTextureGodRays2, 0.004 );
        // filterGodRays( postprocessing.rtTextureGodRays2.texture, postprocessing.rtTextureGodRays1, 0.02 );
        // filterGodRays( postprocessing.rtTextureGodRays1.texture, postprocessing.rtTextureGodRays2, 0.16 );

        // filterGodRays( postprocessing.rtTextureDepthMask.texture, postprocessing.rtTextureGodRays2, 0.004 );
        
        // final pass - composite god-rays onto colors
        return postprocessing.rtTextureGodRays2.texture;

    }
    test(renderTarget){
        if(!this.materialTest){
            this.materialTest = new THREE.ShaderMaterial( {//假太阳？
                uniforms: {
                    tColors: {
                        value: null
                    }
                },
                vertexShader: /* glsl */`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }`,
                fragmentShader: /* glsl */`
                    varying vec2 vUv;
                    uniform sampler2D tColors;
                    void main() {
                        gl_FragColor = texture2D( tColors, vUv );
                        gl_FragColor.a = 1.0;
                    }`
            } );
        }
        this.materialTest.uniforms[ 'tColors' ].value=renderTarget.texture
        this.postprocessing.scene.overrideMaterial = this.materialTest;
        renderer.setRenderTarget( null );
        renderer.render( this.postprocessing.scene, this.postprocessing.camera );
    }
}