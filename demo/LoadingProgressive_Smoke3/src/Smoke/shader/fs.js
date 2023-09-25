export class fs{
    static shader=/* glsl */`
	precision highp float;
	precision highp sampler3D;

	uniform mat4 modelViewMatrix;
	uniform mat4 projectionMatrix;

	in vec3 vOrigin;
	in vec3 vDirection;

	out vec4 color;

	uniform vec3 base;
	uniform sampler3D map;//三维浓度图。

	uniform float threshold;
	uniform float range;//虚化区域的大小 高度浮动范围
	uniform float opacity;
	uniform float steps;//采样步数
	uniform float frame;//方便后面添加动态效果

	uniform float sizex;
	uniform float sizey;
	uniform float sizez;

	vec2 hitBox( vec3 orig, vec3 dir ) {   //计算光线与方盒的交点
		vec3 box_min = vec3( sizex,sizey,sizez )* - .5;//vec3( - 0.5 );//一个轴对称包围盒 Axis-Aligned Bounding Box
		vec3 box_max = vec3( sizex,sizey,sizez )* + .5;//vec3( 0.5 );
		vec3 inv_dir = 1.0 / dir;
		vec3 tmin_tmp = ( box_min - orig ) * inv_dir; //时间*方向=交点-起点
		vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
		vec3 tmin = min( tmin_tmp, tmax_tmp ); //三对平面的入射时间
		vec3 tmax = max( tmin_tmp, tmax_tmp ); //三对平面的出射时间
		float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
		float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
		return vec2( t0, t1 ); //射线的入射时间和出射时间
	}

	float sample1( vec3 p ) {//根据向量取一个随机值
		return texture( map, p ).r;
	}

	float shading( vec3 coord ) {//获取三维图片这这个位置的梯度
		float step = 0.01;//一个极小值
		return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );//map在对角线方向的变化速度
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////
	//               噪声函数
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
		const mat3 m3  = mat3( 
			0.00,  0.80,  0.60,
			-0.80,  0.36, -0.48,
			-0.60, -0.48,  0.64 );
		for( int i=0; i<4; i++ )//for( int i=min(0, iFrame); i<4; i++ )
		{//把不同比例位置的一张噪声合并在一起
			float n = noise(x);//texture( map, x ).r;//2.*texture( map, x ).r-1.;//(2.*texture( map, x/255. ).r-1.)
			a += b*n;
			b *= s;
			x = f*m3*x;
		}
		return a;
	}
	vec3 Translate(vec3 pos, vec3 translate)
	{
		return pos -= translate;
	}
	float sdSphere( vec3 p, vec3 origin, float radius )
	{
		p = Translate(p, origin);
		return length(p)-radius;
	}
	float sdSmoothUnion( float d1, float d2, float k ) 
	{
		float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
		return mix( d2, d1, h ) - k*h*(1.0-h); 
	}
	float QueryVolumetricDistanceField( in vec3 pos)//效果像是液体
	{    
		vec3 p1=vec3(-0.1,-0.1,-0.1*sin(frame));
		float r1=.2;
		vec3 p2=vec3(0.2*sin(frame*1.41));
		float r2=.15;
		vec3 p3=vec3(-0.2*sin(frame*1.41)-0.05);
		float r3=.1;
		vec3 p4=vec3(0.4*sin(frame*2.5),-0.4*sin(frame*2.6),0.4*sin(frame*2.7));
		float r4=.01;

		float sdfValue = sdSphere(pos,p1, r1);
		sdfValue = sdSmoothUnion(
			sdfValue,
			sdSphere(pos, p2, r2), .5f
		);
		sdfValue = sdSmoothUnion(
			sdfValue,
			sdSphere(pos, p3, r3), .5f
		);
		sdfValue = sdSmoothUnion(
			sdfValue,
			sdSphere(pos, p4, r4), .5f
		);
	
		return  sdfValue;
	}
	float QueryVolumetricDistanceField2( in vec3 pos,float id)//每一团烟雾都不同步
	{    
		float f=frame+id*100.;
		vec3 p1=vec3(-0.1,-0.1,-0.1*sin(f));
		float r1=.1;
		vec3 p2=vec3(0.1*sin(f*1.41))+0.2;
		float r2=.1;
		vec3 p3=vec3(-0.2*sin(f*1.41))-0.05;
		float r3=.1;
		vec3 p4=vec3(0.4*sin(f*2.5),-0.4*sin(f*2.6),0.4*sin(f*2.7));
		float r4=.1;

		float sdfValue = sdSmoothUnion(
			sdSphere(pos, p1, r1),
			sdSphere(pos, p2, r2), .5f
		);
		sdfValue = sdSmoothUnion(
			sdfValue,
			sdSphere(pos, p3, r3), .5f
		);
		sdfValue = sdSmoothUnion(
			sdfValue,
			sdSphere(pos, p4, r4), .5f 
		);	

		// sdfValue = sdSmoothUnion(
		// 	sdfValue,
		// 	.01*texture( map, 0.01*pos ).r, 
		// 	.5f 
		// );	
		// return  sdfValue+ 0.1*fract(pow(pos[0]*pos[0],pos[0]*pos[0]));//10.5*texture( map, 0.01*pos ).r;
		return  sdfValue;//+ 0.1*fbm_4(pos*10.);
		// float s=.0;
		// float iTime=frame+id*100.;
		// vec3 fbmCoord = (pos + 2.0 * vec3(iTime, 0.0, iTime)) / 1.5f;
		// float sdfValue = sdSphere(pos, s*vec3(-8.0, 2.0 + 20.0 * sin(iTime), -1), s*5.6);
		// sdfValue = sdSmoothUnion(sdfValue,sdSphere(pos, s*vec3(8.0, 8.0 + 12.0 * cos(iTime), 3), s*5.6), 3.0f);
		// return     sdSmoothUnion(sdfValue, sdSphere(pos, s*vec3(5.0 * sin(iTime), 3.0, 0), 8.0), s*3.0) + 7.0 * fbm_4(fbmCoord / 3.2);
    
	}
	float IntersectVolumetric(in vec3 rayOrigin, in vec3 rayDirection, float maxT)
	{// 精度不是很重要，只需要在之前有一个不错的起点
		float precis = 0.5; 
		float t = 0.0f;//用来记录前进的距离
		for(int i=0; i<3; i++ )//for(int i=0; i<MAX_SDF_SPHERE_STEPS; i++ )
		{
			float result = QueryVolumetricDistanceField( rayOrigin+rayDirection*t);//查询SDF的值
			if( result < (precis) || t>maxT ) break;//到边缘比较近 或 前进的比较远
			t += result;//更新需要前进的距离
		}
		return ( t>=maxT ) ? -1.0 : t;//视点距离物体较近的时候谨慎一些
	}
	float BeerLambert(float absorption, float dist)// 啤酒兰伯特定律描述了穿透光的衰减
	{//absorption是一个浓度系数，dist是穿透距离
		return exp(-absorption * dist);
	}
	vec3 GetAmbientLight()
	{
		return 1.2 * vec3(0.03, 0.018, 0.018);
	}
	float GetFogDensity(vec3 position, float sdfDistance)
	{//有简化
		return sdfDistance < 0.0 ? min(abs(sdfDistance), 1.) : 0.0;
	}
	/////////////////////////////////////////////////////////////////////////////////////////////////
	struct Smoke{//pixel
		float id;//每一团云对应一个id
		vec3 position;
		float density;
		float grad;
	};
	float r(float a,float b){
		a+=0.5;
		return (a/b-floor(a/b))*b-0.5;
	}
	float getd(vec3 p){
		float d = sample1( p + 0.5 );
		return smoothstep( threshold - range, threshold + range, d ) * opacity;
	}
	mat3 rotateX(float angle) {
		float c = cos(angle);
		float s = sin(angle);
		return mat3(
			1.0, 0.0, 0.0,
			0.0, c,   -s,
			0.0, s,    c
		);
	}
	void setPosition(inout Smoke s,vec3 p){//输入一个位置
		float xi=floor(p.x+.5);
		float yi=floor(p.y+.5);
		float zi=floor(p.z+.5);
		s.id=xi*sizey*sizez+yi*sizez+zi;
		s.position=vec3(r(p.x,1.),r(p.y,1.),r(p.z,1.));
	}
	void setDensity(inout Smoke s){
		float time=frame+99.001*s.id;
		float a1=0.5+0.5*sin(time);
		float a2=1.-a1;
		float a3=0.5+0.5*sin(time*1.7+3.14);
		vec3 p2=s.position;
		// s.density = a1*getd(p2)+(0.9+0.1*a2)*getd(rotateX(time)*p2)+a3*getd(vec3(p2.y,p2.x,0.1));
		// s.density= QueryVolumetricDistanceField(p2)+ sample1( p2 + 0.5 );;
		s.density = a1*getd(p2)+(0.9+0.1*a2)*getd(rotateX(time)*p2)+a3*getd(vec3(p2.y,p2.x,0.1));
		// if(s.density>0.)s.density=0.;
		// else s.density=1.;
	}
	void setGrad(inout Smoke s){
		vec3 p=s.position;
		s.grad=shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;
		// s.grad=0.;
	}

	void main(){
		vec3 rayDir = normalize( vDirection );   //将像素点对应的光线方向进行单位化
		vec2 bounds = hitBox( vOrigin, rayDir ); //计算光线的入射方向和出射方向

		bounds.x = max( bounds.x, 0.0 );	//如果视点在云雾对象内部

		vec3 p = vOrigin + bounds.x * rayDir; //射线的入射位置
		float delta = 1./steps;

		vec4 ac = vec4( base, 0.0 );//云雾对象的基颜色

		Smoke s;
		/////////////////////////////////////////////////////////////////////////////////////////////
		float distanceInVolume=0.;//用于叠加穿透距离
		float opaqueVisiblity=1.;//用于记录局部透明度
		float marchSize=delta;
		vec3 volumetricColor=vec3(0.);
		/////////////////////////////////////////////////////////////////////////////////////////////
		for ( float t = bounds.x; t < bounds.y; t += delta ) {//从入射时间到出射时间之间等距离取多个点
			setPosition(s,p);
			setDensity(s);
			setGrad(s);
			/////////////////////////////////////////////////////////////////////////////////////////////
			vec3 position=s.position;
			float signedDistance = QueryVolumetricDistanceField2(position,s.id);//查询SDF的值
			if(signedDistance < 0.0f)//如果在物体内
			{
				ac.rgb += ( 1.0 - ac.a ) * s.density * s.grad;//反射的光线变多
				ac.a += ( 1.0 - ac.a ) * s.density;//阻光度增加
			}
			
			/////////////////////////////////////////////////////////////////////////////////////////////

			

			if ( ac.a >= 0.95 ) break;//阻光度过高就可以暂停了
			

			p += rayDir * delta;//更新光线位置

		}

		color = ac;
		color.a=color.a*color.a*color.a*color.a*color.a;//color.a*=0.5;

		if ( color.a == 0.0 ) discard;//如果不透明就不处理这个像素

	}
`;
}