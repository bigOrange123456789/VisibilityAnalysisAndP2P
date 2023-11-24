import {GetBaseColor} from"./GetBaseColor.js"
import {DDGIGetVolumeIrradiance} from"./DDGIGetVolumeIrradiance.js"
import {DDGIGetVolumeBlendWeight} from"./DDGIGetVolumeBlendWeight.js"

export const getIrradianceColor =
GetBaseColor+
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
DDGIGetVolumeIrradiance+
DDGIGetVolumeBlendWeight+
/* glsl */`
	uniform DDGIVolumeDescGPU DDGIVolume;
	
	varying vec4 vPosition;
    varying vec3 vNormal;

	/**
	* DDGIGetSurfaceBias
	*/
    vec3 DDGIGetSurfaceBias(vec3 surfaceNormal, vec3 cameraDirection, DDGIVolumeDescGPU DDGIVolume)
    {
        return (surfaceNormal * DDGIVolume.normalBias) + (-cameraDirection * DDGIVolume.viewBias);
    }
    vec3 getIrradianceColor(){
            //加载sRGB反照率并在照明前将其转换为线性// load the sRGB albedo and convert it to linear before lighting
		    vec4 albedo = GetBaseColor();//获取基本???的颜色
            if(albedo.w > 0.f)//如果这个片层是透明的
			{
				vec4 worldPos = vPosition;//texture(GBufferb,_screenPosition);
				vec3 normal = vNormal;//texture(GBufferc,_screenPosition).xyz;

				// Indirect Lighting
				vec3 irradiance = vec3(0.f,0.f,0.f);

				vec3 cameraDirection = normalize(worldPos.xyz - cameraPosition);
				vec3 surfaceBias = DDGIGetSurfaceBias(normal, cameraDirection, DDGIVolume);

				// Get the blend weight for this volume's contribution to the surface
				float weight = DDGIGetVolumeBlendWeight(worldPos.xyz, DDGIVolume);
				if(weight > 0.f)
				{
					irradiance += DDGIGetVolumeIrradiance(
						worldPos.xyz,
						surfaceBias,
						normal,
						DDGIVolume);
					irradiance *= weight;
				}
				return (albedo.rgb / PI) * irradiance;//irradianceColor = (albedo.rgb / PI) * irradiance;
			}else{
                return vec3(.0);
            }
    }
`