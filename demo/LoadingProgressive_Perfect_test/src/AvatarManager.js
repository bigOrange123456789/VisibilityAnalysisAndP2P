import { CrowdManager } from '../../../lib/crowd_sim/CrowdManager.js'
// import { CrowdManager } from '../../lib/crowd_noBS/CrowdManager.js'

// import conifg_woman     from '../../config/avatar/sceneConifg_woman0.json'
// import conifg_woman     from '../../config/avatar/sceneConifg_man02.json'
// import conifg_tree     from '../../config/avatar/tree.json'
import conifg_woman     from '../../../config/avatar/sceneConfig_man_linzhou.json'

import * as THREE from "three"
class Test{
    constructor(avatar){
        this.avatar=avatar
        window.t=this
    }
    init(){
        const i5=this.avatar.crowd
        window.i5=i5
        i5.setScale(0,[10,10,10]);
        window.f=(i,j,k)=>{i5.setPartType(0,'body',i);i5.setPartType(0,'coat',j);i5.setPartType(0,'trousers',k);i5.update();}
        window.f(0,0,0)
        i5.setPartType(0,'hair',0)
        window.camera.position.set(-40.316744366725,  8,  37.8613180818328)
        window.camera.rotation.set(-0.6503317661947894, -0.876727763380061,  -0.5291184829295812)
        const self=this
        const show=(obj)=>{
            obj.visible=true
            if(obj.children)
            for(let i=0;i<obj.children.length;i++){
                show(obj.children[i])
            }
        }
        this.i5=this.avatar.crowd
        // this.i4=this.i5.children[0]
        // this.i3=this.i4.children[0]
        // this.i2=this.i3.children[0]
        this.set5=()=>{
            show(self.i5)
        }
        this.set4=(i0)=>{
            const a=self.i5
            self.i4=a.children[i0]
            for(let i=0;i<a.children.length;i++)a.children[i].visible=(i==i0);
            show(a.children[i0])
        }
        this.set3=(i0)=>{
            const a=self.i4
            self.i3=a.children[i0]
            for(let i=0;i<a.children.length;i++)a.children[i].visible=(i==i0);
            show(a.children[i0])
        }
        this.set2=(i0)=>{
            const a=self.i3
            self.i2=a.children[i0]
            for(let i=0;i<a.children.length;i++)a.children[i].visible=(i==i0);
            show(a.children[i0])
        }
        // this.set4(0)
        this.setMaterial=(i5)=>{
            for(let i4 of i5.children)
                for(let i3 of i4.children)
                    for(let i2 of i3.children)
                        i2.material.side=2;
        }
        this.setMaterial(i5)
        // this.set3(0)
        // this.set2(0)

        // window.i5=
    }
}
export class AvatarManager {
    constructor(scene, camera,posConfig) {
        this.posConfig=posConfig
        // return
        window.scene=scene
        this.scene = scene
        this.camera = camera
        this.assets = {}//为了防止资源重复加载，相同路径的资源只加载一次
        // this.init()
        // window.avatar=new CrowdManager(scene, camera,this.initPos_avatar(),this.getConfig_avatar(),"glb_material")
        window.avatar=new CrowdManager(scene, camera,this.initPos_avatarTest(),this.getConfig_avatar(),"json_material",(crowd,c,scenes)=>{
            function r(arr){
                const randomIndex = Math.floor(Math.random() * arr.length)
                return arr[randomIndex]
            }
            
            for (var i00 = 0; i00 < crowd.count; i00++) {
                // const p=self.poslist[i00]
                // crowd.setPosition(i00,[
                //     p[0],//+(2*Math.random()-1)*5,
                //     p[1],
                //     p[2]//+(2*Math.random()-1)*5
                // ])
                // crowd.setRotation(i00,[0,Math.random()*30,0])
                if(Math.random()>0.3){//if(true){//
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
                    // crowd.setRotation(
                    //     i00,[0,0,0]
                    // )
                }
                
                crowd.setSpeed(i00, 1+8*Math.random())
                crowd.setBodyScale(i00,[
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                    (Math.random()-0.5)/1.5,
                ])
                const kkk=32
                crowd.setTexture(i00, [
                    Math.floor(Math.random()*kkk),
                    Math.floor(Math.random()*kkk),
                    Math.floor(Math.random()*kkk),
                    Math.floor(Math.random()*kkk)
                ])
                const s0=1-0.2+0.2*Math.random()
                crowd.setScale(i00, [
                    2*s0,
                    2*(1-0.3+0.3*Math.random()),
                    2*s0,
                ])
                // crowd.setScale(i00, [
                //     -900,
                //     -900*(1-0.2+0.2*Math.random()),
                //     900])
                // crowd.setScale(i00, [
                //     c.scale,
                //     c.scale*(1-0.2+0.2*Math.random()),
                //     c.scale])
                // crowd.setObesity(i00, 0.8+0.4*Math.random())
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
        })
        window.t=new Test(window.avatar)
        // window.tree=new CrowdManager(scene, camera,this.initPos_tree(),this.getConfig_tree(),"glb_material")
    }
    initPos_subway(){
        this.poslist=[]
        let c={
            "x": [
                -121000,
                117000,
                2000
            ],
            "y": [
                2286,
                2286,
                2000
            ],
            "z": [
                -4000,
                16000,
                2000
            ],
        }
        for(let x=c.x[0];x<=c.x[1];x=x+c.x[2])
            for(let y=c.y[0];y<=c.y[1];y=y+c.y[2])
                for(let z=c.z[0];z<=c.z[1];z=z+c.z[2]){
                    this.poslist.push([x,y,z])
                }

    }
    initPos_avatar(){
        const poslist=[]
        const list=[
            173,182,
        ]

        for(let cid of list){
            const arr=this.posConfig[cid+""]
            if(arr)
            for(let i=0;i<arr.length/2;i++){
                const x=arr[2*i]
                const y=5.5
                const z=arr[2*i+1]
                poslist.push([x,y,z])
            }
        }
        console.log("initPos_avatar",poslist)
        return poslist
    }
    initPos_avatarTest(){
        return [
            [-285.95269775390625,6,218.32791137695312],
            [-285.33740234375,6,221.08370971679688],
            [-309.4652099609375,6,246.4104461669922],
            [-299.6354064941406,6,216.35232543945312],
            [-283.8999938964844,6,250.60000610351562],
            [-283.7325439453125,6,219.4379425048828],
            [-289.5063781738281,6,261.7447814941406],
            [-284.3406677246094,6,200.56495666503906],
            [-259.5779113769531,6,178.1188507080078],
            [-225.1352081298828,6,166.5204315185547],
            [-283.0642395019531,6,222.4715118408203],
            [-308.688720703125,6,198.91307067871094],
            [-228.17825317382812,6,187.5029754638672],
            [-286.31768798828125,6,279.5467224121094],
            [-272.9983825683594,6,240.62742614746094],
            [-279.2871398925781,6,191.10101318359375],
            [-232.09054565429688,6,184.14584350585938],
            [-219.9696044921875,6,222.8343048095703],
            [-270.5052185058594,6,271.94256591796875],
            [-228.67724609375,6,139.8816680908203],
            [-286.82684326171875,6,257.61163330078125],
            [-239.37496948242188,6,241.25621032714844],
            [-223.19073486328125,6,195.17373657226562],
            [-251.70550537109375,6,242.40097045898438],
            [-253.61163330078125,6,244.5153045654297]
        ]
        // const poslist=[]
        // for(let i=0;i<1;i++)
        // for(let j=0;j<1;j++){
        //     poslist.push([
        //         5*(i-0)/3,
        //         5.5,
        //         5*(j-0)/3,
        //     ])
        // }
        // return poslist
        
        const poslist=[]
        for(let i=0;i<100;i++)
        for(let j=0;j<100;j++){
            poslist.push([
                5*(i-50)/3-392+40,
                5.5,
                5*(j-50)/3+195,
            ])
        }
        return poslist

        // const poslist=[]
        // const list=[
        //     171,
        //     173,182
        // ]
        // for(let cid of list){
        //     const arr=this.posConfig[cid+""]
        //     for(let i=0;i<arr.length/2;i++){
        //         const x=arr[2*i  ]+(6*Math.random()-3)
        //         const y=5.5
        //         const z=arr[2*i+1]+(6*Math.random()-3)
        //         for(let i1=0;i1<3;i1++)
        //         for(let i2=0;i2<3;i2++)
        //         //if(-400<x+i1*3&&x+i1*3<0&&-0<z+i2*3&&z+i2*3<400)
        //             poslist.push([x+i1*3,y,z+i2*3])
        //     }
        // }
        // // const a=400,b=400
        // // for(let i=0;i<a;i++)
        // // for(let j=0;j<b;j++){
        // //     const x=5*2*(i-a/2)+(2*Math.random()-1)*5
        // //     const z=5*2*(j-b/2)+(2*Math.random()-1)*5
        // //     // "x": [
        // //     //     -815,879,
        // //     //     11
        // //     // ],
        // //     // "y": [
        // //     //     16,16,
        // //     //     11
        // //     // ],
        // //     // "z": [
        // //     //     -962,1084,
        // //     //     11
        // //     // ],
        // //     if(!(-750<x&&x<750&&-750<z&&z<750))
        // //     // if(!(-15<x&&x<879&&-962<z&&z<1054))
        // //         poslist.push([
        // //             x,
        // //             5.5,
        // //             z,
        // //         ])
        // // }
        // console.log("initPos",poslist)
        // return poslist
    }
    initPos_tree(){
        const poslist=[]
        const list=[
            171
        ]
        for(let cid of list){
            const arr=this.posConfig[cid+""]
            for(let i=0;i<arr.length/2;i++){
                const x=arr[2*i  ]//+(2*Math.random()-1)*25
                const y=5.5
                const z=arr[2*i+1]//+(2*Math.random()-1)*25
                poslist.push([x,y,z])
            }
        }
        console.log("initPos_tree",poslist)
        return poslist
    }
    getConfig_tree(){
        const config=conifg_tree
        for(let i=0;i<config.length;i++){
            let c1=config[i]
            c1.scale=1//2
            
            // c1.lod_distance=[ 5000, 15000, 30000, 60000, 100000 ]
            // c1.lod_geometry=[ 20,  15,   1,    0,   0  ]
            // c1.lod_avatarCount=[ 200, 900, 3240, 8800, 12600]

            // c1.lod_distance=[ 10, 20, 40, 80, 160, 640 ]
            // c1.lod_geometry=[ 20, 19,  15,  6,   3,   1 ]//1
            // //                 .   .    .   .   *   *
            // c1.lod_avatarCount=[ 1500, 3900, 4900, 5900, 6900, 8900]


            
            // for(let i=0;i<c1.lod_distance.length;i++){
            //     c1.lod_distance[i]*=c1.scale
            // }
            const lodConut=21
            const countAll=2500*2
            const distanceAll=200
            c1.lod_distance=[ ]
            c1.lod_geometry=[ ]
            c1.lod_avatarCount=[ ]
            let r_pre=0
            for(let j=0;j<lodConut;j++){
                const r=(j+1)*distanceAll/lodConut
                c1.lod_distance.push(r)
                c1.lod_geometry.push(lodConut-j-1)

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
        }
        // console.log(config)
        return config[0]
    }
    getConfig_avatar20(){
        const config=conifg_woman
        for(let i=0;i<config.length;i++){
            let c1=config[i]
            c1.scale=2
            
            // c1.lod_distance=[ 5000, 15000, 30000, 60000, 100000 ]
            // c1.lod_geometry=[ 20,  15,   1,    0,   0  ]
            // c1.lod_avatarCount=[ 200, 900, 3240, 8800, 12600]

            c1.lod_distance=[ 10, 20, 40, 80, 160, 320 ]
            c1.lod_geometry=[ 19, 15,  7,  2,   1,   0 ]
            c1.lod_avatarCount=[ 500, 500, 500, 500, 500, 500]
            
            const lodConut=20
            const countAll=2500
            const distanceAll=200
            c1.lod_distance=[ ]
            c1.lod_geometry=[ ]
            c1.lod_avatarCount=[ ]
            let r_pre=0
            for(let j=0;j<lodConut;j++){
                const r=(j+1)*distanceAll/lodConut
                c1.lod_distance.push(r)
                c1.lod_geometry.push(lodConut-j)

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
                    c1.lod_visible[j][tag]=20
                }
            }
        }
        console.log(config)
        return config[0]
    }
    getConfig_avatar_lod8(){
        const config=conifg_woman
        for(let i=0;i<config.length;i++){
            let c1=config[i]
            c1.scale=2
            
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
            c1.lod_distance[c1.lod_distance.length-2]*=2*2
            c1.lod_distance[c1.lod_distance.length-1]*=4*2
        }
        // console.log(config)
        return config[0]
    }
    getConfig_avatar(){
        const config=conifg_woman
        for(let i=0;i<config.length;i++){
            let c1=config[i]
            c1.scale=2
            
            // c1.lod_distance=[ 5000, 15000, 30000, 60000, 100000 ]
            // c1.lod_geometry=[ 20,  15,   1,    0,   0  ]
            // c1.lod_avatarCount=[ 200, 900, 3240, 8800, 12600]

            // c1.lod_distance=[ 10, 20, 40, 80, 160, 320 ]
            // c1.lod_geometry=[ 20, 15,  7,  2,   1,   0 ]
            // c1.lod_avatarCount=[ 500, 500, 500, 500, 500, 500]
            
            const lodConut=3//21
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
            c1.lod_distance[c1.lod_distance.length-2]*=2*3
            c1.lod_distance[c1.lod_distance.length-1]*=4*2
        }
        // console.log(config)
        return config[0]
    }


}