// import { CrowdManager } from '../../../lib/crowd/CrowdManager.js'
import { Template } from './crowd/Template_sim2.js'
const CrowdManager=Template
import conifg_woman     from '../../../config/avatar/sceneConifg_woman0.json'

// import { Template } from '../../../lib/crowd/Template_sim.js'
// const CrowdManager=Template
// import conifg_woman     from '../../../config/avatar/sceneConfig_man_linzhou2.json'

// import conifg_woman     from '../../config/avatar/sceneConifg_man02.json'
// import conifg_tree     from '../../config/avatar/tree.json'
import { FindPath } from './FindPath/FindPath.js'
import * as THREE from "three"
export class AvatarManager {
    constructor(scene, camera,posConfig,Engine3D) {
        this.Engine3D=Engine3D
        // CrowdManager=Engine3D.Template_sim2
        this.posConfig=posConfig
        // return
        window.scene=scene
        this.scene = scene
        this.camera = camera
        this.assets = {}//为了防止资源重复加载，相同路径的资源只加载一次
        // this.init()
        // window.avatar=new CrowdManager(scene, camera,this.initPos_avatar(),this.getConfig_avatar(),"glb_material")
        window.avatar=new CrowdManager(scene, camera,this.initPos_avatarTest(),this.getConfig_avatar(),"glb_material",(crowd,c,scenes)=>{
            function r(arr){
                const randomIndex = Math.floor(Math.random() * arr.length)
                return arr[randomIndex]
            }
            
            for (var i00 = 0; i00 < crowd.count; i00++) {
                crowd.setRotation(
                    i00,[0,Math.random()*3.1*2,0]
                )
                if(true){//if(Math.random()>0.3){//
                    crowd.setAnimation(
                        i00,
                        r(c.standAnimationList),
                        Math.random()*10000
                    )
                    
                }else{
                    crowd.setAnimation(
                        i00,
                        r(c.walkAnimationList),
                        Math.random()*10000
                    )
                    crowd.setMoveMaxLength(
                        i00,
                        (0.5+Math.random())*10
                    )
                    crowd.setRotation(
                        i00,[0,0,0]
                    )
                }
                crowd.setSpeed(i00, 1+8*Math.random())
                crowd.setBodyScale(i00,[
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                ])
                let flag=true
                if(c.constraint){
                    const i000 = Math.floor(Math.random() * c.constraint.length)
                    const constraint0=c.constraint[i000]
                    for(let partName in constraint0)
                        crowd.setPartType(i00,partName,constraint0[partName])
                    if(i000>=3)flag=false
                }
                if(flag){
                    let j=10
                    crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_kuzi_geo")
                    // crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_shangyi_geo")
                    crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_waitao_geo1")
                    crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_xiezi_geo")

                    j=-0.3
                    crowd.setColor(i00,[j*Math.random(),j*Math.random(),j*Math.random()],"qipao22")
                    crowd.setColor(i00,[j*Math.random(),j*Math.random(),j*Math.random()],"waitao1")

                    j=0.1
                    crowd.setColor(i00,[j*Math.random(),j*Math.random(),j*Math.random()],"CloW_C_qunzi_geo3456")
                    crowd.setColor(i00,[j*Math.random(),j*Math.random(),j*Math.random()],"CloW_C_shangyi_geo")

                }
                
            }
            for(let i=0;i<scenes.length;i++){
                scenes[i].traverse(node=>{
                    if(node instanceof THREE.SkinnedMesh){
                        node.material=node.material.clone()
                        let material=node.material
                        let name=node.name
                        let meshType=c['meshType'][i][name]
                        if(meshType=='body'||meshType=='head'){
                            material.color.r-=0.6
                            material.color.g-=0.6
                            material.color.b-=0.6
                            // material.roughness=0//-=0.6
                            // material.metalness=0//+=0.2
                            // material.envMapIntensity=0
                            // material.emissiveIntensity=0
                            // material.lightMapIntensity=0
                        }else if(meshType=='hair'){
                            material.side=2
                            // material.color.r=1000;
                            material.metalness=0.5
                            material.roughness=0.5
                        }else if(meshType=="eye"){
                            material.metalness=1
                            material.roughness=0.5
                        }else if(meshType=="trousers"||meshType=="coat"){
                            material.metalness=1
                            // material.roughness-=0.5
                            material.color.r=material.color.g=material.color.b=1

                            material.envMapIntensity=1
                            material.emissiveIntensity=1
                            material.lightMapIntensity=1
                        }else if(meshType=="shoes"){
                            material.metalness=1
                            material.roughness=0.5
                        }
                    }
                })
            }
            crowd.update()
            window.fp=new FindPath(crowd)
        },
        this.Engine3D
        )
    }
    initPos_avatarTest(){
        // const poslist=[]
        // for(let i=0;i<100;i++)
        // for(let j=0;j<100;j++){
        //     poslist.push([
        //         5*(i-50)/3,
        //         48,
        //         5*(j-50)/3,
        //     ])
        // }
        // return poslist
        const arr=[
            [9.401352279000676,-53.919369991442025],
            [-1.3401614984055925,-50.88549107870462],
            [8.64432479869295,-40.69571426805416],[5.822456719402155,-34.63120099354046],
            [9.865616104893164,-15.531480892971757],[5.1544829519191495,-20.255303318333546],
            [42.89286874823276,33.13281422650013],
            [-8.33280190319715,13.573104320685104],

            [-12.306725271469759,21.528074988618968],[-15.493936733543848,21.184965803600633],
            [-14.800333037373534,25.741031050020325],[-10.156258068904336,29.41631109993675],
            [-13.238721508333626,30.91517199140445],[12.550835763709586,13.778594112992764],
            [11.959905857695276,7.695540898943264],[14.454629275020466,37.33673948562563],
            [-43.742833605821005,10.245196030741567],[-46.245462075015695,20.264089833475765]
        ]
        const poslist=[]
        for(let i=0;i<arr.length;i++){
            poslist.push([
                arr[i][0],
                48,
                arr[i][1],
            ])
        }
        for(let i=0;i<arr.length;i++){
            poslist.push([
                arr[i][0]+1.5,
                48,
                arr[i][1]+0.5,
            ])
        }
        return poslist
        // return [
        //     poslist[0]
        // ]

    }
    getConfig_avatar(){
        const config=conifg_woman
        for(let i=0;i<config.length;i++){
            let c1=config[i]
            c1.scale=2.//1.//2
            
            // c1.lod_distance=[ 5000, 15000, 30000, 60000, 100000 ]
            // c1.lod_geometry=[ 20,  15,   1,    0,   0  ]
            // c1.lod_avatarCount=[ 200, 900, 3240, 8800, 12600]

            // c1.lod_distance=[ 10, 20, 40, 80, 160, 320 ]
            // c1.lod_geometry=[ 20, 15,  7,  2,   1,   0 ]
            // c1.lod_avatarCount=[ 500, 500, 500, 500, 500, 500]
            
            const lodConut=7//21
            const countAll=2500*2*10
            const distanceAll=200*0.8*0.25//300
            c1.lod_distance=[ ]
            c1.lod_geometry=[ ]
            c1.lod_avatarCount=[ ]
            let r_pre=0
            for(let j=0;j<lodConut;j++){
                const r=Math.pow((j+1)/lodConut,1.2)*distanceAll
                c1.lod_distance.push(r)
                // c1.lod_geometry.push(lodConut-j-1)
                c1.lod_geometry.push((lodConut-j)*3-3)

                const n=countAll*[Math.pow(r,2)-Math.pow(r_pre,2)]/Math.pow(distanceAll,2)
                r_pre=r
                c1.lod_avatarCount.push(Math.ceil(n))
            }
            for(let i=0;i<c1.lod_distance.length;i++){
                c1.lod_distance[i]*=c1.scale
            }
            // console.log(c1)
            for(let j=0;j<c1.lod_visible.length;j++){
                for(let tag in c1.lod_visible[j]){
                    c1.lod_visible[j][tag]=lodConut
                }
            }
            c1.lod_distance[c1.lod_distance.length-2]*=2
            c1.lod_distance[c1.lod_distance.length-1]*=4*2
        }
        config[0].useInstancedBuffer={
            //type,itemSize
            // textureType:[Uint8Array,4],//null,
            // bodyScale:false,//null,//
            moveMaxLength:false,
            
            // speed:[Float32Array,1],
            // animationIndex:false,//[Uint8Array,1],
            // animationStartTime:[Float32Array,1],
    
            obesity:false,//[Float32Array,1],//
        }
        // console.log(config)
        return config[0]
    }


}