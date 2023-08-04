import { CrowdManager } from '../../lib/crowd/CrowdManager.js'
import conifg_woman     from '../../config/avatar/sceneConifg_woman02.json'
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
        window.avatar=new CrowdManager(scene, camera,this.initPos_avatarTest(),this.getConfig_avatar(),"glb_material")
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
        for(let i=0;i<20;i++)
        for(let j=0;j<20;j++){
            poslist.push([
                5*2*(i-10),
                5.5,
                5*2*(j-10),
            ])
        }
        return poslist
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
            c1.scale=2
            
            // c1.lod_distance=[ 5000, 15000, 30000, 60000, 100000 ]
            // c1.lod_geometry=[ 20,  15,   1,    0,   0  ]
            // c1.lod_avatarCount=[ 200, 900, 3240, 8800, 12600]

            c1.lod_distance=[ 10, 20, 40, 80, 160, 640 ]
            c1.lod_geometry=[ 20, 19,  15,  6,   3,   1 ]//1
            //                 .   .    .   .   *   *
            c1.lod_avatarCount=[ 1500, 3900, 4900, 5900, 6900, 8900]


            
            for(let i=0;i<c1.lod_distance.length;i++){
                c1.lod_distance[i]*=c1.scale
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
            c1.scale=2
            
            // c1.lod_distance=[ 5000, 15000, 30000, 60000, 100000 ]
            // c1.lod_geometry=[ 20,  15,   1,    0,   0  ]
            // c1.lod_avatarCount=[ 200, 900, 3240, 8800, 12600]

            c1.lod_distance=[ 10, 20, 40, 80, 160, 320 ]
            c1.lod_geometry=[ 20, 15,  7,  2,   1,   0 ]
            c1.lod_avatarCount=[ 500, 500, 500, 500, 500, 500]
            
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


}