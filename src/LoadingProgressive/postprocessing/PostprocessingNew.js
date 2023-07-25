import { program } from "gltf-pipeline/lib/ForEach";
import * as THREE from "three"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

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

export class PostprocessingNew {
    constructor(scene, camera, renderer) {
        this.renderer = renderer
        this.camera = camera
        this.scene = scene
        const canvas = document.getElementById('myCanvas')
        
        renderer.autoClear = false;

        this.texture = new THREE.CanvasTexture(canvas);
        this.composer = new EffectComposer(renderer)
        this.composer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setPixelRatio(window.devicePixelRatio);
        this.composer.renderToScreen = false;
        this.finalTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight)
        const unrealBloom = new UnrealBloom(camera, scene, renderer);
        
        const bloomPass = new UnrealBloomPass(//创建辉光通道
            undefined,//new THREE.Vector2(window.innerWidth, window.innerHeight),//参数一：泛光覆盖场景大小，二维向量类型
            0.3,//0.4,    //参数二：bloomStrength 泛光强度，值越大明亮的区域越亮，较暗区域变亮的范围越广
            0.3,//0.3,//参数三：bloomRadius 泛光散发半径
            0.75//0.75//参数四：bloomThreshold 泛光的光照强度阈值，如果照在物体上的光照强度大于该值就会产生泛光
        )

        const texturePass = new TexturePass(this.texture);
        const ssrPass = unrealBloom.getSSR()
        const saoPass = unrealBloom.getSAO()
        const ssaoPass = unrealBloom.getSSAO();
        const mySSAOPass = new MySSAOPass(this.scene, this.camera, this.texture, window.innerWidth, window.innerHeight)
        const bokehPass = unrealBloom.getDOF()
        const lutPass = unrealBloom.getLUT()
        
        this.composer.addPass(texturePass)
        //this.composer.addPass(mySSAOPass)

        //this.composer.addPass(ssaoPass)
        this.composer.addPass(lutPass)
        //this.composer.addPass(bloomPass)
        // var fxaaPass = new ShaderPass(FXAAShader);
        // var uniforms = fxaaPass.material.uniforms;

        // uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * renderer.getPixelRatio() );
        // uniforms['resolution'].value.y = 1 / (window.innerHeight * renderer.getPixelRatio() );

        //this.composer.addPass(fxaaPass)

        //this.composer.addPass(new ShaderPass(GammaCorrectionShader))
        //this.composer.addPass(new ShaderPass(CopyShader))
    }
    test()
    {
        const shaderPass = new ShaderPass(CopyShader)
        const filmPass = new FilmPass(0.8, 0.325, 256, false);
        const bloomPass = new UnrealBloomPass(undefined, 0.8, 1, 0.8);

        this.composer2 = new EffectComposer(renderer);
        //this.composer2.addPass(texturePass);
        //this.composer.addPass(ssrPass)
        //this.composer.addPass(saoPass)
        //this.composer.addPass(ssaoPass)
        //this.composer.addPass(bokehPass)
        //this.composer.addPass(lutPass)
        //this.composer.addPass(bloomPass);

        var fxaaPass = new ShaderPass(FXAAShader);

        var pixelRatio = renderer.getPixelRatio();

        var smaaPass = new SMAAPass(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
        //var uniforms = fxaaPass.material.uniforms;

        // uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
        // uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );
        // texturePass.material.minFilter = THREE.LinearFilter;
        // texturePass.material.magFilter = THREE.LinearFilter;
        // texturePass.material.defines['USE_SAMPLE_ALPHA_TO_COVERAGE'] = true;
        // texturePass.material.transparent = true;
        this.composer.addPass(texturePass);
        //this.composer.addPass(filmPass);
        //this.composer.addPass(fxaaPass)

        //this.composer.addPass(smaaPass);
        //this.composer.addPass(new ShaderPass(GammaCorrectionShader))
        this.composer.addPass(bloomPass)
        this.composer.addPass(new ShaderPass(CopyShader))
    }
    render()
    {
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
        this.texture.needsUpdate = true;
        //this.renderer.setRenderTarget(this.finalTarget);
        this.composer.render();
        //this.renderer.clear();
        //this.composer2.render();
        return this.composer.readBuffer.texture;
    }
}