import { Engine3D } from './main.js'
// import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
// import { Classification } from './parametric/Classification.js'
const { ipcRenderer } = require("electron");
export class Building{
    path='./dataIn/'
    constructor(){   
        const scene=new Engine3D.THREE.Scene()
        const path=this.path+"city.gltf"
        const self=this
        const loader = new Engine3D.GLTFLoader();
        loader.load(path, function (gltf) {
            console.log(gltf)
            console.log(gltf.scene.children[0])
            console.log(gltf.scene.children[0].traverse)
            const t=gltf.scene.children[0].traverse
            console.log(t)
            const arr0=gltf.scene.children[0].children
            for(let i=0;i<arr0.length;i++){
                const scene = new Engine3D.THREE.Scene()
                scene.add(arr0[i])
                self.saveScene(scene,"./dataOut/"+i+".glb")
            }
            console.log(arr0)
            return
            console.log(gltf.scene)
            const arr=gltf.scene.children[0].children
            for(let i=0;i<arr.length;i++){
                const mesh=arr[i]
                scene.scale.x*=1/10000
                scene.scale.y*=1/10000
                scene.scale.z*=1/10000
                mesh.material=new Engine3D.THREE.MeshStandardMaterial({
                        map:mesh.material.map,
                        color:mesh.material.color
                    })
                scene.add(mesh)
            }
            self.saveScene(scene,"./result.gltf")
        }, undefined, function (error) {
            console.error(error);
        });
    }
    saveScene(scene,name){
        new Engine3D.GLTFExporter().parse(scene, async function (result) {
            let fileData = JSON.stringify({
                name: name,
                data: JSON.stringify(result),
              });
            await ipcRenderer.invoke("exportGltf", fileData);
            // ipcRenderer.send("quit", "export end");
        });
    }
    saveScene2(scene,name){
        new Engine3D.GLTFExporter().parse(scene,function(result){
            var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
            let link = document.createElement('a')
            link.href = URL.createObjectURL(myBlob)
            link.download = name
            link.click()
        })
    }
    saveJson(name,data){
        const fileData = JSON.stringify({
            name: name+".json",
            data: JSON.stringify(data),
        });
        ipcRenderer.send("downloadJSON", fileData);
    }

}