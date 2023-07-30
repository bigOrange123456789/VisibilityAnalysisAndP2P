// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// import * as THREE from "three"
class AvatarManager {
    constructor(path) {
        this.result={
        }
        this.init(path)
    }
    extract(obj){
        const type=obj.constructor.name
        const base={}
        const color={}
        const vec2={}
        for(let t in obj){
            const v=obj[t]
            if(
                typeof(v)=="number"
                ||typeof(v)=="boolean"
                ||typeof(v)=="string"&&v!=="uuid"){
                    base[t]=v
            }
            if(v instanceof THREE.Color){
                color[t]=[v.r,v.g,v.b]
            }
            if(v instanceof THREE.Vector2){
                vec2[t]=[v.x,v.y]
            }

        }
        return {
            'type':type,
            'base':base,
            // 'colo':color,
            // 'vec2':vec2,
        }
    }
    adjustParam(group){
        group.traverse(o=>{
            if(o instanceof THREE.Mesh){
                // o.material.metalness=0.1//0.5
                // o.material.roughness=0.5//0.5
                // if(o.name=="CloW_A_xiezi_geo")o.visible=false
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
    init(path) {
        const self=this
        // const path="assets/avatar/sim/woman01/sim.glb"
        new THREE.GLTFLoader().load(path, async (glb0) => {
            console.log(glb0)
            self.adjustParam(glb0.scene)

            const material={}
            glb0.scene.traverse(i=>{
                if(i instanceof THREE.Mesh){
                    const temp=self.extract(i.material)
                    if(i.skeleton)
                    temp['lenb']=i.skeleton.bones.length
                    temp['text']={}
                    for(let t in i.material){
                        const v=i.material[t]
                        if(v instanceof THREE.Texture){
                            temp['text'][t]=self.extract(v)
                        }
                    }
                    material[i.name]=temp

                }
            })
            console.log(material)
            self.saveJson(material,"material.json")
        })
    }
    saveJson(data,name){
        const jsonData = JSON.stringify(data)
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
}
// new AvatarManager("temp/woman01.gltf")
// new AvatarManager("assets/avatar/sim/woman01/sim.glb")
// new AvatarManager("assets/avatar/sim/tree/sim.glb")
new AvatarManager("./sim.glb")