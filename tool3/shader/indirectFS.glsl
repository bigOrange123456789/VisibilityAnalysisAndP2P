      #define PI 3.1415926535897932f

      #define RTXGI_COORDINATE_SYSTEM_LEFT 0
      #define RTXGI_COORDINATE_SYSTEM_LEFT_Z_UP 1
      #define RTXGI_COORDINATE_SYSTEM_RIGHT 2
      #define RTXGI_COORDINATE_SYSTEM_RIGHT_Z_UP 3

      //#ifndef RTXGI_COORDINATE_SYSTEM
      #define RTXGI_COORDINATE_SYSTEM RTXGI_COORDINATE_SYSTEM_LEFT//RTXGI_COORDINATE_SYSTEM_RIGHT
      //#endif

      //#ifndef RTXGI_DDGI_COMPUTE_IRRADIANCE
      #define RTXGI_DDGI_COMPUTE_IRRADIANCE 1
      //#endif

      // --- Indirect Lighting -----------------------------

      #ifndef RTXGI_DDGI_COMPUTE_IRRADIANCE
      #define RTXGI_DDGI_COMPUTE_IRRADIANCE 1
      #endif

      varying vec4 vPosition;
      varying vec3 vNormal;
      varying vec2 vuv;
      //uniform mat4 worldView;
      uniform sampler2D probeIrradiance;

      uniform sampler2D colorMap;
      uniform sampler2D emissiveMap;
      uniform bool useMap;
	  uniform vec3 originColor;

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
      uniform DDGIVolumeDescGPU DDGIVolume;


    vec3 DDGIGetSurfaceBias(vec3 surfaceNormal, vec3 cameraDirection, DDGIVolumeDescGPU DDGIVolume)
    {
        return (surfaceNormal * DDGIVolume.normalBias) + (-cameraDirection * DDGIVolume.viewBias);
    }

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
	 * lerp
	*/
	vec3 lerp(vec3 a, vec3 b, vec3 c)
	{
		float lerpx = a.x + (b.x - a.x) * c.x;
		float lerpy = a.y + (b.y - a.y) * c.y;
		float lerpz = a.z + (b.z - a.z) * c.z;
		return vec3(lerpx, lerpy, lerpz);
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
    * Gets the number of probes on a horizontal plane in the active coordinate system.
    *得到水平面上的probe数量
    */
    int DDGIGetProbesPerPlane(ivec3 probeGridCounts)
    {
        return (probeGridCounts.x * probeGridCounts.z);//这是针对y是竖轴的情况，所以x乘与z为总数量
    }

	/**
	* DDGIGetProbeUV
	* Computes the normalized texture coordinates of the given probe,
	* using the probe index, octant coordinates, probe grid counts,
	* and the number of texels used by a probe.
	*/
    vec2 DDGIGetProbeUV(int probeIndex, vec2 octantCoordinates, ivec3 probeGridCounts, int numTexels)
    {

        int probesPerPlane = DDGIGetProbesPerPlane(probeGridCounts);//得到水平面上probe数量
        int planeIndex = int(probeIndex / probesPerPlane);//得到probe处于的plane的索引

        float probeInteriorTexels = float(numTexels);
        float probeTexels = (probeInteriorTexels + 2.f);//每个probe占据的在distance图片上的texels数量

        //降x维？
        int gridSpaceX = (probeIndex % probeGridCounts.x);//得到probe在平面空间中的x坐标
        int gridSpaceY = (probeIndex / probeGridCounts.x);//得到probe在平面空间中的y坐标

        int x = gridSpaceX + (planeIndex * probeGridCounts.x);//得到在整个空间中的x坐标
        int y = gridSpaceY % probeGridCounts.z;//得到在整个空间中的y坐标

        float textureWidth = probeTexels * float(probeGridCounts.x * probeGridCounts.y);//得到整个平面的纹理占据的宽
        float textureHeight = probeTexels * float(probeGridCounts.z);//得到整个纹理的高度


        vec2 uv = vec2(float(x) * probeTexels, float(y) * probeTexels) + (probeTexels * 0.5f);//根据x，y坐标计算出uv
        uv += octantCoordinates.xy * (probeInteriorTexels * 0.5f);//根据八面体空间进行偏移
        uv /= vec2(textureWidth, textureHeight);//归一化处理
        return uv;
    }

    /**
    * Returns either -1 or 1 based on the sign of the input value.
    * If the input is zero, 1 is returned.
    */
    float RTXGISignNotZero(float v)
    {
        return (v >= 0.f) ? 1.f : -1.f;
    }

    /**
    * 2-component version of RTXGISignNotZero.
    */
    vec2 RTXGISignNotZero(vec2 v)
    {
        return vec2(RTXGISignNotZero(v.x), RTXGISignNotZero(v.y));
    }

	/**
	* DDGIGetOctahedralCoordinates
	*/
    vec2 DDGIGetOctahedralCoordinates(vec3 direction)
    {
      float l1norm = abs(direction.x) + abs(direction.y) + abs(direction.z);//取绝对值
        vec2 uv = direction.xy * (1.f / l1norm);//得到当前x和y方向上的正负方向
        if (direction.z < 0.f)
        {
            uv = (1.f - abs(uv.yx)) * RTXGISignNotZero(uv.xy);
        }
        return uv;
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
        DDGIVolumeDescGPU volume
    ){
        vec3 irradiance = vec3(0.f, 0.f, 0.f);//初始irradiance为0
        float  accumulatedWeights = 0.f;//初始累计权重为0

        vec3 biasedWorldPosition = (worldPosition + surfaceBias);//偏移世界坐标

        //获得最近的基础Probe的3d网格坐标，世界坐标取整转换到网格坐标（也包含由[-2/n,2/n]转换到[0,n]坐标） // Get the 3D grid coordinates of the base probe (near the biased world position)
        ivec3 baseProbeCoords = DDGIGetBaseProbeGridCoords(biasedWorldPosition, volume.origin, volume.probeGridCounts, volume.probeGridSpacing);

        //得到基础probe的世界坐标（包含减去半轴还原到偏移之前的坐标） // Get the world space position of the base probe
        vec3 baseProbeWorldPosition = DDGIGetProbeWorldPosition(baseProbeCoords, volume.origin, volume.probeGridCounts, volume.probeGridSpacing);

        //将点和计算得到的相邻基础probe距离偏差进行归一化  // Clamp the distance between the given point and the base probe's world position (on each axis) to [0, 1]
        vec3 alpha = clamp(((biasedWorldPosition - baseProbeWorldPosition) / volume.probeGridSpacing), vec3(0.f, 0.f, 0.f), vec3(1.f, 1.f, 1.f));

        //在周围八个Probe中循环，并累计他们的贡献 // Iterate over the 8 closest probes and accumulate their contributions
        for(int probeIndex = 0; probeIndex < 8; probeIndex++)
        {
            //得到相邻的Probe的offset
            // Compute the offset to the adjacent probe in grid coordinates by
            // sourcing the offsets from the bits of the loop index: x = bit 0, y = bit 1, z = bit 2
            ivec3 adjacentProbeOffset = ivec3(probeIndex, probeIndex >> 1, probeIndex >> 2) & ivec3(1, 1, 1);

            //将计算得到的基础probe附近的probe转换范围到[0,n],结果是3d网格坐标
            // Get the 3D grid coordinates of the adjacent probe by adding the offset to the base probe
            // Clamp to the grid boundaries
            ivec3 adjacentProbeCoords = clamp(baseProbeCoords + adjacentProbeOffset, ivec3(0, 0, 0), volume.probeGridCounts - ivec3(1, 1, 1));

            //获得相邻Probe的世界坐标位置（包含减去半轴还原到偏移之前的坐标）// Get the adjacent probe's world position
            vec3 adjacentProbeWorldPosition = DDGIGetProbeWorldPosition(adjacentProbeCoords, volume.origin, volume.probeGridCounts, volume.probeGridSpacing);

            //得到相邻的Probe的索引（用于贴图采样）    // Get the adjacent probe's index (used for texture lookups)
            int adjacentProbeIndex = DDGIGetProbeIndex(adjacentProbeCoords, volume.probeGridCounts);

            //计算偏移后和未偏移的渲染点到相邻Probe的距离
            // Compute the distance and direction from the (biased and non-biased) shading point and the adjacent probe
            vec3 worldPosToAdjProbe = normalize(adjacentProbeWorldPosition - worldPosition);//当前点到附近probe的向量
            vec3 biasedPosToAdjProbe = normalize(adjacentProbeWorldPosition - biasedWorldPosition);//偏移后的当前点到probe的向量
            
            //计算基于到每个相邻probe的距离用于平滑在probe间平滑转换，根据偏移后世界坐标和计算得到的基础probe的偏差计算三线性平滑系数
            // Compute trilinear weights based on the distance to each adjacent probe
            // to smoothly transition between probes. adjacentProbeOffset is binary, so we're
            // using a 1-alpha when adjacentProbeOffset = 0 and alpha when adjacentProbeOffset = 1.
            vec3 trilinear = max(vec3(0.001f,0.001f,0.001f), lerp(vec3(1.f,1.f,1.f) - alpha, alpha, vec3(adjacentProbeOffset)));
            float  trilinearWeight = (trilinear.x * trilinear.y * trilinear.z);

            // A naive soft backface weight would ignore a probe when
            // it is behind the surface. That's good for walls, but for
            // small details inside of a room, the normals on the details
            // might rule out all of the probes that have mutual visibility
            // to the point. We instead use a "wrap shading" test. The small
            // offset at the end reduces the "going to zero" impact.
            float wrapShading = (dot(worldPosToAdjProbe, direction) + 1.f) * 0.5f;//将偏移前的点世界坐标到相邻probe的方向向量与当前点的向量点乘
            float  weight = (wrapShading * wrapShading) + 0.2f;

            //计算相邻probe的纹理坐标，以及用纹理坐标采样出滤波后距离  // Compute the texture coordinates of this adjacent probe and sample the probe's filtered distance
            vec2 octantCoords = DDGIGetOctahedralCoordinates(-biasedPosToAdjProbe);

            vec2 probeTextureCoords = DDGIGetProbeUV(adjacentProbeIndex, octantCoords, volume.probeGridCounts, volume.probeNumDistanceTexels);
            probeTextureCoords.y = 1.0f- probeTextureCoords.y;

            //应用三线性权重
            weight *= trilinearWeight;

            //采样probe irradiance
            // Sample the probe irradiance
            octantCoords = DDGIGetOctahedralCoordinates(direction);

            probeTextureCoords = DDGIGetProbeUV(adjacentProbeIndex, octantCoords, volume.probeGridCounts, volume.probeNumIrradianceTexels);

            probeTextureCoords.y = 1.0f- probeTextureCoords.y;
            // vec3 probeIrradiance = texture2DLodEXT(probeIrradiance,probeTextureCoords, 0.f).rgb;
            vec3 probeIrradiance = texture2D(probeIrradiance,probeTextureCoords).rgb;
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

	vec4 GetBaseColor()
    {
        vec4 baseColor = vec4(0,0,0,0);
        baseColor.rgb = originColor;
        if(useMap)
        {
            baseColor = texture2DLodEXT(colorMap,vuv, 0.f);
            // baseColor = texture2D(colorMap,vuv*10000.);
        }        
        vec3 emissive = vec3(0,0,0);
        if(false)//if(useEmissiveMap)
        {
             emissive = texture2DLodEXT(emissiveMap,vuv, 0.f).rgb;
        }
        baseColor.rgb += emissive;
        return baseColor;
    }

	void main(void)
    {
		vec4 worldPos = vPosition;//需要渲染的那个点的位置
		vec3 normal = vNormal;//那个点的法向量
		vec3 cameraDirection = normalize(worldPos.xyz - cameraPosition);//视线方向
		vec3 surfaceBias = DDGIGetSurfaceBias(
            normal, 
            cameraDirection, 
            DDGIVolume
            );

		vec3 irradiance = DDGIGetVolumeIrradiance(worldPos.xyz,surfaceBias,normal,DDGIVolume);
		vec3 irradianceColor = (1. * irradiance+0.) * GetBaseColor().rgb ;
        // vec3 irradianceColor = irradiance * GetBaseColor().rgb ;

        // vec3 test=texture2DLodEXT(probeIrradiance,vec2(0.,0.),0.).rgb;
			
		gl_FragColor = vec4(irradianceColor,1.);
        // if (vuv.x+vuv.y==0.)
        //     gl_FragColor = vec4(1.,0.,0.,1.);
    }
