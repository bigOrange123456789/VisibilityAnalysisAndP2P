import * as THREE from 'three';
import { ImprovedNoise } from './ImprovedNoise.js';//import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
export class Smoke{
    constructor(scene,camera){
        const mesh=this.init()
        mesh.position.set(
            camera.position.x,
            camera.position.y,
            camera.position.z
        )
        // const mesh=this.mesh
        scene.add( mesh );
        
        function animate() {
            mesh.material.uniforms.cameraPos.value.copy( camera.position )
            // mesh.rotation.y = - performance.now() / 7500
            mesh.material.uniforms.frame.value ++
            requestAnimationFrame( animate )
        }
        animate()
    }
    init(){
        		// Texture

				const size = 128;
				const data = new Uint8Array( size * size * size );

				let i = 0;
				const scale = 0.05;
				const perlin = new ImprovedNoise();
				const vector = new THREE.Vector3();

				for ( let z = 0; z < size; z ++ ) {

					for ( let y = 0; y < size; y ++ ) {

						for ( let x = 0; x < size; x ++ ) {

							const d = 1.0 - vector.set( x, y, z ).subScalar( size / 2 ).divideScalar( size ).length();
							data[ i ] = ( 128 + 128 * perlin.noise( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
							i ++;

						}

					}

				}

				const texture = new THREE.Data3DTexture( data, size, size, size );
				texture.format = THREE.RedFormat;
				texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;
				texture.unpackAlignment = 1;
				texture.needsUpdate = true;

				// Material

				const vertexShader = /* glsl */`
					in vec3 position;

					uniform mat4 modelMatrix;
					uniform mat4 modelViewMatrix;
					uniform mat4 projectionMatrix;
					uniform vec3 cameraPos;

					out vec3 vOrigin;
					out vec3 vDirection;

					void main() {
						vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

						vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;//modelMatrix???
						//vOrigin是光线上的某个点? //计算相机在体积数据坐标系中的位置 vOrigin,以确定从相机视角观察体积数据时光线的起始点。
						vDirection = position - vOrigin;//光线方向
						

						gl_Position = projectionMatrix * mvPosition;
					}
				`;

				const fragmentShader = /* glsl */`
					precision highp float;
					precision highp sampler3D;

					uniform mat4 modelViewMatrix;
					uniform mat4 projectionMatrix;

					in vec3 vOrigin;
					in vec3 vDirection;

					out vec4 color;

					uniform vec3 base;
					uniform sampler3D map;//我愿称之为三维曲面的表面高度增强图。

					uniform float threshold;
					uniform float range;//虚化区域的大小 高度浮动范围
					uniform float opacity;
					uniform float steps;//采样步数
					uniform float frame;//方便后面添加动态效果

					vec2 hitBox( vec3 orig, vec3 dir ) {   //计算光线与方盒的交点
						vec3 box_min = vec3( - 0.5 );//一个轴对称包围盒 Axis-Aligned Bounding Box
						box_min.x=-10.;
						vec3 box_max = vec3( 0.5 );
						box_max.x=10.;
						vec3 inv_dir = 1.0 / dir;
						vec3 tmin_tmp = ( box_min - orig ) * inv_dir; //时间*方向=交点-起点
						vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
						vec3 tmin = min( tmin_tmp, tmax_tmp ); //三对平面的入射时间
						vec3 tmax = max( tmin_tmp, tmax_tmp ); //三对平面的出射时间
						float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
						float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
						return vec2( t0, t1 ); //射线的入射时间和出射时间
					}

					float sample1( vec3 p ) {//根据向量取一个随机值
						return texture( map, p ).r;
					}

					float shading( vec3 coord ) {//获取三维图片这这个位置的梯度
						float step = 0.01;//一个极小值
						return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );//map在对角线方向的变化速度
					}

					void main(){
						vec3 rayDir = normalize( vDirection );   //将像素点对应的光线方向进行单位化
						vec2 bounds = hitBox( vOrigin, rayDir ); //计算光线的入射方向和出射方向

						bounds.x = max( bounds.x, 0.0 );	//如果视点在云雾对象内部

						vec3 p = vOrigin + bounds.x * rayDir; //射线的入射位置
						float delta = 1./steps;

						vec4 ac = vec4( base, 0.0 );//云雾对象的基颜色

						for ( float t = bounds.x; t < bounds.y; t += delta ) {//从入射时间到出射时间之间等距离取多个点

							float d = sample1( p + 0.5 );//局部增强长度

							d = smoothstep( threshold - range, threshold + range, d ) * opacity;

							float col = shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;//作用类似法向量？ 影响漫反射亮度

							ac.rgb += ( 1.0 - ac.a ) * d * col;//反射的光线变多

							ac.a += ( 1.0 - ac.a ) * d;//阻光度增加

							if ( ac.a >= 0.95 ) break;//阻光度过高就可以暂停了

							p += rayDir * delta;//更新光线位置

						}

						color = ac;

						if ( color.a == 0.0 ) discard;//如果不透明就不处理这个像素

					}
				`;

				const geometry = new THREE.BoxGeometry( 3, 1, 1 );
				const material = new THREE.RawShaderMaterial( {
					glslVersion: THREE.GLSL3,
					uniforms: {
						base: { value: new THREE.Color( 0x798aa0 ) },
						map: { value: texture },
						cameraPos: { value: new THREE.Vector3() },
						threshold: { value: 0.25 },
						opacity: { value: 0.25 },
						range: { value: 0.1 },
						steps: { value: 100 },
						frame: { value: 0 }
					},
					vertexShader,
					fragmentShader,
					side: THREE.BackSide,
					transparent: true
				} );
				setInterval(()=>{
					material.uniforms.frame.value+=0.001
					if(material.uniforms.frame.value>1)material.uniforms.frame.value=0
					// material.uniforms.frame.value+=1000
					// console.log(material.uniforms.frame.value)
				},1)

				

				//

				const parameters = {
					threshold: 0.25,
					opacity: 0.25,
					range: 0.1,
					steps: 100
				};

				function update() {

					material.uniforms.threshold.value = parameters.threshold;
					material.uniforms.opacity.value = parameters.opacity;
					material.uniforms.range.value = parameters.range;
					material.uniforms.steps.value = parameters.steps;

				}
                update()
                const mesh = new THREE.Mesh( geometry, material );
				return mesh//this.mesh=mesh// scene.add( mesh );
    }
}