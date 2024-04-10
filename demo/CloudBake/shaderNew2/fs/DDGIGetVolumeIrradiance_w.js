import {DDGIGetVolumeIrradiance_wt}from"./DDGIGetVolumeIrradiance_wt"
import {DDGIGetVolumeIrradiance_ws}from"./DDGIGetVolumeIrradiance_ws"
import {DDGIGetVolumeIrradiance_wc}from"./DDGIGetVolumeIrradiance_wc"
export const DDGIGetVolumeIrradiance_w =
DDGIGetVolumeIrradiance_wt+
DDGIGetVolumeIrradiance_ws+
DDGIGetVolumeIrradiance_wc+
/* glsl */`
/**
* Computes the world space position of a probe at the given 3D grid coordinates.
*/
vec3 DDGIGetProbeWorldPosition(ivec3 probeCoords, vec3 origin, ivec3 probeGridCounts, vec3 probeGridSpacing)
{
    // Multiply the grid coordinates by the grid spacing
    //将网格坐标还原到位置坐标
    vec3 probeGridWorldPosition = (vec3(probeCoords) * probeGridSpacing);

    // Shift the grid by half of each axis extent to center the volume about its origin
    //矩形中的半轴长度
    vec3 probeGridShift = (probeGridSpacing * vec3(probeGridCounts - 1)) * 0.5f;

    // Compute the probe's world position
    //计算probe的世界坐标位置，将偏移后的位置坐标减去半轴进行还原
    return (origin + probeGridWorldPosition - probeGridShift);
}
    
    float DDGIGetVolumeIrradiance_w(
        vec3 worldPosition,
        vec3 biasedWorldPosition,//vec3 surfaceBias,
        vec3 direction,
        DDGIVolumeDescGPU volume,
        ivec3 adjacentProbeOffset,
        ivec3 adjacentProbeCoords,//
        int adjacentProbeIndex,
        ivec3 baseProbeCoords
    )
    {
        //在周围八个Probe中循环，并累计他们的贡献 // Iterate over the 8 closest probes and accumulate their contributions
        //for(int probeIndex = 0; probeIndex < 8; probeIndex++)
        {
            //获得Probe的世界坐标位置（包含减去半轴还原到偏移之前的坐标）// Get the adjacent probe's world position
            vec3 adjacentProbeWorldPosition = DDGIGetProbeWorldPosition(adjacentProbeCoords, volume.origin, volume.probeGridCounts, volume.probeGridSpacing);
            float weight = DDGIGetVolumeIrradiance_ws(//软背面包裹
                worldPosition,//vec3 
                direction,//vec3 
                volume,//DDGIVolumeDescGPU 
                adjacentProbeCoords,//ivec3 
                adjacentProbeWorldPosition
            );
            float chebyshevWeight = DDGIGetVolumeIrradiance_wc(
                biasedWorldPosition,//vec3 
                volume,//DDGIVolumeDescGPU 
                adjacentProbeCoords,//ivec3 
                adjacentProbeIndex,//int 
                adjacentProbeWorldPosition
            );
            //避免权重为0
            // Avoid a weight of zero
            weight = max(0.000001f, weight * chebyshevWeight);
            // A small amount of light is visible due to logarithmic perception, so
            // crush tiny weights but keep the curve continuous
            const float crushThreshold = 0.2f;
            if (weight < crushThreshold)
            {
                weight *= (weight * weight) * (1.f / (crushThreshold * crushThreshold));
            }

            // Get the world space position of the base probe
            vec3 baseProbeWorldPosition = DDGIGetProbeWorldPosition(baseProbeCoords, volume.origin, volume.probeGridCounts, volume.probeGridSpacing);
            float  trilinearWeight = DDGIGetVolumeIrradiance_wt(
                biasedWorldPosition,//vec3 
                volume,//DDGIVolumeDescGPU 
                baseProbeCoords,//ivec3 
                adjacentProbeOffset,//ivec3 
                baseProbeWorldPosition
            );//基于到每个相邻探针的距离计算三线性权重，以便在探针之间平滑过渡。
            weight *= trilinearWeight;//应用三线性权重// Apply the trilinear weights

            return weight;
        }
    }
`