import * as THREE from "three"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

export class WaterNormalCreator {
	constructor()
	{
    this.target = new THREE.WebGLRenderTarget(512, 512, { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping });
    this.renderer = window.renderer;
    this.target.texture.repeat.set(0.001,0.001);
    this.renderer.setRenderTarget(this.target);
    this.composer = new EffectComposer(this.renderer, this.target);
    this.composer.renderToScreen = false;
    this.composer.setSize(512, 512);
    this.shaderPass = new ShaderPass(WaterNormal);
    this.composer.addPass(this.shaderPass);
	}
	GetTexture(time)
	{
		this.shaderPass.uniforms['iTime'].value = time;
		this.composer.render();
		//return this.composer.readBuffer.texture;
	}
}

var WaterNormal = {
	uniforms: {
		'iTime': { value: 0 }
	},
	vertexShader: /* glsl */`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }`,
	fragmentShader:/* glsl */`
	varying vec2 vUv;
	uniform float iTime;
  const int k_fmbWaterSteps = 4;
  const vec2 MOD2=vec2(4.438975,3.972973);
  
float Hash(float p) {
    // https://www.shadertoy.com/view/4djSRW - Dave Hoskins
  vec2 p2 = fract(vec2(p) * MOD2);
  p2 += dot(p2.yx, p2.xy + 19.19);
  return fract(p2.x * p2.y);    
	//return fract(sin(n)*43758.5453);
}
vec2 Hash2(float p) {
    // https://www.shadertoy.com/view/4djSRW - Dave Hoskins
  vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.xx + p3.yz) * p3.zy);
}

vec3 SmoothNoise_DXY(in vec2 o) {
  vec2 p = floor(o);
  vec2 f = fract(o);

  float n = p.x + p.y * 57.0;

  float a = Hash(n + 0.0);
  float b = Hash(n + 1.0);
  float c = Hash(n + 57.0);
  float d = Hash(n + 58.0);

  vec2 f2 = f * f;
  vec2 f3 = f2 * f;

  vec2 t = 3.0 * f2 - 2.0 * f3;
  vec2 dt = 6.0 * f - 6.0 * f2;

  float u = t.x;
  float v = t.y;
  float du = dt.x;
  float dv = dt.y;

  float res = a + (b - a) * u + (c - a) * v + (a - b + d - c) * u * v;

  float dx = (b - a) * du + (a - b + d - c) * du * v;
  float dy = (c - a) * dv + (a - b + d - c) * u * dv;

  return vec3(dx, dy, res);
}

vec3 FBM_DXY(vec2 p, vec2 flow, float ps, float df) {
  vec3 f = vec3(0.0);
  float tot = 0.0;
  float a = 1.0;
    //flow *= 0.6;
  for(int i = 0; i < k_fmbWaterSteps; i++) {
    p += flow;
    flow *= -0.75; // modify flow for each octave - negating this is fun
    vec3 v = SmoothNoise_DXY(p);
    f += v * a;
    p += v.xy * df;
    p *= 2.0;
    tot += a;
    a *= ps;
  }
  return f / tot;
}
vec4 SampleWaterNormal(vec2 vUV, vec2 vFlowOffset, float fMag, float fFoam) {

  vec2 vFilterWidth = max(abs(dFdx(vUV)), abs(dFdy(vUV)));
  float fFilterWidth = max(vFilterWidth.x, vFilterWidth.y);

  float fScale = (1.0 / (1.0 + fFilterWidth * fFilterWidth * 2000.0));
  float fGradientAscent = 0.25 + (fFoam * -1.5);
  vec3 dxy = FBM_DXY(vUV * 20.0, vFlowOffset * 20.0, 0.75 + fFoam * 0.25, fGradientAscent);
  fScale *= max(0.25, 1.0 - fFoam * 5.0); // flatten normal in foam
  vec3 vBlended = mix(vec3(0.0, 1.0, 0.0), normalize(vec3(dxy.x, fMag, dxy.y)), fScale);
  return vec4(normalize(vBlended), dxy.z * fScale);
}
	vec4 SampleFlowingNormal(const vec2 vUV, const vec2 vFlowRate,const float time) {
  float fMag = 2.5 / (1.0 + dot(vFlowRate, vFlowRate) * 5.0);
  float t0 = fract(time);
  float t1 = fract(time + 0.5);

  float i0 = floor(time);
  float i1 = floor(time + 0.5);

  float o0 = t0 - 0.5;
  float o1 = t1 - 0.5;

  vec2 vUV0 = vUV + Hash2(i0);
  vec2 vUV1 = vUV + Hash2(i1);

  vec4 sample0 = SampleWaterNormal(vUV0, vFlowRate * o0, fMag, 0.0);
  vec4 sample1 = SampleWaterNormal(vUV1, vFlowRate * o1, fMag, 0.0);

  float weight = abs(t0 - 0.5) * 2.0;
    //weight = smoothstep( 0.0, 1.0, weight );


  vec4 result = mix(sample0, sample1, weight);
		result.xyz = normalize(result.xyz);


		return result;
	}
void main()
{
	gl_FragColor=SampleFlowingNormal(vUv,vec2(0.5),iTime);
}
	`
}