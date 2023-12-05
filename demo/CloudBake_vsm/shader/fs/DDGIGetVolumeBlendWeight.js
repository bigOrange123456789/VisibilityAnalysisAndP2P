export const DDGIGetVolumeBlendWeight =/* glsl */`	
	/**
	* RTXGIQuaternionRotate
	*/
	vec3 RTXGIQuaternionRotate(vec3 v, vec4 q)
	{
		vec3 b = q.xyz;
		float b2 = dot(b, b);
		return (v * (q.w * q.w - b2) + b * (dot(v, b) * 2.f) + cross(b, v) * (q.w * 2.f));
	}

    /**
	* DDGIGetVolumeBlendWeight
	* 计算给定体素的混合权重，以便在多个体积之间进行混合。//Computes a blending weight for the given volume for blending between multiple volumes.
	* 返回值1.0表示该体素的全部贡献，而0.0表示没有贡献。//Return value of 1.0 means full contribution from this volume while 0.0 means no contribution.
	*/
    float DDGIGetVolumeBlendWeight(vec3 worldPosition, DDGIVolumeDescGPU volume)
    {
        // Get the volume's origin and extent
        vec3 extent = (volume.probeGridSpacing * vec3(volume.probeGridCounts - ivec3(1))) * 0.5f;
        vec3 position = (worldPosition - volume.origin);
		position = abs(RTXGIQuaternionRotate(position, vec4(0.f, 0.f, 0.f, 1.0f)));

        vec3 delta = position - extent;
        if(delta.x < 0.f && delta.y < 0.f && delta.z < 0.f)return 1.f;

        // Adjust the blend weight for each axis
        float volumeBlendWeight = 1.f;
        // Shift from [-n/2, n/2] to [0, n]
        volumeBlendWeight *= (1.f - clamp(delta.x / volume.probeGridSpacing.x,0.f,1.f));
        volumeBlendWeight *= (1.f - clamp(delta.y / volume.probeGridSpacing.y,0.f,1.f));
        volumeBlendWeight *= (1.f - clamp(delta.z / volume.probeGridSpacing.z,0.f,1.f));

        return volumeBlendWeight;
    }

`