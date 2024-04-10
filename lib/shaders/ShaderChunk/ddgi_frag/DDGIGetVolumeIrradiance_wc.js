export const DDGIGetVolumeIrradiance_wc =
/* glsl */`
    uniform sampler2D probeDistance;
    float DDGIGetVolumeIrradiance_wc(
        vec3 biasedWorldPosition,//vec3 worldPosition,vec3 surfaceBias,//vec3 biasedWorldPosition = (worldPosition + surfaceBias);
        DDGIVolumeDescGPU volume,
        ivec3 adjacentProbeCoords,
        int adjacentProbeIndex,
        vec3 adjacentProbeWorldPosition
        )//probeIndex
    {
        // {
            //计算偏移后和未偏移的渲染点到相邻Probe的距离
            // Compute the distance and direction from the (biased and non-biased) shading point and the adjacent probe
            vec3 biasedPosToAdjProbe = normalize(adjacentProbeWorldPosition - biasedWorldPosition);//偏移点到probe的方向
            float  biasedPosToAdjProbeDist = length(adjacentProbeWorldPosition - biasedWorldPosition);//偏移点到probe的距离

            // 计算该相邻探针的纹理坐标，并对探针的过滤距离进行采样// Compute the texture coordinates of this adjacent probe and sample the probe's filtered distance
            vec2 octantCoords = DDGIGetOctahedralCoordinates(-biasedPosToAdjProbe);

            vec2 probeTextureCoords = DDGIGetProbeUV(adjacentProbeIndex, octantCoords, volume.probeGridCounts, volume.probeNumDistanceTexels);
            probeTextureCoords.y = 1.0f- probeTextureCoords.y;
            vec2 filteredDistance = 2.f * texture2DLodEXT(probeDistance,probeTextureCoords, 0.f).rg;//vec2(0.001,0.);//

            float meanDistanceToSurface = filteredDistance.x;
            float variance = abs((filteredDistance.x * filteredDistance.x) - filteredDistance.y);//|x*x-y|

            float chebyshevWeight = 1.f;
            if(biasedPosToAdjProbeDist > meanDistanceToSurface) //偏移后的当前点到相邻probe的距离大于平均距离，即在阴影中，In "shadow"
            {
                // v must be greater than 0, which is guaranteed by the if condition above.
                float v = biasedPosToAdjProbeDist - meanDistanceToSurface;//求距离差，因上述if条件保证，结果一定大于0
                chebyshevWeight = variance / (variance + (v * v));

                //强调权重的差异
                // Increase the contrast in the weight
                chebyshevWeight = max((chebyshevWeight * chebyshevWeight * chebyshevWeight), 0.f);
            }

            //避免因为没有probe可以照到导致的0值
            // Avoid visibility weights ever going all the way to zero because
            // when *no* probe has visibility we need a fallback value
            return max(0.05f, chebyshevWeight);   
        // }
    }    
`