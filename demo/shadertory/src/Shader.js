import{MushroomCloud,MushroomCloud3,MushroomCloud4}from"./shader/MushroomCloud.js"
import{VolumetricRaymarchingF}from"./shader/VolumetricRaymarchingF copy.js"
import{VolumetricIntegration}from"./shader/VolumetricIntegration.js"
import{Map,Test,Test1}from"./shader/Test.js"

export class Shader{
    constructor(){
        this.fragmentShader=
            this.shader_prefix()+
            //MushroomCloud+
            VolumetricIntegration+
            //VolumetricRaymarchingF+
            //fragmentShader.test16+//
            this.shader_suffix()

    }
    shader_prefix(){
        return /* glsl */`
        varying vec2 vUv;
        uniform float iTime;
        uniform sampler2D iChannel0;
        uniform sampler2D iChannel1;
        uniform sampler2D iChannel2;
        uniform sampler2D iChannel4;
        uniform vec2 iMouse;
        const int iFrame=0;

        const float PI = 3.14159265359;
        
        uniform vec2 iResolution;//=vec2(1.);//vec2(1900., 1900.);
        //vec3 iResolution=vec3(1.);
        `
    }
    shader_suffix(){
        return /* glsl */`
        void main() {
          mainImage( gl_FragColor, vUv );
          gl_FragColor.a=1.;
        }`
    }
}