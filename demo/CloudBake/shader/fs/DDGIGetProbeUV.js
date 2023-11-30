export const DDGIGetProbeUV =/* glsl */`
    int DDGIGetProbesPerPlane(ivec3 probeGridCounts)
    {//以Y轴为竖直方向，计算每个水平面上的探针数量
        return (probeGridCounts.x * probeGridCounts.z);
    }
	/** DDGIGetProbeUV
	* 将每一个水平的探针数据图从左到右逐个进行拼接
	*/
    vec2 DDGIGetProbeUV(int probeIndex, vec2 octantCoordinates, ivec3 probeGridCounts, int numTexels)
    {//(探针索引，八面体纹理坐标,探针数量probeGridCounts, 像素数probeNumIrradianceTexels)
        int probesPerPlane = DDGIGetProbesPerPlane(probeGridCounts);//得到水平面上的探针数量
        int planeIndex = int(probeIndex / probesPerPlane);//得到探针的水平平面索引

        float probeInteriorTexels = float(numTexels);
        float probeTexels = (probeInteriorTexels + 2.f);//每个probe占据的在distance图片上的texels数量

        //（p.x是每页的列数，p.y才是页数,p.z是每页的行数）
        //计算网格坐标
        int gridSpaceX = (probeIndex % probeGridCounts.x);//得到probe在平面空间中的x坐标--不分页列号
        int gridSpaceY = (probeIndex / probeGridCounts.x);//得到probe在平面空间中的y坐标--不分页行号
        // gx不分页列号 gy不分页行号 planeIndex:页号

        //计算空间位置
        int x = gridSpaceX + (planeIndex * probeGridCounts.x);//=不分页列号+页号*每页列数
        int y = gridSpaceY % probeGridCounts.z;//=不分页行数%每页行数   ：行号过多会分页（p.z是每页的行数，p.y才是页数）

        //计算纹理大小（纹理的每一块对应一个八面体指针，每一排纹理块对应一个竖直探针平面）
        float textureWidth = probeTexels * float(probeGridCounts.x * probeGridCounts.y);//得到整个平面的纹理占据的宽
        float textureHeight = probeTexels * float(probeGridCounts.z);//得到整个纹理的高度

        vec2 uv = vec2(float(x) * probeTexels, float(y) * probeTexels) + (probeTexels * 0.5f);//根据x，y坐标计算出uv
        uv += octantCoordinates.xy * (probeInteriorTexels * 0.5f);//根据八面体空间进行偏移
        uv /= vec2(textureWidth, textureHeight);//归一化处理
        return uv;
    }

`