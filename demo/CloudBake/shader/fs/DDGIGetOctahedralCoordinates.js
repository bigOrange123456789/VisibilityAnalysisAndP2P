export const DDGIGetOctahedralCoordinates =/* glsl */`
    /**
    * Returns either -1 or 1 based on the sign of the input value.
    * If the input is zero, 1 is returned.
    */
    float RTXGISignNotZero(float v)
    {
        return (v >= 0.f) ? 1.f : -1.f;
    }
    vec2 RTXGISignNotZero(vec2 v)//2-component version of RTXGISignNotZero.
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
`