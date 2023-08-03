import * as THREE from "three";
export class CrowdPoints extends THREE.Points{
    constructor(instancedMesh){
        // alert(instancedMesh.name)
        // const vertexShader0 = `
        // void main() {
        //     vec3 pos = position;  
        //     gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        //     gl_PointSize = 6.0;
        // }`
        // const fragmentShader0 = `
        // void main() {
        //     vec3 color = vec3(111./255.,82./255.,73./255.);
        //     gl_FragColor = vec4(color, 1.0);
        // }` 
        // const material = new THREE.ShaderMaterial({
        //     uniforms: {},
        //     vertexShader,
        //     fragmentShader
        //   })
        // console.log("instancedMesh.name",instancedMesh.name)

        let vertexShader=instancedMesh.material.vertexShader
        vertexShader=
            vertexShader.replace( 
                '#include <fog_vertex>', 
                '#include <fog_vertex> \n gl_PointSize = 2.0;' )
        vertexShader=
            vertexShader.replace( 'vertex.position.x*=direction;', '')
        vertexShader=
            vertexShader.replace( 'vertex.position.z*=direction;', '')
        vertexShader=/* glsl */`
            varying float d0;
            in vec3 vViewPosition;
            void main() {
                
                // if(vViewPosition.x==.0)d0=0.5;
                vec3 pos = position;  //计算位置偏移
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = 3.0;
                d0=-dot(modelViewMatrix * vec4(pos, 1.0),vec4(1.))/3000.;
                // if(d0<0.)d0=.5;
            }
        
        `
        let fragmentShader=/* glsl */`
            in vec3 instanceColorOut;
            varying float d0;
            void main() {
                vec3 color = vec3(1.);//100.*instanceColorOut;//vec3(111./255.,82./255.,73./255.);//
                // float distance0=dot(vViewPosition.xyz-vWorldPosition.xyz,vec3(1.));
                if(d0<0.05)return;
                gl_FragColor = vec4(color*d0,1.);
            }
        `
        instancedMesh.material.fragmentShader

        let uniforms={}
        let uniforms0=instancedMesh.material.uniforms
        
        // console.log(uniforms0)
        // var str0=""
        // for(var i in uniform0)str0=str0+"'"+i+"',";
        // console.log(str0)
        const tags=[
            'diffuse','opacity','map','uvTransform','uv2Transform','alphaMap','alphaTest','envMap','flipEnvMap','reflectivity',
            'ior','refractionRatio','aoMap','aoMapIntensity','lightMap','lightMapIntensity','emissiveMap','bumpMap','bumpScale',
            'normalMap','normalScale','displacementMap','displacementScale','displacementBias','roughnessMap','metalnessMap','fogDensity',
            'fogNear','fogFar','fogColor','ambientLightColor','lightProbe','directionalLights','directionalLightShadows','directionalShadowMap',
            'directionalShadowMatrix','spotLights','spotLightShadows','spotLightMap','spotShadowMap','spotLightMatrix','pointLights',
            'pointLightShadows','pointShadowMap','pointShadowMatrix','hemisphereLights','rectAreaLights','ltc_1','ltc_2','emissive',
            'roughness','metalness','envMapIntensity','brightness_specular','sssIntensity','sssIntensity2','CurveFactor','sssLUT',
            'textureData','headUV','bottomUV','time','boneCount','animationCount','animationFrameCount','animationTexture',
            // 'animationTextureLength',
            'cameraPosition'
        ]
        for(let i=0;i< tags.length;i++){
            uniforms[tags[i]]=uniforms0[tags[i]]
        }
        // console.log(uniforms)
        setInterval(()=>{
            if(uniforms.time)uniforms.time.value=uniforms0.time.value
        },0)
        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,//{},//instancedMesh.material.uniforms,
            vertexShader,
            fragmentShader
          })
        material.transparent=true
        const geometry = new THREE.BufferGeometry()  

        super(geometry, material)
        
        const visibleList=instancedMesh.parent.visibleList
        let count=0
        for(let i=0;i<instancedMesh.meshTypeList.length;i++){
            if(visibleList[i]==1)count++
        }
        const positions = new Float32Array(count*3)//instancedMesh.count是总共的化身数量，而不仅仅是可见的化身数量
        const moveMaxLength=new  Float32Array(count)
        const speed=new  Float32Array(count)
        const uv=new  Float32Array(count*2)
        const normal=new  Float32Array(count*3)
        // const instanceColorIn=new  Float32Array(count*3)
        this.positions=positions
        this.moveMaxLength=moveMaxLength
        this.speed=speed
        this.uv=uv
        this.normal=normal
        // this.update(instancedMesh)@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('moveMaxLength', new THREE.BufferAttribute(moveMaxLength, 1))
        geometry.setAttribute('speed', new THREE.BufferAttribute(speed, 1))
        geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
        geometry.setAttribute('normal', new THREE.BufferAttribute(normal, 3))
        // geometry.setAttribute('instanceColorIn', new THREE.BufferAttribute(instanceColorIn, 3))
        
        // console.log("instancedMesh/this",instancedMesh,this)
        // console.log(geometry)
    }
    update(instancedMesh){
        // console.log("instancedMesh",instancedMesh)
        const positions=this.positions
        const moveMaxLength=this.moveMaxLength
        const speed=this.speed
        const normal=this.normal
        const uv=this.uv
        let count=0
        const visibleList=instancedMesh.parent.visibleList
        for(let i=0;i<instancedMesh.meshTypeList.length;i++){
            if(visibleList[i]==1){
                const pos=instancedMesh.parent.getPosition(i)//const pos=instancedMesh.parent.getPosition(i)
                const scale=instancedMesh.parent.getScale(i)
                for(let j=0;j<3;j++){
                    positions[3*count+j] =pos[j]
                    normal[3*count+j] =instancedMesh.geometry.attributes.normal.array[j]
                    // console.log(instancedMesh.parent.instanceColorIn)
                    // instanceColorIn[3*count+j] =instancedMesh.parent.instanceColorIn_All[instancedMesh.meshType].array[j]
                }
                for(let j=0;j<2;j++){
                    uv[2*count+j]=instancedMesh.geometry.attributes.uv.array[j]
                }   
                //
                moveMaxLength[count]=instancedMesh.parent.moveMaxLength.array[i]*scale[0]//getPosition(i)
                speed[count]=instancedMesh.parent.speed.array[i]*scale[0]
                // if(moveMaxLength[count]!==0)alert(moveMaxLength[count])
                count=count+1
            }
        }
    }
    update2(instanced5Object){
        const positions=this.positions
        for(let i=0;i<instanced5Object.count;i++){
                const pos=instanced5Object.getPosition(i)
                for(let j=0;j<3;j++){
                    positions[3*i+j] =pos[j]
                }
        }
    }
    static createPoints(instanced5Object){

        const instancedMesh={
            material:{
                vertexShader:"",
                uniforms:{}
            },
            geometry:{},
            meshTypeList:{length:instanced5Object.count},
            parent:{visibleList: Array.from(Array(instanced5Object.count)).map(() => 1)}
        }
        const crowdPoints=new CrowdPoints(instancedMesh)
        crowdPoints.update2(instanced5Object)
        return crowdPoints
    }
}