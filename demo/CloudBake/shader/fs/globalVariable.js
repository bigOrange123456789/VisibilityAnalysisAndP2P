export const globalVariable =/* glsl */`
//precision highp float;

      //#extension GL_EXT_shader_texture_lod : enable
      //#extension GL_OES_standard_derivatives : enable

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
      uniform sampler2D GBufferd;
      uniform sampler2D probeIrradiance;

      uniform float screenWidth;
      uniform float screenHeight;

      
      uniform vec3 emissiveColor;

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


`