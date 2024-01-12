export const DDGIGetVolumeIrradiance_wt =
/* glsl */`
    float DDGIGetVolumeIrradiance_wt(
        vec3 biasedWorldPosition,//vec3 worldPosition,vec3 surfaceBias,//biasedWorldPosition = worldPosition + surfaceBias
        DDGIVolumeDescGPU volume,
        ivec3 baseProbeCoords,
        ivec3 adjacentProbeOffset,
        vec3 baseProbeWorldPosition)//probeIndex
    {
        //将点和计算得到的相邻基础probe距离偏差进行归一化
        // Clamp the distance between the given point and the base probe's world position (on each axis) to [0, 1]
        vec3 alpha = clamp(((biasedWorldPosition - baseProbeWorldPosition) / volume.probeGridSpacing), vec3(0.f, 0.f, 0.f), vec3(1.f, 1.f, 1.f));

        //{

            //基于到每个相邻探针的距离计算三线性权重，以便在探针之间平滑过渡。// Compute trilinear weights based on the distance to each adjacent probe to smoothly transition between probes.
            //当adjacentobeOffset=0时，我们使用1-alpha，而当adjacentrobeOffset=1时，使用alpha。// adjacentProbeOffset is binary, so we're using a 1-alpha when adjacentProbeOffset = 0 and alpha when adjacentProbeOffset = 1.
            vec3 trilinear = max(vec3(0.001f), lerp(vec3(1.f - alpha), alpha, vec3(adjacentProbeOffset)));
            float  trilinearWeight = (trilinear.x * trilinear.y * trilinear.z);
            return trilinearWeight;   
        //}
    }
`