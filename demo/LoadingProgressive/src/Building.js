import * as THREE from "three"
import { Visibility } from '../../../lib/loading/Visibility.js'
import { P2P } from './P2P.js'
import { Detection } from './Detection.js'
import { Loader } from '../../../lib/loading/Loader.js'
import { IndirectMaterial } from '../../../lib/threejs/IndirectMaterial'
// 170 612  使用normalmap的构件
// 167 165
// 171 612
// 180 165
// 181 375
// 417 165
// 474 165

export class Building{
    constructor(scene,camera,csm,cb){
        this.textureMap="textureOrigin/"
        this.materialList={}
        this.materialListIndex=[
           238,168,164,154,156,160,166,178,166,170,181,192,181,182,181,172,194,79,80,154,196,170,186,175,184,192,372,350,214,172,152,226,330,238,170,198,81,189,175,214,200,82,214,83,206,84,204,216,226,172,170,212,210,170,85,202,181,218,238,226,224,221,172,208,228,181,230,172,86,170,232,238,234,184,87,194,236,88,89,172,90,91,258,240,242,244,92,93,94,175,258,242,95,96,97,175,98,244,99,258,242,244,100,101,102,103,104,175,176,192,105,168,106,170,250,252,262,254,247,107,105,105,192,262,105,254,168,247,170,192,248,262,254,105,168,108,170,109,170,105,247,254,262,192,168,110,170,247,252,250,262,168,254,105,192,264,105,266,238,216,270,105,181,202,224,208,268,274,272,276,278,282,111,284,222,112,280,113,294,286,274,288,290,292,298,300,316,306,164,304,320,312,314,114,115,116,328,296,280,168,117,326,302,333,105,258,266,118,333,119,292,258,105,333,334,333,284,196,120,105,258,168,309,258,306,105,170,121,330,122,258,189,170,259,189,192,123,347,341,344,318,309,262,314,352,105,192,262,347,124,309,284,337,105,105,337,324,125,126,290,347,309,337,266,105,192,309,347,127,341,350,192,126,337,341,320,324,309,262,314,347,290,105,322,128,168,341,347,309,105,262,129,341,309,192,347,324,350,105,130,105,337,324,131,192,266,347,309,337,341,350,105,192,132,309,347,341,350,358,337,133,134,105,284,309,347,348,347,262,348,350,192,105,192,309,347,126,337,290,262,341,347,192,135,168,318,309,262,314,284,105,105,354,136,262,309,356,347,318,168,337,358,318,347,309,341,262,342,137,350,105,337,138,347,348,262,309,347,341,139,318,337,341,196,326,266,105,358,356,309,360,126,140,318,126,309,347,266,337,314,262,192,316,105,141,105,262,309,347,284,192,337,350,192,142,337,341,274,318,309,360,314,347,320,105,354,143,262,309,347,318,266,337,144,314,347,309,105,337,370,192,318,262,145,324,105,192,146,337,338,370,318,309,314,347,105,354,262,147,309,314,318,168,358,347,126,368,337,284,320,192,318,309,105,274,324,258,105,362,148,258,309,324,189,362,309,258,192,365,105,149,105,150,258,309,310,365,324,105,244,258,189,190,365,168,192,170,262,366,189,218,258,160,259,170,160,258,170,160,260,170,160,161,160,161,160,162,151,172
        ]
        this.mapId2mapFile={
            '154':'Image_0-2.jpg','156':'Image_0-3.jpg','160':'Image_0-4.jpg','161':'Image_0-91.jpg','162':'Image_0-91.jpg','164':'Image_0-1.jpg','166':'Image_0-5.jpg','168':'Image_0.jpg','170':'Image_0-7.png','172':'Image_0-10.jpg','175':'Image_0-14.jpg','176':'Image_0-39.jpg','178':'Image_0-6.jpg','181':'Image_0-8.jpg','182':'Image_0-9.jpg','184':'Image_0-15.jpg','186':'Image_0-13.jpg','189':'Image_0-17.jpg','190':'Image_0-91.jpg','192':'Image_0-9.jpg','194':'Image_0-11.jpg','196':'Image_0-12.jpg','198':'Image_0-16.jpg','200':'Image_0-19.jpg','202':'Image_0-26.jpg','204':'Image_0-21.jpg','206':'Image_0-20.jpg','208':'Image_0-30.jpg','210':'Image_0-25.jpg','212':'Image_0-24.jpg','214':'Image_0-18.jpg','216':'Image_0-22.jpg','218':'Image_0-27.jpg','221':'Image_0-29.jpg','222':'Image_0-53.jpg','224':'Image_0-28.jpg','226':'Image_0-23.jpg','228':'Image_0-31.jpg','230':'Image_0-32.jpg','232':'Image_0-33.jpg','234':'Image_0-34.jpg','236':'Image_0-35.jpg','238':'GroundGrassGreen002_COL_1K.jpg','240':'Image_0-37.jpg','242':'Image_0-38.jpg','244':'Image_0-39.jpg','247':'Image_0-44.jpg','248':'Image_0-44.jpg','250':'Image_0-40.jpg','252':'Image_0-41.jpg','254':'Image_0-43.jpg','258':'Image_0-36.jpg','259':'Image_0-74.jpg','260':'Image_0-91.jpg','262':'Image_0-42.jpg','264':'Image_0-45.png','266':'Image_0-46.jpg','268':'Image_0-48.png','270':'Image_0-47.jpg','272':'Image_0-50.jpg','274':'Image_0-49.jpg','276':'Image_0-51.jpg','278':'Image_0-52.jpg','280':'Image_0-54.jpg','282':'GroundGrassGreen002_COL_0_5K.jpg','284':'Image_0-53.jpg','286':'Image_0-56.jpg','288':'Image_0-57.jpg','290':'Image_0-58.jpg','292':'Image_0-59.jpg','294':'Image_0-55.jpg','296':'Image_0-69.jpg','298':'Image_0-60.jpg','300':'Image_0-61.jpg','302':'Image_0-71.jpg','304':'Image_0-64.jpg','306':'Image_0-63.jpg','309':'Image_0-73.jpg','310':'Image_0-91.jpg','312':'Image_0-66.jpg','314':'Image_0-67.jpg','316':'Image_0-62.jpg','318':'Image_0-78.jpg','320':'Image_0-65.jpg','322':'Image_0-83.jpg','324':'Image_0-81.jpg','326':'Image_0-70.jpg','328':'Image_0-68.jpg','330':'Image_0-74.jpg','333':'Image_0-72.jpg','334':'Image_0-72.jpg','337':'Image_0-80.jpg','338':'Image_0-88.jpg','341':'Image_0-76.jpg','342':'Image_0-86.jpg','344':'Image_0-77.jpg','347':'Image_0-75.jpg','348':'Image_0-84.jpg','350':'Image_0-82.jpg','352':'Image_0-79.jpg','354':'Image_0-85.jpg','356':'Image_0-86.jpg','358':'Image_0-84.jpg','360':'Image_0-87.jpg','362':'Image_0-90.jpg','365':'Image_0-91.jpg','366':'Image_0-91.jpg','368':'Image_0-89.jpg','370':'Image_0-88.jpg','372':'Image_0-92.jpg'
        }
        
        // this.config.path="http://"+this.config.path 
        document.getElementById("LoadProgress").innerHTML=""
        let self=this
        this.scene=scene
        this.csm=csm
        window.save=(data,name)=>{
            self.saveJson(data,name?name:"test.json")
        }
        
        this.config=window.configALL.src.Building_new
        this.NumberOfComponents=this.config.NumberOfComponents
        this.normalMap=new THREE.TextureLoader().load(this.config.path+this.textureMap+"GroundGrassGreen002_NRM_0_5K.jpg" )
        this.normalMap.repeat.x=this.normalMap.repeat.y=1/1000 //0.0008 
        this.normalMap.wrapS=this.normalMap.wrapT=THREE.RepeatWrapping


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
        for(let i of
        [17, 145, 135, 121, 112, 320, 307, 303, 313, 272, 236, 268, 291, 258, 321, 372, 379, 465, 426, 404, 447, 433, 414, 394, 314, 324, 334, 343, 54, 227, 123, 137]
        ){
            this.meshes_info[i]=true//不加载这些构件
        }

        this.detection=new Detection(this.meshes)
        
        this.p2p=new P2P(camera,this.detection)
        this.p2p.parse=message=>{self.p2pParse(message)}
        // console.log(self.config.path)
        this.loader=new Loader(self.config.path,self.config.crossOriginSocket,true)
        self.loadConfigInstance(()=>{
            self.loadConfigIndirect(()=>{
                self.start(camera)
                if(cb)cb()
            })
        })
        new Tool(this)
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
        // console.log(camera)W
        const self=this
        // this.load0()
        // IndirectMaterial.pre(()=>{
        //     camera.position.set(0,0,0)
        //     self.load("sponza")
        // })
        // return

        
        const firstPack=[
            174, 171, 170, 166, 182, 29, 173, 169, 62, 172, 167, 26, 193, 28, 42, 25, 162, 185, 280, 202, 175, 34, 54, 203, 199, 237, 200, 197, 277, 183, 282, 528, 179, 41, 245, 292, 184, 56, 295, 241, 180, 168, 204, 49, 3, 298, 187, 527, 30, 274, 242, 32, 315, 238, 278, 293, 22, 316, 5, 236, 9, 205, 255, 294, 37, 276, 279, 262, 240, 181, 283, 243, 194, 186, 201, 301, 272, 311, 482, 419, 196, 192, 415, 408, 405, 15, 296, 273, 515, 319, 207, 21, 31, 260, 306, 176, 406, 411, 452, 308
        ]
        for(let i=0;i<15;i++){
            self.loadZip(firstPack[i])
        }
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
        this.visibiity=new Visibility(
            camera,
            list=>self.loading(list),
            this.meshes,
            this.detection
        )

        window.test000=()=>{
            // config[i]
            for(let i=0;i<self.materialListIndex.length;i++)
                self.loadTexture(i)
        }
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
        // console.log(meshOld)
        const materialId=this.materialListIndex[id]
        if(this.materialList[materialId]){
            meshOld.material=this.materialList[materialId]
        }else{
            this.materialList[materialId]=meshOld.material
        }
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
        if(id==29||id==3){//玻璃
            m.transparent=true
            m.opacity=0.6
        }else if(id==166){//护栏
            m.side=2
        }else if(id==174||id==182){//道路
            m.metalness=0.8
            m.roughness=0.4
            // m.visible=false
            // m.metal=true
            // alert(m.shininess)
            // console.log(m)
        }else{
            // m.transparent=false
        }
        m.envMapIntensity=0.1+m.metalness

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
        // console.log(mesh,id)
    }
    addMaterail(materialId,texture){
        // console.log(materialId,texture)
        for(let meshId=0;meshId<this.materialListIndex.length;meshId++){
            if(this.materialListIndex[meshId]==materialId){
                const m=self.meshes[meshId]
                if(m){
                    let j=0
                    // for(let j=0;j<2;j++){
                        m.lod[j].visible=false
                        // console.log(m.lod[j].material,texture)

                        if(m.lod[j].material.map){
                            for(let tag in texture){
                                if(tag!=="source")texture[tag]=m.lod[j].material.map[tag]
                            }
                            m.lod[j].material.map=texture// m.lod[j].material.map.source=texture.source
                        }
                        

                        if(this.normalMap)
                        if(m.lod[j].material.normalMap){
                            // console.log(m.lod[j].material.normalMap,"m.lod[j].material.normalMap")
                            // for(let tag in this.normalMap){
                            //     if(tag!=="source")this.normalMap[tag]=m.lod[j].material.normalMap[tag]
                            // }
                            m.lod[j].material.normalMap=this.normalMap
                        }


                        if(m.lod[j].material.normalMap)
                        console.log(materialId,"materialId")


                        if(materialId==282)//草地 [274砖墙 278人行道 282草地]
                        if(m.lod[j].material.normalMap)
                            if(this.normalMap){
                                // m.lod[j].material.normalMap=this.normalMap
                                console.log(
                                    m.lod[j].material.normalMap,this.normalMap
                                )
                                const m1=m.lod[j].material.normalMap
                                const m2=this.normalMap
                                for(let tag in m1){
                                    if(m1[tag]!=m2[tag]){
                                        console.log(tag,)
                                    }
                                }
                                window.t1=m1
                                window.t2=m2
                                window.m=m.lod[j].material
                            }
                                
                        
                        // m.lod[j]=new THREE.Mesh(m.lod[j].geometry,m.lod[j].material)
                        if(true){
                            m.lod[j].material.needsUpdate=true
                            if(this.csm)this.csm.setupMaterial(m.lod[j].material);
                        }else{
                            m.lod[j]=this.getInstancedMesh(
                                m.lod[j].geometry,
                                m.lod[j].material,
                                this.instance_info[meshId]
                            )
                            m.lod[j].castShadow =true// false//
                            m.lod[j].receiveShadow = true//false//
                            m.add(m.lod[j])
                            m.lod[1].visible=false
                        }
                        m.lod[1]=m.lod[0]
                        
                    // }
                    
                    this.textureList[materialId]=m.lod[0].material
                }
                
            }
        }
    }
    loadZip(id,cb){
        // this.loadGLB(id,cb)
        // return
        if(this.meshes_info[id])return
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
                if(true)setTimeout(()=>{
                    self.loadTexture(self.materialListIndex[id])
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
    loadTexture(materialId){
        const mapName=this.mapId2mapFile[materialId]
        if(!mapName)return
        if(!this.textureList)this.textureList={}
        if(this.textureList[materialId])return
        else this.textureList[materialId]=true
        const path=this.config.path+this.textureMap+mapName
        const self=this
        new THREE.TextureLoader().load( path ,texture=>{
            // var materailId=null
            // for()
            self.addMaterail(materialId,texture)
        })
        // const texture=new THREE.TextureLoader().load( path )
        // self.addMaterail(name,texture)
        
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

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
class Tool{
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
}