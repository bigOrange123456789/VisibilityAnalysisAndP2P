export const DDGIGetProbeUV =/* glsl */`
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

`