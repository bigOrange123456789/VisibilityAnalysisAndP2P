import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { P2P } from './lib/P2P.js'
import {ZipLoader } from './lib/ziploader.js';

export class Building{
    constructor(camera){
        this.meshes={}
        this.meshes_request={}

        this.p2p=new P2P(camera)
        this.p2p.parse=message=>{self.p2pParse(message)}
    }
    loadZip(id,cb){
        if(this.meshes_request[id])return
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
}
