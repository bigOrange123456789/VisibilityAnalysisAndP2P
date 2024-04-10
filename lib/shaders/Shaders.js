// import { ShaderChunk } from './ShaderChunk.js';
// import { mergeUniforms } from './UniformsUtils.js';
// import { Vector2 } from '../../math/Vector2.js';
// import { Vector3 } from '../../math/Vector3.js';
// import { UniformsLib } from './UniformsLib.js';
// import { Color } from '../../math/Color.js';
// import { Matrix3 } from '../../math/Matrix3.js';
import { ddgi_vert } from './ShaderChunk/ddgi_vert/main.js';
import { ddgi_frag } from './ShaderChunk/ddgi_frag/main.js';

export const Shaders = {
	ddgi:{
		// uniforms: mergeUniforms( [
		// 	ShaderLib.standard.uniforms,
		// 	{
		// 		clearcoat: { value: 0 },
		// 		clearcoatMap: { value: null },
		// 		clearcoatRoughness: { value: 0 },
		// 		clearcoatRoughnessMap: { value: null },
		// 		clearcoatNormalScale: { value: new Vector2( 1, 1 ) },
		// 		clearcoatNormalMap: { value: null },
		// 		sheen: { value: new Color( 0x000000 ) },
		// 		transmission: { value: 0 },
		// 		transmissionMap: { value: null },
		// 		transmissionSamplerSize: { value: new Vector2() },
		// 		transmissionSamplerMap: { value: null },
		// 		thickness: { value: 0 },
		// 		thicknessMap: { value: null },
		// 		attenuationDistance: { value: 0 },
		// 		attenuationColor: { value: new Color( 0x000000 ) }
		// 	}
		// ] ),
		vertexShader: ddgi_vert,
		fragmentShader: ddgi_frag
	}
};
