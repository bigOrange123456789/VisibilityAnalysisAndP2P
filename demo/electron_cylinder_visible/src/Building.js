import * as THREE from "three"
import { Engine3D } from './main.js'
export class Building{
    test(){
        this.load_new(0)
    }
    load_new(index){
        // this.path='../../dist/assets/models/huayi/'
        this.path='./assets/models/huayi/'
        const path=this.path+"task-huayi-ecs_output"+index+".gltf"
        const self=this
        const loader = new Engine3D.Loader.GLTFLoader();//new Engine3D.Loader(self.config.path,self.config.crossOriginSocket,true)
        console.log("path",path)
        loader.load(path, function (gltf) {
            console.log(gltf,"gltf")
            // return
            gltf.scene.traverse(o=>{
                if(o instanceof THREE.Mesh){
                    const code=new Engine3D.Classification(o,[]).code
                    o=new THREE.Mesh(
                        o.geometry,new THREE.MeshStandardMaterial()
                    )
                    if(code){
                        // console.log(o.name,code.type)
                        if(code.type=="cube"){
                            o.material.color.r=0
                            o.material.color.g=1
                            o.material.color.b=0
                        }
                    //         self.paramCube[o.name]=code.matrix[0]
                        if(code.type=="cylinder"){
                            o.material.color.r=0
                            o.material.color.g=0
                            o.material.color.b=1
                        }
                    //         self.paramCylinder[o.name]=code.matrix[0]
                    }else{
                        o.material.color.r=1
                        o.material.color.g=0
                        o.material.color.b=0
                        // o.visible=false
                    }
                    // console.log(code)
                    self.parentGroup.add(o)
                }
            })
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
        this.parentGroup.scale.set(0.01,0.01,0.01)
        this.test()

        scene.add(this.parentGroup)
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