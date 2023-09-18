import * as THREE from "three"
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
export class Pretreatment{
    constructor(building){
        this.count=529
        this.building=building
        window.test=this
    }
    start(){
        const self=this
        self.loadAll(()=>{
            setTimeout(()=>{
                if(Object.keys(self.building.meshes).length==self.count){
                    self.saveAll()
                }else{
                    console.log("等待时间不足")
                    alert("等待时间不足，请修改代码中的等待时间！")
                }
            },500)
        })
    }
    loadAll(cb){
        const self=this
        function l(i){
            console.log(i,self.count)
            self.building.loadZip(i)
            if(i==self.count){console.log("加载完成");if(cb)cb()}//alert("加载完成！")
            else setTimeout(()=>{l(i+1);},100)
        }
        l(0)
    }
    saveAll(){
        const self=this
        function s(i){
            console.log(i,self.count)
            const mesh=self.building.meshes[i].lod[0]
            self.saveGLTF(mesh,i)
            if(i+1==self.count)alert("下载完成！")
            else setTimeout(()=>{s(i+1);},1000)
        }
        s(0)
    }
    saveGLTF(mesh,id){
        const scene=new THREE.Scene()
        const name=id+".gltf"
        scene.add(mesh)
        mesh.visible=true
        delete mesh.geometry.attributes.normal
        // scene.traverse(o=>{
        //     if(o instanceof THREE.Mesh)
        //         o.geometry.attributes={position:o.geometry.attributes.position}
        // })
        const self=this
        new GLTFExporter().parse(scene, function (result) {
            self.saveJson(result,name);
        });
    }
    saveAll(){
        const scene=new THREE.Scene()
        const name=id+".gltf"
        scene.add(mesh)
        // const meshes=self.building.meshes
        
        // mesh.visible=true
        // delete mesh.geometry.attributes.normal
        // scene.traverse(o=>{
        //     if(o instanceof THREE.Mesh)
        //         o.geometry.attributes={position:o.geometry.attributes.position}
        // })
        const self=this
        new GLTFExporter().parse(scene, function (result) {
            self.saveJson(result,name);
        });
    }
    saveJson(data,name){
        const jsonData = JSON.stringify(data);//JSON.stringify(data, null, 2); // Convert JSON object to string with indentation
        
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
    saveStr(str,name){
        var myBlob=new Blob([str], { type: 'text/plain' })
        let link = document.createElement('a')
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
    saveJson(data,name){
        const jsonData = JSON.stringify(data);//JSON.stringify(data, null, 2); // Convert JSON object to string with indentation
        
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
    InY2(mesh,y0){
        var box = new THREE.Box3().setFromObject(mesh)
        return box.max.y<y0//return box.min.y<ymax && box.max.y>ymin //&&box.max.z>-7766
    }
    load0(){
        const self=this
        loadAll(0)
        function loadAll(index){
            self.loadZip(index,()=>{
                setTimeout(()=>{
                    if(index+1<self.NumberOfComponents)
                        loadAll(index+1)
                },100)
            })
        }
    }
}