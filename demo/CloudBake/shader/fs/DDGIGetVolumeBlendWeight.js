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
	* Computes a blending weight for the given volume for blending between multiple volumes.
	* Return value of 1.0 means full contribution from this volume while 0.0 means no contribution.
	*/
    float DDGIGetVolumeBlendWeight(vec3 worldPosition, DDGIVolumeDescGPU volume)
    {
        // Get the volume's origin and extent
        vec3 extent = (volume.probeGridSpacing * vec3(volume.probeGridCounts - ivec3(1,1,1))) * 0.5f;
        vec3 position = (worldPosition - volume.origin);
		position = abs(RTXGIQuaternionRotate(position, vec4(0.f, 0.f, 0.f, 1.0f)));

        vec3 delta = position - extent;
        if(delta.x < 0.f && delta.y < 0.f
		&& delta.z < 0.f)return 1.f;

        // Adjust the blend weight for each axis
        float volumeBlendWeight = 1.f;
        // Shift from [-n/2, n/2] to [0, n]
        //坐标系转换
        volumeBlendWeight *= (1.f - clamp(delta.x / volume.probeGridSpacing.x,0.f,1.f));
        volumeBlendWeight *= (1.f - clamp(delta.y / volume.probeGridSpacing.y,0.f,1.f));
        volumeBlendWeight *= (1.f - clamp(delta.z / volume.probeGridSpacing.z,0.f,1.f));

        return volumeBlendWeight;
    }

`