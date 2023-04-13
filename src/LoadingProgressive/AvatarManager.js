import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Crowd } from '../../lib/crowd/Crowd.js'//let Crowd=Pack// 
export class AvatarManager {
    constructor(scene, camera) {
        window.scene=scene
        this.scene = scene
        this.camera = camera
        this.assets = {}//为了防止资源重复加载，相同路径的资源只加载一次
        // this.row_index = 0; //在梯形看台中计算当前人物所在看台行数(貌似含义和小看台中正好相反)
        // this.sum_count = 0; //当前row_index前面行的人数总和
        // this.row_count = 0; //当前行的可放置人数
        this.initPos()
        this.init()
    }
    initPos(){
        const c={
            "x": [
                -121000,
                117000,
                2000
            ],
            "y": [
                2286.5,
                2286.5,
                2000
            ],
            "z": [
                -4000,
                16000,
                2000
            ]
        }
        this.poslist=[]
        for(let x=c.x[0];x<=c.x[1];x=x+c.x[2])
            for(let y=c.y[0];y<=c.y[1];y=y+c.y[2])
                for(let z=c.z[0];z<=c.z[1];z=z+c.z[2]){
                    this.poslist.push([x,y,z])
                }

    }
    getConfig(){
        const c1={ 
            "path": [
                "assets/sim/woman01/"
            ],
            "pathTexture":[
                "./assets/textures_sim1/woman01/"
            ],
            "meshType":[
                {
    
                    "CloW_A_body_geo": "coat",
                    "CloW_A_kuzi_geo": "trousers",
                    "CloW_A_shangyi_geo": "coat",
                    "CloW_A_waitao_geo1": "coat",
                    "CloW_A_xiezi_geo": "xiezi",
                    "CloW_E_eyeLeft_geo02": "eye",
                    "CloW_E_eyeRight_geo01": "eye",
                    "eyelash": "eyelash",
                    "hair": "hair",
                    "head": "head",
                    "teeth": null
                }
            ],
            "lod_visible": [
                {
                    "CloW_A_kuzi_geo": 5,
                    "CloW_A_shangyi_geo": 4,
                    "head":4,
                    "CloW_A_body_geo": 3,
                    "CloW_A_waitao_geo1": 3,
                    "CloW_A_xiezi_geo": 3,
                    "CloW_E_eyeLeft_geo02": 2,
                    "CloW_E_eyeRight_geo01": 2,
                    "eyelash": 2,
                    "hair": 3
                }
            ],
            "useColorTag": [
                "CloW_A_kuzi_geo",
                // "CloW_A_shangyi_geo",
                "CloW_A_waitao_geo1",
                // "CloW_A_xiezi_geo"
            ],
            "walkAnimationList": [
                5,8
            ],
            "sitAnimationList": [
            ],
            "standAnimationList": [
                0,1,2,3,4,6,7,9,10,11,12
            ],
            "pathAnima":  "assets/animation_woman0.bin" ,

            "lod_distance":[ 5000, 15000, 30000, 60000, 100000 ],
            "lod_geometry":    [ 20,  15,   1,    0,   0  ],
            "lod_avatarCount": [ 200, 900, 3240, 8800, 12600]
        }
        const c0={
            "path": [
                "assets/sim/man02/"
            ],
            "pathTexture":["./assets/textures_sim1/man02/"],
            "meshType":[{
                CloM_B_body_geo: "body",
                CloM_B_chenshan_geo: "coat",
                CloM_B_eyeLeft_geo1: "eye",
                CloM_B_eyeRight_geo1: "eye",
                CloM_B_kuzi_geo: "coat",
                CloM_B_waitao_geo: "coat",
                CloM_B_xie_geo: "shoes",
                eyelash: "eyelash",
                hair: "hair",
                head: "head",
                teeth: null
            }],
            "lod_visible": [{
                CloM_B_body_geo: 3,
                CloM_B_chenshan_geo: 3,
                CloM_B_eyeLeft_geo1: 2,
                CloM_B_eyeRight_geo1: 2,
                CloM_B_kuzi_geo: 4,
                CloM_B_waitao_geo: 5,
                CloM_B_xie_geo: 3,
                eyelash: 2,
                hair: 3,
                head: 4,
            }],
            "useColorTag": ["CloM_B_kuzi_geo", "CloM_B_waitao_geo"],
            "walkAnimationList": [
                5,8
            ],
            "sitAnimationList": [
            ],
            "standAnimationList": [
                0,1,2,3,4,6,7,9,10,11,12
            ],
            "pathAnima":  "assets/animation_man02.bin",


            // "lod_distance":[ 5000, 15000, 30000, 60000, 100000 ],
            // "lod_geometry":    [ 20,  15,   1,    0,   0  ],
            // "lod_avatarCount": [ 200, 900, 3240, 8800, 12600]
            "lod_distance":[ 100000 ],
            "lod_geometry":    [ 20 ],
            "lod_avatarCount": [ 200]
        }
        return c1
    }
    init() {
        function r(arr){
            const randomIndex = Math.floor(Math.random() * arr.length)
            return arr[randomIndex]
        }
        const c=this.getConfig()
        const self = this
        new GLTFLoader().load(c.path+"sim.glb", async (glb0) => {
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
                    p[0]+(2*Math.random()-1)*500,
                    p[1]-2000,
                    p[2]+(2*Math.random()-1)*500])
                crowd.setRotation(i00,[0,Math.random()*30,0])
                crowd.setAnimation(
                    i00,
                    r(c.standAnimationList),
                    Math.random()*10000
                    )
                crowd.setSpeed(i00, 1+4*Math.random())
                crowd.setScale(i00, [
                    700,
                    700*(1-0.2+0.2*Math.random()),
                    700])
                crowd.setObesity(i00, 0.8+0.4*Math.random())
                const j=10
                crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_kuzi_geo")
                crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_waitao_geo1")
            }
            crowd.init(scenes)
            self.scene.add(crowd)
            // crowd.visible=false
            // self.scene.add(crowd.CrowdPoints)
        }
    }




}