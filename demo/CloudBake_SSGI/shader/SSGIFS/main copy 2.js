export const fs =
/* glsl */`   
    varying vec3 vNormal;
    uniform sampler2D mytex0;
    uniform sampler2D mytex1;
    uniform sampler2D mytex2;
    uniform sampler2D mytex3;
    uniform sampler2D mytex4;

    vec3 getXYZ(sampler2D tex,float u,float v){
        float px=u;//(u+0.5);
        float py=1.-v;//(y+0.5);
        vec3 result= texture(tex, vec2(px,py)).xyz;
        return result;
    }
    float getSH_base(int i){
        vec3 w = normalize(vNormal);
        float x=w.x,y=w.y,z=w.z;
        float pi=3.1415926535897932f;
        if(i==0)return 0.5*sqrt(1./pi);
        
        else if(i==1)return -sqrt(3./(4.*pi))*y ;
        else if(i==2)return sqrt(3./(4.*pi))*z ;
        else if(i==3)return -sqrt(3./(4.*pi))*x ;

        else if(i==4)return 0.5*sqrt(15./pi)*x*y ;
        else if(i==5)return -0.5*sqrt(15./pi)*y*z ;
        else if(i==6)return 0.25*sqrt(5./pi)*(3.*z*z-1.) ;
        else if(i==7)return -0.5*sqrt(15./pi)*x*z ;
        else if(i==8)return 0.25*sqrt(15./pi)*(x*x-y*y) ;

        else return 0.;
    }
    vec3 getShColor(float u,float v){
        float sh0=getSH_base(0);
        float sh1=getSH_base(1);
        float sh2=getSH_base(2);
        float sh3=getSH_base(3);
        vec3 a0=getXYZ(mytex0,u,v);
        vec3 a1=getXYZ(mytex1,u,v);
        vec3 a2=getXYZ(mytex2,u,v);
        vec3 a3=getXYZ(mytex3,u,v);
        return sh0*a0+sh1*a1+sh2*a2+sh3*a3;//data += result[index]*SH(l, m, theta, phi);
    }
    
    uniform float screenWidth;
    uniform float screenHeight;
	void main(void)
    {
		vec2 _screenPosition = gl_FragCoord.xy/vec2(screenWidth,screenHeight);//当前像素的位置
        float u=_screenPosition.x;
		float v=_screenPosition.y;
        gl_FragColor = vec4(3.*getShColor(u,v),1.0f);
    }
`