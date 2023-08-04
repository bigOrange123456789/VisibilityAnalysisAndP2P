import * as THREE from "three"
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'//
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'//
export class Tool{
    constructor(building){    
        const self=this
        this.building=building
        this.raycaster =new THREE.Raycaster();
        window.test1=()=>{
            self.rayCasterList()
        }
        window.test2=()=>{
            // const mesh = new THREE.Mesh(
            //     new THREE.BoxGeometry(4, 4, 4),//(10, 10, 10),
            //     new THREE.MeshBasicMaterial({ color: 0x00ff00 })
            // ); 
            // mesh.position.set(0,10,0)//(0,80,0)
            // self.building.parentGroup.add(mesh)

            const arr=this.getMeshList()
            const r=self.rayCaster(
                new THREE.Vector3(0,80,0),
                new THREE.Vector3(0,-100,0),
                arr
            )
            console.log(r,"r")
            
        }
        window.start=()=>{
            self.loadGLB(()=>{
                self.start()
            })
        }
        
    }
    getMeshList(){
        const arr0=this.building.parentGroup.children
        const arr1=[]
        for(let i=0;i<arr0.length;i++){
            const mesh=arr0[i]
            if(mesh instanceof THREE.Mesh){
                const mesh1=new THREE.Mesh(
                    mesh.geometry,
                    mesh.material
                )
                mesh1.myId=mesh.myId
                // arr1.push(mesh)
                arr1.push(mesh1)
            }
                
        }
        return arr1
    }
    rayCaster(origin , direction,arr){
        //const arr=this.getMeshList()//this.building.parentGroup.children
        const raycaster=this.raycaster
        raycaster.set(origin , direction)
        const intersects = raycaster.intersectObjects(arr);
        if (intersects.length > 0) {
               return intersects[0].object
        } else {
               return null
        }
    }
    rayCasterList(){
        for(let i=0;i<this.building.parentGroup.children.length;i++){
            this.building.parentGroup.children[i].visible=true
        }
        const arr=this.getMeshList()
        // const result=[]
        const direction=new THREE.Vector3(0,-100,0)
        const n=150
        const m=150
        const pos={}
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                const x=(i-n/2) * 10
                const z=(j-m/2) * 10
                const r=this.rayCaster(
                    new THREE.Vector3(
                        (i-n/2) * 10, 
                        80, 
                        (j-m/2) * 10),
                    direction,
                    arr
                )
                if(r){
                    const id=r.myId
                    if(!pos[id]){
                        pos[id]=[]   
                    }
                    pos[id].push(x)
                    pos[id].push(z)
                    // result.push([r,x,z])
                }
                    
            }
            console.log(n,i+1)
        }
        console.log("pos",pos)
        this.saveJson(pos,"pos.json")
    }
    instance(){
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        // 创建实例化方块
        const n=150
        const m=150
        const instances = new THREE.InstancedMesh(geometry, material, n*m); // 创建10个实例
        // 设置实例化方块的位置
        for (let i = 0; i < n; i++) 
        for (let j = 0; j < m; j++) {
            const matrix = new THREE.Matrix4();
            matrix.setPosition(new THREE.Vector3(
                (i-n/2) * 10, 
                80, //10
                (j-m/2) * 10));
            instances.setMatrixAt(i*m+j, matrix);
        }
        return instances
    }
    saveJson(data,name){
        const jsonData = JSON.stringify(data);//JSON.stringify(data, null, 2); // Convert JSON object to string with indentation
        
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }

    start(){
        //this.building.loading(Array.from(Array(529)).map((e, i) => i))
        const self=this
        const s=(i)=>{
            const mesh=this.building.meshes[i].lod[0]
            self.saveGLTF(mesh,i)
            if(i+1<529)setTimeout(()=>{s(i+1)},500)
        }
        setTimeout(()=>{s(0)},2000)
    }
    saveGLTF(mesh,id){
        const scene=new THREE.Scene()
        const name=id+".gltf"
        scene.add(new THREE.Mesh(
            mesh.geometry,
            new THREE.MeshBasicMaterial()
        ))
        scene.traverse(o=>{
            if(o instanceof THREE.Mesh)
                o.geometry.attributes={position:o.geometry.attributes.position}
        })
        const self=this
        new GLTFExporter().parse(scene, function (result) {
            self.saveJson(result,name);
        });
    }
    loadGLB(cb){
        var self=this
        const loader = new GLTFLoader();
        loader.load("./assets/gkd_sim2.glb", gltf=>{
            console.log(gltf)
            this.building.meshes={}
            gltf.scene.traverse(o=>{
                if(o instanceof THREE.Mesh){              
                    const id=parseInt(o.name.split("Mesh_")[1])      
                    // self.addMesh(id,o)
                    self.building.meshes[id]={lod:[o]}
                }
            })
            if(cb)cb()
        }, undefined, function (error) {
            console.error(error);
        });
    }
}