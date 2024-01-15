import * as THREE from "three"
import { Engine3D } from './main.js'//Engine3D.Building.
// import {Test}from"./Building/Test.js"
import{LoadZip}from"./LoadZip"
export class Building{
    initLoadZip2(){
        let self=this
        this.loadZip2=new LoadZip((m1,meshIndex,matrixConfig,structdesc0,jsonDataAll)=>{
            // console.log(m1,meshIndex)
            const id=meshIndex
            const o=m1
                // self.meshes_info[id].parsed=performance.now()//解析完成
                // gltf.scene.traverse(o=>{
                    // if(o instanceof THREE.Mesh){  
                        // o.delay={
                        //     load   :self.meshes_info[id].loaded   -self.meshes_info[id].request,  //加载延迟
                        //     forward:self.meshes_info[id].forwarded-self.meshes_info[id].loaded,   //转发延迟
                        //     parse  :self.meshes_info[id].parsed   -self.meshes_info[id].forwarded,//解析延迟
                            
                        //     parsed :self.meshes_info[id].parsed,//解析完成的时刻
                        // }
                        
                        // o.LoadDelay   =self.meshes_info[id].loaded   -self.meshes_info[id].request
                        // o.originType="centerServer"
                        // if(!o.material.map)console.log(779)
                        self.addMesh(id,o)
                    // }
                // }) 
                if(true)setTimeout(()=>{
                    if(self.buildMaterial)
                    self.buildMaterial.loadTexture(id)
                },500)  
            // self.addInsModel(jsonDataAll, m1);
        })
    }
    constructor(scene,camera,csm,cb,sampling){
        let self=this
        this.initLoadZip2()
        this.sampling=sampling
        // this.config.path="http://"+this.config.path 
        document.getElementById("LoadProgress").innerHTML=""
        
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
        for(let i of
            this.config["noload"]?this.config["noload"]:[]
        ){
            this.meshes_info[i]=true//不加载这些构件
        }
        window.meshes_info=this.meshes_info

        this.detection=new Engine3D.Detection(this.meshes)
        if(this.config.useP2P){
            this.p2p=new Engine3D.P2P(camera,this.detection)
            this.p2p.parse=message=>{self.p2pParse(message)}
        }
        // console.log(self.config.path)
        this.loader=new Engine3D.Loader(self.config.path,self.config.crossOriginSocket,true)
        self.loadConfigInstance(()=>{
            self.loadConfigIndirect(()=>{
                if(!this.config.onlyP2P)self.start(camera)
                if(cb)cb()
            })
        })
        // new Engine3D.Building.Pretreatment(this)
        if(self.config.needTool)
            new Engine3D.Building.Tool({
                instance_info:this.instance_info,
                meshes:this.meshes,
                parentGroup:this.parentGroup
            })
        // new Test(this)
        setTimeout(() => {
            // self.addWater()
        },6000);
    }
    addWater(){
        const geometry = new THREE.PlaneGeometry( 1, 1 );
        const material = new THREE.MeshBasicMaterial( {color: 0xAEACA3, side: 0} );
        const mesh = new THREE.Mesh( geometry, material );

        var water = new Engine3D.WaterController(mesh).water
        window.ww=water
        water.position.y=3
        water.rotation.x=-Math.PI/2
        water.scale.set(3000,3000,3000)
        this.parentGroup2.add(water)
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
            Engine3D.IndirectMaterial.pre(()=>{
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
        // for(let i=0;i<50;i++)l(i+2000)
        // self.loading([3097])
        // return

        // console.log(camera)W
        
        this.buildMaterial=new Engine3D.Building.BuildMaterial({
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
        // Engine3D.IndirectMaterial.pre(()=>{
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
        
        setTimeout(()=>{
            for(let i=0;i<500;i++){
                self.loadZip(i)
            }
        },1500) 
        setTimeout(()=>{
            for(let i=0;i<28;i++){
                self.loadZip(i+500)
            }
        },2000) 
        return

        this.visibiity=new Engine3D.Visibility(
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
        const a=[
            171,
            187,
            // 1,3,4,5,6,7,9,10,14,15,18,21,22,25,26,28,29,30,31,32,33,34,37,42,49,53,57,59,61,62,163,164,165,166,168,169,170,172,174,175,176,179,180,181,182,183,184,186,188,189,191,192,193,194,196,197,199,200,203,205,207,499,511,528
            1,3,4,5,6,9,14,15,18,21,22,25,26,28,29,30,31,32,34,37,49,53,56,57,58,59,61,62,163,170,175,179,182,183,188,189,191,192,516

            //25,26,28,29,30,31,32,34,36,37,38,40,41,42,48,49,51,52,53,54,55,56,60,62,166,167,168,169,170,171,172,173,174,179,180,182,183,184,185,187,193,196,197,201,202,208,209,211,212,215,235,236,237,238,240,241,242,243,245,248,252,254,255,257,258,260,261,262,264,265,266,267,268,269,271,272,273,274,276,277,278,279,280,282,283,286,291,292,293,294,295,296,298,300,301,303,306,307,308,309,311,312,313,315,316,318,319,321,322,324,325,327,328,404,405,406,407,408,411,415,418,419,421,422,424,426,427,429,448,451,452,454,455,457,458,460,481,482,483,484,485,495,497,515,516,517
            //174,171,170,166,182,29,173,169,62,172,167,26,193,28,42,25,162,185,280,202,175,34,54,203,199,237,200,197,277,183,282,528,179,41,245,292,184,56,295,241,180,168,204,49,3,298,187,527,30,274,242,32,315,238,278,293,22,316,5,236,9,205,255,294,37,276,279,262,240,181,283,243,194,186,201,301,272,311,482,419,196,192,415,408,405,15,296,273,515,319,207,21,31,260,306,176,406,411,452,308,38,448,208,291,254,481,17,499,164,264,429,497,261,269,267,4,51,163,271,235,424,6,307,60,407,265,188,258,427,189,507,312,52,426,300,53,460,313,495,266,418,517,57,485,483,209,303,18,404,455,516,61,309,322,484,268,451,257,59,327,191,422,212,458,48,457,326,40,252,286,454,36,248,328,211,7,33,195,1,421,420,55,215,410,350,324,318,321,325,430,329,14,414,220,511,416,453,467,447,464,465,487,523,488,432,463
        ]
        meshOld.material=new THREE.MeshBasicMaterial()
        meshOld.material.color.r=0
        meshOld.material.color.g=0
        meshOld.material.color.b=1
        for(let i=0;i<a.length;i++){
            if(id==a[i]){
                meshOld.material.color.r=0.2
                meshOld.material.color.g=0
                meshOld.material.color.b=0
            }
        }
        
        

        // meshOld.material=Engine3D.Building.Tool.getSampleMaterial(id)
        if(this.sampling)meshOld.material=Engine3D.Building.Tool.getSampleMaterial(id)
        // if(this.sampling)meshOld.material=Engine3D.Building.Tool.getSampleMaterial(136)

        // mesh.material.shininess = 10;
        const mesh=new THREE.Object3D()
        mesh.geometry=meshOld.geometry
        // console.log(this.instance_info,"this.instance_info")
        if(this.instance_info){
            meshOld.materialOld=meshOld.material
            
            const mesh0=meshOld
            const instance_info=this.instance_info[id]
            const geometry=meshOld.geometry
            
            if(this.csm)this.csm.setupMaterial(meshOld.material);
            const mesh1=
            meshOld
            // this.getInstancedMesh(
            //     geometry,
            //     meshOld.material,
            //     instance_info)
            mesh1.castShadow =true// false//
            mesh1.receiveShadow = true//false//
            const mesh2=mesh1//mesh1.clone()
            
            //////////
            if(this.config.useIndirectMaterial){
                mesh1.material1=mesh1.material
                mesh2.material1=mesh2.material
                mesh1.material2=
                mesh2.material2=new Engine3D.IndirectMaterial(mesh.material)
            }
            // mesh2.material=mesh.material=mesh.material2
            
            ///////////////
            mesh.lod=[mesh1,mesh2]
            
            mesh.add(mesh1)
            mesh.add(mesh2)
            mesh.config0=this.meshes_info[id]
        }else{
            mesh.lod=[meshOld,meshOld]
            mesh.add(meshOld)
        }
        const self=this
        // setTimeout(()=>{
            self.meshes[id]=mesh
        // },1000)
        // if(
        //     id==192
        //     )   
        this.parentGroup.add(mesh)

        mesh.myId=id
        mesh.name=meshOld.name 
        // console.log(mesh,id)
        if(window.csm)window.csm.MyUpdate()
    }
    loadZip(id,cb){
        // this.loadGLB(id,cb)
        // return
        if(this.meshes_info[id])return
        else this.meshes_info[id]={request:performance.now()}//true
        this.detection.receivePack("server")
        this.detection.request("zip")
        const self=this
        // if(this.loadZip2){
        //     this.loadZip2.load([id]);
        //     // return;
        // }
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
                if(true)setTimeout(()=>{
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
        // let s=""
        // for(let i=0;i<list.length;i++)s=s+","+list[i]
        // console.log("list:",s)
        // console.log(list)
        // for(let i=0;i<30;i++)this.loadZip(i)
        // return
        

        if(this.loadZip2&&this.loadZip2.initDoubleFinish){
            this.loadZip2.load(list);
        }else{
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