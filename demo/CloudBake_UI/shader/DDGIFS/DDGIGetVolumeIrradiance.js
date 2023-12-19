import {DDGIGetOctahedralCoordinates}from"./DDGIGetOctahedralCoordinates"
import {DDGIGetProbeUV}from"./DDGIGetProbeUV"
import {DDGIGetVolumeIrradiance_w}from"./DDGIGetVolumeIrradiance_w"
export const DDGIGetVolumeIrradiance =
DDGIGetOctahedralCoordinates+
DDGIGetProbeUV+
DDGIGetVolumeIrradiance_w+
/* glsl */`
uniform sampler2D probeIrradiance;
ivec3 DDGIGetBaseProbeGridCoords(vec3 worldPosition, vec3 origin, ivec3 probeGridCounts, vec3 probeGridSpacing)
{//着色点位置 -> 最近探针的网格坐标
    
    vec3 position = (worldPosition - origin) + (probeGridSpacing * vec3(probeGridCounts - ivec3(1))) * 0.5f;//将相对坐标转到0，n
    ivec3 probeCoords = ivec3(position / probeGridSpacing);//得到转换后的坐标
    return clamp(probeCoords, ivec3(0), (probeGridCounts - ivec3(1)));//统一范围处理，超过界限作为0或者 probeGridCounts - 1
}
int DDGIGetProbeIndex(ivec3 probeCoords, ivec3 probeGridCounts)
{//探针的网格坐标 -> 探针的索引
    return probeCoords.x + (probeGridCounts.x * probeCoords.z) + (probeGridCounts.x * probeGridCounts.z) * probeCoords.y;//计算得到当前probe在整个probe矩形中的索引
}  
  
	/**
	* DDGIGetVolumeIrradiance
	* Samples irradiance from the given volume's probes using information
	* about the surface, sampling direction, and volume.
	*/
    vec3 DDGIGetVolumeIrradiance(
        vec3 worldPosition,//着色点位置
        vec3 surfaceBias,//表面偏移？
        vec3 direction,//着色点法线(采样方向)
        DDGIVolumeDescGPU volume)
    {
        vec3 irradiance = vec3(0.f);
        float  accumulatedWeights = 0.f;

        // Bias the world space position
        vec3 biasedWorldPosition = worldPosition + surfaceBias;

        // 获得最近探针的网格坐标
        ivec3 baseProbeCoords = DDGIGetBaseProbeGridCoords(biasedWorldPosition, volume.origin, volume.probeGridCounts, volume.probeGridSpacing);

        //在周围八个Probe中循环，并累计他们的贡献 // Iterate over the 8 closest probes and accumulate their contributions
        for(int probeIndex = 0; probeIndex < 8; probeIndex++)
        {

            // Compute the offset to the adjacent probe in grid coordinates by
            // sourcing the offsets from the bits of the loop index: x = bit 0, y = bit 1, z = bit 2
            ivec3 adjacentProbeOffset = ivec3(probeIndex, probeIndex >> 1, probeIndex >> 2) & ivec3(1);

            // Get the 3D grid coordinates of the adjacent probe by adding the offset to the base probe
            // Clamp to the grid boundaries
            ivec3 adjacentProbeCoords = clamp(baseProbeCoords + adjacentProbeOffset, ivec3(0), volume.probeGridCounts - ivec3(1, 1, 1));

            //得到Probe的索引（用于贴图采样）
            int adjacentProbeIndex = DDGIGetProbeIndex(adjacentProbeCoords, volume.probeGridCounts);

            float weight = DDGIGetVolumeIrradiance_w(
                worldPosition,//vec3 
                biasedWorldPosition,//vec3 
                direction,//vec3 
                volume,//DDGIVolumeDescGPU 
                adjacentProbeOffset,//ivec3 
                adjacentProbeCoords,//ivec3 
                adjacentProbeIndex,//int 
                baseProbeCoords//ivec3 
            );

            vec2 octantCoords = DDGIGetOctahedralCoordinates(direction);//获取采样方向对应的八面体纹理坐标
            vec2 probeTextureCoords = DDGIGetProbeUV(adjacentProbeIndex, octantCoords, volume.probeGridCounts, volume.probeNumIrradianceTexels);
            probeTextureCoords.y = 1.0f- probeTextureCoords.y;

            vec3 probeIrradiance = texture2DLodEXT(probeIrradiance,probeTextureCoords, 0.f).rgb;
            // Decode the tone curve, but leave a gamma = 2 curve to approximate sRGB blending
            vec3 exponent = vec3(volume.probeIrradianceEncodingGamma * 0.5f);
            probeIrradiance = pow(probeIrradiance, exponent);

            // Accumulate the weighted irradiance
            irradiance += (weight * probeIrradiance);
            accumulatedWeights += weight;
        }
		// Avoid a divide by zero when weights sum to zero
		if (accumulatedWeights == 0.f) return vec3(0.f, 0.f, 0.f);

        irradiance *= (1.f / accumulatedWeights);   // Normalize by the accumulated weights
        irradiance *= irradiance;                   // Go back to linear irradiance
        irradiance *= (2.0f * PI);                  // Factored out of the probes

        return irradiance;
    }
`