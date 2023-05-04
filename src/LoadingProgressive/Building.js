import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {OBJExporter} from "three/examples/jsm/exporters/OBJExporter"
import { saveAs } from 'file-saver';
import config from '../../config/configOP.json'
import { Visibility } from './Visibility.js'
import { P2P } from './P2P.js'
import { Detection } from './Detection.js'
import {ZipLoader } from '../../lib/zip/ziploader.js';
export class Building{
    constructor(scene,camera){
        document.getElementById("LoadProgress").innerHTML=""
        let self=this
        this.scene=scene
        
        this.config=config.src.Building_new
        this.NumberOfComponents=this.config.NumberOfComponents

        window.config0=this.config
        this.parentGroup = new THREE.Group()
        this.parentGroup.scale.set(
            this.config.parentGroup.scale.x,
            this.config.parentGroup.scale.y,
            this.config.parentGroup.scale.z
        )
        scene.add(this.parentGroup)
        this.meshes={}
        window.meshes=this.meshes
        this.meshes_request={}

        this.detection=new Detection(this.meshes)
        
        // this.doorTwinkle()
        // this.createFloor()
        this.p2p=new P2P(camera,this.detection)
        this.p2p.parse=message=>{self.p2pParse(message)}
        this.loaderZip=new THREE.LoadingManager()

        // this.load0()
        let c=this.config.createSphere
        this.visibiity=new Visibility(
            {
                "min": [c.x[0],c.y[0],c.z[0]],
                "max": [c.x[1],c.y[1],c.z[1]],
                "step": [
                    (c.x[1]-c.x[0])/c.x[2],
                    (c.y[1]-c.y[0])/c.y[2],
                    (c.z[1]-c.z[0])/c.z[2]
                ]
            },
            camera,
            list=>{
                self.loading(list)
            },
            this.meshes
        )
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
    addMesh(id,mesh){
        this.detection.receiveMesh(mesh)
        mesh.myId=id

        let t=mesh.myId*256*256*256/8431 ///2665
        mesh.material.color.r=0.5*((t&0xff)    )/255
        mesh.material.color.g=0.5*((t&0xff00)>>8 )/255
        mesh.material.color.b=0.5*((t&0xff0000)>>16)/255
        // mesh.geometry.computeFaceNormals()
        // mesh.material.color.r=mesh.material.color.g=mesh.material.color.b=((t&0xff)    )/255
        mesh.geometry.computeVertexNormals()

        this.meshes[id]=mesh
        // mesh.visible=false
        this.parentGroup.add(mesh)
        this.visibiity.prePoint2=""//重新进行可见剔除
    }
    loadGLB(id,cb){
        if(this.meshes_request[id])return
        this.meshes_request[id]=performance.now()//true
        var self=this
        const loader = new GLTFLoader();
        loader.load(self.config.path+id+".glb", gltf=>{
            // console.log(id)
            gltf.scene.traverse(o=>{
                if(o instanceof THREE.Mesh){                    
                    self.addMesh(id,o)
                }
            })
            if(cb)cb()
        }, undefined, function (error) {
            console.error(error);
        });
    }
    loadZip(id,cb){
        if(this.meshes_request[id])return
        this.detection.receivePack("server")
        this.meshes_request[id]=performance.now()//true
        const self=this
        var url=self.config.path+id+".zip"
	    new Promise( function( resolve, reject ) {//加载资源压缩包
            const zipLoader=new ZipLoader()
		    zipLoader.load( url,()=>{
		    },()=>{
			    console.log("加载失败："+id)
			    setTimeout(()=>{//重新请求
			    },1000*(0.5*Math.random()+1))//1~1.5秒后重新加载
		    }).then( ( zip )=>{//解析压缩包
                self.p2p.send({
                    cid:id,
                    baseUrl:zipLoader.baseUrl,
                    buffer:zipLoader.buffer
                })
                new ZipLoader().parse(zipLoader.baseUrl,zipLoader.buffer).then( ( zip )=>{//解析压缩包
                    self.loaderZip.setURLModifier( zip.urlResolver );//装载资源
                    resolve({//查看文件是否存在？以及路径
                        fileUrl: zip.find( /\.(gltf|glb)$/i )
                    });
                },()=>{});
		    });
	    } ).then( function ( configJson ) {
		    const loader = new GLTFLoader(self.loaderZip);
		    loader.load(configJson.fileUrl[0], (gltf) => {
                // self.p2p.send({cid:id,myArray:loader.myArray})
                gltf.scene.traverse(o=>{
                    if(o instanceof THREE.Mesh){                    
                        o.LoadDelay=performance.now()-self.meshes_request[id]
                        o.originType="cloud"
                        self.addMesh(id,o)
                    }
                })
                if(cb)cb()
		    });
	    } );
    }
    p2pParse(message){
        this.detection.receivePack("p2p")
        const cid=message.cid
        if(this.meshes[cid]||this.meshes_request[cid])return
		else this.meshes_request[cid]=true
        const self=this
		new Promise( function( resolve, reject ) {//加载资源压缩包
            new ZipLoader().parse(message.baseUrl,message.buffer).then( ( zip )=>{//解析压缩包
                self.loaderZip.setURLModifier( zip.urlResolver );//装载资源
                resolve({//查看文件是否存在？以及路径
                    fileUrl: zip.find( /\.(gltf|glb)$/i )
                });
            },()=>{});
	    } ).then( function ( configJson ) {
		    const loader = new GLTFLoader(self.loaderZip);
		    loader.load(configJson.fileUrl[0], (gltf) => {
                gltf.scene.traverse(o=>{
                    if(o instanceof THREE.Mesh){           
                        o.LoadDelay=0         
                        o.originType="edgeP2P"
                        self.addMesh(cid,o)
                    }
                })
		    });
	    } );
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
        const self=this;
        for(let i=0;i<50&&i<list.length;i++){
            this.loadZip(list[i])
        }
        setTimeout(()=>{
            for(let i=50;i<list.length;i++){
                self.loadZip(list[i])
            }
        },100)
    }
    saveMesh(mesh,name){
        const scene=new THREE.Scene()
        // mesh.geometry.attributes.normal=null
        // mesh.geometry.attributes={
        //     position:mesh.geometry.attributes.position
        // }
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
    InY(mesh,ymin,ymax){
        var box = new THREE.Box3().setFromObject(mesh)
        // return box.max.y<ymax && box.min.y>ymin
        return box.min.y<ymax && box.max.y>ymin //&&box.max.z>-7766
    }
}
