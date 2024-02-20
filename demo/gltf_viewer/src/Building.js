import * as THREE from "three"
import { Engine3D } from './main.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
export class Building{
    test(){
        this.load_new(0)
    }
    saveScene(scene,name){
        new GLTFExporter().parse(scene, (result) => {
            // 将导出的数据存储为二进制文件
            const blob = 
                new Blob([JSON.stringify(result)], { type: 'text/plain' })
            //new Blob([result], { type: 'model/gltf-binary' });

            // 创建链接，并下载文件
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = name
            link.click();
        });
    }
    saveMesh(mesh,name){
        const scene=new THREE.Scene()
        scene.add(mesh)
        this.saveScene(scene,name)
    }
    load_new(index){
        // this.path='../../dist/assets/models/huayi/'
        this.path='./temp/'
        const path=this.path+"hall.gltf"
        const self=this
        const loader = new Engine3D.Loader.GLTFLoader();//new Engine3D.Loader(self.config.path,self.config.crossOriginSocket,true)
        console.log("path",path)
        loader.load(path, function (gltf) {
            console.log(gltf,"gltf")
            const arr=[]//new THREE.Scene()
            gltf.scene.traverse(o=>{
                if(o instanceof THREE.Mesh){
                    o.material=
                        new THREE.MeshStandardMaterial({
                            map:o.material.map,
                            color:o.material.color
                        })
                    arr.push(o)
                }
            })
            const scene=new THREE.Scene()
            for(let i=0;i<arr.length;i++){
                scene.add(arr[i])
            }
            self.saveScene(scene,"hall.StandardMaterial.gltf")
            
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

        camera.position.set(-301.9959744700025,  247.22000000000003,  315.169907837892)
        camera.rotation.set(0.021169286259497242, -0.7316884518312282,  0.014144938796166663)
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