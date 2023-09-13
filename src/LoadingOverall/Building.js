import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
import {OBJExporter} from "three/examples/jsm/exporters/OBJExporter"
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
// import { GLTFExporter } from "./three/examples/jsm/exporters/GLTFExporter.js";
import { saveAs } from 'file-saver';
import { Array3D } from './Array3D.js'
import { SamplePointList } from './SamplePointList.js'
export class Building{
    constructor(scene){
        this.scene=scene
        
        this.config=window.configALL.src.Building_new
        window.config0=this.config
        this.parentGroup = new THREE.Group()

        if(this.config.parentGroup&&this.config.parentGroup.scale)
            this.parentGroup.scale.set(
                this.config.parentGroup.scale.x,
                this.config.parentGroup.scale.y,
                this.config.parentGroup.scale.z
            )
        scene.add(this.parentGroup)
        this.meshes=[]
        window.meshes=this.meshes
        this.load0(this.config.path)
        
        var a=new Array3D({
            x:{
                start:this.config.createSphere.x[0],
                end  :this.config.createSphere.x[1],
                step :this.config.createSphere.x[2]
            },
            y:{
                start:this.config.createSphere.y[0],
                end  :this.config.createSphere.y[1],
                step :this.config.createSphere.y[2]
            },
            z:{
                start:this.config.createSphere.z[0],
                end  :this.config.createSphere.z[1],
                step :this.config.createSphere.z[2]
            },
            entropy:this.config.entropy
        })
        window.a=a
        window.entropy=this.config.entropy
        this.colorList=a.colorList
        a.detect()
        this.kernelPosition=a.convexDot
        this.color_convexDot=a.color_convexDot
        this.convexArea=a.convexArea
        window.a=a

        if(false){
            new SamplePointList(
                this.config.createSphere,
                this.parentGroup,
                this.meshes,
                this.config.entropy
            )
            
            // this.createCube2(this.config.createSphere)
            // this.createKernel(this.config.block2Kernel)

            this.createSphere1(this.config.createSphere)
            // this.createSphere2(this.config.createSphere)//展示凸局域分布情况 //不显示核视点 每一块视点使用不同颜色
            // this.wallShow()
            // this.doorTwinkle()  
        }
        
    }
    doorTwinkle(){
        const self=this
        if(self.config.isdoor)
        setInterval(()=>{
            self.meshes
            for(let i=0;i<self.meshes.length;i++){
                if(self.config.isdoor[""+i]==1)
                    self.meshes[i].visible=!self.meshes[i].visible
            }

        },500)
    }
    createKernel(kernel){
        for(let blockId in kernel){
            let k=kernel[blockId]
            let a=k.split(",")
            let geometry = new THREE.SphereGeometry( 
                    this.config.createSphere.r,//c.r*(-0.4+1.4*self.config.entropy[name]/entropyMax), 
                    32, 16 );
            let material = new THREE.MeshBasicMaterial( {color:0xff0000} );
                
            const sphere = new THREE.Mesh( geometry, material );
            if(a[0]+","+a[1]+","+a[2]!=="190,85,20")sphere.visible=false
            sphere.position.set(a[0],a[1],a[2])
            this.parentGroup.add( sphere )
        }
    }
    createCube0(c){
        let self=this
        
        let size=c.x[2]*0.3
        for(let x=c.x[0];x<=c.x[1];x=x+c.x[2])
            for(let y=c.y[0];y<=c.y[1];y=y+c.y[2])
                for(let z=c.z[0];z<=c.z[1];z=z+c.z[2]){
                    var geometry,material
                    {
                        geometry = new THREE.BoxGeometry(size, size, size);
                        material = new THREE.MeshBasicMaterial( {
                            color:0x00ffff, 
                            opacity: 0.3, 
                            transparent: true
                        } );
                    }
                    console.log(self.parentGroup.children.length)
                    const cube = new THREE.Mesh( geometry, material );
                    cube.position.set(x,y,z)
                    self.parentGroup.add( cube )

                    // // 创建EdgesGeometry对象
                    // var edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size));
                    // var material = new THREE.LineBasicMaterial({
                    //     color: 0x000000,
                    //     opacity: 0.3, 
                    //     transparent: true
                    // });
                    // var line=new THREE.LineSegments(edges, material)
                    // line.position.set(x,y,z)
                    // self.parentGroup.add(
                    //     line
                    // );

                }
    }
    createSphere1(c){
        let self=this
        let entropyMax=0.001
        for(let name in self.config.entropy){
            if(self.config.entropy[name]>entropyMax)entropyMax=self.config.entropy[name]
        }
        let test=[]
        for(let x=c.x[0];x<=c.x[1];x=x+c.x[2])
            for(let y=c.y[0];y<=c.y[1];y=y+c.y[2])
                for(let z=c.z[0];z<=c.z[1];z=z+c.z[2]){
                    test.push([x,y,z])
                    let geometry,material
                    let name=(x+","+y+","+z)
                    let flag=false
                    for(let i=0;i<self.kernelPosition.length;i++){
                        const p=self.kernelPosition[i]
                        if( (p[0]+","+p[1]+",-10")==name)flag=true
                    }
                    if(false){
                    //if(flag){//
                    // if(name==self.config["kernelPosition"]){
                        geometry = new THREE.SphereGeometry( c.r, 32, 16 );
                        material = new THREE.MeshBasicMaterial( {color:0xff0000} );
                    }else{
                        geometry = new THREE.SphereGeometry( 
                            c.r,//c.r*(-0.4+1.4*self.config.entropy[name]/entropyMax), 
                            32, 16 );
                        material = new THREE.MeshBasicMaterial( );
                        material.color.r=material.color.g=material.color.b=
                            (-0.1+1.1*self.config.entropy[name]/entropyMax)
                        material.color.g-=0.2
                        material.color.b-=0.2
                    }
                    const sphere = new THREE.Mesh( geometry, material );
                    sphere.position.set(x,y,z)
                    self.parentGroup.add( sphere )
                    if( name==self.config["kernelPosition"] )window.sphere=sphere
                }
    }
    createSphere2(c){//展示凸区域
        let self=this
        let entropyMax=0.001
        for(let name in self.config.entropy){
            if(self.config.entropy[name]>entropyMax)entropyMax=self.config.entropy[name]
        }
        let test=[]
        for(let x=c.x[0];x<=c.x[1];x=x+c.x[2])
            for(let y=c.y[0];y<=c.y[1];y=y+c.y[2])
                for(let z=c.z[0];z<=c.z[1];z=z+c.z[2]){
                    test.push([x,y,z])
                    let geometry,material
                    const color=this.color_convexDot[
                        this.convexArea[x][y][z]
                    ]
                    geometry = new THREE.SphereGeometry(c.r,32, 16 )
                    material = new THREE.MeshBasicMaterial()
                    material.color.r=color[0]
                    material.color.g=color[1]
                    material.color.b=color[2]
                    
                    const sphere = new THREE.Mesh( geometry, material );
                    sphere.position.set(x,y,z)
                    self.parentGroup.add( sphere )
                }
    }
    createCube2(c){//展示凸区域
        let self=this
        let entropyMax=0.001
        for(let name in self.config.entropy){
            if(self.config.entropy[name]>entropyMax)entropyMax=self.config.entropy[name]
        }
        let size=c.x[2]
        for(let x=c.x[0];x<=c.x[1];x=x+c.x[2])
            for(let y=c.y[0];y<=c.y[1];y=y+c.y[2])
                for(let z=c.z[0];z<=c.z[1];z=z+c.z[2]){
                    // const color=this.color_convexDot[
                    //     this.convexArea[x][y][z]
                    // ]
                    // console.log("this.color_convexDot",this.color_convexDot)
                    // console.log("this.convexArea[x][y][z]",this.convexArea[x][y][z])
                    // console.log("color",color)
                    const color=this.colorList[
                        self.config.blocking[x+','+y+","+z]
                    ]
                    
                    var geometry,material
                    geometry = new THREE.BoxGeometry(size, size, size);
                    material = new THREE.MeshBasicMaterial( {
                            // opacity: 0.3, 
                            // transparent: true
                    } );
                    material.color.r=color[0]
                    material.color.g=color[1]
                    material.color.b=color[2]
                    
                    const cube = new THREE.Mesh( geometry, material );
                    cube.position.set(x,y,z)
                    self.parentGroup.add( cube )
                    // 创建EdgesGeometry对象
                    var edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size));
                    var material = new THREE.LineBasicMaterial({
                        color: 0x000000,
                        opacity: 0.1,//0.3, 
                        transparent: true
                    });
                    var line=new THREE.LineSegments(edges, material)
                    line.position.set(x,y,z)
                    // self.parentGroup.add(line);

                }
                
        
        
    }
    modelShow(){
        window.light.visible=true
        for(let id=0;id<this.meshes.length;id++){
            const mesh=this.meshes[id]
            if(this.config.updateColor){
                let t=id*256*256*256/2665
                mesh.material.color.r=0.5*((t&0xff)    )/255
                mesh.material.color.g=0.5*((t&0xff00)>>8 )/255
                mesh.material.color.b=0.5*((t&0xff0000)>>16)/255  
            }
            
            mesh.material.opacity=1
            mesh.visible=true
        }
    }
    modelHide(){
        window.light.visible=false
        for(let i=0;i<this.meshes.length;i++){
            const mesh=this.meshes[i]
            mesh.material.color.r=mesh.material.color.g=mesh.material.color.b=0.8
            mesh.material.opacity=0.1
            mesh.material.transparent=true
            mesh.visible=false
        }
    }
    wallShow(){
        this.modelHide()
        window.light.visible=true
        const iswall=this.config.iswall
        for(let id=0;id<this.meshes.length;id++){
            // console.log(iswall[id])
            if(iswall[id+""]){
                const mesh=this.meshes[id]
                let t=id*256*256*256/2665
                mesh.material.color.r=0.5*((t&0xff)    )/255
                mesh.material.color.g=0.5*((t&0xff00)>>8 )/255
                mesh.material.color.b=0.5*((t&0xff0000)>>16)/255
                mesh.material.opacity=1
                mesh.visible=true
            }
        }
        console.log(this.config)
    }
    load0(path){
        var self=this
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onLoad = function() {// 监听加载进度事件，并输出加载百分比
            // document.getElementById("LoadProgress").innerHTML=""
            console.log("onLoad")
        };
        loadingManager.itemStart =()=>{document.getElementById("LoadProgress").innerHTML="场景模型加载中。。"}
        loadingManager.itemEnd =()=>{document.getElementById("LoadProgress").innerHTML="正在加载参数。。"}
        const loader = new GLTFLoader(loadingManager);
        console.log("path",path)
        loader.load(path, function (gltf) {
            let matrices_all=""
            let colorList=[]
            gltf.scene.traverse(o=>{
                if(o instanceof THREE.Mesh){                    
                    let mesh=o
                    
                    const name=mesh.material.id
                    if(window.data0012){
                        if(window.data0012[name])mesh.material=window.data0012[name]//return
                        else window.data0012[name]=mesh.material
                    }else window.data0012={name:mesh.material}
                    mesh=new THREE.Mesh(mesh.geometry,mesh.material)

                    // console.log()
                    mesh.myId=self.meshes.length
                    if(false)colorList.push(self.getColor2(mesh))
                    
                    if(false){//if(self.config.updateColor){
                        // console.log(mesh.myId)
                        let t=mesh.myId*256*256*256/1320 //2665
                        mesh.material.color.r=0.5*((t&0xff)    )/255
                        mesh.material.color.g=0.5*((t&0xff00)>>8 )/255
                        mesh.material.color.b=0.5*((t&0xff0000)>>16)/255
                        // mesh.material.color.r=mesh.material.color.g=mesh.material.color.b=0.8
                    }
                    
                    // mesh.material.opacity=1
                    // mesh.material.transparent=true

                    // 获取材质对象
                    if(false)if (mesh.material.map) {//水彩风场景
                        var canvas=new PicHandle().getCanvas( mesh.material.map.image);
                        const color=self.getColor(canvas)
                        mesh.material = new THREE.MeshStandardMaterial({ 
                            color:color ,
                            alphaTest: 0,
                            alphaToCoverage: false,
                            aoMapIntensity: 1,
                            blendDst: 205,
                            blendEquation: 100,
                            blendSrc: 204,
                            blending: 1,
                            bumpScale: 1,
                            clipIntersection: false,
                            clipShadows: false,
                            colorWrite: true,
                            defines: {STANDARD: ""},
                            depthFunc: 3,
                            depthTest: true,
                            depthWrite: true,
                            displacementBias: 0,
                            displacementScale: 1,
                            dithering: false,
                            emissive: 0,
                            emissiveIntensity: 1,
                            envMapIntensity: 1,
                            flatShading: false,
                            fog: true,
                            lightMapIntensity: 1,
                            metalness: 1,
                            morphNormals: false,
                            morphTargets: false,
                            normalMapType: 0,
                            opacity: 1,
                            polygonOffset: false,
                            polygonOffsetFactor: 0,
                            polygonOffsetUnits: 0,
                            premultipliedAlpha: false,
                            refractionRatio: 0.98,
                            roughness: 1,
                            side: 0,
                            skinning: false,
                            stencilFail: 7680,
                            stencilFunc: 519,
                            stencilFuncMask: 255,
                            stencilRef: 0,
                            stencilWrite: false,
                            stencilWriteMask: 255,
                            stencilZFail: 7680,
                            stencilZPass: 7680,
                            toneMapped: true,
                            transparent: false,
                            vertexColors: false,
                            vertexTangents: false,
                            visible: true,
                            wireframe: false,
                        })
                        // mesh.geometry.computeVertexNormals()
                    }

                    // console.log(mesh.material.color)
                    self.meshes.push(mesh)
                    // self.parentGroup.add(mesh)
                    const id=mesh.name.split("_")[1]
                    matrices_all=matrices_all+"[], "
                }
            })
            console.log("colorList",colorList)
            // self.saveJson(colorList,"colorList.json")

            // self.config.isdoor={}
            // for(let i=0;i<self.meshes.length;i++){
            //     self.config.isdoor[""+i]=
            //         self.meshes[i].name.split("FM甲").length>1||
            //         self.meshes[i].name.split("FM_B甲").length>1
            // }
            // saveAs(
            //     new Blob([
            //         JSON.stringify(self.config.isdoor)
            //     ], { type: 'application/json' }), 
            //     'isdoor.json'
            // )
            
            
            // console.log("matrices_all",matrices_all)
            self.parentGroup.add(gltf.scene)
            window.meshes=self.meshes
            window.initBox=()=>{
                window.downBox= new THREE.Mesh( 
                    new THREE.BoxGeometry( 1000000, 0.001, 100000 ), 
                    new THREE.MeshBasicMaterial( {color: 0x00ff00,opacity: 0.3, transparent: true} ) );
                self.scene.add(window.downBox)
                window.upBox= new THREE.Mesh( 
                    new THREE.BoxGeometry( 1000000, 0.001, 100000 ), 
                    new THREE.MeshBasicMaterial( {color: 0x00ff00,opacity: 0.3, transparent: true} ) );
                self.scene.add(window.upBox)
                window.downBox.position.y=450
                window.upBox.position.y  =3400
            }
            window.downloadBox=()=>{
                window.downBox
                window.upBox
                self.saveMesh(window.downBox,self.meshes.length+".obj")
                self.saveMesh(window.upBox,  (self.meshes.length+1)+".obj")
            }
            window.getOneStorey=(a,b)=>{
                if (!window.downBox){
                    window.initBox()
                }
                window.downBox.position.y=a
                window.upBox.position.y=b

                for(let i=0;i<meshes.length;i++){
                    meshes[i].visible = self.InY(meshes[i],a,b)
                }
            }
            // self.wallShow()
            // self.modelShow()
            //test(450,3400);//test(50,3400);// test(50,3400);

            const save = function(index){
                console.log(index,index+".obj")
                self.saveMesh(meshes[index],index+".obj")
                if(index+1>=meshes.length) {
                    console.log("finish!")
                }else{
                    setTimeout(()=>{
                        save(index+1)
                    },100)
                }
            }
            const save2 = function(index){
                console.log(index,meshes[index]);
                self.saveMesh2(meshes[index],index+".gltf")
                if(index+1>=meshes.length) {
                    console.log("finish!")
                }else{
                    setTimeout(()=>{
                        save2(index+1)
                    },250)
                }
            }
            const save2_material = function(index){
                self.saveMesh2_material(meshes[index])
                if(index+1>=meshes.length) {
                    console.log("finish!")
                }else{
                    setTimeout(()=>{
                        save2_material(index+1)
                    },250)
                }
            }
            window.save=()=>{
                save(0)
            }
            window.save2=()=>{
                save2(0)
            }
            window.save2_material=()=>{
                save2_material(0)
            }
            window.save3=()=>{
                self.saveMesh3(self.scene,"all.gltf")
            }
            window.downloadAll=()=>{
                const scene=new THREE.Scene()
                for(let i=0;i<meshes.length;i++){
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
        }, undefined, function (error) {
            console.error(error);
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
    // saveMesh2(mesh,name){
    //     const scene=new THREE.Scene()
    //     scene.add(mesh)
        
    //     // 创建 GLTFExporter 对象
    //     const exporter = new GLTFExporter();

    //     // 导出 glTF 文件
    //     exporter.parse(scene, (result) => {
    //         // 将导出的数据存储为二进制文件
    //         const blob = new Blob([result], { type: 'model/gltf-binary' });

    //         // 创建链接，并下载文件
    //         const link = document.createElement('a');
    //         link.href = URL.createObjectURL(blob);
    //         link.download = name
    //         link.click();
    //     });
    // }
    saveMesh2_old2(mesh,name){
        mesh.geometry.attributes.position.data = new THREE.BufferAttribute(
            new Float32Array(
                mesh.geometry.attributes.position.data.array
            ),
            4)
        delete mesh.geometry.attributes.normal

        // const scene=new THREE.Scene()
        // scene.add(mesh)
        // new GLTFExporter().parse(scene,function(result){
        //     var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
        //     let link = document.createElement('a')
        //     link.href = URL.createObjectURL(myBlob)
        //     link.download = name
        //     link.click()
        // })
    }
    saveMesh2_old1(mesh,name){
        mesh.geometry.attributes.position = new THREE.BufferAttribute(
            mesh.geometry.attributes.position.data, 
            mesh.geometry.attributes.position.itemSize)
        delete mesh.geometry.attributes.normal// geometry.computeVertexNormals();

        const scene=new THREE.Scene()
        scene.add(mesh)
        new GLTFExporter().parse(scene,function(result){
            var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
            let link = document.createElement('a')
            link.href = URL.createObjectURL(myBlob)
            link.download = name
            link.click()
        })
    }
    saveMesh2(mesh,name){
        console.log(mesh)
        if(mesh.geometry.attributes.position.data){
            const array1=mesh.geometry.attributes.position.data.array
            const array2=[]
            for(let i=0;i<array1.length/4;i++)
                for(let j=0;j<3;j++)
                    array2.push(
                        array1[4*i+j]
                    )
            mesh.geometry.attributes.position = new THREE.BufferAttribute(
                new Float32Array(array2), 
                3//4
            )//mesh.geometry.attributes.position.itemSize)
        }
        
        delete mesh.geometry.attributes.normal// geometry.computeVertexNormals();

        const scene=new THREE.Scene()
        const mesh2=mesh.clone()
        mesh2.applyMatrix4(mesh.matrixWorld);
        scene.add(mesh2)
        new GLTFExporter().parse(scene,function(result){
            var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
            let link = document.createElement('a')
            link.href = URL.createObjectURL(myBlob)
            link.download = name
            link.click()
        })
    }
    saveMesh2_material(mesh){
        const name=mesh.material.id+".gltf"
        if(window.data0012){
            if(window.data0012[name])return
            else window.data0012[name]=true
        }else window.data0012={name:true}
        // console.log(mesh)
        if(mesh.geometry.attributes.position.data){
            const array1=mesh.geometry.attributes.position.data.array
            const array2=[]
            for(let i=0;i<array1.length/4;i++)
                for(let j=0;j<3;j++)
                    array2.push(
                        array1[4*i+j]
                    )
            mesh.geometry.attributes.position = new THREE.BufferAttribute(
                new Float32Array(array2), 
                3//4
            )
        }
        
        delete mesh.geometry.attributes.normal// geometry.computeVertexNormals();

        const scene=new THREE.Scene()
        const mesh2=new THREE.Mesh(
            new THREE.PlaneGeometry( 1, 1 ),//mesh.geometry,
            mesh.material
        )//mesh.clone()
        delete mesh2.geometry.attributes.normal
        mesh2.applyMatrix4(mesh.matrixWorld);
        scene.add(mesh2)
        new GLTFExporter().parse(scene,function(result){
            var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
            let link = document.createElement('a')
            link.href = URL.createObjectURL(myBlob)
            link.download = name
            link.click()
        })
    }
    mesh2load(mesh){
        const array1=mesh.geometry.attributes.position.data.array
        const array2=[]
        for(let i=0;i<array1.length/4;i++)
            for(let j=0;j<3;j++){
                array2.push(
                    array1[4*i+j]
                )
            }
        mesh.geometry.attributes.position = new THREE.BufferAttribute(
            new Float32Array(
                array2//mesh.geometry.attributes.position.data.array
            ), 
            3//4
        )//mesh.geometry.attributes.position.itemSize)
        delete mesh.geometry.attributes.normal// geometry.computeVertexNormals();
        return mesh
    }
    saveMesh3(scene0,name){
        const scene=new THREE.Scene()
        const arr=Object.values(this.meshes)
        for(let i=0;i<arr.length;i++){
            scene.add(this.mesh2load(arr[i]))
        }
        new GLTFExporter().parse(scene,function(result){
            var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
            let link = document.createElement('a')
            link.href = URL.createObjectURL(myBlob)
            link.download = name
            link.click()
        })
    }
    saveJson(data,name){
        const jsonData = JSON.stringify(data);//JSON.stringify(data, null, 2); // Convert JSON object to string with indentation
        
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
    InY(mesh,ymin,ymax){
        var box = new THREE.Box3().setFromObject(mesh)
        // return box.max.y<ymax && box.min.y>ymin
        return box.min.y<ymax && box.max.y>ymin //&&box.max.z>-7766
    }
    getColor(canvas) {//取100个点求平均值
        var ctx=canvas.getContext( "2d" );  //设置画布类型2d
        var r=0,g=0,b=0,n=0;
        var dy=canvas.height<20?canvas.height:Math.floor(canvas.height/10);
        var dx=canvas.width<20?canvas.width:Math.floor(canvas.width/10);
        for( var y = 0; y < canvas.height; y+=dy )
            for( var x = 0; x < canvas.width ; x+=dx ) {
                // 获取当前位置的元素
                var pixel = ctx.getImageData( x, y, 1, 1 );//获取一个像素点的数据
                r+=pixel.data[0];
                g+=pixel.data[1];
                b+=pixel.data[2];
                n++;
            }
        //n=canvas.height*canvas.width;
        r=Math.floor(r/n);
        g=Math.floor(g/n);
        b=Math.floor(b/n);
        var color=(r*256*256+g*256+b);//.toString(16);
        // console.log(color.toString(16));
        return color;
    }
    getColor2(mesh){
        if(mesh.material.map){
            let canvas=new PicHandle().getCanvas( mesh.material.map.image);
            return this.getColor(canvas)
        }else return 0xFFFFFF
        
    }
}

function PicHandle() {//只服务于MaterialHandle对象
    this.image;
    this.h;
    this.w;
    this.compressionRatio=0.1;//0-1
}
PicHandle.prototype={
    getCanvas:function (image) {
        var flipY = true;
        var canvas =  document.createElement( 'canvas' );
        //计算画布的宽、高
        canvas.width = image.width*this.compressionRatio;
        canvas.height = image.height*this.compressionRatio;

        var ctx = canvas.getContext( '2d' );

        if ( flipY === true ) {
            ctx.translate( 0, canvas.height );
            ctx.scale( 1, - 1 );
        }
        //将image画到画布上
        ctx.drawImage( image, 0, 0, canvas.width, canvas.height );


        /*var ctx=this.canvas.getContext( "2d" );  //设置画布类型2d
        ctx.fillStyle = "#FFFFFF";//白色
        for( var y = 0; y < this.canvas.height; y++ ) {
            for( var x = 0; x < this.canvas.width ; x++ ) {
                // 获取当前位置的元素
                var pixel = ctx.getImageData( x, y, 1, 1 );//获取一个像素点的数据
                // 判断透明度不为0
                if( pixel.data[0] +pixel.data[1] +pixel.data[2] >100) {//如果颜色较亮
                    ctx.fillRect(x,y,1,1);
                }
            }
        }*/
        return canvas;
    },

}