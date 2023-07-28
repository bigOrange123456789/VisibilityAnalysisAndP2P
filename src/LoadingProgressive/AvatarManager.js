import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Crowd } from '../../lib/crowd/Crowd.js'//let Crowd=Pack// 
import conifg_woman01     from '../../config/avatar/sceneConifg_woman0.json'
import * as THREE from "three"
export class AvatarManager {
    constructor(scene, camera,posConfig) {
        this.posConfig=posConfig
        window.posConfig=posConfig
        // return
        window.scene=scene
        this.scene = scene
        this.camera = camera
        this.assets = {}//为了防止资源重复加载，相同路径的资源只加载一次
        this.initPos2()//this.initPos_test()//this.initPos_old()
        const self=this
        this.init()
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
    initPos2(){
        this.poslist=[]
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
                this.poslist.push([x,y,z])
            }
        }
    }
    initPos_test(){
        this.poslist=[]
        let c={
            "x": [
                -100,
                100,
                10
            ],
            "z": [
                -100,
                100,
                10
            ],
        }
        for(let x=c.x[0];x<=c.x[1];x=x+c.x[2])
                for(let z=c.z[0];z<=c.z[1];z=z+c.z[2]){
                    this.poslist.push([x,0,z])
                }
        console.log(this.poslist.length)

    }
    getConfig(){
        const config=conifg_woman01
        for(let i=0;i<config.length;i++){
            let c1=config[i]
            c1.scale=2
            
            // c1.lod_distance=[ 5000, 15000, 30000, 60000, 100000 ]
            // c1.lod_geometry=[ 20,  15,   1,    0,   0  ]
            // c1.lod_avatarCount=[ 200, 900, 3240, 8800, 12600]

            c1.lod_distance=[ 10, 20, 40, 80, 160, 320 ]
            c1.lod_geometry=[ 19, 15,  7,  2,   1,   0 ]
            // c1.lod_avatarCount=[ 1640, 900/2, 3240/2, 8800/2, 12600/2]
            c1.lod_avatarCount=[ 500, 500, 500, 500, 500, 500]


            
            for(let i=0;i<c1.lod_distance.length;i++){
                c1.lod_distance[i]*=c1.scale
            }
        }
        // console.log(config)
        return config[0]
    }
    adjustParam(group){
        group.traverse(o=>{
            if(o instanceof THREE.Mesh){
                // o.material.metalness=0.1//0.5
                // o.material.roughness=0.5//0.5
                if(o.name=="CloW_A_xiezi_geo")o.visible=false
                if(o.name=="hair"){
                    o.material.side=2
                }
                if(
                    o.name=="CloM_B_body_geo2"||
                    o.name=="CloM_C_head_geo"
                ){
                    o.material.scattering=true
                }
            }
        })
    }
    async loadMaterial_json(path){
        const self=this
        function json2obj(j,o){
            for(let t in j.base){
                o[t]=j.base[t]
            }
            return o
        }
        return new Promise((resolve, reject) => {
            window.loadJson(path,data=>{
                console.log(data)
                const group=new THREE.Group()
                for(let t in data){
                    const v=data[t]

                    const mesh=new THREE.Mesh()
                    mesh.geometry=new THREE.BufferGeometry()
                    for(let tag of ["position","skinIndex","skinWeight","uv","normal"])
                        mesh.geometry.attributes[tag]=new THREE.BufferAttribute(new Float32Array([]),3)         
                    mesh.name=t
                    mesh.skeleton={bones:{
                        length:v.lenb
                    }}
                    mesh.material=new THREE[v.type]()
    
                    json2obj(v,mesh.material)
                    for(let i in v.text){
                        mesh.material[i]=new THREE.Texture()//{}
                        json2obj(v.text[i],mesh.material[i])
                    }
                    console.log(mesh.material,v.text)
                    group.add(mesh)
                }
                self.adjustParam(group)
                resolve(group)//cb(group)//return group
            })
        })
    }
    async loadMaterial_glb(path){//c.path+"sim.glb"
        const self=this
        return new Promise((resolve, reject) => {
            new GLTFLoader().load(path, (glb0) => {
                self.adjustParam(glb0.scene)
                // resolve(glb0.scene)// process([glb0.scene],0)
                var test=new THREE.Group()
                console.log(glb0.scene,"glb0.scene")
                glb0.scene.traverse(i=>{
                    if(i instanceof THREE.Mesh){
                        const material1=i.material
                        const material2=new THREE[material1.constructor.name]()
                        for(let t in material1){
                            const v=material1[t]
                            if(
                                typeof(v)=="number"
                                ||typeof(v)=="boolean"
                                ||typeof(v)=="string"&&v!=="uuid"){
                                material2[t]=v
                            }
                            if(v instanceof THREE.Color){
                                material2[t]=v
                            }
                            if(v instanceof THREE.Vector2){
                                material2[t]=v
                            }
                            window.material=material1
                            // if(v!=="uuid"){
                            //     material2[t]=v
                            // }
                        }
                        for(let t of [
                            'map'
                        ]){
                            material2[t]=material1[t]
                        }
                        material2.map=new THREE.Texture()
                        for(let t of['flipY']){
                            material2.map[t]=material1.map[t]
                        }

                        const mesh=new THREE.Mesh()
                        mesh.geometry=new THREE.BufferGeometry()
                        for(let tag of ["position","skinIndex","skinWeight","uv","normal"])
                            mesh.geometry.attributes[tag]=new THREE.BufferAttribute(new Float32Array([]),3)         
                        mesh.material=material1//i.material
                        mesh.name=i.name
                        mesh.skeleton={bones:{
                            length:i.skeleton.bones.length
                        }}
                        /////////////////////////////////////////////////////////////
                        const material={}
                        for(let t in i.material){
                            const v=i.material[t]
                            if(
                                typeof(v)=="number"
                                ||typeof(v)=="boolean"
                                ||typeof(v)=="string"&&v!=="uuid"){
                                material[t]=v
                            }
                            if(v instanceof THREE.Color){
                                material[t]=[v.r,v.g,v.b]
                            }
                            // console.log(t,v.r,v.g,v.b])
                        
                        }
                        
                        // console.log(material)
                        /////////////////////////////////////////////////////////////
                        test.add(mesh)
                    }
                })
                resolve(test)//process([test],0)
            })
        })
    }

    async init() {
        function r(arr){
            const randomIndex = Math.floor(Math.random() * arr.length)
            return arr[randomIndex]
        }
        const c=this.getConfig()
        const self = this
        
        Promise.all(
            Array.from(Array(c.path.length)).map((_, i) => 
                self.loadMaterial_glb(c.path[i]+"sim.glb")
                // self.loadMaterial_json(c.path[i]+"material.json")
            )
        ).then(res => {
            process(res) // 10
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
                pathLodGeo: 
                    Array.from(Array(c.path.length)).map((_, i) => 
                        c.path[i]+"LOD/"
                    ),//[c.path+"LOD/"],
                pathTexture: c.pathTexture,
                pathTextureConfig: 
                    Array.from(Array(c.path.length)).map((_, i) => 
                        c.path[i]+"texture_names.json"
                    ),//[c.path+"texture_names.json"],
                useColorTag:  c.useColorTag
            })
            for (var i00 = 0; i00 < crowd.count; i00++) {
                const p=self.poslist[i00]
                crowd.setPosition(i00,[
                    p[0],//+(2*Math.random()-1)*5,
                    p[1],
                    p[2]//+(2*Math.random()-1)*5
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
                    c.scale,
                    c.scale,//*(1-0.2+0.2*Math.random()),
                    c.scale])
                crowd.setObesity(i00, 0.8+0.4*Math.random())
                const j=10
                crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_kuzi_geo")
                crowd.setColor(i00,[j*Math.random()*2,j*Math.random(),j*Math.random()],"CloW_A_waitao_geo1")
            }
            crowd.init(scenes)
            window.crowd=crowd
            self.scene.add(crowd)
            self.scene.add(crowd.CrowdPoints)
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