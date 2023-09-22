import * as THREE from "three"
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import {OBJExporter} from "three/examples/jsm/exporters/OBJExporter"
import { saveAs } from 'file-saver';
import { Obstacle } from './Pretreatment/Obstacle.js'
export class Pretreatment{
    test(){

        let s="";
        // for(let i in window.meshes){
        //     const color= window.meshes[i].lod[0].material.color;   
        //     const r=color.r,g=color.g,b=color.b;  
        //     if(
        //         ((r>0.9)&&(r+b+g<2.7))||//红色管道
        //         ((b>0.9)&&(r+b+g<1.7))||//蓝色管道
        //         // ((g>0.8)&&(r+b+g<2.7))||//墙壁
        //         ((r+b>1.6)&&(r+b+g<2.3))||//粉红色管道
        //         (0.8<b)&&b<0.9&&(r+g+b<1.7)//紫色管道
        //     ){
        //         s=s+(i+",");
        //     }
        //     // window.meshes[i].visible=(r>0.9)&&(r+b+g<2.7)//红色管道
        //     // window.meshes[i].visible=(b>0.9)&&(r+b+g<1.7)//蓝色管道
        //     // window.meshes[i].visible=(g>0.8)&&(r+b+g<2.7)//墙壁
        //     // window.meshes[i].visible=(r+b>1.6)&&(r+b+g<2.3)//粉红色管道
        //     // window.meshes[i].visible=(0.8<b)&&b<0.9&&(r+g+b<1.7)//紫色管道
        //     // if((r>0.9)&&(r+b+g<2.7))s=s+(i+",");
        // }

        s=""
        for(let i in window.meshes){
            const color= window.meshes[i].lod[0].material.color;   
            const r=color.r,g=color.g,b=color.b;  
            const mesh=window.meshes[i].lod[0]
            mesh.computeBoundingBox()
            const box=mesh.boundingBox
            const v=(box.max.x-box.min.x)*(box.max.y-box.min.y)*(box.max.z-box.min.z)
            if(
                // ((r>0.9)&&(r+b+g<2.7))||//红色管道
                // ((b>0.9)&&(r+b+g<1.7))||//蓝色管道
                // ((g>0.8)&&(r+b+g<2.7))||//墙壁
                // ((r+b>1.6)&&(r+b+g<2.3))||//粉红色管道
                // (0.8<b)&&b<0.9&&(r+g+b<1.7)||//紫色管道
                (r<0.2)&&g<0.2&&(b>0.6)//||//紫色管道2
                // (r<0.4)&&(b>0.4)&&(b<0.5)||绿色管道
                // (0.6<g)&&(r+b==0)||//绿色扁管
                //(0.4<r)&&(b==0)//黄色管道
            ){
                s=s+(i+",");
                window.meshes[i].visible=true
            }else window.meshes[i].visible=false
        }


        for(let i in window.meshes){
            const mesh=window.meshes[i].lod[0]
            mesh.computeBoundingBox()
            const box=mesh.boundingBox
            box.applyMatrix4(mesh.matrixWorld)
            mesh.count
            const v=mesh.count*(box.max.x-box.min.x)*(box.max.y-box.min.y)*(box.max.z-box.min.z)
            console.log(v)
            mesh.visible=v<11115069537
            // const geometry=mesh.geometry
            // const color= window.meshes[i].lod[0].material.color;   

            // const r=color.r,g=color.g,b=color.b;  
            // if(
            //     (0.8<b)&&b<0.9&&(r+g+b<1.7)//紫色管道 
            // )s=s+(i+",");
        }


        //提取轨道
        s=""
        for(let i in window.meshes){
            const color= window.meshes[i].lod[0].material.color;   
            const r=color.r,g=color.g,b=color.b;  
            const mesh=window.meshes[i].lod[0]
            mesh.computeBoundingBox()
            const box=mesh.boundingBox
            const v=(box.max.x-box.min.x)*(box.max.y-box.min.y)*(box.max.z-box.min.z)
            const c=mesh.geometry.attributes.position.count
            if(
                78==c&&r>0.5&&r<0.6
            ){
                s=s+(i+",");//console.log(r);
                window.meshes[i].visible=true
            }else window.meshes[i].visible=false
        }
    }
    constructor(building){
        window.pretreatment=this
        new Obstacle(building)
        this.count=3577//529
        this.building=building
        window.test=this

        const self=this
        window.saveMatrix=()=>{
            const instance_info=building.instance_info
            const a=[]
            for(let i=0;i<529;i++){
                a.push(instance_info[i])
            }
            self.saveJson(a,"matrix.json")
        }

        window.downloadAll=()=>{
            const scene=new THREE.Scene()
            for(let i in meshes){
                const o=meshes[i]
                if(o instanceof THREE.Mesh&&o.visible){
                    // o.geometry.attributes={position:o.geometry.attributes.position}
                    scene.add(o)
                }
            }
            const objData = new OBJExporter().parse(scene);
            const blob = new Blob([objData], { type: 'textain' });
            saveAs(blob, "all.obj");
        }
        console.log(window.downloadAll)

        const save2obj = function(index){
            console.log(index,index+".obj")
            self.saveMesh(meshes[index],index+".obj")
            if(index+1>=Object.keys(meshes).length) {
                console.log("finish!")
            }else{
                setTimeout(()=>{
                    save2obj(index+1)
                },100)
            }
        }
        window.save2obj=()=>{
            save2obj(0)
        }
        window.getMatrix=()=>{
            self.getMatrix()
        }



    }
    getMatrix(){
        const self=this
        const matrix2str=instanceMatrix=>{
            let str=""
            console.log(instanceMatrix.length,"instanceMatrix.length")
            for(let i=0;i<Object.keys(instanceMatrix).length;i++){
                const group=instanceMatrix[""+i]
                str+="["
                for(let j=0;j<group.length;j++){
                    const mesh=group[j]
                    str+=("[")
                    for(let k=0;k<12;k++){
                        str+=(mesh[k])
                        if(k<12-1)str+=(", ")
                    }
                    str+=("]")
                    if(j<group.length-1)str+=(", ")
                }
                str+="], "
            }
            console.log(str)
            self.saveStr(str,"matrices_all.json")
        }
        matrix2str(self.building.config.instanceMatrix)
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
    saveAll1(){
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
    saveMesh(mesh,name){
        const scene=new THREE.Scene()
        scene.add(mesh)
        scene.traverse(o=>{
            if(o instanceof THREE.Mesh)
                o.geometry.attributes={position:o.geometry.attributes.position}
        })
        const objData = new OBJExporter().parse(scene, { includeNormals: false });

        // 将数据保存为OBJ文件
        const blob = new Blob([objData], { type: 'textain' });
        saveAs(blob, name);
    }
    saveAll2(){
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
    rayCaster(){//视点拾取
        const arr=Object.values(window.meshes)
        const camera=window.camera
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        window.addEventListener( 'mousemove', event=>{//鼠标移动事件
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1 ;
        }, false );
        window.addEventListener('click',()=>{
                raycaster.setFromCamera( mouse, camera )
                const intersects = raycaster.intersectObjects( arr )
                if (intersects.length > 0) {
                    console.log(intersects[0].object.parent.myId,intersects[0].object)
                }

        },false)
    }
}