import * as THREE from "three"
import { Engine3D } from './main.js'
export class Building{
    test(){
        this.load_new(0)
    }
    load_new(index){
        // this.path='../../dist/assets/models/huayi/'
        this.path='./assets/models/'
        // const path=this.path+"huayi/task-huayi-ecs_output"+index+".gltf"
        const path="./assets/models/home.glb"
        const self=this
        const loader = 
            new Engine3D.Loader.GLTFLoader();//new Engine3D.Loader(self.config.path,self.config.crossOriginSocket,true)
        console.log("path",path)
        loader.load(path, function (gltf) {
            console.log(gltf,"gltf")
            // return
            // return
            gltf.scene.traverse(m=>{
                if(m instanceof THREE.Mesh){
                    
                    // m.visible=false
                    const classification=new Engine3D.Classification(m,[])
                    const code=classification.code                    
                    let o=new THREE.Mesh(
                        m.geometry,
                        //new THREE.MeshDepthMaterial()
                        // new THREE.MeshStandardMaterial()
                        m.material
                        // new THREE.MeshLambertMaterial()
                    )
                    if(code){
                        o=classification.mesh2
                        // o.visible=false
                    }else{
                        o.visible=false
                    }
                    o.position.set(
                        m.position.x,
                        m.position.y,
                        m.position.z
                    )
                    o.rotation.set(
                        m.rotation.x,
                        m.rotation.y,
                        m.rotation.z
                    )
                    o.scale.set(
                        m.scale.x,
                        m.scale.y,
                        m.scale.z
                    )
                    //m.parent.add(o)
                    o.material.color.r=0
                    if(code){
                        // console.log(code.type,o)
                        // console.log(o.name,code.type)
                        //if(false)
                        if(code.type=="cube"){
                            // o.material.color.r=0
                            // o.material.color.g=1
                            // o.material.color.b=0


                            // o.material.color.r=1
                            // o.material.color.g=0
                            // o.material.color.b=0
                            // o.visible=false
                        }
                    //         self.paramCube[o.name]=code.matrix[0]
                        //if(false)
                        if(code.type=="cylinder"){

                            o.material.color.r=1
                            o.material.color.g=0
                            o.material.color.b=0
                            // o.visible=false
                        }
                        // o=new THREE.Mesh(
                        //     o.geometry,
                        //     new THREE.MeshDepthMaterial()
                        //     //new THREE.MeshStandardMaterial()
                        // )
                        // o.visible=false
                    //         self.paramCylinder[o.name]=code.matrix[0]
                    }else{
                        // if(false)
                        {
                            // o.material.color.r=1
                            // o.material.color.g=0
                            // o.material.color.b=0
                        }
                        
                        // o.visible=false
                    }
                    // console.log(o)
                    // self.parentGroup.add(o)
                    self.parentGroup.add(o)
                }
            })
            // self.parentGroup.add(gltf.scene)
            console.log(index)
            index++
            // if(index>=self.numPack)self.finish()
            // else self.load(index)
        }, undefined, function (error) {
            console.error(error);
        });
    }
    constructor(scene,camera,csm,cb,sampling){
        
        
        document.getElementById("LoadProgress").innerHTML=""
    

        this.parentGroup = new THREE.Group()
        
        this.test()

        scene.add(this.parentGroup)
        if(false){
            this.parentGroup.scale.set(0.01,0.01,0.01)
            camera.position.set(
                -10026.998046875,
                22722.0078125,
                25003,
            )
            camera.position.set(
                -100.26,
                227.22,
                250.03,
            )

            camera.position.set(-301.9959744700025,  247.22000000000003,  315.169907837892)
            camera.rotation.set(0.021169286259497242, -0.7316884518312282,  0.014144938796166663)
        }
        {
            this.parentGroup.scale.set(0.5,0.5,0.5)
            camera.position.set(-2.288170820022621,  -10,  577.4423653022196)
            camera.rotation.set(0.010765260187853488,  -0.005799514336699335,  0.00006243534264637412)
        }
        
    }
    loadJson(path,cb){
        console.log(path)
        var xhr = new XMLHttpRequest()
        xhr.open('GET', path, true)
        xhr.send()
        xhr.onreadystatechange = ()=> {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var json_data = JSON.parse(xhr.responseText)
                cb(json_data)
            }
        }
    }
}