import {GLTFLoader} from "../../lib/threejs/GLTFLoader"
import { Crowd } from '../../lib/crowd/Crowd.js'//let Crowd=Pack// 
import * as THREE from "three";
import { modelManager } from "./modelManager.js";
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
    async init() {
        var pathAnima = "assets/animation_man_A.bin"

        this.modelManager = new modelManager();

        if(false){
            this.load_model()
        }else{
            this.test()
        }
        // new UI(this.scene, new THREE.Object3D())
    }
    test() {
        // this.camera.position.set(1000,0,0)
        // this.camera.lookAt(new THREE.Vector3(0,0,0))
        // const geometry = new THREE.SphereGeometry( 15, 32, 16 );
        // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        // const sphere = new THREE.Mesh( geometry, material );
        // this.scene.add( sphere );
        var self = this
        new GLTFLoader().load("assets/sim/man02/sim.glb", async (glb0) => {
            process([glb0.scene],0)
        })
        function process(scenes){
            var crowd = new Crowd({
                camera: self.camera,
                assets: {},

                animPathPre: "assets/animation_man02.bin",
                // assets: {assets/animation_man02.bin: {…}}
                count: self.poslist.length,
                lod_avatarCount:  [200, 900, 3240, 8800, 12600],
                lod_distance:  [5000, 15000, 30000, 60000, 100000],
                lod_geometry:  [20, 15, 1, 0, 0],
                lod_visible: [{
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
                meshType: [{
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
                pathLodGeo: ["assets/sim/man02/LOD/"],
                pathTexture: ["./assets/textures_sim1/man02/"],
                pathTextureConfig: ["assets/sim/man02/texture_names.json"],
                useColorTag:  ["CloM_B_kuzi_geo", "CloM_B_waitao_geo"],
            })
            for (var i00 = 0; i00 < crowd.count; i00++) {
                const p=self.poslist[i00]//[i00*1500-50,100,0]
                crowd.setPosition(i00,[
                    p[0]+Math.random()*500,
                    p[1]-2000,
                    p[2]+Math.random()*500])
                crowd.setRotation(i00,[0,Math.random()*3,0])
                crowd.setSpeed(i00, 0.8+0.4*Math.random())
                crowd.setScale(i00, [700,700,700])
                crowd.setObesity(i00, 0.8+0.4*Math.random())
            }
            crowd.init(scenes)
            self.scene.add(crowd)
            self.scene.add(crowd.CrowdPoints)
        }
            
        
    }
    materialSet(glb){
        console.log(glb)
        glb.scene.traverse(node => {
            if (node instanceof THREE.Mesh || node instanceof THREE.SkinnedMesh) {
                let name = node.name
                console.log(name)
                node.material.envMapIntensity = 0.1
                node.material.roughness = 0.5//0.5
                node.material.metalness=0.1

                if(name=="CloM_A_Hair_geo"){//man_A
                    node.material.color.r=20
                    node.material.color.g=20
                    node.material.color.b=20
                    node.material.transparent=true
                    node.material.alphaTest = 0.7;
                    node.material.depthWrite = true;
                    node.material.side=THREE.DoubleSide

                    node.material.roughness = 0.9
                    node.material.envMapIntensity = 0.1
                    node.material.metalness=1
                }
                if(name=="CloW_A_hair_geo"){//man_b
                    node.material.color.r=10
                    node.material.color.g=10
                    node.material.color.b=10
                    node.material.transparent=true
                    node.material.alphaTest = 0.7;
                    node.material.depthWrite = true;
                    node.material.side=THREE.DoubleSide

                    node.material.roughness = 0.9
                    node.material.envMapIntensity = 0.1
                    node.material.metalness=1
                }
                if(name=="hair"){
                    // alert(23)
                    node.material.side=THREE.DoubleSide
                }
                if(name=="CloW_C_hair_geo"){//man_b
                    
                    node.material.color.r=10
                    node.material.color.g=10
                    node.material.color.b=10
                    node.material.transparent=true
                    node.material.alphaTest = 0.7;
                    node.material.depthWrite = true;
                    node.material.side=THREE.DoubleSide

                    node.material.roughness = 0.9
                    node.material.envMapIntensity = 0.1
                    node.material.metalness=1
                }
                if(name=="CloW_D_Hair_geo"){//man_b
                    // alert(123)
                    node.material.color.r=30
                    node.material.color.g=30
                    node.material.color.b=30
                    node.material.transparent=true
                    node.material.alphaTest = 0.7;
                    node.material.depthWrite = true;
                    node.material.side=THREE.DoubleSide

                    node.material.roughness = 0.9
                    node.material.envMapIntensity = 0.1
                    node.material.metalness=1
                }

                if(
                    name=="CloM_A_head_geo"//1
                    ||name=="GW_man_Body_geo1"//1
                    ||name=="head"//3
                    ||name=="CloW_A_body_geo1"//3
                    ||name=="CloW_C_head_geo"//5
                    ||name=="body1"//5
                    ||name=="CloW_D_Body_geo1"//6
                    ){
                    node.material.scattering=true
                }


                
            }
        })
    }
    load_model() {
        
        var self = this
        // console.log("self.modelManager.modelList",self.modelManager.modelList)
        window.model = []
        crowd_next(0)
        function crowd_next(modelType) {
            const scenes=[]
            gltfloader_next(0)
            function gltfloader_next(gltf_index){
                new GLTFLoader().load(self.modelManager.modelList[modelType].pathModel[gltf_index], async (glb0) => {
                    // console.log("glb0:",glb0)
                    window.test0001=glb0.scene.children[0].children[0].children[0].children
                    self.materialSet(glb0)
                    scenes.push(glb0.scene)
                    if(gltf_index+1<self.modelManager.modelList[modelType].pathModel.length) gltfloader_next(gltf_index+1)
                    else process(scenes,modelType)
                })
            }
            // alert(modelType)
            if (modelType+1 < self.modelManager.modelList.length) crowd_next(modelType+1)
        }
        function process(scenes,modelType){
            console.log("scenes",scenes)

            // let lod_distance_max = 10
            // let lod_distance = []
            // for (var i = 0; i < 19; i++)
            //     lod_distance.push((i + 1) * lod_distance_max / 19)
            // lod_distance.push(lod_distance_max * 2)   //最低精度模型
            // lod_distance.push(lod_distance_max * 9)     //多个四面体

            // let lod_geometry = []
            // for (var i = 0; i <= 20; i++)//20..0
            //     lod_geometry.push(20 - i)
            // lod_geometry.push(0)

            // let lod_distance_max = 10
            // let lod_distance = []
            // for (var i = 0; i < 9; i++)
            //     lod_distance.push((i + 1) * lod_distance_max / 9)
            // lod_distance.push(lod_distance_max * 2)   //最低精度模型
            // lod_distance.push(lod_distance_max * 9)     //多个四面体

            // let lod_geometry = []
            // for (var i = 0; i <= 10; i++)//20..0
            //     lod_geometry.push(20 - 2*i)
            // lod_geometry.push(0)


            let lod_distance =   [ 2,   3,   5,    30,  50 ]
            let lod_geometry =   [ 20,  19,   10,    5,   1  ]//[ 10,  9,   8,    1,   0  ]
            // let lod_avatarCount= [ 2*50, 2*100, 2*170,  2*(800+1100), 2*(2500+800)]//[ 50, 100, 170,  800+1100, 2500+800]
            // alert("test2")
            // lod_distance=[
            //     0.5263157894736842, 1.0526315789473684, 1.5789473684210527, 
            //     2.1052631578947367, 2.6315789473684212, 3.1578947368421053, 
            //     3.6842105263157894, 4.2105263157894735, 4.7368421052631575, 
            //     5.2631578947368425, 5.7894736842105265, 
            //     6.315789473684211, 6.842105263157895, 7.368421052631579, 
            //     7.894736842105263, 8.421052631578947, 8.947368421052632, 9.473684210526315, 10, 20, 90]
            // lod_geometry=[20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0]

            
            // lod_distance=[]
            // lod_geometry=[0]
            let lod_avatarCount0=self.modelManager.modelList[modelType].lod_avatarCount
            let lod_avatarCount= []//[ 2*50, 2*100, 2*170,  2*(800+1100), 2*(2500+800)]//[ 50, 100, 170,  800+1100, 2500+800]
            for(let i=0;i<lod_avatarCount0.length;i++){
                lod_avatarCount.push(
                    Math.floor(lod_avatarCount0[i]/(self.modelManager.modelList[modelType].pathModel.length*2))
                )
            }


            var crowd = new Crowd({
                camera: self.camera,
                count: self.modelManager.modelList[modelType].ModelCount,
                animPathPre: 
                    self.modelManager.modelList[modelType].pathAnima
                ,

                pathLodGeo: 
                    self.modelManager.modelList[modelType].pathLodGeo,

                pathTextureConfig: 
                    self.modelManager.modelList[modelType].pathTextureConfig,
                useColorTag: 
                    self.modelManager.modelList[modelType].useColorTag,
                meshType:
                    self.modelManager.modelList[modelType].meshType,

                pathTexture:
                    self.modelManager.modelList[modelType].pathTexture,
                
                assets: self.assets,
                
                lod_visible:self.modelManager.modelList[modelType].lod_visible,
                lod_distance: self.modelManager.modelList[modelType].lod_distance,
                lod_geometry: self.modelManager.modelList[modelType].lod_geometry,
                lod_avatarCount:self.modelManager.modelList[modelType].lod_avatarCount
            })
            self.setParam(crowd, modelType, self.modelManager.modelIndex)
            
            for (var i00 = 0; i00 < crowd.count; i00++) {
                // 这部分还没整合到分别进行设置
                let useTagLen = self.modelManager.modelList[modelType].useColorTag.length
                for (let meshIndex = 0; meshIndex < useTagLen; meshIndex++) {
                    crowd.setColor(i00, [
                        5*Math.random() - 0.5,
                        5*Math.random() - 0.5,
                        5*Math.random() - 0.5
                    ], self.modelManager.modelList[modelType].useColorTag[meshIndex])
                    // console.log(self.modelManager.modelList[modelType].useColorTag[meshIndex])
                }
                crowd.setObesity(i00, 1)
            }
            // crowd.visible=false
            
            window.model.push(crowd)
            window.crowd = crowd
            crowd.init(scenes)
            self.scene.add(crowd)
            self.scene.add(crowd.CrowdPoints)
            window.p=crowd.CrowdPoints
        }
        
    }


    setParam(crowd, modelType, modelCount) {
        for (var i0 = 0; i0 < modelCount * crowd.count; i0++) {
            var scale = [
                1,
                Math.random() * 0.3 + 0.85,
                1,
            ]
            for (var i = 0; i < 3; i++)scale[i] *= 0.5//0.2

            if (i0 % modelCount != modelType) continue
            let i00 = Math.floor(i0 / modelCount)
            // let i00 = i0

            var PosRot = this.modelManager.getPosRot_9e(i0, modelType)
            var speed = PosRot.speed;
            var startTime = PosRot.startTime;
            crowd.setSpeed(i00, speed)
            crowd.setScale(i00, scale)
            //this.modelManager.modelList[modelType].posRotList[i0];
            // crowd.setObesity(i00, 0.85+1.1*Math.random())
            let animtionType = PosRot.ani;
            let walkAnimationlen = this.modelManager.modelList[modelType].walkAnimationList.length;
            for (let walkAnimation = 0; walkAnimation < walkAnimationlen; walkAnimation++) {
                if (animtionType == this.modelManager.modelList[modelType].walkAnimationList[walkAnimation]&&animtionType!==10) {
                    crowd.setMoveMaxLength(i00, 2*(1+Math.random()) )
                    break;
                }
            }
            crowd.setPosition(i00, PosRot.pos)
            PosRot.rot[1] += Math.PI;
            crowd.setRotation(i00, PosRot.rot)
            crowd.setAnimation(i00, animtionType, startTime)
        }//end

    }


}