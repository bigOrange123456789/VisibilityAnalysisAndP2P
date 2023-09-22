import * as THREE from "three"
// import { Visibility } from '../../../lib/loading/Visibility.js'
// import { P2P } from       '../../../lib/loading/P2P/P2P.js'
// import { Detection } from '../../../lib/loading/P2P/Detection.js'
// import { IndirectMaterial } from '../../../lib/threejs/IndirectMaterial'
// import { Loader } from '../../../lib/loading/Loader.js'

import { BuildMaterial } from './Building/BuildMaterial.js'
// import { Pretreatment } from './Building/Pretreatment.js'
import { Tool } from './Building/Tool.js'



export class Building{
    constructor(scene,camera,csm,cb,sampling,Engine3D){
        this.shell=[3465, 2500, 2504, 2488, 3576, 2949, 2816, 2795, 3533, 2803, 2951, 3475, 3474, 3480, 3097, 2543, 2515, 3489, 3476, 2396, 2950, 2957, 2952, 2113, 2963, 2529, 2520, 2894, 2892, 2896, 2397, 2506, 2590, 3485, 3132, 2895, 2893, 2565, 3575, 3014, 3539, 2518, 2964, 2498, 2519, 3498, 2959, 2840, 2930, 2486, 3134, 2903, 2904, 3013, 2905, 3486, 2897, 2107, 3133, 2538, 2494, 3112, 2342, 2576, 3574, 2962, 3537, 2091, 3120, 3544, 3490, 2263, 3497, 2899, 2801, 2415, 2411, 2502, 3534, 2341, 2398, 3541, 2447, 2115, 2496, 3131, 2340, 2898, 2900, 3527, 3492, 2484, 2264, 3098, 2558, 2796, 2907, 2100, 2921, 2902]
        this.Engine3D=Engine3D

        this.sampling=sampling
        // this.config.path="http://"+this.config.path 
        document.getElementById("LoadProgress").innerHTML=""
        let self=this
        this.scene=scene
        this.csm=csm
        window.save=(data,name)=>{
            self.Pretreatment.saveJson(data,name?name:"test.json")
        }
        
        this.config=window.configALL.Building
        this.NumberOfComponents=this.config.NumberOfComponents

        this.parentGroup = new THREE.Group()
        // var k0=0.01
        // this.parentGroup.scale.set(
        //     this.config.parentGroup.scale.x*k0,
        //     this.config.parentGroup.scale.y*k0,
        //     this.config.parentGroup.scale.z*k0
        // )
        scene.add(this.parentGroup)
        if(this.config.rootMatrix){
            const matrix = new THREE.Matrix4(); 
            matrix.set(
                this.config.rootMatrix[0],
                this.config.rootMatrix[1],
                this.config.rootMatrix[2],
                this.config.rootMatrix[3],

                this.config.rootMatrix[4],
                this.config.rootMatrix[5],
                this.config.rootMatrix[6],
                this.config.rootMatrix[7],

                this.config.rootMatrix[8],
                this.config.rootMatrix[9],
                this.config.rootMatrix[10],
                this.config.rootMatrix[11],

                this.config.rootMatrix[12],
                this.config.rootMatrix[13],
                this.config.rootMatrix[14],
                this.config.rootMatrix[15]
             )
            matrix.transpose ()
            this.parentGroup.applyMatrix4(matrix)
        }
        

        // this.test()
        // return
        this.meshes={}
        window.meshes=this.meshes
        this.meshes_info={}
        // for(let i=0;i<3577;i++)this.meshes_info[i]=true
        for(let i of
            this.config["noload"]?this.config["noload"]:[]
        ){
            this.meshes_info[i]=true//false//不加载这些构件
        }
        window.meshes_info=this.meshes_info

        

        this.detection=new this.Engine3D.Detection(this.meshes)
        
        this.p2p=new this.Engine3D.P2P(camera,this.detection)
        this.p2p.parse=message=>{self.p2pParse(message)}
        // console.log(self.config.path)
        this.loader=new this.Engine3D.Loader(self.config.path,self.config.crossOriginSocket,true)
        self.loadConfigInstance(()=>{
            self.loadConfigIndirect(()=>{
                self.start(camera)
                if(cb)cb()
            })
        })
        // new Pretreatment(this)
        if(self.config.needTool){
            const tool=new Tool({
                instance_info:this.instance_info,
                meshes:this.meshes,
                parentGroup:this.parentGroup
            })
            // tool.createFloor2()
        }
            
    }
    loadConfigInstance(cb){
        const self=this
        if(this.config.instanceUse){
            self.instance_info=self.config.instanceMatrix
            self.colorList=self.config.colorList
            this.parentGroup2=new THREE.Group()//用于Lod
            this.parentGroup.add(this.parentGroup2)
        } 
        cb()
        // return
        return 
        
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
            this.Engine3D.IndirectMaterial.pre(()=>{
                cb()
            })
        }else cb()
    }
    start(camera){
        const self=this
        window.loading=arr=>{
            self.loading(arr)
        }
        function l(i){
            self.loadZip(i,()=>{
                console.log(i)
                if(i+50<3577)l(i+50) 
                else{
                    console.log("finish")
                    self.loading(Array.from(new Array(3577)).map((v,i)=>{return i}))
                }
            })
        }
        if(this.sampling){
            // self.loading(Array.from(new Array(1000)).map((v,i)=>{return i}))
            
            // self.loadZip(0)
            
            // for(let i=0;i<1;i++)l(i+2500)
            for(let i=0;i<50;i++)l(i+0)
            // for(let i=0;i<50;i++)l(i+2000)
            return
        }
        // for(let i=0;i<50;i++)l(i+0)
        // // self.loading([3097])
        // return

        // console.log(camera)
        
        this.buildMaterial=new BuildMaterial({
            path:this.config.path,
            meshes:this.meshes,
            // instance_info:this.instance_info
            getInstancedMeshById:(geometry,material,meshId)=>{
                return self.getInstancedMesh(
                    geometry,
                    material,
                    self.instance_info[meshId]
                )
            }
        })
        // this.load0()
        // IndirectMaterial.pre(()=>{
        //     camera.position.set(0,0,0)
        //     self.load("sponza")
        // })
        // return
        
        const firstPack=this.config.firstPack?this.config.firstPack:[]
        if(firstPack.length>15)
            for(let i=0;i<15;i++){
                self.loadZip(firstPack[i])
            }
        if(firstPack.length>60){
            setTimeout(()=>{
                for(let i=15;i<60;i++){
                    self.loadZip(firstPack[i])
                }
            },500)
            setTimeout(()=>{
                for(let i=60;i<firstPack.length;i++){
                    self.loadZip(firstPack[i])
                }
            },1500)  
        }
        
        
        
        
        this.visibiity=new this.Engine3D.Visibility(
            camera,
            list=>self.loading(list),
            this.meshes,
            this.detection
        )

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
        // console.log(meshOld)
        if(!this.sampling)
        if(this.buildMaterial)
        this.buildMaterial.checkMaterial(id,meshOld)

        // meshOld.material.map=null
        // if(meshOld.material.map)
        // meshOld.material.map=null

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
        
        m.side=0
        // if(id==29||id==3){//玻璃
        //     m.transparent=true
        //     m.opacity=0.6
        // }else if(id==166){//护栏
        //     m.side=2
        // }else if(id==174||id==182){//道路
        //     m.metalness=0.8
        //     m.roughness=0.4
        //     // m.visible=false
        //     // m.metal=true
        //     // alert(m.shininess)
        //     // console.log(m)
        // }else{
        //     // m.transparent=false
        // }
        m.metalness=0.9//0.5
        m.roughness=0.5//0.5
        m.envMapIntensity=0.6//0.4//0.1+m.metalness
        m.transparent=false

        // meshOld.material=Tool.getSampleMaterial(id)
        if(this.sampling)meshOld.material=Tool.getSampleMaterial(id)
        // if(this.sampling)meshOld.material=Tool.getSampleMaterial(136)

        // mesh.material.shininess = 10;
        const mesh=new THREE.Object3D()
        mesh.geometry=meshOld.geometry
        // console.log(this.instance_info,"this.instance_info")
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
            if(this.csm)this.csm.setupMaterial(meshOld.material);
            const mesh1=this.getInstancedMesh(
                geometry,
                meshOld.material,
                instance_info)
            mesh1.castShadow =true// false//
            mesh1.receiveShadow = true//false//
            const mesh2=mesh1//mesh1.clone()
            
            //////////
            if(this.config.useIndirectMaterial){
                mesh1.material1=mesh1.material
                mesh2.material1=mesh2.material
                mesh1.material2=
                mesh2.material2=new this.Engine3D.IndirectMaterial(mesh.material)
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
            mesh.add(meshOld)
        }
        const self=this
        // setTimeout(()=>{
            self.meshes[id]=mesh
        // },1000)
        this.parentGroup.add(mesh)
        const v=this.visibility
        if(typeof v!=="undefined")
            this.visibility.culling.update()//this.visibiity.prePoint2=""//重新进行可见剔除

        mesh.myId=id
        mesh.name=meshOld.name
        this.detection.receiveMesh(mesh)   
        mesh.name=meshOld.name

        mesh.isShell=false
        for(let i=0;i<this.shell.length;i++){
            if(this.shell[i]==id)mesh.isShell=true
        }
        // console.log(mesh,id)
    }
    loadZip(id,cb){
        // this.loadGLB(id,cb)
        // return
        if(this.meshes_info[id]){if(cb)cb();return}
        else this.meshes_info[id]={request:performance.now()}//true
        this.detection.receivePack("server")
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
                if(false)
                setTimeout(()=>{
                    self.loadZip_fine(id)
                },500)  
                setTimeout(()=>{
                    if(self.buildMaterial)
                        self.buildMaterial.loadTexture(id)
                    if(cb)cb()
                },500)  
            }
        )
    }
    loadGLB(id,cb){
        if(this.meshes_info[id])return
        else this.meshes_info[id]={request:performance.now()}//true
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

    loading(list){
        // console.log(list)
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