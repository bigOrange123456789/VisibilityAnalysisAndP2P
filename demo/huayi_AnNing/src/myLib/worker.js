import * as THREE from "three";
import {ZipLoader} from "./ziploader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import{Classification} from "../parametric/Classification";
import{CoderDecoder  } from "../parametric/CoderDecoder";
// import { parameterFlag } from '../parametric/parameter.json'
// console.log("parameterFlag",parameterFlag)
///////////改动的部分--开始///////////   --1--
let parameterFlag=false
if(false)
Classification.loadJson("./parameter.json",result=>{
    parameterFlag=result
    console.log(result)
})
///////////改动的部分--结束///////////   --1--
// var loadingList = [];
// var postTimes = 0;
//
// setInterval(function(){
//     // console.log(loadingList);
//     console.log("post times: "+postTimes);
// },5000);

onmessage = function(e){
    let to_load_list = e.data;
    // console.log(to_load_list);
    for(let i=0; i<to_load_list.length; i++){
        // loadingList.push(to_load_list[i]);
        loadModelZip(to_load_list[i]);
    }
}

function loadModelZip(index){
    ///////////改动的部分--开始///////////   --0-1--
    if(parameterFlag){
        if(parameterFlag[index]==1){//cube
            // Classification.loadJson("./assets/cube/"+index+".json",result=>{
            //     postMessage({code:CoderDecoder.sim2code(result,"cube")})
            // })
            CoderDecoder.loadBin("./assets/cubeBin/"+index+".bin",result=>{
                postMessage({code:CoderDecoder.sim2code(result,"cube")})
            })
            return
        }else if(parameterFlag[index]==2){//cylinder
            // Classification.loadJson("./assets/cylinder/"+index+".json",result=>{
            //     postMessage({code:CoderDecoder.sim2code(result,"cylinder")})
            // })
            CoderDecoder.loadBin("./assets/cylinderBin/"+index+".bin",result=>{
                postMessage({code:CoderDecoder.sim2code(result,"cylinder")})
            })
            return
        }
    }
    ///////////改动的部分--结束///////////   --0-1--
    var url = "./assets/huayi/components/"+index+".zip";///////////改动的部分--单行///////////
    var loader = new THREE.LoadingManager();
    new Promise(function(resolve,reject){
        new ZipLoader().load(url,()=>{
        },()=>{
            console.log("model加载失败："+index);
        }).then((zip)=>{
            loader.setURLModifier(zip.urlResolver);
            resolve({
                matrices: zip.find("json"),
                models: zip.find("glb")
            });
        })
    }).then(function(zipContent){
        new THREE.FileLoader(loader).load(zipContent.matrices[0],(json)=>{
            let matrix = JSON.parse(json);
            // let pos = loadingList.indexOf(index);
            // if(pos!==-1) loadingList.splice(pos,1);
            // postTimes++;
            if(zipContent.models.length===1){
                new GLTFLoader(loader).load(zipContent.models[0], (gltf)=>{
                    let mesh = gltf.scene.children[0].children[0];
                    ///////////改动的部分--开始///////////   --1--
                    if(false){
                        let classification = new Classification(mesh,[])
                        if(classification.code){
                            // console.log("flag0049",mesh)
                            // mesh=classification.mesh2
                            // console.log({code:classification.code})
                            postMessage({code:classification.code})
                            return
                            // material=new THREE.MeshBasicMaterial()
                        }else{
                            // return
                            // material=new THREE.MeshBasicMaterial()
                            // material.color.r=1//color[0]
                            // material.color.g=0//color[1]
                            // material.color.b=0//color[2]
                        }
                    }
                    ///////////改动的部分--结束///////////
                    postMessage({
                        index: index,
                        matrix: matrix,
                        vertices: mesh.geometry.attributes.position.array,
                        normal: mesh.geometry.attributes.normal? mesh.geometry.attributes.normal.array : null,
                        indices: mesh.geometry.index? mesh.geometry.index.array : null,
                        vertices_simp: null,
                        normal_simp: null,
                        indices_simp: null,
                        color: mesh.material.color
                    });
                })
            }else{
                return;//测试
                new GLTFLoader(loader).load(zipContent.models[1], (gltf)=>{
                    let mesh = gltf.scene.children[0].children[0];
                    new GLTFLoader(loader).load(zipContent.models[0], (gltf)=>{
                        let mesh_simp = gltf.scene.children[0].children[0];
                        ///////////改动的部分--开始///////////   --2--
                        // let classification = new Classification(mesh,[])
                        // if(classification.mesh2){
                        //     mesh=classification.mesh2
                        //     mesh_simp=mesh
                        //     // material=new THREE.MeshBasicMaterial()
                        // }else{
                        //     // material=new THREE.MeshBasicMaterial()
                        //     // material.color.r=1//color[0]
                        //     // material.color.g=0//color[1]
                        //     // material.color.b=0//color[2]
                        // }
                        ///////////改动的部分--结束///////////
                        mesh_simp.geometry.computeVertexNormals();
                        postMessage({
                            index: index,
                            matrix: matrix,
                            vertices: mesh.geometry.attributes.position.array,
                            normal: mesh.geometry.attributes.normal? mesh.geometry.attributes.normal.array : null,
                            indices: mesh.geometry.index? mesh.geometry.index.array : null,
                            vertices_simp: mesh_simp.geometry.attributes.position.array,
                            normal_simp: mesh_simp.geometry.attributes.normal? mesh_simp.geometry.attributes.normal.array : null,
                            indices_simp: mesh_simp.geometry.index? mesh_simp.geometry.index.array : null,
                            color: mesh.material.color
                        });
                    })
                })
            }
        })
    })
}
