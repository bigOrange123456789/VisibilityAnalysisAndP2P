const VS={
	"MeshStandardMaterial":/* glsl */`
	#define STANDARD
	varying vec3 vViewPosition;

	#ifdef USE_TRANSMISSION

		varying vec3 vWorldPosition;

	#endif

	#include <common>
	#include <uv_pars_vertex>
	//#include <uv2_pars_vertex>
	#include <displacementmap_pars_vertex>
	#include <color_pars_vertex>
	#include <fog_pars_vertex>
	#include <normal_pars_vertex>
	#include <morphtarget_pars_vertex>
	#include <skinning_pars_vertex>
	#include <shadowmap_pars_vertex>
	#include <logdepthbuf_pars_vertex>
	#include <clipping_planes_pars_vertex>
	void main() {
		// gl_Position=vec4(0.,0.,-1000.,1.);
		// return;
		#include <uv_vertex>
		//#include <uv2_vertex>
		#include <color_vertex>

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
		#include <normal_vertex>

		#include <begin_vertex>
		#include <morphtarget_vertex>
		#include <skinning_vertex>
		#include <displacementmap_vertex>
		///////////////////////////////////////////
		Vertex vertex;
		vertex.position=transformed;
		vertex.normal=vNormal;
		// transformed_temp=transformed;
		// vNormal_temp=vNormal;
		vertex=frameInterpolation(vertex);
		// transformed=transformed_temp;
		// vNormal=vNormal_temp;
		transformed=vertex.position;
		vNormal=vertex.normal;

		// vec4 temp=frameInterpolation(transformed);
		// transformed=temp.xyz;
		// float direction=temp.a;
		instanceColorOut= instanceColorIn;//vNormal
		///////////////////////////////////////////
		#include <project_vertex>
		
		#include <logdepthbuf_vertex>
		#include <clipping_planes_vertex>

		vViewPosition = - mvPosition.xyz;

		#include <worldpos_vertex>
		#include <shadowmap_vertex>
		#include <fog_vertex>

	#ifdef USE_TRANSMISSION

		vWorldPosition = worldPosition.xyz;

	#endif
	}
	`,
	"anim":/* glsl */`
	in vec3 instanceColorIn;
	out vec3 instanceColorOut;
	//////////////////////////////////////
	uniform sampler2D animationTexture;
	uniform float boneCount, animationFrameCount, animationTextureLength;
	uniform float time;
	in vec4 skinIndex, skinWeight; // 仅使用了绑定的第一个骨骼
	in float speed;//float speed=1.;//
	in float obesity;
	in float moveMaxLength;
	in float animationStartTime;
	in float animationIndex; // float animationIndex=0.; // 动画类型// in float animationIndex; // 动画类型//
	in vec4 bodyScale; // 0:身体 1:头部 2:上肢 3:下肢
	struct Vertex{
		vec3 position;
		vec3 normal;
	};
	float getBoneScale(float bone) { // 身体形变
		if ( bone < 3.5 || (bone > 5.5 && bone < 6.5) || (bone > 15.5 && bone < 16.5) ) // 身体
			return bodyScale[0];
		if ( bone > 3.5 && bone < 5.5 ) // 头部
			return bodyScale[1];
		if ( bone > 6.5 && bone < 15.5 || (bone > 16.5 && bone < 25.5) ) // 上肢
			return bodyScale[2];
		if ( bone > 25.5 ) // 下肢
			return bodyScale[3];
	}
	float computeBodyScale() {
		return (
			skinWeight[0] * getBoneScale(skinIndex[0]) + 
			skinWeight[1] * getBoneScale(skinIndex[1]) +
			skinWeight[2] * getBoneScale(skinIndex[2]) +
			skinWeight[3] * getBoneScale(skinIndex[3])
		);
	}
	vec4 getAnimationItem(float index) { // 从texture中提取矩阵元素
		float v = floor(index / animationTextureLength);
		float u = index - v * animationTextureLength;
		return texture(
			animationTexture, 
			vec2( (0.5 + u) / animationTextureLength, (0.5 + v) / animationTextureLength )
		);
	}
	mat4 computeAnimationMatrix(float boneIndex, float frameIndex) { // 计算一个骨骼的变换矩阵
		float startPos = //4. * boneCount +
				3. * (boneCount * (animationIndex  * animationFrameCount + frameIndex) + boneIndex);
		vec4 a=getAnimationItem(startPos + 0.);
		vec4 b=getAnimationItem(startPos + 1.);
		vec4 c=getAnimationItem(startPos + 2.);
		
		return mat4(
			vec4(a.x,a.y,a.z, 0.),
			vec4(a.a,b.x,b.y, 0.),
			vec4(b.z,b.a,c.x, 0.),
			vec4(c.y,c.z,c.a, 1.)
		);
	}
	mat3 mat4_mat3(mat4 m){
		return mat3(
			m[0].xyz,
			m[1].xyz,
			m[2].xyz
		);
	}
	Vertex computeAnimationPos(float boneIndex, float frameIndex,Vertex vertex) { // 计算一个骨骼的变换矩阵
		vec4 position=vec4(vertex.position, 1.);
		mat4 m1=computeAnimationMatrix( boneIndex,  0.);
		mat4 test=mat4(
			vec4(obesity ,0.,0., 0.),
			vec4(0.,1.,0., 0.),
			vec4(0.,0.,obesity, 0.),
			vec4(0.,0.,0., 1.)
		);
		mat4 m2=computeAnimationMatrix( boneIndex,  frameIndex+1.);
		vertex.position=(m2*test*m1*position).xyz;
	
		vec3 normal=vertex.normal;
		mat3 m3=mat4_mat3(m1);
		mat3 test2=mat4_mat3(test);
		mat3 m4=mat4_mat3(m2);
		vertex.normal= m4*test2*m3*normal;
		return vertex;
	}
	Vertex vertexBlending(Vertex vertex, float frameIndex) { // 动画形变, 计算4个骨骼的影响
		if ( animationTextureLength < 0.5) return vertex; // 动画未加载
		Vertex vertexResult;
		vertexResult.position=vec3(0.,0.,0.);
		vertexResult.normal=vec3(0.,0.,0.);
		for(int i=0;i<4;i++){
			Vertex v=computeAnimationPos(skinIndex[i], frameIndex,vertex) ;
			vertexResult.position+=skinWeight[i] * v.position;
			vertexResult.normal+=skinWeight[i] * v.normal;
		}
		return vertexResult;
	}
	Vertex frameInterpolation(Vertex vertex) { // 点坐标插值, 考虑优化:变换矩阵插值
		float m = floor((time + animationStartTime) * speed / (animationFrameCount-1.));
		float temp = (time + animationStartTime) * speed - m * (animationFrameCount-1.);
		float frameIndex1 = floor(temp);
		float weight = temp - frameIndex1; // 插值权重
		float frameIndex2 = float(int(frameIndex1 + 1.) % int(animationFrameCount));
		if(frameIndex2>=animationFrameCount-1.)frameIndex2=0.;
		Vertex vertex1 = vertexBlending(vertex, frameIndex1);
		Vertex vertex2 = vertexBlending(vertex, frameIndex2);
		vertex.position = (1. - weight) * vertex1.position + weight * vertex2.position;
		vertex.normal = (1. - weight) * vertex1.normal + weight * vertex2.normal;
	
		float max=moveMaxLength;//移动路线的长度
		// float f=1.;
		if(max>0.){
			float direction=1.;
			float x=0.25*(time + animationStartTime) * speed;
			x=x-max*2.*floor(x/(max*2.));
			if(x>max){
				x=2.*max-x;
				direction=-1.;
			}
			x-=max/2.;
			vertex.position.x*=direction;
			vertex.position.z*=direction;
			vertex.position.z-=x;
	
			vertex.normal.x*=direction;
			vertex.normal.z*=direction;
		}
		return vertex;
	}
	//////////////////////////////////////
	`,
	"anim_sim":/* glsl */`
	in vec3 instanceColorIn;
	out vec3 instanceColorOut;
	//////////////////////////////////////
	uniform sampler2D animationTexture;
	uniform float boneCount, animationFrameCount, animationTextureLength;
	uniform float time;
	in vec4 skinIndex, skinWeight; // 仅使用了绑定的第一个骨骼
	in float speed;//float speed=1.;//
	// in float obesity;
	in float moveMaxLength;
	in float animationStartTime;
	in float animationIndex; // float animationIndex=0.; // 动画类型// in float animationIndex; // 动画类型//
	in vec4 bodyScale; // 0:身体 1:头部 2:上肢 3:下肢
	struct Vertex{
		vec3 position;
		vec3 normal;
	};
	float getBoneScale(float bone) { // 身体形变
		if ( bone < 3.5 || (bone > 5.5 && bone < 6.5) || (bone > 15.5 && bone < 16.5) ) // 身体
			return bodyScale[0];
		if ( bone > 3.5 && bone < 5.5 ) // 头部
			return bodyScale[1];
		if ( bone > 6.5 && bone < 15.5 || (bone > 16.5 && bone < 25.5) ) // 上肢
			return bodyScale[2];
		if ( bone > 25.5 ) // 下肢
			return bodyScale[3];
	}
	float computeBodyScale() {
		return (
			skinWeight[0] * getBoneScale(skinIndex[0]) + 
			skinWeight[1] * getBoneScale(skinIndex[1]) +
			skinWeight[2] * getBoneScale(skinIndex[2]) +
			skinWeight[3] * getBoneScale(skinIndex[3])
		);
	}
	vec4 getAnimationItem(float index) { // 从texture中提取矩阵元素
		float v = floor(index / animationTextureLength);
		float u = index - v * animationTextureLength;
		return texture(
			animationTexture, 
			vec2( (0.5 + u) / animationTextureLength, (0.5 + v) / animationTextureLength )
		);
	}
	mat4 computeAnimationMatrix(float boneIndex, float frameIndex) { // 计算一个骨骼的变换矩阵
		float startPos = //4. * boneCount +
				3. * (boneCount * (animationIndex  * (animationFrameCount-1.) + frameIndex) + boneIndex);
		vec4 a=getAnimationItem(startPos + 0.);
		vec4 b=getAnimationItem(startPos + 1.);
		vec4 c=getAnimationItem(startPos + 2.);
		
		return mat4(
			vec4(a.x,a.y,a.z, 0.),
			vec4(a.a,b.x,b.y, 0.),
			vec4(b.z,b.a,c.x, 0.),
			vec4(c.y,c.z,c.a, 1.)
		);
	}
	mat3 mat4_mat3(mat4 m){
		return mat3(
			m[0].xyz,
			m[1].xyz,
			m[2].xyz
		);
	}
	Vertex computeAnimationPos(float boneIndex, float frameIndex,Vertex vertex) { // 计算一个骨骼的变换矩阵
		vec4 position=vec4(vertex.position, 1.);
		// mat4 m1=computeAnimationMatrix( boneIndex,  0.);
		// mat4 m2=computeAnimationMatrix( boneIndex,  frameIndex+1.);
		// vertex.position=(m2*m1*position).xyz;
		mat4 m=computeAnimationMatrix( boneIndex,  frameIndex);
		vertex.position=(m*position).xyz;
		return vertex;
	}
	Vertex vertexBlending(Vertex vertex, float frameIndex) { // 动画形变, 计算4个骨骼的影响
		if ( animationTextureLength < 0.5) return vertex; // 动画未加载 //点集渲染的时候可以用到
		Vertex vertexResult;
		vertexResult.position=vec3(0.,0.,0.);
		// vertexResult.normal=vec3(0.,0.,0.);
		for(int i=0;i<4;i++){
			Vertex v=computeAnimationPos(skinIndex[i], frameIndex,vertex) ;
			vertexResult.position+=skinWeight[i] * v.position;
			// vertexResult.normal+=skinWeight[i] * v.normal;
		}
		return vertexResult;
	}
	Vertex frameInterpolation(Vertex vertex) { // 点坐标插值, 考虑优化:变换矩阵插值
		float m = floor((time + animationStartTime) * speed / (animationFrameCount-2.));
		float temp = (time + animationStartTime) * speed - m * (animationFrameCount-2.);
		float frameIndex1 = floor(temp);
		float weight = temp - frameIndex1; // 插值权重
		float frameIndex2 = float(int(frameIndex1 + 1.) % int(animationFrameCount-1.));
		if(frameIndex2>=animationFrameCount-2.)frameIndex2=0.;
		Vertex vertex1 = vertexBlending(vertex, frameIndex1);
		Vertex vertex2 = vertexBlending(vertex, frameIndex2);
		vertex.position = (1. - weight) * vertex1.position + weight * vertex2.position;
	
		float max=moveMaxLength;//移动路线的长度
		if(max>0.){
			float direction=1.;
			float x=0.25*(time + animationStartTime) * speed;
			x=x-max*2.*floor(x/(max*2.));
			if(x>max){
				x=2.*max-x;
				direction=-1.;
			}
			x-=max/2.;
			vertex.position.x*=direction;
			vertex.position.z*=direction;
			vertex.position.z-=x;
	
			vertex.normal.x*=direction;
			vertex.normal.z*=direction;
		}
		return vertex;
	}
	//////////////////////////////////////
	`,
	"anim_no":/* glsl */`
	in vec3 instanceColorIn;
	out vec3 instanceColorOut;
	//////////////////////////////////////
	uniform float time;
	in float moveMaxLength;
	struct Vertex{
		vec3 position;
		vec3 normal;
	};
	mat3 mat4_mat3(mat4 m){
		return mat3(
			m[0].xyz,
			m[1].xyz,
			m[2].xyz
		);
	}
	Vertex frameInterpolation(Vertex vertex) { // 点坐标插值, 考虑优化:变换矩阵插值
		return vertex;
	}
	//////////////////////////////////////
	`
}
const FS={
	"MeshStandardMaterial":/* glsl */`
	#define STANDARD

	#ifdef PHYSICAL
		#define IOR
		#define SPECULAR
	#endif
	
	uniform vec3 diffuse;
	uniform vec3 emissive;
	uniform float roughness;
	uniform float metalness;
	uniform float opacity;
	
	#ifdef IOR
		uniform float ior;
	#endif
	
	#ifdef SPECULAR
		uniform float specularIntensity;
		uniform vec3 specularColor;
	
		#ifdef USE_SPECULARINTENSITYMAP
			uniform sampler2D specularIntensityMap;
		#endif
	
		#ifdef USE_SPECULARCOLORMAP
			uniform sampler2D specularColorMap;
		#endif
	#endif
	
	#ifdef USE_CLEARCOAT
		uniform float clearcoat;
		uniform float clearcoatRoughness;
	#endif
	
	#ifdef USE_SHEEN
		uniform vec3 sheenColor;
		uniform float sheenRoughness;
	
		#ifdef USE_SHEENCOLORMAP
			uniform sampler2D sheenColorMap;
		#endif
	
		#ifdef USE_SHEENROUGHNESSMAP
			uniform sampler2D sheenRoughnessMap;
		#endif
	#endif
	
	varying vec3 vViewPosition;
	
	#include <common>
	#include <packing>
	#include <dithering_pars_fragment>
	#include <color_pars_fragment>
	#include <uv_pars_fragment>
	//#include <uv2_pars_fragment>
	#include <map_pars_fragment>
	#include <alphamap_pars_fragment>
	#include <alphatest_pars_fragment>
	#include <aomap_pars_fragment>
	#include <lightmap_pars_fragment>
	#include <emissivemap_pars_fragment>
	#include <bsdfs>
	#include <cube_uv_reflection_fragment>
	#include <envmap_common_pars_fragment>
	#include <envmap_physical_pars_fragment>
	#include <fog_pars_fragment>
	#include <lights_pars_begin>
	#include <normal_pars_fragment>
	
	#include <lights_physical_pars_fragment>
	
	#include <transmission_pars_fragment>
	#include <shadowmap_pars_fragment>
	#include <bumpmap_pars_fragment>
	#include <normalmap_pars_fragment>
	#include <clearcoat_pars_fragment>
	#include <roughnessmap_pars_fragment>
	#include <metalnessmap_pars_fragment>
	#include <logdepthbuf_pars_fragment>
	#include <clipping_planes_pars_fragment>
	//////////////////////////////////////////////////////
	in vec3 instanceColorOut;
	//////////////////////////////////////////////////////
	void main() {
	
		#include <clipping_planes_fragment>
	
		vec4 diffuseColor = vec4( diffuse, opacity );
		/////////////////////////////////////////////////////////////////////
		diffuseColor.xyz +=instanceColorOut;
		/////////////////////////////////////////////////////////////////////
		ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
		vec3 totalEmissiveRadiance = emissive;
	
		#include <logdepthbuf_fragment>
		#include <map_fragment>
		#include <color_fragment>
		#include <alphamap_fragment>
		#include <alphatest_fragment>
		#include <roughnessmap_fragment>
		#include <metalnessmap_fragment>
		#include <normal_fragment_begin>
		#include <normal_fragment_maps>
		#include <clearcoat_normal_fragment_begin>
		#include <clearcoat_normal_fragment_maps>
		#include <emissivemap_fragment>
	
		// accumulation
		#include <lights_physical_fragment>
		#include <lights_fragment_begin>
		#include <lights_fragment_maps>
		#include <lights_fragment_end>
	
		// modulation
		#include <aomap_fragment>
	
		vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
		vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	
		#include <transmission_fragment>
	
		vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	
		#ifdef USE_CLEARCOAT
	
			float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
	
			vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
	
			outgoingLight = outgoingLight * ( 1.0 - clearcoat * Fcc ) + clearcoatSpecular * clearcoat;
	
		#endif
	
		#include <output_fragment>
		#include <tonemapping_fragment>
		#include <encodings_fragment>
		#include <fog_fragment>
		#include <premultiplied_alpha_fragment>
		#include <dithering_fragment>
	
	}
	`,
	"lights_physical_pars_fragment_Scattering":/* glsl */`
	float thicknessDistortion = 0.1;
	float thicknessPower = 2.0;
	float thicknessScale = 2.0;

	uniform sampler2D sssLUT;//Subsurface Scattering //https://developer.nvidia.com/gpugems/gpugems3/part-iii-rendering/chapter-14-advanced-techniques-realistic-real-time-skin
	uniform float sssIntensity;
	uniform float CurveFactor;

	void RE_Direct_Physical_Scattering( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
			RE_Direct_Physical( directLight, geometry, material, reflectedLight ) ;
			vec3 scatteringHalf = normalize( directLight.direction + (geometry.normal * thicknessDistortion));
			float scatteringDot = pow(saturate(dot(geometry.viewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
			reflectedLight.directDiffuse += scatteringDot * directLight.color * material.diffuseColor.rgb;

			float wrappedDotNL = (dot(directLight.direction, geometry.normal) * 0.5 + 0.5);
			vec4 scatteringColor = texture2D(sssLUT, vec2(wrappedDotNL, CurveFactor  ));
			reflectedLight.directDiffuse += (1.0 - wrappedDotNL) * directLight.color * material.diffuseColor * scatteringColor.rgb * sssIntensity;//计算次表面散射并加入到漫反射中
	}
	#define  RE_Direct_Physical  RE_Direct_Physical_Scattering
	`,
}
export class Instanced0Shader{
	constructor(opt){
		let frag =FS["MeshStandardMaterial"]
		if(opt.scattering){
			frag = frag.replace( 
				'#include <lights_physical_pars_fragment>', 
				'#include <lights_physical_pars_fragment>'+
				FS["lights_physical_pars_fragment_Scattering"]
			)
		}
		this.fragmentShader=frag
		const isInstancedMesh=opt["isInstancedMesh"]
		if(opt["isInstancedMesh"]){
			this.vertexShader=this.addGlsl(
				VS["MeshStandardMaterial"],
				opt["isSimShader"]?VS["anim_sim"]:VS["anim"]
			)
		}else{
			this.vertexShader=this.addGlsl(
				VS["MeshStandardMaterial"],
				VS["anim_no"]
			)
		}
		
		
	}
	addGlsl(origin,str0,tag){
		if(!tag)tag='#include <common>' 
		var str1='\n' + str0+ '\n' + tag + '\n' 
		return origin
				.replace( tag, str1 );
	}
}