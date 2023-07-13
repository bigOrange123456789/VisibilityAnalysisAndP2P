export class Shader{
    constructor(){
        this.fragmentShader=
            this.shader_prefix()+
            this.DtyXDR()+
            this.shader_suffix()

    }
    shader_prefix(){
        return /* glsl */`
        varying vec2 vUv;
        uniform float iTime;
        uniform sampler2D iChannel0;
        vec3 iResolution=vec3(1.);`
    }
    shader_suffix(){
        return /* glsl */`
        void main() {
            mainImage( gl_FragColor, vUv );
        }`
    }
    new(){
        return /* glsl */`
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
            // Normalized pixel coordinates (from 0 to 1)
            vec2 uv = fragCoord/iResolution.xy;

            // Time varying pixel color
            vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

            // Output to screen
            fragColor = vec4(col,1.0);
        }`
    }
    MdsXDM(){
        return /* glsl */`
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
            vec2 uv = fragCoord.xy / iResolution.xy;
            vec2 pos = (uv.xy-0.5);
            vec2 cir = ((pos.xy*pos.xy+sin(uv.x*18.0+iTime)/25.0*sin(uv.y*7.0+iTime*1.5)/1.0)+uv.x*sin(iTime)/16.0+uv.y*sin(iTime*1.2)/16.0);
            float circles = (sqrt(abs(cir.x+cir.y*0.5)*25.0)*5.0);
            fragColor = vec4(sin(circles*1.25+2.0),abs(sin(circles*1.0-1.0)-sin(circles)),abs(sin(circles)*1.0),1.0);
        }
        `
    }
    DtyXDR(){
        return /* glsl */`
//CC0 1.0 Universal https://creativecommons.org/publicdomain/zero/1.0/
//To the extent possible under law, Blackle Mori has waived all copyright and related or neighboring rights to this work.

vec3 erot(vec3 p, vec3 ax, float ro) {
    return mix(ax*dot(p,ax),p,cos(ro)) + cross(ax,p)*sin(ro);
  }
  
  float fact(vec3 p, float s) {
    return dot(asin(sin(p)*s),vec3(1))/sqrt(3.);
  }
  
  int id = 0;
  float scene(vec3 p) {
    float a1 = fact(erot(p,vec3(1,0,0),2.),.9);
    float a2 = fact(erot(p,vec3(0,1,0),1.5),.9);
    float a3 = fact(erot(p,vec3(0,0,1),2.),.9);
    float a4 = fact(erot(p,normalize(vec3(0,1,1)),.59),.999);
    float s1 = (a1+a2+a3)/2. - 1. + length(p.yz)*.1;
    s1 = min(s1,length(p.yz)-1.);
    float s2 = a4-1.5;
    if (s1 < s2) id = 0;
    else id = 1;
    return id == 0 ? s2 : s1;
  }
  
  vec3 norm(vec3 p) {
    mat3 k = mat3(p,p,p) - mat3(0.01);
    return normalize(scene(p) - vec3(scene(k[0]),scene(k[1]),scene(k[2])));
  }
  
  vec3 randomdir(int stage) {
    vec3 dotdir = vec3(1);
    if (stage%5==0) dotdir.x *= -1.;
    if (stage%5==1) dotdir.y *= -1.;
    if (stage%5==2) dotdir.z *= -1.;
    if (stage%5==3) dotdir.x *= 0.;
    if (stage%6==0) dotdir.xyz = dotdir.yzx;
    
    return dotdir;
  }
  
  void mainImage( out vec4 fragColor, in vec2 fragCoord )
  {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    
    float t = iTime;
    t += length(uv)*2.5*pow(sin(t*.4)*.5+.5,8.);
    
    int stage0 = int(t+.5);
    float swipedir = ((stage0/2)%2==0?-1.:1.)*(stage0%2==0?uv.x:uv.y);
    
    int stage = int(t+swipedir*.25);
    float sdiff = t - float(stage);
    int stage2 = int(t*3.5);
  
    vec3 cam = normalize(vec3(.6+sin(float(stage)*3.1415 + 1.5*smoothstep(-.5,.5,cos(sdiff*3.)))*.3,uv));
    vec3 init = vec3(cos(t*.3)/.3*.5,0,0);
    
    float rdir = (stage%3==0?-1.:1.);
    if (stage%5 >1)rdir*=0.;
    float zrot = t*.2*rdir + float(stage);
    float yrot = sin(t*.0555*rdir)*.3;
    float xrot = smoothstep(-.65,.65,cos(sdiff*3.))*rdir;
    cam = erot(cam,vec3(1,0,0),xrot);
    cam = erot(cam,vec3(0,1,0),yrot);
    cam = erot(cam,vec3(0,0,1),zrot);
    
    vec3 p = init;
    bool hit = false;
    for ( int i = 0; i < 150 && !hit; i++) {
      if (distance(p,init) > 400.) break;
      float d = scene(p);
      if (d*d < 0.00001) hit = true;
      p += cam*d;
    }
    int lid = id;
    float fog = smoothstep(0., (stage%7-stage%5<0)?20.:100., distance(p,init));
    vec3 n = norm(p);
    vec3 r = reflect(cam,n);
    float ao = 1.0;
    ao *= smoothstep(-0.5,.5,scene(p+n*.5));
    ao *= smoothstep(-1.,1.,scene(p+n*1.));
    ao *= smoothstep(-2.,2.,scene(p+n*2.));
    float fres = 1.-abs(dot(cam,n))*.98;
    float rfact = length(sin(r*3.5)*.5+.5)/sqrt(3.);
    float dfact = length(sin(n*2.5)*.4+.6)/sqrt(3.);
    rfact = rfact*.2 + pow(rfact,8.)*6.;
    
    
    float stripes = asin(sin(dot(randomdir(stage),p)*3.+float(t)));
    if (stage%4==0) stripes *= asin(sin(dot(randomdir(stage+7),p)*3.+float(t)));
    vec3 dcolor = vec3(0.85,0.4,0.05);
    if (stage%3==0) dcolor = vec3(0.85,0.1,0.05);
    if (stage%3==1) dcolor = vec3(0.85,0.8,0.05);
    if (0 == lid) dcolor = dcolor.zxy;
    else dcolor*=smoothstep(-0.05,0.05,stripes);
    
    
    vec3 col = (vec3(rfact*fres) + dcolor*dfact)*ao;
    
    if (!hit) fog = 1.0;
    fragColor.xyz = mix(col, vec3(1.1), fog);
    fragColor.xyz *= 1. - dot(uv,uv)*.8;
    fragColor.xyz = smoothstep(0.,1.,sqrt(fragColor.xyz));
    if (stage%4 == 1) fragColor.xyz = 1.-fragColor.xyz;
    if (stage%4 == 3) fragColor.xyz = 1.-fragColor.xxx;
    //fragColor.xyz = 1.-fragColor.xyz;
  }
`
    }
    _4dXSzn_1(){return /* glsl */`
// Created by anatole duprat - XT95/2014
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.


//Maths
const float PI = 3.14159265;

mat3 rotate( in vec3 v, in float angle)
{
	float c = cos(radians(angle));
	float s = sin(radians(angle));
	
	return mat3(c + (1.0 - c) * v.x * v.x, (1.0 - c) * v.x * v.y - s * v.z, (1.0 - c) * v.x * v.z + s * v.y,
		(1.0 - c) * v.x * v.y + s * v.z, c + (1.0 - c) * v.y * v.y, (1.0 - c) * v.y * v.z - s * v.x,
		(1.0 - c) * v.x * v.z - s * v.y, (1.0 - c) * v.y * v.z + s * v.x, c + (1.0 - c) * v.z * v.z
		);
}

mat3 lookat( in vec3 fw, in vec3 up )
{
	fw = normalize(fw);
	vec3 rt = normalize( cross(fw, normalize(up)) );
	return mat3( rt, cross(rt, fw), fw );
}


//Raymarching 
float map( in vec3 p );

float box( in vec3 p, in vec3 data )
{
    return max(max(abs(p.x)-data.x,abs(p.y)-data.y),abs(p.z)-data.z);
}

float sphere( in vec3 p, in float size)
{
	return length(p)-size;
}

vec4 raymarche( in vec3 org, in vec3 dir, in vec2 nfplane )
{
	float d = 1.0, g = 0.0, t = 0.0;
	vec3 p = org+dir*nfplane.x;
	
	for(int i=0; i<42; i++)
	{
		if( d > 0.001 && t < nfplane.y )
		{
			d = map(p);
			t += d;
			p += d * dir;
			g += 1./42.;
		}
	}
	
	return vec4(p,g);
}

vec3 normal( in vec3 p )
{
	vec3 eps = vec3(0.01, 0.0, 0.0);
	return normalize( vec3(
		map(p+eps.xyy)-map(p-eps.xyy),
		map(p+eps.yxy)-map(p-eps.yxy),
		map(p+eps.yyx)-map(p-eps.yyx)
	) );
}

float ambiantOcclusion( in vec3 p, in vec3 n, in float d )
{
    float dlt = 0.0;
    float oc = 0.0;
    
    for(int i=1; i<=6; i++)
    {
		dlt = d*float(i)/6.;
		oc += (dlt - map(p+n*dlt))/exp(dlt);
    }
    oc /= 6.;
    
    return clamp(pow(1.-oc,d), 0.0, 1.0);
}




//Geometry
float ill = 0.;
#define impulsTime (iTime+sin(iTime+PI))
float map( in vec3 p )
{
	float d = p.y;
	vec3 pp = p;
	ill = 0.;
	
	//mirrors
	p = abs(p);
	p = rotate(vec3(-1.,0.,0.),40.)*p;
	p = abs(p);
	p = rotate(vec3(0.,1.,0.),45.)*p;
	p = abs(p);
	
	//make a branch of cubes
	for(int i=0; i<15; i++)
	{
		p -= vec3(.25);
		p = rotate( normalize( vec3(.5, .25, 1.0 ) ), 20.+pp.x+pp.y+pp.z )*p;
		
		
		float size = cos(float(i)/20.*PI*2.-impulsTime);
		float dbox = box( p, vec3( (1.1-float(i)/20.)*.25 + pow(size*.4+.4,10.) ) );
	
		if( dbox < d)
		{
			d = dbox;
			ill = pow(size*.5+.5, 10.);
		}
	
	}
	//add another one iteration with a sphere
	p -= vec3(.25);
	p = rotate( normalize( vec3(.5, .25, 1.0 ) ), 20.+pp.x+pp.y+pp.z )*p;
	d = min(d, sphere(p,.25) );
	
	return d;
}

//Shading
vec3 ldir = normalize( vec3(.267,.358,.90) );
vec3 sky( in vec3 dir )
{
	vec3 col = mix( vec3(40., 34., 30.), vec3(18., 28., 44.), min( abs(dir.y)*2.+.5, 1. ) )/255.*.5;
	col *= (1. + vec3(1.,.7,.3)/sqrt(length(dir-ldir))*4.); //sun
	
	return col;
}
vec3 shade( in vec4 p, in vec3 n, in vec3 org, in vec3 dir )
{		
	//direct lighting
	vec3 col = vec3(.1);
	col += pow(sky(vec3(1.,0.,0.))*max( dot(n, ldir), 0.)*2., vec3(2.));
	
	//illumination of the tree
	col += mix( vec3(1.,.3,.1), vec3(.1, .7, .1), length(p.xyz)/8.)*ill*p.w*5.;
	
	//ao
	col *= pow( ambiantOcclusion(p.xyz,n,1.) , 1.5 );
	
	//fog/sky
	col = mix(col, sky(dir), vec3(1.)*min( pow( distance(p.xyz,org)/20., 2. ), 1. ) );
	
	return col;
}

vec2 hash2( in float n )
{
    return fract(sin(vec2(n,n+1.0))*vec2(43758.5453123,22578.1459123));
}
//Main
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	//screen coords

    vec2 o = 0.*hash2( float(iTime) ) ;//- 0.5;//hash2( float(iFrame) ) - 0.5;
    vec2 v = (-iResolution.xy + 2.0*(fragCoord+o))/ iResolution.y;
	vec2 q = fragCoord.xy/iResolution.xy;
	
	//camera ray
	float ctime = (iTime+140.)*.025;
	vec3 org = vec3( cos(ctime)*10., 2.+cos(ctime), sin(ctime)*10. );
	vec3 dir = normalize( vec3(v.x, v.y, 1.5) );
	dir = lookat( -org + vec3(0., 2., 0.), vec3(0., 1., 0.) ) * dir;
	
	//classic raymarching by distance field
	vec4 p = raymarche(org, dir, vec2(4., 20.) );
	vec3 n = normal(p.xyz);
	vec3 col = shade(p, n, org, dir);
	
    fragColor = vec4(col, 1.);//mix(vec4(col, 1.), texture(iChannel0,q), .8);
}
    `}
    _4ttSWf_1(){
        return /* glsl */`
int iFrame=0;
#define LOWQUALITY

//==========================================================================================
// general utilities
//==========================================================================================
#define ZERO (min(iFrame,0))

float sdEllipsoidY( in vec3 p, in vec2 r )
{
    float k0 = length(p/r.xyx);
    float k1 = length(p/(r.xyx*r.xyx));
    return k0*(k0-1.0)/k1;
}
float sdEllipsoid( in vec3 p, in vec3 r )
{
    float k0 = length(p/r);
    float k1 = length(p/(r*r));
    return k0*(k0-1.0)/k1;
}

// return smoothstep and its derivative
vec2 smoothstepd( float a, float b, float x)
{
	if( x<a ) return vec2( 0.0, 0.0 );
	if( x>b ) return vec2( 1.0, 0.0 );
    float ir = 1.0/(b-a);
    x = (x-a)*ir;
    return vec2( x*x*(3.0-2.0*x), 6.0*x*(1.0-x)*ir );
}

mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
{
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(sin(cr), cos(cr),0.0);
	vec3 cu = normalize( cross(cw,cp) );
	vec3 cv = normalize( cross(cu,cw) );
    return mat3( cu, cv, cw );
}

//==========================================================================================
// hashes (low quality, do NOT use in production)
//==========================================================================================

float hash1( vec2 p )
{
    p  = 50.0*fract( p*0.3183099 );
    return fract( p.x*p.y*(p.x+p.y) );
}

float hash1( float n )
{
    return fract( n*17.0*fract( n*0.3183099 ) );
}

vec2 hash2( vec2 p ) 
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    float n = 111.0*p.x + 113.0*p.y;
    return fract(n*fract(k*n));
}

//==========================================================================================
// noises
//==========================================================================================

// value noise, and its analytical derivatives
vec4 noised( in vec3 x )
{
    vec3 p = floor(x);
    vec3 w = fract(x);
    #if 1
    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);
    #else
    vec3 u = w*w*(3.0-2.0*w);
    vec3 du = 6.0*w*(1.0-w);
    #endif

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

    return vec4( -1.0+2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z), 
                      2.0* du * vec3( k1 + k4*u.y + k6*u.z + k7*u.y*u.z,
                                      k2 + k5*u.z + k4*u.x + k7*u.z*u.x,
                                      k3 + k6*u.x + k5*u.y + k7*u.x*u.y ) );
}

float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 w = fract(x);
    
    #if 1
    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    #else
    vec3 u = w*w*(3.0-2.0*w);
    #endif
    


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

vec3 noised( in vec2 x )
{
    vec2 p = floor(x);
    vec2 w = fract(x);
    #if 1
    vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec2 du = 30.0*w*w*(w*(w-2.0)+1.0);
    #else
    vec2 u = w*w*(3.0-2.0*w);
    vec2 du = 6.0*w*(1.0-w);
    #endif
    
    float a = hash1(p+vec2(0,0));
    float b = hash1(p+vec2(1,0));
    float c = hash1(p+vec2(0,1));
    float d = hash1(p+vec2(1,1));

    float k0 = a;
    float k1 = b - a;
    float k2 = c - a;
    float k4 = a - b - c + d;

    return vec3( -1.0+2.0*(k0 + k1*u.x + k2*u.y + k4*u.x*u.y), 
                 2.0*du * vec2( k1 + k4*u.y,
                            k2 + k4*u.x ) );
}

float noise( in vec2 x )
{
    vec2 p = floor(x);
    vec2 w = fract(x);
    #if 1
    vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    #else
    vec2 u = w*w*(3.0-2.0*w);
    #endif

    float a = hash1(p+vec2(0,0));
    float b = hash1(p+vec2(1,0));
    float c = hash1(p+vec2(0,1));
    float d = hash1(p+vec2(1,1));
    
    return -1.0+2.0*(a + (b-a)*u.x + (c-a)*u.y + (a - b - c + d)*u.x*u.y);
}

//==========================================================================================
// fbm constructions
//==========================================================================================

const mat3 m3  = mat3( 0.00,  0.80,  0.60,
                      -0.80,  0.36, -0.48,
                      -0.60, -0.48,  0.64 );
const mat3 m3i = mat3( 0.00, -0.80, -0.60,
                       0.80,  0.36, -0.48,
                       0.60, -0.48,  0.64 );
const mat2 m2 = mat2(  0.80,  0.60,
                      -0.60,  0.80 );
const mat2 m2i = mat2( 0.80, -0.60,
                       0.60,  0.80 );

//------------------------------------------------------------------------------------------

float fbm_4( in vec2 x )
{
    float f = 1.9;
    float s = 0.55;
    float a = 0.0;
    float b = 0.5;
    for( int i=ZERO; i<4; i++ )
    {
        float n = noise(x);
        a += b*n;
        b *= s;
        x = f*m2*x;
    }
	return a;
}

float fbm_4( in vec3 x )
{
    float f = 2.0;
    float s = 0.5;
    float a = 0.0;
    float b = 0.5;
    for( int i=ZERO; i<4; i++ )
    {
        float n = noise(x);
        a += b*n;
        b *= s;
        x = f*m3*x;
    }
	return a;
}

vec4 fbmd_7( in vec3 x )
{
    float f = 1.92;
    float s = 0.5;
    float a = 0.0;
    float b = 0.5;
    vec3  d = vec3(0.0);
    mat3  m = mat3(1.0,0.0,0.0,
                   0.0,1.0,0.0,
                   0.0,0.0,1.0);
    for( int i=ZERO; i<7; i++ )
    {
        vec4 n = noised(x);
        a += b*n.x;          // accumulate values		
        d += b*m*n.yzw;      // accumulate derivatives
        b *= s;
        x = f*m3*x;
        m = f*m3i*m;
    }
	return vec4( a, d );
}

vec4 fbmd_8( in vec3 x )
{
    float f = 2.0;
    float s = 0.65;
    float a = 0.0;
    float b = 0.5;
    vec3  d = vec3(0.0);
    mat3  m = mat3(1.0,0.0,0.0,
                   0.0,1.0,0.0,
                   0.0,0.0,1.0);
    for( int i=ZERO; i<8; i++ )
    {
        vec4 n = noised(x);
        a += b*n.x;          // accumulate values		
        if( i<4 )
        d += b*m*n.yzw;      // accumulate derivatives
        b *= s;
        x = f*m3*x;
        m = f*m3i*m;
    }
	return vec4( a, d );
}

float fbm_9( in vec2 x )
{
    float f = 1.9;
    float s = 0.55;
    float a = 0.0;
    float b = 0.5;
    for( int i=ZERO; i<9; i++ )
    {
        float n = noise(x);
        a += b*n;
        b *= s;
        x = f*m2*x;
    }
    
	return a;
}

vec3 fbmd_9( in vec2 x )
{
    float f = 1.9;
    float s = 0.55;
    float a = 0.0;
    float b = 0.5;
    vec2  d = vec2(0.0);
    mat2  m = mat2(1.0,0.0,0.0,1.0);
    for( int i=ZERO; i<9; i++ )
    {
        vec3 n = noised(x);
        a += b*n.x;          // accumulate values		
        d += b*m*n.yz;       // accumulate derivatives
        b *= s;
        x = f*m2*x;
        m = f*m2i*m;
    }

	return vec3( a, d );
}

//==========================================================================================
// specifics to the actual painting
//==========================================================================================


//------------------------------------------------------------------------------------------
// global
//------------------------------------------------------------------------------------------

const vec3  kSunDir = vec3(-0.624695,0.468521,-0.624695);
const float kMaxTreeHeight = 4.8;
const float kMaxHeight = 840.0;

vec3 fog( in vec3 col, float t )
{
    vec3 ext = exp2(-t*0.00025*vec3(1,1.5,4)); 
    return col*ext + (1.0-ext)*vec3(0.55,0.55,0.58); // 0.55
}

//------------------------------------------------------------------------------------------
// clouds
//------------------------------------------------------------------------------------------

vec4 cloudsFbm( in vec3 pos )
{
    return fbmd_8(pos*0.0015+vec3(2.0,1.1,1.0)+0.07*vec3(iTime,0.5*iTime,-0.15*iTime));
}

vec4 cloudsMap( in vec3 pos, out float nnd )
{
    float d = abs(pos.y-900.0)-40.0;
    vec3 gra = vec3(0.0,sign(pos.y-900.0),0.0);
    
    vec4 n = cloudsFbm(pos);
    d += 400.0*n.x * (0.7+0.3*gra.y);
    
    if( d>0.0 ) return vec4(-d,0.0,0.0,0.0);
    
    nnd = -d;
    d = min(-d/100.0,0.25);
    
    //gra += 0.1*n.yzw *  (0.7+0.3*gra.y);
    
    return vec4( d, gra );
}

float cloudsShadowFlat( in vec3 ro, in vec3 rd )
{
    float t = (900.0-ro.y)/rd.y;
    if( t<0.0 ) return 1.0;
    vec3 pos = ro + rd*t;
    return cloudsFbm(pos).x;
}

float terrainShadow( in vec3 ro, in vec3 rd, in float mint );

vec4 renderClouds( in vec3 ro, in vec3 rd, float tmin, float tmax, inout float resT, in vec2 px )
{
    vec4 sum = vec4(0.0);

    // bounding volume!!
    float tl = ( 600.0-ro.y)/rd.y;
    float th = (1200.0-ro.y)/rd.y;
    if( tl>0.0 ) tmin = max( tmin, tl ); else return sum;
    if( th>0.0 ) tmax = min( tmax, th );

    float t = tmin;
    //t += 1.0*hash1(gl_FragCoord.xy);
    float lastT = -1.0;
    float thickness = 0.0;
    for(int i=ZERO; i<128; i++)
    { 
        vec3  pos = ro + t*rd; 
        float nnd;
        vec4  denGra = cloudsMap( pos, nnd ); 
        float den = denGra.x;
        float dt = max(0.2,0.011*t);
        //dt *= hash1(px+float(i));
        if( den>0.001 ) 
        { 
            float kk;
            cloudsMap( pos+kSunDir*70.0, kk );
            float sha = 1.0-smoothstep(-200.0,200.0,kk); sha *= 1.5;
            
            vec3 nor = normalize(denGra.yzw);
            float dif = clamp( 0.4+0.6*dot(nor,kSunDir), 0.0, 1.0 )*sha; 
            float fre = clamp( 1.0+dot(nor,rd), 0.0, 1.0 )*sha;
            float occ = 0.2+0.7*max(1.0-kk/200.0,0.0) + 0.1*(1.0-den);
            // lighting
            vec3 lin  = vec3(0.0);
                 lin += vec3(0.70,0.80,1.00)*1.0*(0.5+0.5*nor.y)*occ;
                 lin += vec3(0.10,0.40,0.20)*1.0*(0.5-0.5*nor.y)*occ;
                 lin += vec3(1.00,0.95,0.85)*3.0*dif*occ + 0.1;

            // color
            vec3 col = vec3(0.8,0.8,0.8)*0.45;

            col *= lin;

            col = fog( col, t );

            // front to back blending    
            float alp = clamp(den*0.5*0.125*dt,0.0,1.0);
            col.rgb *= alp;
            sum = sum + vec4(col,alp)*(1.0-sum.a);

            thickness += dt*den;
            if( lastT<0.0 ) lastT = t;            
        }
        else 
        {
            dt = abs(den)+0.2;

        }
        t += dt;
        if( sum.a>0.995 || t>tmax ) break;
    }
    
    //resT = min(resT, (150.0-ro.y)/rd.y );
    if( lastT>0.0 ) resT = min(resT,lastT);
    //if( lastT>0.0 ) resT = mix( resT, lastT, sum.w );
    
    
    sum.xyz += max(0.0,1.0-0.0125*thickness)*vec3(1.00,0.60,0.40)*0.3*pow(clamp(dot(kSunDir,rd),0.0,1.0),32.0);

    return clamp( sum, 0.0, 1.0 );
}


//------------------------------------------------------------------------------------------
// terrain
//------------------------------------------------------------------------------------------

vec2 terrainMap( in vec2 p )
{
    float e = fbm_9( p/2000.0 + vec2(1.0,-2.0) );
    float a = 1.0-smoothstep( 0.12, 0.13, abs(e+0.12) ); // flag high-slope areas (-0.25, 0.0)
    e = 600.0*e + 600.0;
    
    // cliff
    e += 90.0*smoothstep( 552.0, 594.0, e );
    //e += 90.0*smoothstep( 550.0, 600.0, e );
    
    return vec2(e,a);
}

vec4 terrainMapD( in vec2 p )
{
    vec3 e = fbmd_9( p/2000.0 + vec2(1.0,-2.0) );
    e.x  = 600.0*e.x + 600.0;
    e.yz = 600.0*e.yz;

    // cliff
    vec2 c = smoothstepd( 550.0, 600.0, e.x );
	e.x  = e.x  + 90.0*c.x;
	e.yz = e.yz + 90.0*c.y*e.yz;     // chain rule
    
    e.yz /= 2000.0;
    return vec4( e.x, normalize( vec3(-e.y,1.0,-e.z) ) );
}

vec3 terrainNormal( in vec2 pos )
{
#if 1
    return terrainMapD(pos).yzw;
#else    
    vec2 e = vec2(0.03,0.0);
	return normalize( vec3(terrainMap(pos-e.xy).x - terrainMap(pos+e.xy).x,
                           2.0*e.x,
                           terrainMap(pos-e.yx).x - terrainMap(pos+e.yx).x ) );
#endif    
}

float terrainShadow( in vec3 ro, in vec3 rd, in float mint )
{
    float res = 1.0;
    float t = mint;
#ifdef LOWQUALITY
    for( int i=ZERO; i<32; i++ )
    {
        vec3  pos = ro + t*rd;
        vec2  env = terrainMap( pos.xz );
        float hei = pos.y - env.x;
        res = min( res, 32.0*hei/t );
        if( res<0.0001 || pos.y>kMaxHeight ) break;
        t += clamp( hei, 2.0+t*0.1, 100.0 );
    }
#else
    for( int i=ZERO; i<128; i++ )
    {
        vec3  pos = ro + t*rd;
        vec2  env = terrainMap( pos.xz );
        float hei = pos.y - env.x;
        res = min( res, 32.0*hei/t );
        if( res<0.0001 || pos.y>kMaxHeight  ) break;
        t += clamp( hei, 0.5+t*0.05, 25.0 );
    }
#endif
    return clamp( res, 0.0, 1.0 );
}

vec2 raymarchTerrain( in vec3 ro, in vec3 rd, float tmin, float tmax )
{
    // bounding plane
    float tp = (kMaxHeight+kMaxTreeHeight-ro.y)/rd.y;
    if( tp>0.0 ) tmax = min( tmax, tp );
    
    // raymarch
    float dis, th;
    float t2 = -1.0;
    float t = tmin; 
    float ot = t;
    float odis = 0.0;
    float odis2 = 0.0;
    for( int i=ZERO; i<400; i++ )
    {
        th = 0.001*t;

        vec3  pos = ro + t*rd;
        vec2  env = terrainMap( pos.xz );
        float hei = env.x;

        // tree envelope
        float dis2 = pos.y - (hei+kMaxTreeHeight*1.1);
        if( dis2<th ) 
        {
            if( t2<0.0 )
            {
                t2 = ot + (th-odis2)*(t-ot)/(dis2-odis2); // linear interpolation for better accuracy
            }
        }
        odis2 = dis2;
        
        // terrain
        dis = pos.y - hei;
        if( dis<th ) break;
        
        ot = t;
        odis = dis;
        t += dis*0.8*(1.0-0.75*env.y); // slow down in step areas
        if( t>tmax ) break;
    }

    if( t>tmax ) t = -1.0;
    else t = ot + (th-odis)*(t-ot)/(dis-odis); // linear interpolation for better accuracy
    
    return vec2(t,t2);
}

//------------------------------------------------------------------------------------------
// trees
//------------------------------------------------------------------------------------------

float treesMap( in vec3 p, in float rt, out float oHei, out float oMat, out float oDis )
{
    oHei = 1.0;
    oDis = 0.0;
    oMat = 0.0;
        
    float base = terrainMap(p.xz).x; 
    
    float bb = fbm_4(p.xz*0.075);

    float d = 20.0;
    vec2 n = floor( p.xz/2.0 );
    vec2 f = fract( p.xz/2.0 );
    for( int j=0; j<=1; j++ )
    for( int i=0; i<=1; i++ )
    {
        vec2  g = vec2( float(i), float(j) ) - step(f,vec2(0.5));
        vec2  o = hash2( n + g );
        vec2  v = hash2( n + g + vec2(13.1,71.7) );
        vec2  r = g - f + o;

        float height = kMaxTreeHeight * (0.4+0.8*v.x);
        float width = 0.5 + 0.2*v.x + 0.3*v.y;

        if( bb<0.0 ) width *= 0.5; else height *= 0.7;
        
        vec3  q = vec3(r.x,p.y-base-height*0.5,r.y);
        
        float k = sdEllipsoidY( q, vec2(width,0.5*height) );

        if( k<d )
        { 
            d = k;
            oMat = 0.5*hash1(n+g+111.0);
            if( bb>0.0 ) oMat += 0.5;
            oHei = (p.y - base)/height;
            oHei *= 0.5 + 0.5*length(q) / width;
        }
    }

    // distort ellipsoids to make them look like trees (works only in the distance really)
    if( rt<1200.0 )
    {
        p.y -= 600.0;
        float s = fbm_4( p*3.0 );
        s = s*s;
        float att = 1.0-smoothstep(100.0,1200.0,rt);
        d += 4.0*s*att;
        oDis = s*att;
    }
    
    return d;
}

float treesShadow( in vec3 ro, in vec3 rd )
{
    float res = 1.0;
    float t = 0.02;
#ifdef LOWQUALITY
    for( int i=ZERO; i<64; i++ )
    {
        float kk1, kk2, kk3;
        vec3 pos = ro + rd*t;
        float h = treesMap( pos, t, kk1, kk2, kk3 );
        res = min( res, 32.0*h/t );
        t += h;
        if( res<0.001 || t>50.0 || pos.y>kMaxHeight+kMaxTreeHeight ) break;
    }
#else
    for( int i=ZERO; i<150; i++ )
    {
        float kk1, kk2, kk3;
        float h = treesMap( ro + rd*t, t, kk1, kk2, kk3 );
        res = min( res, 32.0*h/t );
        t += h;
        if( res<0.001 || t>120.0 ) break;
    }
#endif
    return clamp( res, 0.0, 1.0 );
}

vec3 treesNormal( in vec3 pos, in float t )
{
    float kk1, kk2, kk3;
#if 0    
    const float eps = 0.005;
    vec2 e = vec2(1.0,-1.0)*0.5773*eps;
    return normalize( e.xyy*treesMap( pos + e.xyy, t, kk1, kk2, kk3 ) + 
                      e.yyx*treesMap( pos + e.yyx, t, kk1, kk2, kk3 ) + 
                      e.yxy*treesMap( pos + e.yxy, t, kk1, kk2, kk3 ) + 
                      e.xxx*treesMap( pos + e.xxx, t, kk1, kk2, kk3 ) );            
#else
    // inspired by tdhooper and klems - a way to prevent the compiler from inlining map() 4 times
    vec3 n = vec3(0.0);
    for( int i=ZERO; i<4; i++ )
    {
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        n += e*treesMap(pos+0.005*e, t, kk1, kk2, kk3);
    }
    return normalize(n);
#endif    
}

//------------------------------------------------------------------------------------------
// sky
//------------------------------------------------------------------------------------------

vec3 renderSky( in vec3 ro, in vec3 rd )
{
    // background sky     
    //vec3 col = vec3(0.45,0.6,0.85)/0.85 - rd.y*vec3(0.4,0.36,0.4);
    //vec3 col = vec3(0.4,0.6,1.1) - rd.y*0.4;
    vec3 col = vec3(0.42,0.62,1.1) - rd.y*0.4;

    // clouds
    float t = (2500.0-ro.y)/rd.y;
    if( t>0.0 )
    {
        vec2 uv = (ro+t*rd).xz;
        float cl = fbm_9( uv*0.00104 );
        float dl = smoothstep(-0.2,0.6,cl);
        col = mix( col, vec3(1.0), 0.12*dl );
    }
    
	// sun glare    
    float sun = clamp( dot(kSunDir,rd), 0.0, 1.0 );
    col += 0.2*vec3(1.0,0.6,0.3)*pow( sun, 32.0 );
    
	return col;
}

//------------------------------------------------------------------------------------------
// main image making function
//------------------------------------------------------------------------------------------

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 o = hash2( vec2(iFrame,1) ) - 0.5;
    
    vec2 p = (2.0*(fragCoord+o)-iResolution.xy)/ iResolution.y;
    
    //----------------------------------
    // setup
    //----------------------------------

    // camera
    float time = iTime;
    vec3 ro = vec3(0.0, 401.5, 6.0);
    vec3 ta = vec3(0.0, 403.5, -90.0 + ro.z );
    
    //ro += vec3(10.0*sin(0.02*time),0.0,-10.0*sin(0.2+0.031*time))
    
    ro.x -= 80.0*sin(0.01*time);
    ta.x -= 86.0*sin(0.01*time);

    // ray
    mat3 ca = setCamera( ro, ta, 0.0 );
    vec3 rd = ca * normalize( vec3(p,1.5));

	float resT = 2000.0;

    //----------------------------------
    // sky
    //----------------------------------

    vec3 col = renderSky( ro, rd );


    //----------------------------------
    // raycast terrain and tree envelope
    //----------------------------------
    {
    const float tmax = 2000.0;
    int   obj = 0;
    vec2 t = raymarchTerrain( ro, rd, 15.0, tmax );
    if( t.x>0.0 )
    {
        resT = t.x;
        obj = 1;
    }

    //----------------------------------
    // raycast trees, if needed
    //----------------------------------
    float hei, mid, displa;
    
    if( t.y>0.0 )
    {
        float tf = t.y;
        float tfMax = (t.x>0.0)?t.x:tmax;
        for(int i=ZERO; i<64; i++) 
        { 
            vec3  pos = ro + tf*rd; 
            float dis = treesMap( pos, tf, hei, mid, displa); 
            if( dis<(0.000125*tf) ) break;
            tf += dis;
            if( tf>tfMax ) break;
        }
        if( tf<tfMax )
        {
            resT = tf;
            obj = 2;
        }
    }

    //----------------------------------
    // shade
    //----------------------------------
    if( obj>0 )
    {
        vec3 pos  = ro + resT*rd;
        vec3 epos = pos + vec3(0.0,4.8,0.0);

        float sha1  = terrainShadow( pos+vec3(0,0.02,0), kSunDir, 0.02 );
        //sha1 *= smoothstep(-0.3,0.0,cloudsShadowFlat(epos, kSunDir));
        sha1 *= smoothstep(-0.325,-0.075,cloudsShadowFlat(epos, kSunDir));
        
        #ifndef LOWQUALITY
        float sha2  = treesShadow( pos+vec3(0,0.02,0), kSunDir );
        #endif

        vec3 tnor = terrainNormal( pos.xz );
        vec3 nor;
        
        vec3 speC = vec3(1.0);
        //----------------------------------
        // terrain
        //----------------------------------
        if( obj==1 )
        {
            // bump map
            nor = normalize( tnor + 0.8*(1.0-abs(tnor.y))*0.8*fbmd_7( (pos-vec3(0,600,0))*0.15*vec3(1.0,0.2,1.0) ).yzw );

            col = vec3(0.18,0.12,0.10)*.85;

            col = 1.0*mix( col, vec3(0.1,0.1,0.0)*0.2, smoothstep(0.7,0.9,nor.y) );      
            float dif = clamp( dot( nor, kSunDir), 0.0, 1.0 ); 
            dif *= sha1;
            #ifndef LOWQUALITY
            dif *= sha2;
            #endif

            float bac = clamp( dot(normalize(vec3(-kSunDir.x,0.0,-kSunDir.z)),nor), 0.0, 1.0 );
            float foc = clamp( (pos.y/2.0-180.0)/130.0, 0.0,1.0);
            float dom = clamp( 0.5 + 0.5*nor.y, 0.0, 1.0 );
            vec3  lin  = 1.0*0.2*mix(0.1*vec3(0.1,0.2,0.1),vec3(0.7,0.9,1.5)*3.0,dom)*foc;
                  lin += 1.0*8.5*vec3(1.0,0.9,0.8)*dif;        
                  lin += 1.0*0.27*vec3(1.1,1.0,0.9)*bac*foc;
            speC = vec3(4.0)*dif*smoothstep(20.0,0.0,abs(pos.y/2.0-310.0)-20.0);

            col *= lin;
        }
        //----------------------------------
        // trees
        //----------------------------------
        else //if( obj==2 )
        {
            vec3 gnor = treesNormal( pos, resT );
            
            nor = normalize( gnor + 2.0*tnor );

            // --- lighting ---
            vec3  ref = reflect(rd,nor);
            float occ = clamp(hei,0.0,1.0) * pow(1.0-2.0*displa,3.0);
            float dif = clamp( 0.1 + 0.9*dot( nor, kSunDir), 0.0, 1.0 ); 
            dif *= sha1;
            if( dif>0.0001 )
            {
                float a = clamp( 0.5+0.5*dot(tnor,kSunDir), 0.0, 1.0);
                a = a*a;
                a *= occ;
                a *= 0.6;
                a *= smoothstep(60.0,200.0,resT);
                // tree shadows with fake transmission
                #ifdef LOWQUALITY
                float sha2  = treesShadow( pos+kSunDir*0.1, kSunDir );
                #endif
                dif *= a+(1.0-a)*sha2;
            }
            float dom = clamp( 0.5 + 0.5*nor.y, 0.0, 1.0 );
            float bac = clamp( 0.5+0.5*dot(normalize(vec3(-kSunDir.x,0.0,-kSunDir.z)),nor), 0.0, 1.0 );                 
            float fre = clamp(1.0+dot(nor,rd),0.0,1.0);
            //float spe = pow( clamp(dot(ref,kSunDir),0.0, 1.0), 9.0 )*dif*(0.2+0.8*pow(fre,5.0))*occ;

            // --- lights ---
            vec3 lin  = 12.0*vec3(1.2,1.0,0.7)*dif*occ*(2.5-1.5*smoothstep(0.0,120.0,resT));
                 lin += 0.55*mix(0.1*vec3(0.1,0.2,0.0),vec3(0.6,1.0,1.0),dom*occ);
                 lin += 0.07*vec3(1.0,1.0,0.9)*bac*occ;
                 lin += 1.10*vec3(0.9,1.0,0.8)*pow(fre,5.0)*occ*(1.0-smoothstep(100.0,200.0,resT));
            speC = dif*vec3(1.0,1.1,1.5)*1.2;

            // --- material ---
            float brownAreas = fbm_4( pos.zx*0.015 );
            col = vec3(0.2,0.2,0.05);
            col = mix( col, vec3(0.32,0.2,0.05), smoothstep(0.2,0.9,fract(2.0*mid)) );
            col *= (mid<0.5)?0.65+0.35*smoothstep(300.0,600.0,resT)*smoothstep(700.0,500.0,pos.y):1.0;
            col = mix( col, vec3(0.25,0.16,0.01)*0.825, 0.7*smoothstep(0.1,0.3,brownAreas)*smoothstep(0.5,0.8,tnor.y) );
            col *= 1.0-0.5*smoothstep(400.0,700.0,pos.y);
            col *= lin;
        }

        // spec
        vec3  ref = reflect(rd,nor);            
        float fre = clamp(1.0+dot(nor,rd),0.0,1.0);
        float spe = 3.0*pow( clamp(dot(ref,kSunDir),0.0, 1.0), 9.0 )*(0.05+0.95*pow(fre,5.0));
        col += spe*speC;

        col = fog(col,resT);
    }
    }



    float isCloud = 0.0;
    //----------------------------------
    // clouds
    //----------------------------------
    {
        vec4 res = renderClouds( ro, rd, 0.0, resT, resT, fragCoord );
        col = col*(1.0-res.w) + res.xyz;
        isCloud = res.w;
    }

    //----------------------------------
    // final
    //----------------------------------
    
    // sun glare    
    float sun = clamp( dot(kSunDir,rd), 0.0, 1.0 );
    col += 0.25*vec3(0.8,0.4,0.2)*pow( sun, 4.0 );
 

    // gamma
    //col = sqrt( clamp(col,0.0,1.0) );
    col = pow( clamp(col*1.1-0.02,0.0,1.0), vec3(0.4545) );

    // contrast
    col = col*col*(3.0-2.0*col);            
    
    // color grade    
    col = pow( col, vec3(1.0,0.92,1.0) );   // soft green
    col *= vec3(1.02,0.99,0.9 );            // tint red
    col.z = col.z+0.1;                      // bias blue
    
    //------------------------------------------
	// reproject from previous frame and average
    //------------------------------------------

    mat3x4 oldCam = mat3x4( texelFetch(iChannel0,ivec2(0,0), 0),
                            texelFetch(iChannel0,ivec2(1,0), 0),
                            texelFetch(iChannel0,ivec2(2,0), 0) );
    
    // world space
    vec4 wpos = vec4(ro + rd*resT,1.0);
    // camera space
    vec3 cpos = (wpos*oldCam); // note inverse multiply
    // ndc space
    vec2 npos = 1.5 * cpos.xy / cpos.z;
    // screen space
    vec2 spos = 0.5 + 0.5*npos*vec2(iResolution.y/iResolution.x,1.0);
    // undo dither
    spos -= o/iResolution.xy;
	// raster space
    vec2 rpos = spos * iResolution.xy;
    
    if( rpos.y<1.0 && rpos.x<3.0 )
    {
    }
	else
    {
        vec3 ocol = textureLod( iChannel0, spos, 0.0 ).xyz;
    	if( iFrame==0 ) ocol = col;
        col = mix( ocol, col, 0.1+0.8*isCloud );
    }

    //----------------------------------
    ivec2 ip = ivec2(fragCoord);
	if( ip.y==0 && ip.x<=2 )
    {
        fragColor = vec4( ca[ip.x], -dot(ca[ip.x],ro) );
    }
    else
    {
        fragColor = vec4( col, 1.0 );
    }
}
        `
    }
    fsXXzX(){
        return /* glsl */`
        // "Into the Woods" by dr2 - 2018
// License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License

float PrSphDf (vec3 p, float r);
float PrCylDf (vec3 p, float r, float h);
float SmootherStep (float a, float b, float x);
float SmoothMin (float a, float b, float r);
float SmoothBump (float lo, float hi, float w, float x);
vec2 Rot2D (vec2 q, float a);
vec2 Rot2Cs (vec2 q, vec2 cs);
vec2 PixToHex (vec2 p);
vec2 HexToPix (vec2 h);
vec3 HexGrid (vec2 p);
void HexVorInit ();
vec4 HexVor (vec2 p);
vec3 HsvToRgb (vec3 c);
float Hashfv2 (vec2 p);
vec2 Hashv2v2 (vec2 p);
float Noisefv2 (vec2 p);
float Noisefv3 (vec3 p);
float Fbm2 (vec2 p);
vec3 VaryNf (vec3 p, vec3 n, float f);

#define DMIN(id) if (d < dMin) { dMin = d;  idObj = id; }

vec3 sunDir, vuPos;
vec2 gId, trOff;
float tCur, dstFar, szFac, trSym, grHt, trRot, snowFac;
int idObj;
const int idTrnk = 1, idLv = 2, idRk = 3;
const float pi = 3.14159, sqrt3 = 1.7320508;

vec2 TrackPathS (float t)
{
  return vec2 (dot (vec3 (1.9, 2.9, 4.3),
     sin (vec3 (0.23, 0.17, 0.13) * t)), t);
}

vec2 TrackPath (float t)
{
  return TrackPathS (t) + vec2 (dot (vec2 (0.07, 0.08), sin (vec2 (2.5, 3.3) * t)), 0.);
}

float GrndHt (vec2 p)
{
  float h, w;
  h = 0.35 + 0.17 * (sin (dot (p, vec2 (1., 1.4))) + sin (dot (p, vec2 (-1.2, 0.8))));
  w = abs (p.x - TrackPath (p.y).x) * (1.1 + 0.3 * sin (0.5 * p.y));
  h = h * SmootherStep (0.75, 1.5, w) - 0.05 * (1. - w * w / 0.64) * step (w, 0.8);
  return h;
}

float GrndRay (vec3 ro, vec3 rd)
{
  vec3 p;
  float dHit, h, s, sLo, sHi;
  s = 0.;
  sLo = 0.;
  dHit = dstFar;
  for (int j = 0; j < 150; j ++) {
    p = ro + s * rd;
    h = p.y - GrndHt (p.xz);
    if (h < 0.) break;
    sLo = s;
    s += max (0.02 * s, 0.3 * h);
    if (s > dstFar) break;
  }
  if (h < 0.) {
    sHi = s;
    for (int j = 0; j < 9; j ++) {
      s = 0.5 * (sLo + sHi);
      p = ro + s * rd;
      h = step (0., p.y - GrndHt (p.xz));
      sLo += h * (s - sLo);
      sHi += (1. - h) * (s - sHi);
    }
    dHit = sHi;
  }
  return dHit;
}

vec3 GrndNf (vec3 p)
{
  vec2 e;
  e = vec2 (0.01, 0.);
  return normalize (vec3 (GrndHt (p.xz) - vec2 (GrndHt (p.xz + e.xy),
     GrndHt (p.xz + e.yx)), e.x).xzy);
}

float ObjDf (vec3 p)
{
  vec3 q, qq;
  float dMin, d, ht;
  dMin = dstFar;
  p.xz -= HexToPix (gId) + trOff;
  if (szFac > 0.) {
    dMin /= szFac;
    p.xz = Rot2D (p.xz, trRot);
    p.y -= grHt - 0.1;
    p /= szFac;
    ht = 2.2;
    q = p;
    q.y -= ht;
    d = PrCylDf (q.xzy, 0.12 - 0.03 * q.y / ht, ht);
    qq = p;
    qq.xz = Rot2D (qq.xz, 2. * pi * (floor (trSym * atan (qq.z, - qq.x) / (2. * pi) +
       0.5) / trSym));
    q = qq;
    q.xy = Rot2D (q.xy - vec2 (-0.2, 0.3), -0.3 * pi);
    d = SmoothMin (d, PrCylDf (q.yzx, 0.09 + 0.02 * q.x / 0.6, 0.6), 0.2);
    q = qq;
    q.xy = Rot2D (q.xy - vec2 (-0.2, 1.2 * ht), 0.3 * pi);
    d = SmoothMin (d, PrCylDf (q.yzx, 0.05 + 0.02 * q.x / 0.5, 0.5), 0.1);
    DMIN (idTrnk);
    q = p;
    q.y -= 2. * ht;
    d = PrSphDf (q, 1.);
    q.y -= 1.;
    d = SmoothMin (d, PrSphDf (q, 0.5), 0.5);
    q.xz = qq.xz;
    q.xy -= vec2 (-0.3, -2.);
    d = SmoothMin (d, PrSphDf (q, 0.6), 0.3);
    DMIN (idLv);
    dMin *= szFac;
  } else  if (szFac < 0.) {
    q = p;
    d = PrSphDf (q, - szFac * 0.15);
    DMIN (idRk);
  }
  return dMin;
}

void SetTrParms ()
{
  vec2 g, w;
  float s;
  szFac = 0.3 + 0.4 * Hashfv2 (17. * gId + 99.);
  trSym = floor (3. + 2.9 * Hashfv2 (19. * gId + 99.));
  w = Hashv2v2 (33. * gId);
  g = HexToPix (gId);
  s = abs (g.x - TrackPath (g.y).x);
  if (s < 0.5) {
    trOff = 0.25 * sqrt3 * w.x * vec2 (cos (2. * pi * w.y), sin (2. * pi * w.y));
    szFac *= -1.;
  } else if (s < 2.) {
    szFac = 0.;
  } else {
    trOff = max (0., 0.5 * sqrt3 - szFac) * w.x * vec2 (cos (2. * pi * w.y), sin (2. * pi * w.y));
    trRot = 0.6 * pi * (Hashfv2 (23. * gId + 99.) - 0.5);
    grHt = GrndHt (g + trOff);
  }
}

float ObjRay (vec3 ro, vec3 rd)
{
  vec3 vri, vf, hv, p;
  vec2 edN[3], pM, gIdP;
  float dHit, d, s;
  edN[0] = vec2 (1., 0.);
  edN[1] = 0.5 * vec2 (1., sqrt3);
  edN[2] = 0.5 * vec2 (1., - sqrt3);
  for (int k = 0; k < 3; k ++) edN[k] *= sign (dot (edN[k], rd.xz));
  vri = 1. / vec3 (dot (rd.xz, edN[0]), dot (rd.xz, edN[1]), dot (rd.xz, edN[2]));
  vf = 0.5 * sqrt3 - vec3 (dot (ro.xz, edN[0]), dot (ro.xz, edN[1]),
     dot (ro.xz, edN[2]));
  pM = HexToPix (PixToHex (ro.xz));
  gIdP = vec2 (-99.);
  dHit = 0.;
  for (int j = 0; j < 200; j ++) {
    hv = (vf + vec3 (dot (pM, edN[0]), dot (pM, edN[1]), dot (pM, edN[2]))) * vri;
    s = min (hv.x, min (hv.y, hv.z));
    p = ro + dHit * rd;
    gId = PixToHex (p.xz);
    if (gId.x != gIdP.x || gId.y != gIdP.y) {
      gIdP = gId;
      SetTrParms ();
    }
    d = ObjDf (p);
    if (dHit + d < s) {
      dHit += d;
    } else {
      dHit = s + 0.002;
      pM += sqrt3 * ((s == hv.x) ? edN[0] : ((s == hv.y) ? edN[1] : edN[2]));
    }
    if (d < 0.0005 || dHit > dstFar || p.y < 0. || p.y > 10.) break;
  }
  if (d >= 0.0005) dHit = dstFar;
  return dHit;
}

vec3 ObjNf (vec3 p)
{
  vec4 v;
  vec2 e = vec2 (0.0005, -0.0005);
  v = vec4 (ObjDf (p + e.xxx), ObjDf (p + e.xyy), ObjDf (p + e.yxy), ObjDf (p + e.yyx));
  return normalize (vec3 (v.x - v.y - v.z - v.w) + 2. * v.yzw);
}

float ObjSShadow (vec3 ro, vec3 rd)
{
  vec3 p;
  vec2 gIdP;
  float sh, d, h;
  sh = 1.;
  gIdP = vec2 (-99.);
  d = 0.01;
  for (int j = 0; j < 30; j ++) {
    p = ro + rd * d;
    gId = PixToHex (p.xz);
    if (gId.x != gIdP.x || gId.y != gIdP.y) {
      gIdP = gId;
      SetTrParms ();
    }
    h = ObjDf (p);
    sh = min (sh, smoothstep (0., 0.1 * d, h));
    d += clamp (h, 0.05, 0.5);
    if (sh < 0.05) break;
  }
  return 0.3 + 0.7 * sh;
}

vec3 SkyCol (vec3 rd)
{
  return mix (vec3 (0.1, 0.2, 0.4) + 0.2 * pow (1. - rd.y, 8.) +
     0.35 * pow (max (dot (rd, sunDir), 0.), 6.), vec3 (1.), clamp (0.1 + 0.8 * rd.y *
     Fbm2 (5. * rd.xz / max (rd.y, 0.001)), 0., 1.));
}

float WaterHt (vec2 p)
{
  mat2 qRot = mat2 (0.8, -0.6, 0.6, 0.8);
  vec4 t4, v4;
  vec2 t;
  float wFreq, wAmp, ht, tWav;
  tWav = 0.5 * tCur;
  wFreq = 1.;
  wAmp = 1.;
  ht = 0.;
  for (int j = 0; j < 3; j ++) {
    p *= qRot;
    t = tWav * vec2 (1., -1.);
    t4 = (p.xyxy + t.xxyy) * wFreq;
    t = vec2 (Noisefv2 (t4.xy), Noisefv2 (t4.zw));
    t4 += 2. * t.xxyy - 1.;
    v4 = (1. - abs (sin (t4))) * (abs (sin (t4)) + abs (cos (t4)));
    ht += wAmp * dot (pow (1. - sqrt (v4.xz * v4.yw), vec2 (8.)), vec2 (1.));
    wFreq *= 2.;
    wAmp *= 0.5;
  }
  return ht;
}

vec3 WaterNf (vec3 p)
{
  vec3 vn;
  vec2 e = vec2 (0.05, 0.);
  vn.xz = 0.002 * (WaterHt (p.xz) - vec2 (WaterHt (p.xz + e.xy), WaterHt (p.xz + e.yx)));
  vn.y = e.x;
  return normalize (vn);
}

vec3 ShowScene (vec3 ro, vec3 rd)
{
  vec4 vc;
  vec3 col, c1, c2, rbCol, fCol, wCol, snCol, vn, vnw, rog, rdo;
  vec2 vf;
  float dstObj, dstGrnd, dstWat, sh, spec, s, h1, h2, glit;
  bool isRefl, isSky;
  isRefl = false;
  isSky = false;
  spec = 0.;
  HexVorInit ();
  dstGrnd = GrndRay (ro, rd);
  dstObj = ObjRay (ro, rd);
  dstWat = (rd.y < 0.) ? - ro.y / rd.y : dstFar;
  rdo = rd;
  rog = ro + dstGrnd * rd;
  if (dstWat < min (min (dstGrnd, dstObj), dstFar)) {
    ro += dstWat * rd;
    vnw = WaterNf (8. * ro);
    rd = reflect (rd, vnw);
    ro += 0.01 * rd;
    dstGrnd = GrndRay (ro, rd);
    dstObj = ObjRay (ro, rd);
    isRefl = true;
  }
  vf = vec2 (0.);
  if (min (dstGrnd, dstObj) < dstFar) {
    snCol = vec3 (0.9, 0.9, 0.95);
    if (dstObj < dstGrnd) {
      ro += dstObj * rd;
      vn = ObjNf (ro);
      gId = PixToHex (ro.xz);
      h1 = Hashfv2 (gId * vec2 (17., 27.) + 0.5);
      h2 = Hashfv2 (gId * vec2 (19., 29.) + 0.5);
      if (idObj == idTrnk) {
        fCol = HsvToRgb (vec3 (0.1 * h1, 0.5, 0.4 - 0.2 * h2));
        wCol = mix (snCol, mix (fCol, snCol, smoothstep (0.01, 0.2, vn.y)),
           smoothstep (0.1 * szFac, 0.3 * szFac, ro.y - GrndHt (HexToPix (gId))));
        vf = vec2 (32., 2.);
      } else if (idObj == idLv) {
        fCol = HsvToRgb (vec3 (0.2 + 0.2 * h1, 0.7, 0.8 - 0.4 * h2)) *
           (1. - 0.2 * Noisefv3 (64. * ro));
        spec = 0.1;
        wCol = mix (0.6 * fCol, snCol, 0.2 + 0.8 * smoothstep (-0.8, -0.6, vn.y));
        vf = vec2 (16., mix (4., 16., 1. - snowFac));
      } else if (idObj == idRk) {
        fCol = mix (vec3 (0.4, 0.3, 0.3), vec3 (0.3, 0.4, 0.5), Fbm2 (16. * ro.xz));
        spec = 0.1;
        wCol = mix (fCol, snCol, 0.2 + 0.8 * smoothstep (0.1, 0.3, vn.y));
        vf = vec2 (8., 8.);
      }
    } else if (dstGrnd < dstFar) {
      ro += dstGrnd * rd;
      gId = PixToHex (ro.xz);
      SetTrParms ();
      vn = GrndNf (ro);
      vf = vec2 (8., 4.);
      if (snowFac < 1.) {
        c1 = mix (vec3 (0.1, 0.2, 0.15), vec3 (0.2, 0.4, 0.2),
           smoothstep (0.3, 0.5, Fbm2 (8. * ro.xz)));
        if (szFac > 0.) c1 = mix (vec3 (0.15, 0.05, 0.1), c1, 0.2 + 0.8 *
           smoothstep (0.4 * szFac, 0.7 * szFac, length (ro.xz - HexToPix (gId) - trOff)));
        c1 *= (1. - 0.2 * Noisefv2 (128. * ro.xz));
        c2 = vec3 (0.3, 0.3, 0.35) * (1. - 0.2 * Noisefv2 (256. * ro.zy));
        fCol = mix (c2, mix (c2, c1, smoothstep (0.4, 0.7, vn.y)),
           smoothstep (0., 0.005 * Noisefv2 (128. * ro.xz), ro.y));
      } else fCol = vec3 (0.);
      wCol = vec3 (0.8, 0.8, 0.85);
    }
    col = mix (fCol, wCol, snowFac);
    if (vf.x > 0.) vn = VaryNf (vf.x * ro, vn, vf.y);
    sh = ObjSShadow (ro, sunDir);
    col = col * (0.1 + 0.1 * max (dot (normalize (- sunDir.xz), vn.xz), 0.) +
       0.1 * max (vn.y, 0.) + 0.8 * sh * max (dot (vn, sunDir), 0.)) +
       sh * spec * pow (max (dot (normalize (sunDir - rd), vn), 0.), 64.);
    if (snowFac > 0. && dstGrnd < dstObj) {
      glit = 64. * step (0.01, max (0., dot (vn, sunDir))) *
         pow (max (0., dot (sunDir, reflect (rd, vn))), 16.) *
         pow (1. - 0.6 * abs (dot (normalize (sunDir - rd), VaryNf (512. * ro, vn, 8.))), 8.);
      col += vec3 (1., 1., 0.8) * smoothstep (0.6, 0.9, snowFac) * step (0.5, sh) * glit;
    }
  } else {
    col = SkyCol (rd);
    isSky = true;
  }
  if (isRefl) {
    vc = HexVor (128. * rog.xz);
    vn = normalize (vec3 (-0.7 * vc.yz, 1.).xzy);
    s = mod (10. * vc.w, 1.);
    sh = ObjSShadow (rog, sunDir);
    rbCol = HsvToRgb (vec3 (0.1 + 0.3 * step (2. * s, 1.) + 0.1 * mod (5. * s, 1.),
       0.2 + 0.2 * mod (17. * s, 1.), 0.2 + 0.2 * mod (12. * s, 1.))) *
       (0.5 + 0.3 * smoothstep (0., 0.2, vc.x)) * (1. - 0.2 * Noisefv2 (128. * rog.xz));
    rbCol = rbCol * (0.2 + 0.1 * max (vn.y, 0.) + 0.7 * sh * max (dot (vn, sunDir), 0.)) +
       sh * 0.1 * pow (max (dot (normalize (sunDir - rdo), vn), 0.), 64.);
    col = mix (rbCol, 0.95 * col, 1. - 0.9 * pow (dot (- rdo, vnw), 2.));
    if (isSky) col = mix (col, 1.5 * vec3 (1., 1., 0.9), sh *
       pow (max (0., dot (sunDir, reflect (rdo, vnw))), 2048.));
  }
  col = pow (col, vec3 (0.6));
  return clamp (col, 0., 1.);
}

void mainImage (out vec4 fragColor, vec2 fragCoord)
{
  mat3 vuMat;
  vec4 mPtr, dateCur;
  vec3 ro, rd;
  vec2 canvas, uv, ori, ca, sa, vd;
  float el, az, tCyc, tt, a, vel;
  canvas = iResolution.xy;
  uv = 2. * fragCoord.xy / canvas - 1.;
  uv.x *= canvas.x / canvas.y;
  tCur = iTime;
  dateCur = iDate;
  mPtr = iMouse;
  mPtr.xy = mPtr.xy / canvas - 0.5;
  tCyc = 40.;
  tCur = mod (tCur, 36000.) + floor (floor (dateCur.w / 600.) / (2. * tCyc)) * 2. * tCyc;
  snowFac = SmoothBump (0.4, 0.9, 0.05, mod (0.5 * tCur / tCyc, 1.));
  vel = 0.7;
  vuPos.xz = TrackPathS (vel * tCur);
  vuPos.y = 0.6;
  ro = vuPos;
  vd = TrackPathS (vel * (tCur + 0.2)) - vuPos.xz;
  az = atan (vd.x, vd.y);
  el = 0.;
  if (mPtr.z > 0.) {
    az += 2. * pi * mPtr.x;
    el = 0.7 * pi * mPtr.y;
  } else {
    a = 0.45 * pi * SmoothBump (0.3, 0.7, 0.1, 0.1 * mod (tCur, 0.25 * tCyc));
    tt = mod (tCur / tCyc, 1.);
    if (tt < 0.25) az += a;
    else if (tt < 0.5) az -= a;
    else if (tt < 0.75) el = -0.4 * a;
  }
  ori = vec2 (el, az);
  ca = cos (ori);
  sa = sin (ori);
  vuMat = mat3 (ca.y, 0., - sa.y, 0., 1., 0., sa.y, 0., ca.y) *
          mat3 (1., 0., 0., 0., ca.x, - sa.x, 0., sa.x, ca.x);
  rd = vuMat * normalize (vec3 (uv, 1.6));
  dstFar = 80.;
  sunDir = normalize (vec3 (1., 1.5, 0.3));
  fragColor = vec4 (ShowScene (ro, rd), 1.);
}

float PrSphDf (vec3 p, float r)
{
  return length (p) - r;
}

float PrCylDf (vec3 p, float r, float h)
{
  return max (length (p.xy) - r, abs (p.z) - h);
}

float SmoothMin (float a, float b, float r)
{
  float h;
  h = clamp (0.5 + 0.5 * (b - a) / r, 0., 1.);
  return mix (b, a, h) - r * h * (1. - h);
}

float SmoothBump (float lo, float hi, float w, float x)
{
  return (1. - smoothstep (hi - w, hi + w, x)) * smoothstep (lo - w, lo + w, x);
}

float SmootherStep (float a, float b, float x)
{
  x = clamp ((x - a) / (b - a), 0., 1.); 
  return ((6. * x - 15.) * x + 10.) * x * x * x;
}

vec2 Rot2D (vec2 q, float a)
{
  return q * cos (a) * vec2 (1., 1.) + q.yx * sin (a) * vec2 (-1., 1.);
}

vec2 PixToHex (vec2 p)
{
  vec3 c, r, dr;
  c.xz = vec2 ((1./sqrt3) * p.x - (1./3.) * p.y, (2./3.) * p.y);
  c.y = - c.x - c.z;
  r = floor (c + 0.5);
  dr = abs (r - c);
  r -= step (dr.yzx, dr) * step (dr.zxy, dr) * dot (r, vec3 (1.));
  return r.xz;
}

vec2 HexToPix (vec2 h)
{
  return vec2 (sqrt3 * (h.x + 0.5 * h.y), (3./2.) * h.y);
}

vec3 HexGrid (vec2 p)
{
  vec2 q;
  p -= HexToPix (PixToHex (p));
  q = abs (p);
  return vec3 (p, 0.5 * sqrt3 - q.x + 0.5 * min (q.x - sqrt3 * q.y, 0.));
}

vec2 gVec[7], hVec[7];

void HexVorInit ()
{
  vec3 e = vec3 (1., 0., -1.);
  gVec[0] = e.yy;
  gVec[1] = e.xy;
  gVec[2] = e.yx;
  gVec[3] = e.xz;
  gVec[4] = e.zy;
  gVec[5] = e.yz;
  gVec[6] = e.zx;
  for (int k = 0; k < 7; k ++) hVec[k] = HexToPix (gVec[k]);
}

vec4 HexVor (vec2 p)
{
  vec4 sd, udm;
  vec2 ip, fp, d, u;
  float amp, a;
  amp = 0.7;
  ip = PixToHex (p);
  fp = p - HexToPix (ip);
  sd = vec4 (4.);
  udm = vec4 (4.);
  for (int k = 0; k < 7; k ++) {
    u = Hashv2v2 (ip + gVec[k]);
    a = 2. * pi * (u.y - 0.5);
    d = hVec[k] + amp * (0.4 + 0.6 * u.x) * vec2 (cos (a), sin (a)) - fp;
    sd.w = dot (d, d);
    if (sd.w < sd.x) {
      sd = sd.wxyw;
      udm = vec4 (d, u);
    } else sd = (sd.w < sd.y) ? sd.xwyw : ((sd.w < sd.z) ? sd.xyww : sd);
  }
  sd.xyz = sqrt (sd.xyz);
  return vec4 (SmoothMin (sd.y, sd.z, 0.3) - sd.x, udm.xy, Hashfv2 (udm.zw));
}

vec3 HsvToRgb (vec3 c)
{
  vec3 p;
  p = abs (fract (c.xxx + vec3 (1., 2./3., 1./3.)) * 6. - 3.);
  return c.z * mix (vec3 (1.), clamp (p - 1., 0., 1.), c.y);
}

const float cHashM = 43758.54;

float Hashfv2 (vec2 p)
{
  return fract (sin (dot (p, vec2 (37., 39.))) * cHashM);
}

vec2 Hashv2f (float p)
{
  return fract (sin (p + vec2 (0., 1.)) * cHashM);
}

vec2 Hashv2v2 (vec2 p)
{
  vec2 cHashVA2 = vec2 (37., 39.);
  return fract (sin (vec2 (dot (p, cHashVA2), dot (p + vec2 (1., 0.), cHashVA2))) * cHashM);
}

vec4 Hashv4v3 (vec3 p)
{
  vec3 cHashVA3 = vec3 (37., 39., 41.);
  vec2 e = vec2 (1., 0.);
  return fract (sin (vec4 (dot (p + e.yyy, cHashVA3), dot (p + e.xyy, cHashVA3),
     dot (p + e.yxy, cHashVA3), dot (p + e.xxy, cHashVA3))) * cHashM);
}

float Noisefv2 (vec2 p)
{
  vec2 t, ip, fp;
  ip = floor (p);  
  fp = fract (p);
  fp = fp * fp * (3. - 2. * fp);
  t = mix (Hashv2v2 (ip), Hashv2v2 (ip + vec2 (0., 1.)), fp.y);
  return mix (t.x, t.y, fp.x);
}

float Noisefv3 (vec3 p)
{
  vec4 t;
  vec3 ip, fp;
  ip = floor (p);
  fp = fract (p);
  fp *= fp * (3. - 2. * fp);
  t = mix (Hashv4v3 (ip), Hashv4v3 (ip + vec3 (0., 0., 1.)), fp.z);
  return mix (mix (t.x, t.y, fp.x), mix (t.z, t.w, fp.x), fp.y);
}

float Fbm2 (vec2 p)
{
  float f, a;
  f = 0.;
  a = 1.;
  for (int j = 0; j < 5; j ++) {
    f += a * Noisefv2 (p);
    a *= 0.5;
    p *= 2.;
  }
  return f * (1. / 1.9375);
}

float Fbmn (vec3 p, vec3 n)
{
  vec3 s;
  float a;
  s = vec3 (0.);
  a = 1.;
  for (int j = 0; j < 5; j ++) {
    s += a * vec3 (Noisefv2 (p.yz), Noisefv2 (p.zx), Noisefv2 (p.xy));
    a *= 0.5;
    p *= 2.;
  }
  return dot (s, abs (n));
}

vec3 VaryNf (vec3 p, vec3 n, float f)
{
  vec3 g;
  vec2 e = vec2 (0.1, 0.);
  g = vec3 (Fbmn (p + e.xyy, n), Fbmn (p + e.yxy, n), Fbmn (p + e.yyx, n)) - Fbmn (p, n);
  return normalize (n + f * (g - n * dot (n, g)));
}

        `
    }
}