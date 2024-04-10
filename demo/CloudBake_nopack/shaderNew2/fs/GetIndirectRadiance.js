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
	
	uniform bool dGI; 
    vec3 GetIndirectRadiance(){
		if(dGI){
			vec4 albedo = GetAlbedo();//获取纹理颜色
			// return albedo.xyz;
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