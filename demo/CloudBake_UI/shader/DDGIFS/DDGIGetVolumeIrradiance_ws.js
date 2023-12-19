export const DDGIGetVolumeIrradiance_ws =
/* glsl */`
    float DDGIGetVolumeIrradiance_ws(
        vec3 worldPosition,
        vec3 direction,
        DDGIVolumeDescGPU volume,
        ivec3 adjacentProbeCoords,
        vec3 adjacentProbeWorldPosition)
    {
        //{
            //计算偏移后和未偏移的渲染点到相邻Probe的距离
            // Compute the distance and direction from the (biased and non-biased) shading point and the adjacent probe
            vec3 worldPosToAdjProbe = normalize(adjacentProbeWorldPosition - worldPosition);//当前点到probe的方向
            
            float wrapShading = (dot(worldPosToAdjProbe, direction) + 1.f) * 0.5f;//将偏移前的点世界坐标到相邻probe的方向向量与当前点的向量点乘
            float weight = (wrapShading * wrapShading) + 0.2f;
            return weight;
        //}
    }
`