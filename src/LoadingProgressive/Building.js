import * as THREE from "three"
import { Visibility } from '../../lib/loading/Visibility.js'
import { P2P } from './P2P.js'
import { Detection } from './Detection.js'
import { Loader } from '../../lib/loading/Loader.js'
import { IndirectMaterial } from '../../lib/threejs/IndirectMaterial'

export class Building{
    constructor(scene,camera){
        // this.config.path="http://"+this.config.path
        document.getElementById("LoadProgress").innerHTML=""
        let self=this
        this.scene=scene
        window.save=(data,name)=>{
            self.saveJson(data,name?name:"test.json")
        }
        
        this.config=window.configALL.src.Building_new
        this.NumberOfComponents=this.config.NumberOfComponents

        this.parentGroup = new THREE.Group()
        // var k0=10
        // this.parentGroup.scale.set(
        //     this.config.parentGroup.scale.x*k0,
        //     this.config.parentGroup.scale.y*k0,
        //     this.config.parentGroup.scale.z*k0
        // )
        scene.add(this.parentGroup)
        // this.test()
        // return
        this.meshes={}
        window.meshes=this.meshes
        this.meshes_info={}

        this.detection=new Detection(this.meshes)
        
        this.p2p=new P2P(camera,this.detection)
        this.p2p.parse=message=>{self.p2pParse(message)}
        this.loader=new Loader(self.config.path,self.config.crossOriginSocket,true)
        self.loadConfigInstance(()=>{
            self.loadConfigIndirect(()=>{
                self.start(camera)
            })
        })
        // new Tool(this)
    }
    loadConfigInstance(cb){
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
        if(this.config.instanceUse){
            this.parentGroup2=new THREE.Group()//用于Lod
            this.parentGroup.add(this.parentGroup2)
            this.loadJson(
                this.config.path+"info.json",
                data=>{
                    self.instance_info=data.instanceMatrix
                    self.colorList=data.colorList
                    if(false)matrix2str(data.instanceMatrix)
                    cb()
                }
            )
        }else cb()
    }
    loadConfigIndirect(cb){
        if(this.config.useIndirectMaterial){
            IndirectMaterial.pre(()=>{
                cb()
            })
        }else cb()
    }
    start(camera){
        console.log(camera)
        const self=this
        // this.load0()
        // IndirectMaterial.pre(()=>{
        //     camera.position.set(0,0,0)
        //     self.load("sponza")
        // })
        // return
        this.visibiity=new Visibility(
            camera,
            list=>self.loading(list),
            this.meshes,
            this.detection
        )

        // const l1=Array.from(Array(100)).map((v,i) => {return i } )
        // const l2=Array.from(Array(100)).map((v,i) => {return i+100 } )
        // const l3=Array.from(Array(100)).map((v,i) => {return i+200 } )
        // const l4=Array.from(Array(100)).map((v,i) => {return i+300 } )
        // const l5=Array.from(Array(100)).map((v,i) => {return i+400 } )
        // const l6=Array.from(Array(29)).map((v,i) => {return i+500 } )
        // setTimeout(()=>{self.loading(l1)},1000)
        // setTimeout(()=>{self.loading(l2)},2000)
        // setTimeout(()=>{self.loading(l3)},3000)
        // setTimeout(()=>{self.loading(l4)},4000)
        // setTimeout(()=>{self.loading(l5)},5000)
        // setTimeout(()=>{self.loading(l6)},6000)
    }
    createFloor(){
        const geometry = new THREE.BoxGeometry( 1000000, 500, 50000 );
        const material = new THREE.MeshPhongMaterial( {color: 0x654321} );
        const floor = new THREE.Mesh( geometry, material );
        window.floor=floor
        this.parentGroup.add( floor );
    }
    doorTwinkle(){
        const self=this
        let flag=false
        setInterval(()=>{
            for(let id in self.meshes){
                if(self.meshes[id].visible)
                if(self.meshes[id].name.split("FM甲").length>1){//if(self.config.isdoor[""+id]==1){
                    const color=self.meshes[id].material.color
                    if(flag){
                        if(color.r>0.6)color.r-=0.5
                        if(color.g>0.6)color.g-=0.5
                        if(color.b>0.6)color.b-=0.5
                    }else{
                        color.r+=0.5
                        color.g+=0.5
                        color.b+=0.5
                    }
                    // self.meshes[id].visible=!self.meshes[id].visible
                }                  
            }
            flag=!flag 
        },500)
    }
    getInstancedMesh(geometry,material,instance_info){
        const mesh=new THREE.InstancedMesh(
            geometry,
            material,
            instance_info.length+1
        )
        for(let i=0;i<instance_info.length;i++){
            const mat=instance_info[i]
            mesh.setMatrixAt(
                i,
                new THREE.Matrix4().set(
                    mat[0], mat[1], mat[2], mat[3],
                    mat[4], mat[5], mat[6], mat[7],
                    mat[8], mat[9], mat[10], mat[11],
                    0, 0, 0, 1
                )
            )
        }
        mesh.setMatrixAt(
            instance_info.length,
            new THREE.Matrix4().fromArray( [
                1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1
            ] )
        )
        return mesh
    }
    addMesh(id,meshOld){
        if(this.config.updateColor){
            meshOld.geometry.computeVertexNormals()
            let t=id*256*256*256/8431 ///2665
            meshOld.material.color.r=0.5*((t&0xff)    )/255
            meshOld.material.color.g=0.5*((t&0xff00)>>8 )/255
            meshOld.material.color.b=0.5*((t&0xff0000)>>16)/255
        }else{
            meshOld.geometry.computeVertexNormals()
            meshOld.material.depthWrite=true
        }
        meshOld.material.metalness0=meshOld.material.metalness//-0.5
        meshOld.material.roughness0=meshOld.material.roughness//-0.5
        meshOld.material.envMapIntensity0=meshOld.material.envMapIntensity//-0.5
        meshOld.material.emissiveIntensity0=meshOld.material.emissiveIntensity//-0.5
        // console.log(mesh.material.color.r+mesh.material.color.g+mesh.material.color.b)
        const m=meshOld.material
        if(id==29||id==3){//玻璃
            m.transparent=true
            m.opacity=0.6
        }else if(id==166){//护栏
        }else if(id==174||id==182){//道路
            m.metalness=0.8
            m.roughness=0.4
            // m.visible=false
            // m.metal=true
            // alert(m.shininess)
            // console.log(m)
        }else{
            m.transparent=false
        }

        // mesh.material.shininess = 10;
        const mesh=new THREE.Object3D()
        mesh.geometry=meshOld.geometry
        if(this.instance_info){
            meshOld.materialOld=meshOld.material
            
            const mesh0=meshOld
            const instance_info=this.instance_info[id]
            const geometry=meshOld.geometry
            // const mesh2=this.getInstancedMesh(
            //     geometry,
            //     meshOld.material,
            //     instance_info)
            // mesh2.castShadow = false//true
            // mesh2.receiveShadow = false//true
            // mesh2.visible=false
            const mesh1=this.getInstancedMesh(
                geometry,
                meshOld.material
                // new THREE.MeshStandardMaterial({
                //     color:this.colorList[id] ,
                //     map:null,
        
                //     bumpScale: 1,
                //     displacementBias:0,
                //     displacementScale: 1,
                //     // emissiveIntensity: meshOld.material.emissiveIntensity,//1,
                //     // envMapIntensity:meshOld.material.envMapIntensity,//1,
                //     // metalness: meshOld.material.metalness,//0.95,
                //     // roughness: meshOld.material.roughness//0.1+0.4,
                    
                //     // // shininess:300,
                // })
                ,
                instance_info)
            mesh1.castShadow =true// false
            mesh1.receiveShadow = true//false//true
            const mesh2=mesh1.clone()
            
            //////////
            if(this.config.useIndirectMaterial){
                mesh1.material1=mesh1.material
                mesh2.material1=mesh2.material
                mesh1.material2=
                mesh2.material2=new IndirectMaterial(mesh.material)
            }
            // mesh2.material=mesh.material=mesh.material2
            
            ///////////////
            mesh.lod=[mesh1,mesh2]
            if(id==194){//雕塑
                // mesh.lod=[mesh2,mesh2]
            }
            // mesh.lod=[mesh,mesh]
            // mesh.visible=false
            if(this.config.waterCidList){//175
                for(let i=0;i<this.config.waterCidList.length;i++)
                    if(id==this.config.waterCidList[i]){
                        // var water = new WaterController(meshOld).water
                        // mesh.visible=mesh2.visible=false
                        // mesh.lod=[water,water]
                        // if(true)this.parentGroup2.add(water)
                        // alert(id)
                        // mesh.lod=[mesh2,mesh2]
                        // if(id==175)
                        // window.waterMaterial = mesh.lod[1].material;
                    }
            }
            mesh.add(mesh1)
            mesh.add(mesh2)
            mesh.used      =mesh0.used
            mesh.LoadDelay =mesh0.LoadDelay
            mesh.originType=mesh0.originType
            mesh.delay     =mesh0.delay
            mesh.config0=this.meshes_info[id]
        }else{
            mesh.lod=[meshOld,meshOld]
        }
        const self=this
        // setTimeout(()=>{
            self.meshes[id]=mesh
        // },1000)
        this.parentGroup.add(mesh)
        this.visibiity.prePoint2=""//重新进行可见剔除

        mesh.myId=id
        this.detection.receiveMesh(mesh)   
        // console.log(mesh,id)
    }
    loadZip(id,cb){
        if(this.meshes_info[id])return
        this.detection.receivePack("server")
        this.meshes_info[id]={request:performance.now()}//true
        this.detection.request("zip")
        const self=this
        this.loader.loadZip(
            id,
            zipLoader=>{
                if(self.p2p)self.p2p.send({
                    cid:id,
                    baseUrl:zipLoader.baseUrl,
                    buffer:zipLoader.buffer
                })
            },
            gltf => {
                // console.log(gltf)
                // self.p2p.send({cid:id,myArray:loader.myArray})
                self.meshes_info[id].parsed=performance.now()//解析完成
                gltf.scene.traverse(o=>{
                    if(o instanceof THREE.Mesh){  
                        o.delay={
                            load   :self.meshes_info[id].loaded   -self.meshes_info[id].request,  //加载延迟
                            forward:self.meshes_info[id].forwarded-self.meshes_info[id].loaded,   //转发延迟
                            parse  :self.meshes_info[id].parsed   -self.meshes_info[id].forwarded,//解析延迟
                            
                            parsed :self.meshes_info[id].parsed,//解析完成的时刻
                        }
                        
                        o.LoadDelay   =self.meshes_info[id].loaded   -self.meshes_info[id].request
                        o.originType="centerServer"
                        // if(!o.material.map)console.log(779)
                        self.addMesh(id,o)
                    }
                })
                if(cb)cb()
                if(false)
                setTimeout(()=>{
                    self.loadZip_fine(id)
                },500)  
            }
        )
    }
    loadGLB(id,cb){
        if(this.meshes_info[id])return
        this.meshes_info[id]={request:performance.now()}//true
        this.detection.request("glb")
        const self=this
        this.loader.loadGLB(id,(gltf) => {
            gltf.scene.traverse(o=>{
                if(o instanceof THREE.Mesh){                    
                    self.addMesh(id,o)
                }
            })
            if(cb)cb()
        })
    }
    p2pParse(message){
        this.detection.receivePack("p2p")
        const cid=message.cid
        if(this.meshes_info[cid])return
		else this.meshes_info[cid]={request:performance.now()}
        const self=this
        this.loader.p2pParse(message,(gltf) => {
            gltf.scene.traverse(o=>{
                if(o instanceof THREE.Mesh){    
                    o.LoadDelay   =0
                    o.delay={
                        load   :0,
                        forward:0,
                        parse  :performance.now()-self.meshes_info[cid].request,

                        parsed :self.meshes_info[cid].parsed,//解析完成的时刻
                    }
                    // o.material.color.r=255
                    // o.position.y+=5
                    // console.log("p2p",o)
                    o.originType="edgeP2P"
                    self.addMesh(cid,o)
                }
            })
        })
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
    loading(list){
        // for(let i=0;i<30;i++)this.loadZip(i)
        // return
        const self=this;
        window.list=list
        const NUMBER=this.config.NUMBER?this.config.NUMBER:30//50//350//50//50
        const TIME=this.config.TIME?this.config.TIME:120//0//100
        window.NUMBER=NUMBER
        window.TIME0=TIME
        
        for(let i=0;i<NUMBER&&i<list.length;i++){
            // if(!this.meshes_info[list[i]])console.log("第"+(i+1)+"次请求(第1批),构件编号"+list[i])
            this.loadZip(list[i])
        }
        // if(!window.flag000){
        //     console.log("完成第一批请求")
        //     window.flag000=true
        // }
        setTimeout(()=>{
            for(let i=NUMBER;i<list.length;i++){
                // if(!self.meshes_info[list[i]])console.log("第"+(i+1)+"次请求(第2批),构件编号"+list[i])
                self.loadZip(list[i])
            }
            // if(!window.flag001){
            //     console.log("完成第二批请求")
            //     window.flag001=true
            // }
        },TIME)
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
