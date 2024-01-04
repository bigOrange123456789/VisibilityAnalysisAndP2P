import {
    FileLoader,
    LoadingManager
} from "three";
import {ZipLoader} from "./ziploader";
import { GLTFLoaderEx } from "./threeEx/GLTFLoaderEx";

var projectName = "ExhibitionHall";

onmessage = function(e){
    let to_load_list = e.data;
    for(let i=0; i<to_load_list.length; i++){
        loadModelZip(to_load_list[i]);
    }
}

function loadModelZip(index){
    var url = "./assets/models/"+projectName+"/"+index+".zip";
    var loader = new LoadingManager();
    new Promise(function(resolve,reject){
        new ZipLoader().load(url,()=>{
        },()=>{
            console.log("model加载失败："+index);
        }).then((zip)=>{
            loader.setURLModifier(zip.urlResolver);
            resolve({
                matrices: zip.find("json"),
                models: zip.find("gltf")
            });
        })
    }).then(function(zipContent){
        new FileLoader(loader).load(zipContent.matrices[0],(json)=>{
            let matrix = JSON.parse(json);
            // let pos = loadingList.indexOf(index);
            // if(pos!==-1) loadingList.splice(pos,1);
            // postTimes++;
            new GLTFLoaderEx(loader).load(zipContent.models[0], (gltf)=>{
                let mesh = gltf.scene.children[0].children[0];
                // console.log(mesh.material.opacity)
                postMessage({
                    index: index,
                    matrix: matrix,
                    geometry: {
                        vertices: mesh.geometry.attributes.position.array,
                        normals: mesh.geometry.attributes.normal? mesh.geometry.attributes.normal.array : null,
                        uvs: mesh.geometry.attributes.uv? mesh.geometry.attributes.uv.array : null,
                        indices: mesh.geometry.index? mesh.geometry.index.array : null
                    },
                    material: {
                        color: mesh.material.color,
                        roughness: mesh.material.roughness,
                        metalness: mesh.material.metalness,
                        opacity: mesh.material.opacity,
                        emissive: mesh.material.emissive,
                        image: mesh.material.map? mesh.material.map.image : null,
                        offset: mesh.material.map? mesh.material.map.offset : null,
                        repeat: mesh.material.map? mesh.material.map.repeat : null,
                    },
                    mesh:mesh
                });
            })
        })
    })
}