const VolumetricRaymarchingF=/* glsl */`
#define PI 3.14

#define NUM_LIGHTS 3
#define NUM_LIGHT_COLORS 3

#define CHECKER_FLOOR_MATERIAL_ID 0
#define LIGHT_BASE_MATERIAL_ID 1
#define NUM_MATERIALS (LIGHT_BASE_MATERIAL_ID + NUM_LIGHTS)

#define PERFORMANCE_MODE 1

#define INVALID_MATERIAL_ID int(-1)
#define LARGE_NUMBER 1e20
#define EPSILON 0.0001
#define MAX_SDF_SPHERE_STEPS 15
#define ABSORPTION_COEFFICIENT 0.5
#define CAST_VOLUME_SHADOW_ON_OPAQUES 1

#if PERFORMANCE_MODE
#define MAX_VOLUME_MARCH_STEPS 20
#define MAX_VOLUME_LIGHT_MARCH_STEPS 4
#define ABSORPTION_CUTOFF 0.25
#define MARCH_MULTIPLIER 1.8
#define LIGHT_ATTENUATION_FACTOR 2.0
#define MAX_OPAQUE_SHADOW_MARCH_STEPS 10
#else
#define MAX_VOLUME_MARCH_STEPS 50
#define MAX_VOLUME_LIGHT_MARCH_STEPS 25
#define ABSORPTION_CUTOFF 0.01
#define MARCH_MULTIPLIER 1.0
#define LIGHT_ATTENUATION_FACTOR 1.65
#define MAX_OPAQUE_SHADOW_MARCH_STEPS 25
#endif

#define UNIFORM_FOG_DENSITY 0
#define UNIFORM_LIGHT_SPEED 1

struct CameraDescription
{
    vec3 Position;
    vec3 LookAt;    

    float LensHeight;
    float FocalDistance;
};
    
struct OrbLightDescription
{
    vec3 Position;
    float Radius;
    vec3 LightColor;
};
    
CameraDescription Camera = CameraDescription(
    vec3(0, 70, -165),
    vec3(0, 5, 0),
    2.0,
    7.0
);

vec3 GetLightColor(int lightIndex)
{
    switch(lightIndex % NUM_LIGHT_COLORS)
    {
        case 0: return vec3(1, 0.0, 1.0);
        case 1: return vec3(0, 1.0, 0.0);
    }
    return vec3(0, 0.0, 1.0);
}

OrbLightDescription GetLight(int lightIndex)
{
    const float lightMultiplier = 17.0f;
#if UNIFORM_LIGHT_SPEED
    float theta = iTime * 0.7 + float(lightIndex) * PI * 2.0 / float(NUM_LIGHT_COLORS);
    float radius = 18.5f;
#else
    float theta = iTime * 0.4 * (float(lightIndex) + 1.0f);
    float radius = 19.0f + float(lightIndex) * 2.0;
#endif
    
    OrbLightDescription orbLight;
    orbLight.Position = vec3(radius * cos(theta), 6.0 + sin(theta * 2.0) * 2.5, radius * sin(theta));
    orbLight.LightColor = GetLightColor(lightIndex) * lightMultiplier;
    orbLight.Radius = 0.8f;

    return orbLight;
}

float GetLightAttenuation(float distanceToLight)
{
    return 1.0 / pow(distanceToLight, LIGHT_ATTENUATION_FACTOR);
}
    
// --------------------------------------------//
//               Noise Functions
// --------------------------------------------//
// Taken from Inigo Quilez's Rainforest ShaderToy:
float hash1( float n )
{// https://www.shadertoy.com/view/4ttSWf
    return fract( n*17.0*fract( n*0.3183099 ) );
}
float noise( in vec3 x )
{// https://www.shadertoy.com/view/4ttSWf
    vec3 p = floor(x);
    vec3 w = fract(x);
    
    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    
    float n = p.x + 317.0*p.y + 157.0*p.z;
    
    float a = hash1(n+0.0);
    float b = hash1(n+1.0);
    float c = hash1(n+317.0);
    float d = hash1(n+318.0);
    float e = hash1(n+157.0);
    float f = hash1(n+158.0);
    float g = hash1(n+474.0);
    float h = hash1(n+475.0);

    float k0 =   a;
    float k1 =   b - a;
    float k2 =   c - a;
    float k3 =   e - a;
    float k4 =   a - b - c + d;
    float k5 =   a - c - e + g;
    float k6 =   a - b - e + f;
    float k7 = - a + b + c - d + e - f - g + h;

    return -1.0+2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z);
}
float fbm_4( in vec3 x )//分形布朗运动
{//不是噪声，但是可以让噪声有更多的细节。
    float f = 2.0;
    float s = 0.5;
    float a = 0.0;
    float b = 0.5;
    const mat3 m3  = mat3( 0.00,  0.80,  0.60,
        -0.80,  0.36, -0.48,
        -0.60, -0.48,  0.64 );
    for( int i=0; i<4; i++ )//for( int i=min(0, iFrame); i<4; i++ )
    {//把不同比例位置的一张噪声合并在一起
        float n = noise(x);
        a += b*n;
        b *= s;
        x = f*m3*x;
    }
    return a;
}

// Taken from https://iquilezles.org/articles/distfunctions
float sdPlane( vec3 p )
{
    return p.y;
}

// Taken from https://iquilezles.org/articles/distfunctions
vec2 opU( vec2 d1, vec2 d2 )
{
    return (d1.x<d2.x) ? d1 : d2;
}

// Taken from https://iquilezles.org/articles/distfunctions
float sdSmoothUnion( float d1, float d2, float k ) 
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); 
}

vec3 Translate(vec3 pos, vec3 translate)
{
    return pos -= translate;
}

// Taken from https://iquilezles.org/articles/distfunctions
float sdSphere( vec3 p, vec3 origin, float s )
{
  p = Translate(p, origin);
  return length(p)-s;
}

#define MATERIAL_IS_LIGHT_SOURCE 0x1
struct Material
{
    vec3 albedo;
    int flags;
};
    
Material NormalMaterial(vec3 albedo, int flags)
{
    return Material(albedo, flags);
}

bool IsLightSource(in Material m)
{
    return (m.flags & MATERIAL_IS_LIGHT_SOURCE) != 0;
}

Material GetMaterial(int materialID, vec3 position)
{
    Material materials[NUM_MATERIALS];
    materials[CHECKER_FLOOR_MATERIAL_ID] = NormalMaterial(vec3(0.6, 0.6, 0.7), 0);
    for(int lightIndex = 0; lightIndex < NUM_LIGHTS; lightIndex++)
    {
        materials[LIGHT_BASE_MATERIAL_ID + lightIndex] = NormalMaterial(GetLight(lightIndex).LightColor, MATERIAL_IS_LIGHT_SOURCE);
    }
    
    Material mat;
    if(materialID < int(NUM_MATERIALS))
    {
        mat = materials[materialID];
    }
    else
    {
        // Should never get hit
           return materials[0];
    }
    
    if(materialID == CHECKER_FLOOR_MATERIAL_ID)
    {
        vec2 uv = position.xz / 13.0;
        uv = vec2(uv.x < 0.0 ? abs(uv.x) + 1.0 : uv.x, uv.y < 0.0 ? abs(uv.y) + 1.0 : uv.y);
        if((int(uv.x) % 2 == 0 && int(uv.y) % 2 == 0) || (int(uv.x) % 2 == 1 && int(uv.y) % 2 == 1))
        {
            mat.albedo = vec3(1, 1, 1) * 0.7;
        }
    }

    return mat;    
}

// https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-plane-and-ray-disk-intersection
float PlaneIntersection(vec3 rayOrigin, vec3 rayDirection, vec3 planeOrigin, vec3 planeNormal, out vec3 normal) 
{ 
    float t = -1.0f;
    normal = planeNormal;
    float denom = dot(-planeNormal, rayDirection); 
    if (denom > EPSILON) { 
        vec3 rayToPlane = planeOrigin - rayOrigin; 
        return dot(rayToPlane, -planeNormal) / denom; 
    } 
 
    return t; 
} 
    
float SphereIntersection(
    in vec3 rayOrigin, 
    in vec3 rayDirection, 
    in vec3 sphereCenter, 
    in float sphereRadius, 
    out vec3 normal)
{
      vec3 eMinusC = rayOrigin - sphereCenter;
      float dDotD = dot(rayDirection, rayDirection);

      float discriminant = dot(rayDirection, (eMinusC)) * dot(rayDirection, (eMinusC))
         - dDotD * (dot(eMinusC, eMinusC) - sphereRadius * sphereRadius);

      if (discriminant < 0.0) 
         return -1.0;

      float firstIntersect = (dot(-rayDirection, eMinusC) - sqrt(discriminant))
             / dDotD;
      
      float t = firstIntersect;
    
      normal = normalize(rayOrigin + rayDirection * t - sphereCenter);
      return t;
}


void UpdateIfIntersected(
    inout float t,
    in float intersectionT, 
    in vec3 intersectionNormal,
    in int intersectionMaterialID,
    out vec3 normal,
    out int materialID
    )
{    
    if(intersectionT > EPSILON && intersectionT < t)
    {
        normal = intersectionNormal;
        materialID = intersectionMaterialID;
        t = intersectionT;
    }
}

float IntersectOpaqueScene(in vec3 rayOrigin, in vec3 rayDirection, out int materialID, out vec3 normal)
{
    float intersectionT = LARGE_NUMBER;
    vec3 intersectionNormal = vec3(0, 0, 0);

    float t = LARGE_NUMBER;
    normal = vec3(0, 0, 0);
    materialID = 0;//INVALID_MATERIAL_ID;
    //注释掉了光照的代码
    
    UpdateIfIntersected(//如果相交就更新？
        t,
        PlaneIntersection(rayOrigin, rayDirection, vec3(0, 0, 0), vec3(0, 1, 0), intersectionNormal),
        intersectionNormal,
        CHECKER_FLOOR_MATERIAL_ID,
        normal,
        materialID);

    
    return t;
}

float QueryVolumetricDistanceField( in vec3 pos)
{    
    // Fuse a bunch of spheres, slap on some fbm noise, 
    // merge it with ground plane to get some ground fog 
    // and viola! Big cloudy thingy!
    float s=2.;
    vec3 fbmCoord = (pos + 2.0 * vec3(iTime, 0.0, iTime)) / 1.5f;
    float sdfValue = sdSphere(pos, s*vec3(-8.0, 2.0 + 20.0 * sin(iTime), -1), s*5.6);
    sdfValue = sdSmoothUnion(sdfValue,sdSphere(pos, s*vec3(8.0, 8.0 + 12.0 * cos(iTime), 3), s*5.6), 3.0f);
    sdfValue = sdSmoothUnion(sdfValue,sdSphere(pos, s*vec3(5.0 * sin(iTime), 3.0, 0), s*8.0), 3.0) ;
    // sdfValue = sdSmoothUnion(sdfValue, sdPlane(pos + vec3(0, 0.4, 0)), 22.0);
    return sdfValue+ 7.0 * fbm_4(fbmCoord / 3.2);
}

float IntersectVolumetric(in vec3 rayOrigin, in vec3 rayDirection, float maxT)
{// 精度不是很重要，只需要在之前有一个不错的起点
    float precis = 0.5; 
    float t = 0.0f;//用来记录前进的距离
    for(int i=0; i<MAX_SDF_SPHERE_STEPS; i++ )
    {
        float result = QueryVolumetricDistanceField( rayOrigin+rayDirection*t);//查询SDF的值
        if( result < (precis) || t>maxT ) break;//到边缘比较近 或 前进的比较远
        t += result;//更新需要前进的距离
    }
    return ( t>=maxT ) ? -1.0 : t;//视点距离物体较近的时候谨慎一些
}

vec3 Diffuse(in vec3 normal, in vec3 lightVec, in vec3 diffuse)
{
    float nDotL = dot(normal, lightVec);
    return clamp(nDotL * diffuse, 0.0, 1.0);
}

vec3 GetAmbientLight()
{
    return 1.2 * vec3(0.03, 0.018, 0.018);
}

float GetFogDensity(vec3 position, float sdfDistance)
{//有简化
    return sdfDistance < 0.0 ? min(abs(sdfDistance), 1.) : 0.0;
}

float BeerLambert(float absorption, float dist)// 啤酒兰伯特定律描述了穿透光的衰减
{//absorption是一个浓度系数，dist是穿透距离
    return exp(-absorption * dist);
}

float GetLightVisiblity(in vec3 rayOrigin, in vec3 rayDirection, in float maxT, in int maxSteps, in float marchSize)
{
    float t = 0.0f;
    float lightVisibility = 1.0f;
    float signedDistance = 0.0;
    for(int i = 0; i < maxSteps; i++)
    {                       
        t += max(marchSize, signedDistance);
        if(t > maxT || lightVisibility < ABSORPTION_CUTOFF) break;

        vec3 position = rayOrigin + t*rayDirection;

        signedDistance = QueryVolumetricDistanceField(position);
        if(signedDistance < 0.0)
        {
            lightVisibility *= BeerLambert(ABSORPTION_COEFFICIENT * GetFogDensity(position, signedDistance), marchSize);
        }
    }
    return lightVisibility;
}


float Luminance(vec3 color)
{
    return (color.r * 0.3) + (color.g * 0.59) + (color.b * 0.11);
}

bool IsColorInsignificant(vec3 color)
{
    const float minValue = 0.009;
    return Luminance(color) < minValue;
}

void CalculateLighting(vec3 position, vec3 normal, vec3 reflectionDirection, Material material, inout vec3 color)
{
    for(int lightIndex = 0; lightIndex < NUM_LIGHTS; lightIndex++)
    {
        vec3 lightDirection = (GetLight(lightIndex).Position - position);
        float lightDistance = length(lightDirection);
        lightDirection /= lightDistance;

        vec3 lightColor = GetLight(lightIndex).LightColor * GetLightAttenuation(lightDistance); 

        float lightVisiblity = 1.0;
        #if CAST_VOLUME_SHADOW_ON_OPAQUES
        if(!IsColorInsignificant(lightColor))
        {
            const float shadowMarchSize = 0.65f * MARCH_MULTIPLIER;
            lightVisiblity = GetLightVisiblity(position, lightDirection, lightDistance, MAX_OPAQUE_SHADOW_MARCH_STEPS, shadowMarchSize); 
        }
        #endif
        
        color += lightVisiblity * lightColor * pow(max(dot(reflectionDirection, lightDirection), 0.0), 4.0);
        color += lightVisiblity * lightColor * Diffuse(normal, lightDirection, material.albedo);
    
    }
    color += GetAmbientLight() * material.albedo;
}

vec3 Render( in vec3 rayOrigin, in vec3 rayDirection)
{
    float depth = LARGE_NUMBER;
    vec3 opaqueColor = vec3(0.0f);
    
    vec3 normal;
    float t;
    int materialID = 0;//INVALID_MATERIAL_ID;
    t = IntersectOpaqueScene(rayOrigin, rayDirection, materialID, normal);//会更新materialID
    if( materialID != INVALID_MATERIAL_ID )
    {//在体积照明之后推迟照明计算，这样我们就可以避免对无论如何都不可见的不透明对象进行阴影跟踪
        depth = t;//跳过背景区域？
    }
    
    float volumeDepth = IntersectVolumetric(rayOrigin, rayDirection, depth);//尽可能跳过空白区域
    float opaqueVisiblity = 1.0f;//可见度的初始值，随着不断步进会不断降低
    vec3 volumetricColor = vec3(0.0f);//反射光的初始值，随着不断步进会不断增加
    if(volumeDepth > 0.0)
    {
        const float marchSize = 0.6f * MARCH_MULTIPLIER;//最小步进单位
        float distanceInVolume = 0.0f;//记录设置的穿透长度
        float signedDistance = 0.0;//记录步进点的符号距离
        for(int i = 0; i < MAX_VOLUME_MARCH_STEPS; i++)//光线步近的次数
        {
            volumeDepth += max(marchSize, signedDistance);//计算前进后的距离，marchSize是前进距离的最小步长
            if(volumeDepth > depth || opaqueVisiblity < ABSORPTION_CUTOFF) break;//超出最远距离 或 透明度过低
            
            vec3 position = rayOrigin + volumeDepth*rayDirection;//计算前进后的位置

            signedDistance = QueryVolumetricDistanceField(position);//查询SDF的值
            if(signedDistance < 0.0f)//如果在物体内
            {
                distanceInVolume += marchSize;//叠加穿透距离
                float previousOpaqueVisiblity = opaqueVisiblity;//记录透明度
                opaqueVisiblity *= BeerLambert(ABSORPTION_COEFFICIENT * GetFogDensity(position, signedDistance), marchSize);
                // 啤酒兰伯特定律描述了穿透光的衰减    烟雾边缘的浓度为SDF距离
                float absorptionFromMarch = previousOpaqueVisiblity - opaqueVisiblity;//透明度的变化情况
                //暂时注释掉了光照
                volumetricColor += absorptionFromMarch * vec3(0.8) * GetAmbientLight();//计算由于不透明反射回来的光
            }
        }
    }
    //注释掉了背景渲染
    
    return min(volumetricColor, 1.0f) + opaqueVisiblity * opaqueColor;
}

mat3 GetViewMatrix(float xRotationFactor)
{ 
   float xRotation = ((1.0 - xRotationFactor) - 0.5) * PI * 0.4 + PI * 0.25;
   return mat3( cos(xRotation), 0.0, sin(xRotation),
                0.0,           1.0, 0.0,    
                -sin(xRotation),0.0, cos(xRotation));
}

float GetCameraPositionYOffset()
{
    return 100.0 * (iMouse.y / iResolution.y);
}

float GetRotationFactor()
{
    return iMouse.x / iResolution.x;
}

vec3 GammaCorrect(vec3 color) 
{
    return pow(color, vec3(1.0/2.2));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    
    float aspectRatio = iResolution.x /  iResolution.y; 
    float lensWidth = Camera.LensHeight * aspectRatio;
    
    vec3 CameraPosition = Camera.Position + GetCameraPositionYOffset();
    
    vec3 NonNormalizedCameraView = Camera.LookAt - CameraPosition;
    float ViewLength = length(NonNormalizedCameraView);
    vec3 CameraView = NonNormalizedCameraView / ViewLength;

    vec3 lensPoint = CameraPosition;
    
    // Pivot the camera around the look at point
    {
        float rotationFactor = GetRotationFactor();
        mat3 viewMatrix = GetViewMatrix(rotationFactor);
        CameraView = CameraView * viewMatrix;
        lensPoint = Camera.LookAt - CameraView * ViewLength;
    }
    
    // Technically this could be calculated offline but I like 
    // being able to iterate quickly
    vec3 CameraRight = cross(CameraView, vec3(0, 1, 0));    
    vec3 CameraUp = cross(CameraRight, CameraView);

    vec3 focalPoint = lensPoint - Camera.FocalDistance * CameraView;
    lensPoint += CameraRight * (uv.x * 2.0 - 1.0) * lensWidth / 2.0;
    lensPoint += CameraUp * (uv.y * 2.0 - 1.0) * Camera.LensHeight / 2.0;
    
    vec3 rayOrigin = focalPoint;
    vec3 rayDirection = normalize(lensPoint - focalPoint);
    
    vec3 color = Render(rayOrigin, rayDirection);
    fragColor=vec4( GammaCorrect(clamp(color, 0.0, 1.0)), 1.0 );
}
`
export {VolumetricRaymarchingF}