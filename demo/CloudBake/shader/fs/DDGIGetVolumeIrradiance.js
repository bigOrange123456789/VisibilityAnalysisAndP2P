import {DDGIGetOctahedralCoordinates}from"./DDGIGetOctahedralCoordinates"
import {DDGIGetProbeUV}from"./DDGIGetProbeUV"
export const DDGIGetVolumeIrradiance =
DDGIGetOctahedralCoordinates+
DDGIGetProbeUV+
/* glsl */`
    uniform sampler2D probeIrradiance;
    uniform sampler2D probeDistance;

	/**
	* DDGIGetBaseProbeGridCoords
	* Computes the 3D grid coordinates of the base probe (i.e. floor of xyz) of the 8-probe
	* cube that surrounds the given world space position. The other seven probes are offset
	* by 0 or 1 in grid space along each axis.
	*/
    ivec3 DDGIGetBaseProbeGridCoords(vec3 worldPosition, vec3 origin, ivec3 probeGridCounts, vec3 probeGridSpacing)
    {
        // Shift from [-n/2, n/2] to [0, n]
        vec3 position = (worldPosition - origin) + (probeGridSpacing * vec3(probeGridCounts - ivec3(1,1,1))) * 0.5f;//将相对坐标转到0，n

        ivec3 probeCoords = ivec3(position / probeGridSpacing);//得到转换后的坐标

        // Clamp to [0, probeGridCounts - 1]
        // Snaps positions outside of grid to the grid edge
        //统一范围处理，超过界限作为0或者 probeGridCounts - 1
        probeCoords = clamp(probeCoords, ivec3(0, 0, 0), (probeGridCounts - ivec3(1, 1, 1)));

        return probeCoords;
    }

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

    /**
    * Computes the probe index from 3D grid coordinates and probe counts.
    * The opposite of DDGIGetProbeCoords().
    */
    int DDGIGetProbeIndex(ivec3 probeCoords, ivec3 probeGridCounts)
    {
        return probeCoords.x + (probeGridCounts.x * probeCoords.z) + (probeGridCounts.x * probeGridCounts.z) * probeCoords.y;//计算得到当前probe在整个probe矩形中的索引
    }    

	/**
	* DDGIGetVolumeIrradiance
	* Samples irradiance from the given volume's probes using information
	* about the surface, sampling direction, and volume.
	*/
    vec3 DDGIGetVolumeIrradiance(
        vec3 worldPosition,
        vec3 surfaceBias,
        vec3 direction,
        DDGIVolumeDescGPU volume)
    {
        vec3 irradiance = vec3(0.f, 0.f, 0.f);
        float  accumulatedWeights = 0.f;

        // Bias the world space position
        vec3 biasedWorldPosition = (worldPosition + surfaceBias);

        //获得最近的基础Probe的3d网格坐标，世界坐标取整转换到网格坐标（也包含由[-2/n,2/n]转换到[0,n]坐标）
        // Get the 3D grid coordinates of the base probe (near the biased world position)
        ivec3 baseProbeCoords = DDGIGetBaseProbeGridCoords(biasedWorldPosition, volume.origin, volume.probeGridCounts, volume.probeGridSpacing);

        //得到基础probe的世界坐标（包含减去半轴还原到偏移之前的坐标）
        // Get the world space position of the base probe
        vec3 baseProbeWorldPosition = DDGIGetProbeWorldPosition(baseProbeCoords, volume.origin, volume.probeGridCounts, volume.probeGridSpacing);

        //将点和计算得到的相邻基础probe距离偏差进行归一化
        // Clamp the distance between the given point and the base probe's world position (on each axis) to [0, 1]
        vec3 alpha = clamp(((biasedWorldPosition - baseProbeWorldPosition) / volume.probeGridSpacing), vec3(0.f, 0.f, 0.f), vec3(1.f, 1.f, 1.f));

        //在周围八个Probe中循环，并累计他们的贡献 // Iterate over the 8 closest probes and accumulate their contributions
        for(int probeIndex = 0; probeIndex < 8; probeIndex++)
        {

            // Compute the offset to the adjacent probe in grid coordinates by
            // sourcing the offsets from the bits of the loop index: x = bit 0, y = bit 1, z = bit 2
            ivec3 adjacentProbeOffset = ivec3(probeIndex, probeIndex >> 1, probeIndex >> 2) & ivec3(1, 1, 1);

            // Get the 3D grid coordinates of the adjacent probe by adding the offset to the base probe
            // Clamp to the grid boundaries
            ivec3 adjacentProbeCoords = clamp(baseProbeCoords + adjacentProbeOffset, ivec3(0, 0, 0), volume.probeGridCounts - ivec3(1, 1, 1));

            //获得Probe的世界坐标位置（包含减去半轴还原到偏移之前的坐标）// Get the adjacent probe's world position
            vec3 adjacentProbeWorldPosition = DDGIGetProbeWorldPosition(adjacentProbeCoords, volume.origin, volume.probeGridCounts, volume.probeGridSpacing);

            //得到Probe的索引（用于贴图采样）// Get the adjacent probe's index (used for texture lookups)
            int adjacentProbeIndex = DDGIGetProbeIndex(adjacentProbeCoords, volume.probeGridCounts);

            //计算偏移后和未偏移的渲染点到相邻Probe的距离
            // Compute the distance and direction from the (biased and non-biased) shading point and the adjacent probe
            vec3 worldPosToAdjProbe = normalize(adjacentProbeWorldPosition - worldPosition);//当前点到probe的方向
            vec3 biasedPosToAdjProbe = normalize(adjacentProbeWorldPosition - biasedWorldPosition);//偏移点到probe的方向
            float  biasedPosToAdjProbeDist = length(adjacentProbeWorldPosition - biasedWorldPosition);//偏移点到probe的距离

            //基于到每个相邻探针的距离计算三线性权重，以便在探针之间平滑过渡。// Compute trilinear weights based on the distance to each adjacent probe to smoothly transition between probes.
            //当adjacentobeOffset=0时，我们使用1-alpha，而当adjacentrobeOffset=1时，使用alpha。// adjacentProbeOffset is binary, so we're using a 1-alpha when adjacentProbeOffset = 0 and alpha when adjacentProbeOffset = 1.
            vec3 trilinear = max(vec3(0.001f), lerp(vec3(1.f - alpha), alpha, vec3(adjacentProbeOffset)));
            float  trilinearWeight = (trilinear.x * trilinear.y * trilinear.z);
            
            //当探针在表面后时，一个自然的软背面权重会忽略它。// A naive soft backface weight would ignore a probe when it is behind the surface. 
            //这对墙壁来说很好，但对于房间内的小细节，细节上的法线可能会排除所有对该点具有相互可见性的探测器。// That's good for walls, but for small details inside of a room, the normals on the details might rule out all of the probes that have mutual visibility to the point. 
            //相反，我们使用“包裹着色”测试。// We instead use a "wrap shading" test. 
            //末端的小偏移减少了“归零”的影响。// The small offset at the end reduces the "going to zero" impact.
            float wrapShading = (dot(worldPosToAdjProbe, direction) + 1.f) * 0.5f;//将偏移前的点世界坐标到相邻probe的方向向量与当前点的向量点乘
            float weight = (wrapShading * wrapShading) + 0.2f;

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
            weight *= max(0.05f, chebyshevWeight);

            //避免权重为0
            // Avoid a weight of zero
            weight = max(0.000001f, weight);
            // A small amount of light is visible due to logarithmic perception, so
            // crush tiny weights but keep the curve continuous
            const float crushThreshold = 0.2f;
            if (weight < crushThreshold)
            {
                weight *= (weight * weight) * (1.f / (crushThreshold * crushThreshold));
            }

            //应用三线性权重// Apply the trilinear weights
            weight *= trilinearWeight;

            //采样probe irradiance // Sample the probe irradiance
            octantCoords = DDGIGetOctahedralCoordinates(direction);

            probeTextureCoords = DDGIGetProbeUV(adjacentProbeIndex, octantCoords, volume.probeGridCounts, volume.probeNumIrradianceTexels);

            //probeTextureCoords = probeTextureCoords * probeTextureCoords *probeTextureCoords*probeTextureCoords*probeTextureCoords;accuUV += probeTextureCoords;
            float tempx = probeTextureCoords.x;
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
        irradiance *= (2.0f * PI);            // Factored out of the probes

        return irradiance;
    }
`