import {
	Color,
	ShaderChunk,
	ShaderLib,
	UniformsUtils
} from 'three';

/**
 * ------------------------------------------------------------------------------------------
 * Subsurface Scattering shader
 * Based on GDC 2011 – Approximating Translucency for a Fast, Cheap and Convincing Subsurface Scattering Look
 * https://colinbarrebrisebois.com/2011/03/07/gdc-2011-approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look/
 *------------------------------------------------------------------------------------------
 */

function replaceAll( string, find, replace ) {

	return string.split( find ).join( replace );

}

const meshphong_frag_head = ShaderChunk[ 'meshphong_frag' ].slice( 0, ShaderChunk[ 'meshphong_frag' ].indexOf( 'void main() {' ) );
const meshphong_frag_body = ShaderChunk[ 'meshphong_frag' ].slice( ShaderChunk[ 'meshphong_frag' ].indexOf( 'void main() {' ) );
const frag=/* glsl */`  //兔子
	uniform sampler2D thicknessMap;
	uniform float thicknessPower;
	uniform float thicknessScale;
	uniform float thicknessDistortion;
	uniform float thicknessAmbient;
	uniform float thicknessAttenuation;
	uniform vec3 thicknessColor;
	void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in GeometricContext geometry, inout ReflectedLight reflectedLight) {
		// vec3 thickness = thicknessColor * texture2D(thicknessMap, uv).r;//透视出来的结果
		vec3 thickness =  thicknessColor *texture2D(thicknessMap, uv).rgb;
		vec3 scatteringHalf = normalize(directLight.direction + geometry.normal * thicknessDistortion);//散射半程向量
		float scatteringDot = pow(saturate(dot(geometry.viewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
		vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * thickness;
		reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
		
		// reflectedLight.directDiffuse=texture2D(thicknessMap, uv).rgb;
	}
`
const frag2_=/* glsl */`  //人头
	uniform sampler2D thicknessMap;
	uniform float thicknessPower;
	uniform float thicknessScale;
	uniform float thicknessDistortion;
	uniform float thicknessAmbient;
	uniform float thicknessAttenuation;
	uniform vec3 thicknessColor;
	void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in GeometricContext geometry, inout ReflectedLight reflectedLight) {
		vec3 thickness = thicknessColor ;//透视出来的结果
		// vec3 thickness =  thicknessColor *texture2D(thicknessMap, uv).rgb;
		vec3 scatteringHalf = normalize(directLight.direction* thicknessDistortion + geometry.normal );//散射半程向量
		float scatteringDot = pow(saturate(dot(geometry.viewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
		vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * thickness;
		reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
		
		//reflectedLight.directDiffuse=texture2D(thicknessMap, uv).rgb;
	}
`
const frag2=/* glsl */`  //人头
	uniform sampler2D thicknessMap;
	uniform float thicknessPower;
	uniform float thicknessScale;
	uniform float thicknessDistortion;
	uniform float thicknessAmbient;
	uniform float thicknessAttenuation;
	uniform vec3 thicknessColor;
	void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in GeometricContext geometry, inout ReflectedLight reflectedLight) {
		vec3 thickness = thicknessColor ;//透视出来的结果
		// vec3 thickness =  thicknessColor *texture2D(thicknessMap, uv).rgb;
		vec3 scatteringHalf = normalize(directLight.direction* thicknessDistortion + geometry.normal );//散射半程向量
		float scatteringDot = pow(saturate(dot(geometry.viewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
		vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * thickness;
		reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
		
		//reflectedLight.directDiffuse=texture2D(thicknessMap, uv).rgb;
	}
`
const frag_old=/* glsl */`
	uniform sampler2D thicknessMap;
	uniform float thicknessPower;
	uniform float thicknessScale;
	uniform float thicknessDistortion;
	uniform float thicknessAmbient;
	uniform float thicknessAttenuation;
	uniform vec3 thicknessColor;
	void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in GeometricContext geometry, inout ReflectedLight reflectedLight) {
		// vec3 thickness = thicknessColor * texture2D(thicknessMap, uv).r;//透视出来的结果
		vec3 thickness =  thicknessColor *texture2D(thicknessMap, uv).rgb;
		vec3 scatteringHalf = normalize(directLight.direction + (geometry.normal * thicknessDistortion));//散射半程向量
		float scatteringDot = pow(saturate(dot(geometry.viewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
		vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * thickness;
		reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
	}
`
const SubsurfaceScatteringShader = {

	uniforms: UniformsUtils.merge( [
		ShaderLib[ 'phong' ].uniforms,
		{
			'thicknessMap': { value: null },
			'thicknessColor': { value: new Color( 0xffffff ) },
			'thicknessDistortion': { value: 0.1 },
			'thicknessAmbient': { value: 0.0 },
			'thicknessAttenuation': { value: 0.1 },
			'thicknessPower': { value: 2.0 },
			'thicknessScale': { value: 10.0 }
		}

	] ),

	vertexShader: [
		'#define USE_UV',
		ShaderChunk[ 'meshphong_vert' ],
	].join( '\n' ),

	fragmentShader: [
		'#define USE_UV',
		'#define SUBSURFACE',
		meshphong_frag_head,
		frag,
		meshphong_frag_body.replace( '#include <lights_fragment_begin>',
			replaceAll(
				ShaderChunk[ 'lights_fragment_begin' ],
				/* glsl */`RE_Direct( directLight, geometry, material, reflectedLight );`,
				/* glsl */`
					RE_Direct( directLight, geometry, material, reflectedLight );
					#if defined( SUBSURFACE ) && defined( USE_UV )
					 RE_Direct_Scattering(directLight, vUv, geometry, reflectedLight);
					#endif
				`
			),
		),
	].join( '\n' ),

	fragmentShader2: [
		'#define USE_UV',
		'#define SUBSURFACE',
		meshphong_frag_head,
		frag2,
		meshphong_frag_body.replace( '#include <lights_fragment_begin>',
			replaceAll(
				ShaderChunk[ 'lights_fragment_begin' ],
				/* glsl */`RE_Direct( directLight, geometry, material, reflectedLight );`,
				/* glsl */`
					RE_Direct( directLight, geometry, material, reflectedLight );
					#if defined( SUBSURFACE ) && defined( USE_UV )
					 RE_Direct_Scattering(directLight, vUv, geometry, reflectedLight);
					#endif
				`
			),
		),
	].join( '\n' ),

};

export { SubsurfaceScatteringShader };
