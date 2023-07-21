import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Crowd } from '../../lib/crowd/Crowd.js'//let Crowd=Pack// 
import conifg_woman01     from '../../config/avatar/sceneConifg_woman01.json';
import * as THREE from "three"
export class AvatarManager {
    constructor(scene, camera) {
        // return
        window.scene=scene
        this.scene = scene
        this.camera = camera
        this.assets = {}//为了防止资源重复加载，相同路径的资源只加载一次
        // this.row_index = 0; //在梯形看台中计算当前人物所在看台行数(貌似含义和小看台中正好相反)
        // this.sum_count = 0; //当前row_index前面行的人数总和
        // this.row_count = 0; //当前行的可放置人数
        this.initPos()//this.initPos_test()//this.initPos_old()
        this.init()//this.init_test()//
    }
    initPos_old(){
        this.poslist=[]
        let c={
            "x": [
                -124000,
                126000,
                2000
            ],
            "y": [
                -1530.26+3000,
                -1530.26+3000,
                2000
            ],
            "z": [
                -3000,
                        15000,
                        2000
            ],
        }
        for(let x=c.x[0];x<=c.x[1];x=x+c.x[2])
            for(let y=c.y[0];y<=c.y[1];y=y+c.y[2])
                for(let z=c.z[0];z<=c.z[1];z=z+c.z[2]){
                    this.poslist.push([x,y,z])
                }
                
                c={
                    "x": [
                        -124000,
                        126000,
                        2000
                    ],
                    "y": [
                        -7430.26+4000,
                        -7430.26+4000,
                        2000
                    ],
                    "z": [
                        -3000,
                        15000,
                        2000
                    ],
                }
                for(let x=c.x[0];x<=c.x[1];x=x+c.x[2])
                    for(let y=c.y[0];y<=c.y[1];y=y+c.y[2])
                        for(let z=c.z[0];z<=c.z[1];z=z+c.z[2]){
                            this.poslist.push([x,y,z])
                        }
            
                        c={
                            "x": [
                                -124000,
                                126000,
                                2000
                            ],
                            "y": [
                                -12230.26+3500,
                                -12230.26+3500,
                                2000
                            ],
                            "z": [
                                -3000,
                                15000,
                                2000
                            ],
                        }
                        for(let x=c.x[0];x<=c.x[1];x=x+c.x[2])
                            for(let y=c.y[0];y<=c.y[1];y=y+c.y[2])
                                for(let z=c.z[0];z<=c.z[1];z=z+c.z[2]){
                                    this.poslist.push([x,y,z])
                                }

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
    initPos(){
        this.poslist=[]
        let c={
            "x": [
                -100,
                100,
                5
            ],
            // "y": [
            //     0,
            //     1,
            //     1
            // ],
            "z": [
                -100,
                100,
                5
            ],
        }
        // for(let x=c.x[0];x<=c.x[1];x=x+c.x[2])
        //         for(let z=c.z[0];z<=c.z[1];z=z+c.z[2]){
        //             this.poslist.push([x,5.5,z])
        //         }
        for(let x=0;x<40;x++)
                for(let z=0;z<=40;z++){
                    this.poslist.push([(x-4*5)*20,5.5,(z-4*5)*20])
                }
        // this.poslist=[
        //     [0,10,0]
        // ]
        console.log(this.poslist)

    }
    initPos_test(){
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
    getConfig(){
        const config=conifg_woman01
        for(let i=0;i<config.length;i++){
            let c1=config[i]

            // for(let j=0;j<c1.path.length;j++)
            //     c1.path[j]       =c1.path[j].replace(new RegExp("assets/","gm"),"assets/avatar/")
            // for(let j=0;j<c1.pathTexture.length;j++)
            //     c1.pathTexture[j]=c1.pathTexture[j].replace(new RegExp("assets/","gm"),"assets/avatar/")
            // c1.pathAnima=c1.pathAnima.replace(new RegExp("assets/","gm"),"assets/avatar/")
            
            c1.lod_distance=[ 5000, 15000, 30000, 60000, 100000 ]
            c1.lod_geometry=[ 20,  15,   1,    0,   0  ]
            c1.lod_avatarCount=[ 200, 900, 3240, 8800, 12600]

            c1.lod_distance=[ 5000, 15000, 30000, 60000, 100000 ]
            c1.lod_geometry=[ 20,  15,   1,    0,   0  ]
            c1.lod_avatarCount=[ 1640, 900/2, 3240/2, 8800/2, 12600/2]
        }
        console.log(config)
        return config[0]
    }
    init() {
        function r(arr){
            const randomIndex = Math.floor(Math.random() * arr.length)
            return arr[randomIndex]
        }
        const c=this.getConfig()
        const self = this
        new GLTFLoader().load(c.path+"sim.glb", async (glb0) => {
            glb0.scene.traverse(o=>{
                if(o instanceof THREE.Mesh){
                    // console.log(o.material)
                    o.material.metalness=0.5
                    o.material.roughness=0//0.5
                    // console.log(o.name)
                    if(o.name=="CloW_A_xiezi_geo")o.visible=false
                    if(
                        //o.name=="head"||
                    // o.name=="CloW_A_body_geo"
                    o.name=="hair"
                    ){
                        o.material.side=2
                        // console.log(o)
                        //o.material.scattering=true
                    }
                    if(
                        o.name=="CloM_B_body_geo2"||
                        o.name=="CloM_C_head_geo"
                    ){
                        o.material.scattering=true
                    }
                    // if(o.name=="CloW_C_body_geo1"){
                    //     o.material.color.r=0.7
                    //     o.material.color.g=1.
                    //     o.material.color.b=1.

                    // }
                }
            })
            process([glb0.scene],0)
        })
        function process(scenes){
            var crowd = new Crowd({
                camera: self.camera,
                assets: {},
                animPathPre: c.pathAnima,

                count: self.poslist.length,
                lod_avatarCount:  c.lod_avatarCount,
                lod_distance:  c.lod_distance,
                lod_geometry:  c.lod_geometry,
                lod_visible: c.lod_visible,
                meshType: c.meshType,
                pathLodGeo: [c.path+"LOD/"],
                pathTexture: c.pathTexture,
                pathTextureConfig: [c.path+"texture_names.json"],
                useColorTag:  c.useColorTag
            })
            for (var i00 = 0; i00 < crowd.count; i00++) {
                const p=self.poslist[i00]//[i00*1500-50,100,0]
                // crowd.setPosition(i00,[
                //     p[0]+(2*Math.random()-1)*500,
                //     p[1]-2000,
                //     p[2]+(2*Math.random()-1)*500])
                crowd.setPosition(i00,[
                    p[0]+(2*Math.random()-1)*5,
                    p[1],
                    p[2]+(2*Math.random()-1)*5
                ])
                crowd.setRotation(i00,[0,Math.random()*30,0])
                crowd.setAnimation(
                    i00,
                    r(c.standAnimationList),
                    Math.random()*10000
                    )
                crowd.setSpeed(i00, 1+4*Math.random())
                // crowd.setScale(i00, [
                //     -900,
                //     -900*(1-0.2+0.2*Math.random()),
                //     900])
                crowd.setScale(i00, [
                    2,
                    2,//*(1-0.2+0.2*Math.random()),
                    2])
                crowd.setObesity(i00, 0.8+0.4*Math.random())
                const j=10
                crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_kuzi_geo")
                crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_waitao_geo1")
            }
            crowd.init(scenes)
            window.crowd=crowd
            self.scene.add(crowd)
            // crowd.visible=false
            // self.scene.add(crowd.CrowdPoints)
        }
    }
    init_test() {
        window.camera.position.set( -112955.14889055162,  -1060.26,  15389.89423682258)
        window.camera.position.set( -112769.81911025316,  -460.26,  15631.057800327242)
        window.camera.rotation.set(2.9971475897725877,  0.019309738726166568,  -3.1387840775235243)

        window.camera.position.set(-113613.07101287028,  -1310.26,  13639.167352406446)
        window.camera.rotation.set( 2.798170084677891,  -0.25254251780158277,  3.052478889142581)

        window.camera.position.set(-113316.52150201441,  -1220.26,  14942.784975382892)
        window.camera.rotation.set(2.9596643731833536,  -0.24159278294367525,  3.0976081453913644)
        function r(arr){
            const randomIndex = 1//Math.floor(Math.random() * arr.length)
            return arr[randomIndex]
        }
        const c=this.getConfig1()
        const self = this
        new GLTFLoader().load(c.path+"sim.glb", async (glb0) => {
            glb0.scene.traverse(o=>{
                if(o instanceof THREE.Mesh){
                    // console.log(o.material)
                    o.material.metalness=0
                    o.material.roughness=1
                    console.log(o.name)
                    if(o.name=="CloW_A_xiezi_geo")o.visible=false
                    if(
                        //o.name=="head"||
                    // o.name=="CloW_A_body_geo"
                    o.name=="hair"
                    ){
                        o.material.side=2
                        // console.log(o)
                        //o.material.scattering=true
                    }
                    if(
                        o.name=="CloM_B_body_geo2"||
                        o.name=="CloM_C_head_geo"
                    ){
                        o.material.scattering=true
                    }
                    // if(o.name=="CloW_C_body_geo1"){
                    //     o.material.color.r=0.7
                    //     o.material.color.g=1.
                    //     o.material.color.b=1.

                    // }
                }
            })
            process([glb0.scene],0)
        })
        function process(scenes){
            var crowd = new Crowd({
                camera: self.camera,
                assets: {},
                animPathPre: c.pathAnima,

                count: self.poslist.length,
                lod_avatarCount:  c.lod_avatarCount,
                lod_distance:  c.lod_distance,
                lod_geometry:  c.lod_geometry,
                lod_visible: c.lod_visible,
                meshType: c.meshType,
                pathLodGeo: [c.path+"LOD/"],
                pathTexture: c.pathTexture,
                pathTextureConfig: [c.path+"texture_names.json"],
                useColorTag:  c.useColorTag
            })
            for (var i00 = 0; i00 < crowd.count; i00++) {
                const p=self.poslist[i00]//[i00*1500-50,100,0]
                crowd.setPosition(i00,[
                    p[0],
                    p[1]-2000,
                    p[2]])
                crowd.setRotation(i00,[0,0.1*Math.PI,0])
                crowd.setAnimation(
                    i00,
                    r(c.standAnimationList),
                    0.1*i00
                    )
                crowd.setSpeed(i00, 0)
                crowd.setScale(i00, [
                    -900,
                    -900*(1-0.2+0.1),
                    900])
                crowd.setObesity(i00, 0.8+0.2)
                const j=10
                crowd.setColor(i00,[j,j,j],"CloW_A_kuzi_geo")
                crowd.setColor(i00,[j,j,j],"CloW_A_waitao_geo1")
            }
            crowd.init(scenes)
            self.scene.add(crowd)
            // crowd.visible=false
            // self.scene.add(crowd.CrowdPoints)
        }
    }




}