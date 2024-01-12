import {GetAlbedo} from"./GetAlbedo.js"
import {DDGIGetVolumeBlendWeight} from"./DDGIGetVolumeBlendWeight.js"
import {DDGIGetVolumeIrradiance} from"./DDGIGetVolumeIrradiance.js"
export const GetIndirectRadiance =
GetAlbedo+
/* glsl */`
	#define PI 3.1415926535897932f
	struct DDGIVolumeDescGPU
	{
          vec3 origin;
          vec3 probeGridSpacing;
          ivec3 probeGridCounts;
          float probeIrradianceEncodingGamma;
          int probeNumIrradianceTexels;
          int probeNumDistanceTexels;
          float normalBias;
          float viewBias;
    };
`+
DDGIGetVolumeBlendWeight+
DDGIGetVolumeIrradiance+
/* glsl */`
	uniform DDGIVolumeDescGPU DDGIVolume;//输入调控光照效果的参数
	varying vec4 vPosition;
    varying vec3 vNormal;
    vec3 DDGIGetSurfaceBias(vec3 surfaceNormal, vec3 cameraDirection, DDGIVolumeDescGPU DDGIVolume)
    {//视线 与 法线 中间的某个方向
        return (surfaceNormal * DDGIVolume.normalBias) + (-cameraDirection * DDGIVolume.viewBias);
    }
	
	uniform sampler2D mytex0;
	uniform sampler2D mytex1;
	uniform sampler2D mytex2;
	uniform sampler2D mytex3;
	uniform sampler2D mytex4;

	vec3 getXYZ(sampler2D tex,float u,float v){
		float px=u;//(u+0.5);
		float py=1.-v;//(y+0.5);
		vec3 result= texture(tex, vec2(px,py)).xyz;
		return result;
	}
	float getSH_base(int i){
		vec3 w = normalize(vNormal);
		float x=w.x,y=w.y,z=w.z;
		float pi=PI;
		if(i==0)return 0.5*sqrt(1./pi);
		
		else if(i==1)return -sqrt(3./(4.*pi))*y ;
		else if(i==2)return sqrt(3./(4.*pi))*z ;
		else if(i==3)return -sqrt(3./(4.*pi))*x ;

		else if(i==4)return 0.5*sqrt(15./pi)*x*y ;
		else if(i==5)return -0.5*sqrt(15./pi)*y*z ;
		else if(i==6)return 0.25*sqrt(5./pi)*(3.*z*z-1.) ;
		else if(i==7)return -0.5*sqrt(15./pi)*x*z ;
		else if(i==8)return 0.25*sqrt(15./pi)*(x*x-y*y) ;

		else return 0.;
	}
	vec3 getShColor(float u,float v){
		float sh0=getSH_base(0);
		float sh1=getSH_base(1);
		float sh2=getSH_base(2);
		float sh3=getSH_base(3);
		vec3 a0=getXYZ(mytex0,u,v);
		vec3 a1=getXYZ(mytex1,u,v);
		vec3 a2=getXYZ(mytex2,u,v);
		vec3 a3=getXYZ(mytex3,u,v);
		return sh0*a0+sh1*a1+sh2*a2+sh3*a3;//data += result[index]*SH(l, m, theta, phi);
	}
	uniform bool dGI; 
    vec3 GetIndirectRadiance(vec2 _screenPosition){
		if(dGI){
			float u=_screenPosition.x;
			float v=_screenPosition.y;
			return 3.*getShColor(u,v);
			return getXYZ(mytex0,u,1.-v);
			return vec3(u,v,0.5);
			return vNormal;
			vec4 albedo = GetAlbedo();//获取纹理颜色
			return albedo.xyz/PI;
            if(albedo.w > 0.f)//如果该像素不对应全透明纹理
			{
				vec4 worldPos = vPosition;//texture(GBufferb,_screenPosition);
				vec3 normal = vNormal;//texture(GBufferc,_screenPosition).xyz;
				
				//获取对表面体积贡献的混合权重 //Get the blend weight for this volume's contribution to the surface
				float weight = DDGIGetVolumeBlendWeight(worldPos.xyz, DDGIVolume);
				if(weight > 0.f)
				{
					vec3 cameraDirection = normalize(worldPos.xyz - cameraPosition);//-视线方向
					vec3 surfaceBias = DDGIGetSurfaceBias(normal, cameraDirection, DDGIVolume);//视线 与 法线 中间的某个方向
					vec3 irradiance = DDGIGetVolumeIrradiance(
						worldPos.xyz,//着色点坐标
						surfaceBias,//?
						normal,//着色点法线
						DDGIVolume);
					return (albedo.rgb / PI) * irradiance * weight;//irradianceColor = (albedo.rgb / PI) * irradiance;
				}
			}
		}
        return vec3(.0);	
    }
`