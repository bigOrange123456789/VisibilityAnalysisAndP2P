import { CrowdManager } from '../../lib/crowd/CrowdManager.js'
import conifg_woman     from '../../config/avatar/sceneConifg_woman01.json'
import conifg_tree     from '../../config/avatar/tree.json'

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
        window.avatar=new CrowdManager(scene, camera,this.initPos_avatarTest(),this.getConfig_avatar(),"json_material",(crowd,c)=>{
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
                if(Math.random()>0.3){
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
                // crowd.setScale(i00, [
                //     -900,
                //     -900*(1-0.2+0.2*Math.random()),
                //     900])
                // crowd.setScale(i00, [
                //     c.scale,
                //     c.scale*(1-0.2+0.2*Math.random()),
                //     c.scale])
                // crowd.setObesity(i00, 0.8+0.4*Math.random())
                // let j=100
                // // crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_kuzi_geo")
                // // crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_waitao_geo1")
                // crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_C_qunzi_geo3456")
                // j=-0.5
                // crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_C_shangyi_geo")
            }
        })
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
        const poslist=[]
        for(let i=0;i<1000;i++)
        for(let j=0;j<1000;j++){
            poslist.push([
                3*(i-500),
                5.5,
                3*(j-500),
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
    getConfig_avatar(){
        const config=conifg_woman
        for(let i=0;i<config.length;i++){
            let c1=config[i]
            c1.scale=1
            
            // c1.lod_distance=[ 5000, 15000, 30000, 60000, 100000 ]
            // c1.lod_geometry=[ 20,  15,   1,    0,   0  ]
            // c1.lod_avatarCount=[ 200, 900, 3240, 8800, 12600]

            c1.lod_distance=[ 10, 20, 40, 80, 160, 320 ]
            c1.lod_geometry=[ 20, 15,  7,  2,   1,   0 ]
            c1.lod_avatarCount=[ 500, 500, 500, 500, 500, 500]
            
            const lodConut=21
            const countAll=2500*2*10
            const distanceAll=200//300
            c1.lod_distance=[ ]
            c1.lod_geometry=[ ]
            c1.lod_avatarCount=[ ]
            let r_pre=0
            for(let j=0;j<lodConut;j++){
                const r=Math.pow((j+1)/lodConut,5.5)*distanceAll
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


}