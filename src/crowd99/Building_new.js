import * as THREE from "three";
import JSZip from 'jszip';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"

export class Building{
    constructor(scene){
        window.list000=[]
        this.parentGroup = new THREE.Group()
        // this.parentGroup.scale.set(0.0005,0.0005,0.0005)

        scene.add(this.parentGroup)
        this.parentGroup.position.z=-32

        this.load()
        // this.createFloor()
    }
    createFloor(){
        const geometry = new THREE.BoxGeometry( 10000, 0.01, 10000 );
        const material = new THREE.MeshPhongMaterial( );
        material.color.r=material.color.g=material.color.b=0
        const floor = new THREE.Mesh( geometry, material );
        floor.position.y=-0.1
        window.floor=floor
        this.parentGroup.add( floor );
    }
    load(){
        var self = this
        new THREE.FileLoader().load("assets/Building/structdesc.json",json=>{
            var structList = JSON.parse(json)
            new THREE.FileLoader().load("assets/Building/smatrix.json",json=>{
                var matrixList = JSON.parse(json)
                var i = 0
                var loading = setInterval(function(){
                    self.loadZip(i,structList,matrixList)
                    if(++i===5) clearInterval(loading)
                },10)
            })
        })
    }
    loadZip(index,structList,matrixList){
        var self = this
        var url = "assets/Building/output"+index+".zip"
        var promise = JSZip.external.Promise
        var baseUrl = "blob:"+THREE.LoaderUtils.extractUrlBase(url)
        new promise(function(resolve,reject){
            var loader = new THREE.FileLoader(THREE.DefaultLoadingManager)
            loader.setResponseType('arraybuffer')
            loader.load(url,resolve,()=>{},reject)
        }).then(function(buffer){
            return JSZip.loadAsync(buffer)
        }).then(function(zip){
            var fileMap = {}
            var pendings = []
            for (var file in zip.files){
                var entry = zip.file(file)
                if(entry===null) continue
                pendings.push(entry.async("blob").then(function(file,blob){
                    fileMap[baseUrl+file] = URL.createObjectURL(blob)
                }.bind(this,file)))
            }
            return promise.all(pendings).then(function(){
                return fileMap
            })
        }).then(function(fileMap){
            return {
                urlResolver:function(url){
                    return fileMap[url]?fileMap[url]:url
                }}
        }).then(function(zip){
            var manager = new THREE.LoadingManager()
            manager.setURLModifier(zip.urlResolver)
            return manager
        }).then(function(manager){
            new GLTFLoader(manager).load("blob:assets/Building/output"+index+".glb",gltf=>{
                gltf.scene.traverse(object=>{
                    if(object instanceof THREE.Mesh){
                        console.log(object)

                        object.material.color.r/=10
                        object.material.color.g/=10
                        object.material.color.b/=10

                        object.material.color.r=object.material.color.g=object.material.color.b=-1//0
                        
                        object.material.roughness=0.5//1
                        // object.material.metalness=1

                        object.material.emissiveIntensity=0
                        object.material.lightMapIntensity=0
                        object.material.aoMapIntensity=0

                        
                    }
                })
                var meshNodeList = gltf.scene.children[0].children
                self.processMesh(meshNodeList,structList,matrixList,index)
            })
        })
    }
    processMesh(meshNodeList,structList,matrixList,index){
        for(let i=0; i<meshNodeList.length; i++){
            var node = meshNodeList[i].clone()
            {
                var name=node.name
                var c=node.material.color
                // c.r=1-c.r
                // c.g=1-c.g
                // c.b=1-c.b
                if(index<4){
                    c.r+=1.5
                    c.g+=1.5
                    c.b+=1.5
                }
                
                // if(name.split("image").length>1){
                // }else if(name=='xialouti_4'){
                // }else if(name.split("Wutai").length>1){
                // }else if(name.split("videowall").length>1){
                // }
                // else{
                //     // {
                //     //     c.r+=0.05
                //     //     c.g+=0.21
                //     //     c.b+=0.21
                //     // }
                // }
            }
            this.parentGroup.add(node)
            var stride = 3
            for(let j=0; j<structList[i].length; j++){
                var object = node.clone()
                object.geometry = node.geometry.clone()
                var group = structList[i][j]
                if(matrixList[group.n].it.length===0) continue
                var index_arr = []
                for(let k=0; k<group.c*3; k+=3){
                    for(let l=0; l<3; l++){
                        index_arr.push(node.geometry.index.array[group.s*3+k+l])
                    }
                }
                var position_arr = []
                var pushed_index = []
                var updated_index_arr = []
                for(let k=0; k<index_arr.length; k++){
                    var t = pushed_index.indexOf(index_arr[k])
                    if(t===-1){
                        pushed_index.push(index_arr[k])
                        updated_index_arr.push(position_arr.length/3)
                        for(let l=0; l<3; l++){
                            position_arr.push(node.geometry.attributes.position.array[index_arr[k]*stride+l])
                        }
                    }else{
                        updated_index_arr.push(t)
                    }
                }
                var new_position_array = new Float32Array(position_arr)
                var new_index_array = new Uint16Array(updated_index_arr)
                object.geometry.attributes.position = new THREE.BufferAttribute(new_position_array,3)
                object.geometry.index = new THREE.BufferAttribute(new_index_array,1)
                object.geometry.computeVertexNormals()

                matrixList[group.n].it.push([1,0,0,0,0,1,0,0,0,0,1,0])
                
                var instanceMesh = new THREE.InstancedMesh(object.geometry,object.material,matrixList[group.n].it.length)
                for(let k=0; k<matrixList[group.n].it.length; k++){
                    var mat = matrixList[group.n].it[k]
                    var instanceMatrix = new THREE.Matrix4().set(
                        mat[0], mat[1], mat[2], mat[3],
                        mat[4], mat[5], mat[6], mat[7],
                        mat[8], mat[9], mat[10], mat[11],
                        0, 0, 0, 1)
                    instanceMesh.setMatrixAt(k,instanceMatrix)
                }
                this.parentGroup.add(instanceMesh)
            }
        }
    }
}
