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
	uniform sampler3D map;//噪声贴图

	uniform float threshold;
	uniform float range;//虚化区域的大小 高度浮动范围
	uniform float opacity;
	uniform float steps;//采样步数
	uniform float frame;//方便后面添加动态效果

	uniform float sizex;
	uniform float sizey;
	uniform float sizez;
	uniform float res;

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
	float sdSphere( vec3 p, vec3 origin, float radius )
	{
		p -= origin;
		return length(p)-radius;
	}
	float sdSmoothUnion( float d1, float d2, float k ) 
	{
		float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
		return mix( d2, d1, h ) - k*h*(1.0-h); 
	}
	float noise(vec3 pos){//0-1
		return texture( map, pos*64./res ).r;
	}
	struct Smoke{//pixel
		int type;//0为底层烟雾，1为顶层烟雾
		float id;//每一团云对应一个id
		vec3 position;
		float density;
		float grad;
	};
	float QueryVolumetricDistanceField0( in vec3 pos,float id){ //0为底层烟雾   //pos -0.5~0.5
		return sdSphere(pos, 
				-0.3*vec3(0.,-.3,.5), 
				.5)+.3*noise(  pos*.3+0.5 );
	}
	float sample1( vec3 p ,Smoke s) {//获取位置p的烟雾浓度
		float d;
		d=QueryVolumetricDistanceField0( p-0.5,s.id);//-0.5~0.5
		// d=d*.8;
		if(d>0.)return 0.;
		else return d*-1.;
	}
	void setPosition(inout Smoke s,vec3 p){
			s.type=0;
			float xi=floor(p.x+.5);
			float yi=floor(p.y+.5);
			float zi=floor(p.z+.5);
			s.id=xi*sizey*sizez+yi*sizez+zi;
			s.position=vec3(fract(p+.5))-.5;
	}
	void setDensity(inout Smoke s){
		float d = sample1( s.position + 0.5 ,s);
		s.density = smoothstep( threshold - range, threshold + range, d ) * opacity;
	}
	void setGrad(inout Smoke s){
		vec3 p=s.position;
		vec3 coord =p + 0.5;
		float step = 0.01;//一个极小值
		s.grad=sample1( coord + vec3( - step ) ,s) - sample1( coord + vec3( step ) ,s);//在对角线方向的变化速度
		s.grad=s.grad* 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;//s.grad=0.03*s.grad/step;
	}
	void main(){
		vec3 rayDir = normalize( vDirection );   //将像素点对应的光线方向进行单位化
		vec2 bounds = hitBox( vOrigin, rayDir ); //计算光线的入射方向和出射方向

		bounds.x = max( bounds.x, 0.0 );	//如果视点在云雾对象内部

		vec3 p = vOrigin + bounds.x * rayDir; //射线的入射位置
		float delta = 1./steps;

		vec4 ac = vec4( base, 0.0 );//云雾对象的基颜色

		Smoke s;
		for ( float t = bounds.x; t < bounds.y; t += delta ) {//从入射时间到出射时间之间等距离取多个点
			setPosition(s,p);
			setDensity(s);
			setGrad(s);

			ac.rgb += ( 1.0 - ac.a ) * s.density * s.grad;//反射的光线变多
			ac.a += ( 1.0 - ac.a ) * s.density;//阻光度增加
			// if ( ac.a >= 0.95 ) break;//阻光度过高就可以暂停了
			p += rayDir * delta;//更新光线位置
		}
		color = ac;
		// color.a=color.a*color.a*color.a*color.a*color.a;//color.a*=0.5;
		// if ( color.a == 0.0 ) discard;//如果不透明就不处理这个像素
	}
`;
}