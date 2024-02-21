import {
    FileLoader,
    Group, InstancedMesh,
    LoadingManager, 
    Matrix4, 
    Vector3, 
    MeshStandardMaterial,
    TextureLoader,RepeatWrapping
} from "three";
import { Engine3D } from '../src/main.js'
import { ZipLoader } from "./ziploader";
import { GLTFLoaderEx } from "./threeEx/GLTFLoaderEx";
import {Water} from "./threeEx/Water2";
import{LoadZip}from"./LoadZip"
import InitialVisibleList from '../config/InitialVisibleList.json'

const normalMap=new TextureLoader().load('assets/textures/water/waternormals.jpg',function(texture){
        texture.wrapS = texture.wrapT = RepeatWrapping;
        // texture.repeat.x=200
        // texture.repeat.y=200

        console.log(texture)
    })
export class SceneManager {
    
    constructor() {
        const self=this
        this.loadZip=new LoadZip((m1,meshIndex,matrixConfig,structdesc0,jsonDataAll)=>{
            const index=meshIndex
            let pos = self.loadingModelList.indexOf(index)
            if(pos===-1) {
                // alert("?:"+index);
                // return;
            }else{
                self.loadingModelList.splice(pos,1)
                if(!self.loadedModelList.includes(index))
                    self.loadedModelList.push(index) 
            }
            self.addInsModel(jsonDataAll, m1);
        })
        this.projectName = window.projectName;
        this.scene = window.scene;
        this.camera = window.camera;
        this.instanceGroup = new Group();
        this.scene.add(this.instanceGroup);
        this.matrixWorld = null;

        this.visibleModelList = [];

        this.FVS = [];
        this.SVS = [];
        this.PVS = [];

        this.loadingModelList = [];
        this.toLoadModelList = [];
        this.loadedModelList = [];

        this.loaded_mesh = {};
        this.loaded_mesh_interest = {};
        this.loaded_mesh_invisible_time = {};

        this.loaded_mesh_limit = 2500; //缓存构件数限制
        this.loadlimit = 200;
        this.loading = false;
        this.httping = true;
        this.pre_camera_position = new Vector3();

        this.mesText1 = document.createElement("p");
        document.body.appendChild(this.mesText1);
        this.mesText1.style.position = "fixed";
        this.mesText1.style.left = 20 + "px";
        this.mesText1.style.top = 0 + "px";
        this.mesText1.style.fontSize = window.innerHeight / 60 + "px";

        this.waterList = []

        // 192.168.114.129
        // 47.103.21.207

        this.server_ip = "ws://47.116.5.3:4003";
        // if(false)
        this.startConnect();

        this.processLoadList(InitialVisibleList)
        // for(let i=4000; i<4050; i++){
        //     this.loadModelZip(i);
        // }
    }
    startConnect(){
        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)

        var self = this;
        this.ws = new WebSocket(this.server_ip)
        this.ws.onopen = (evt) => {
            console.log("websocket connect succeed")
            self.ws.send(JSON.stringify({typ:-1}))
        }
        this.ws.onclose = (evt) => {
            // window.alert("暂时无法访问服务器")
        }
        this.ws.onmessage = (evt) => {
            let res = JSON.parse(evt.data)
            if(res["mat"]){
                let m = JSON.parse(res["mat"]);
                self.matrixWorld = new Matrix4().set(
                    m[0],
                    m[4],
                    m[8],
                    m[12],
                    m[1],
                    m[5],
                    m[9],
                    m[13],
                    m[2],
                    m[6],
                    m[10],
                    m[14],
                    m[3],
                    m[7],
                    m[11],
                    m[15]
                );
                console.log(self.matrixWorld)
                self.instanceGroup.applyMatrix4(self.matrixWorld);
                self.httping = false;
            }else{
                if(res["res"].length){
                    if(Array.isArray(res["res"][0])){
                        // console.log("occlusion culling")
                        if(positionMatch(res["pos"],self.camera.position)){
                            self.httping = false
                            self.processSVS(res["res"])
                        }else{
                            let frustumPVS_data = {
                                mat:new Matrix4().multiplyMatrices(self.camera.projectionMatrix,self.camera.matrixWorldInverse).elements,
                                pos:self.camera.position,
                                wid:document.documentElement.clientWidth,
                                hei:document.documentElement.clientHeight,
                                typ:0
                            }
                            self.ws.send(JSON.stringify(frustumPVS_data))
                            self.pre_camera_position = self.camera.position.clone()
                        }
                    }else{
                        // console.log("frustum culling")
                        let frustumPVS_data = {
                            mat:new Matrix4().multiplyMatrices(self.camera.projectionMatrix,self.camera.matrixWorldInverse).elements,
                            pos:self.camera.position,
                            wid:document.documentElement.clientWidth,
                            hei:document.documentElement.clientHeight,
                            PVS:res["res"],
                            typ:1
                        }
                        if(positionMatch(res["pos"],self.camera.position)){ // 如果相机没有改变，进行遮挡剔除
                            self.ws.send(JSON.stringify(frustumPVS_data))
                            // self.httping = false
                        }else{                                              // 如果相机改变了，再来一次视锥剔除
                            delete frustumPVS_data["PVS"]
                            frustumPVS_data["typ"] = 0
                            self.ws.send(JSON.stringify(frustumPVS_data))
                            self.pre_camera_position = self.camera.position.clone()
                        }
                        self.processFVS(res["res"])
                    }
                }
            }
        };

    }
    animate() {
        if (!this.camera.position.equals(this.pre_camera_position) && !this.httping) {
            this.httping = true
            this.sceneCulling();
        }
        if(false)
        this.setVisibility(this.visibleModelList);//判断是否可见
        if(false)
        this.processLoadList(this.toLoadModelList)//是否进行加载
        this.manageCaches()

        if(false)
        for(let i=0; i<this.waterList.length; i++){
            let water = this.waterList[i]
            water.material.uniforms['time'].value += 4.0/120.0
        }

        requestAnimationFrame(this.animate);
    }
    sceneCulling() {
        let frustumMat = new Matrix4().multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse)
        let frustum_data = JSON.stringify({
            mat:frustumMat.elements,
            pos:this.camera.position,
            wid:document.documentElement.clientWidth,
            hei:document.documentElement.clientHeight,
            typ:0
        })
        // console.log(document.documentElement.clientWidth,document.documentElement.clientHeight)
        this.pre_camera_position = this.camera.position.clone()
        this.ws.send(frustum_data)
    }
    setVisibility(list) {
        var vis_num = 0;
        var invis_num = 0;
        for (let i = 0; i < this.loadedModelList.length; i++) {
            let index = this.loadedModelList[i];
            if (list.includes(index) || index===209) {
                // 可见
                if (this.loaded_mesh[index]) {
                    this.loaded_mesh[index].visible = true;
                    this.loaded_mesh_invisible_time[index] = 0;
                    vis_num++;
                }
            } else {
                // 不可见
                if (this.loaded_mesh[index]) {
                    this.loaded_mesh[index].visible = false;
                    this.loaded_mesh_invisible_time[index] += 1;
                    invis_num++;
                }
            }
        }
        // console.log(this.loadedModelList.length)
        this.mesText1.innerText = "构件数：" + vis_num + "/" + list.length;
    }
    processFVS(FVS){
        this.FVS = FVS
        this.visibleModelList = FVS
        let load_list = []
        for(let i=0; i<FVS.length; i++){
            if(!this.loadedModelList.includes(FVS[i])){
                load_list.push(FVS[i])
            }
        }
        for(let i=0; i<this.loadingModelList.length; i++) {
            if (!FVS.includes(this.loadingModelList[i])) {
                this.loadingModelList.splice(i, 1)
                i--
            }
        }
        // console.log("PVS new load:",load_list.length)
        this.toLoadModelList = load_list
        if(load_list.length)
            this.processLoadList(load_list)
    }
    processSVS(res){
        let SVS = res[0]
        let PVS = res[1]
        this.SVS = SVS
        this.PVS = PVS
        let FVS = [...SVS, ...PVS]
        this.FVS = FVS.slice(0,Math.floor(FVS.length/5))
        this.visibleModelList = SVS
        let load_list = []
        let pon_load_list = []
        for(let i=0; i<SVS.length; i++){
            if(!this.loadedModelList.includes(SVS[i])){
                load_list.push(SVS[i])
            }
        }
        for(let i=0; i<PVS.length; i++){
            if(!this.loadedModelList.includes(PVS[i])){
                pon_load_list.push(PVS[i])
            }
        }
        for(let i=0; i<this.loadingModelList.length; i++) {
            if (!FVS.includes(this.loadingModelList[i])) {
                this.loadingModelList.splice(i, 1)
                i--
            }
        }
        // console.log("EVS new load:",load_list.length)
        // console.log("IVS new load:",pon_load_list.length)
        this.toLoadModelList = [...load_list, ...pon_load_list]
        if(load_list.length)
            this.processLoadList(load_list)
    }
    processLoadList(load_list) {
        // console.log(load_list)
        // return
        if(this.loadingModelList.length>this.loadlimit) return
        // console.log("loading:",this.loadingModelList.length)
        var to_load_list = []
        for(let i=0; i<load_list.length; i++){
            let ind = load_list[i]
            if(i<this.loadlimit && !this.loadingModelList.includes(ind)){
                to_load_list.push(ind)
            }
        }
        for(let i=0; i<to_load_list.length; i++){
            if(this.worker){
                let index = to_load_list[i];
                this.toLoadModelList.splice(this.toLoadModelList.indexOf(index),1);
                this.loadingModelList.push(index);
            }else{
                this.loadModelZip(to_load_list[i])
            }
        }
        if(this.worker)this.worker.postMessage(to_load_list);
    }
    loadModelZip(index) {
        this.toLoadModelList.splice(this.toLoadModelList.indexOf(index),1)
        this.loadingModelList.push(index)
        if(this.loadZip){
            this.loadZip.load([index]);
            return;
        }
        

        var self = this;
        var url = "assets/models/" + self.projectName + "/" + index + ".zip";
        var loader = new LoadingManager();
        new Promise(function (resolve, reject) {
            new ZipLoader()
                .load(
                    url,
                    () => {},
                    () => {
                        console.log("模型加载失败：" + url);
                        setTimeout(() => {
                            // self.loadModelZip(index);
                        }, 1000 * (0.5 * Math.random() + 1));
                    }
                )
                .then((zip) => {
                    let pos = self.loadingModelList.indexOf(index)
                    if(pos===-1) return;
                    self.loadingModelList.splice(pos,1)
                    if(!self.loadedModelList.includes(index))
                        self.loadedModelList.push(index)

                    loader.setURLModifier(zip.urlResolver);
                    resolve();
                });
        }).then(function () {
            new FileLoader(loader).load(
                "blob:assets/models/" + self.projectName + "/matrix" + index + ".json",
                (json) => {
                    var matrix = JSON.parse(json);
                    new GLTFLoaderEx(loader).load(
                        "blob:assets/models/" +
                        self.projectName +
                        "/model" +
                        index +
                        ".gltf",
                        (gltf) => {
                            var mesh = gltf.scene.children[0].children[0];
                            // console.log(matrix)
                            self.addInsModel(matrix, mesh);
                        }
                    );
                }
            );
        });
    }
    addInsModel(matrix, mesh) {
        let index = Number(mesh.name);
        matrix.push([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]);
        let matrix4List = [];
        for(let j = 0; j < matrix.length; j++) {
            let mat = matrix[j];
            matrix4List.push(new Matrix4().set(
                    mat[0], mat[1], mat[2], mat[3],
                    mat[4], mat[5], mat[6], mat[7],
                    mat[8], mat[9], mat[10], mat[11],
                    0, 0, 0, 1));
        }

        mesh.material.side = 2;
        let instance_mesh = processMesh(mesh, matrix4List);
        if(!instance_mesh)return
        instance_mesh.receiveShadow = true;
        instance_mesh.castShadow = true;
        // mesh.applyMatrix4(this.matrixWorld)
        // this.scene.add(mesh)
        // if(Number(index)<466 || Number(index)>469){
        
        if(false&&index===21){
            var water = new Water(mesh.geometry,{
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: normalMap,
                alpha: 0.2,
                // sunDirection: new Vector3(-1,1,0),
                // sunColor: 0xffffff,
                waterColor: 0x66ccff,
                // distortionScale: 30,
                // fog: false,
                // side: 2
            })
            this.instanceGroup.add(water)
            this.waterList.push(water)

            // var water = new Engine3D.WaterController(mesh).water
            // window.ww=water
            // water.position.y=3
            // water.rotation.x=-Math.PI/2
            // water.scale.set(3000,3000,3000)
            // this.instanceGroup.add(water)
        }else{
            this.instanceGroup.add(instance_mesh);
            if(window.shadow)window.shadow.needsUpdate=true
        }
        // console.log(Math.round(performance.now()-window.time0))

        // mesh.applyMatrix4(this.matrixWorld);
        // this.scene.add(mesh);
        // }
        this.loaded_mesh[index] = instance_mesh;

        mesh.geometry.computeBoundingBox()
        let box = mesh.geometry.boundingBox.clone().applyMatrix4(this.instanceGroup.matrixWorld)
        let xl = box.max.x-box.min.x;
        let yl = box.max.y-box.min.y;
        let zl = box.max.z-box.min.z;
        this.loaded_mesh_interest[index] = xl*yl+xl*zl+yl*zl * matrix.length
        this.loaded_mesh_invisible_time[index] = 0
    }
    manageCaches(){// 新增函数
        let model_list = [];
        let clear_degree_list = [];
        for(let i=0; i<this.loadedModelList.length; i++){
            let index = this.loadedModelList[i];
            if(this.loaded_mesh[index] && this.loaded_mesh_invisible_time[index] && !this.PVS.includes(index)){
                model_list.push(index);
                clear_degree_list.push(this.loaded_mesh_interest[index]/this.loaded_mesh_invisible_time[index]);
            }
        }
        quickSort(clear_degree_list,model_list,0,model_list.length-1);
        let del_count = 0;
        for(let i=this.loaded_mesh_limit; i<model_list.length; i++){
            if(i<0) continue;
            let index = model_list[i];
            this.loaded_mesh[index].visible = false;
            this.instanceGroup.remove(this.loaded_mesh[index]);
            disposeInsMesh(this.loaded_mesh[index]);
            delete this.loaded_mesh[index];
            delete this.loaded_mesh_interest[index];
            delete this.loaded_mesh_invisible_time[index];
            this.loadedModelList.splice(this.loadedModelList.indexOf(index),1);
            del_count++;
            // console.log("del",index);
        }
        // if(del_count) console.log("delete count:",del_count);
    }
}

function disposeInsMesh(instanceMesh) {
    if (!instanceMesh || instanceMesh.geometry) return;
    // instanceMesh.geometry.clearGroups();
    // instanceMesh.geometry.dispose();
    // instanceMesh.material[0].dispose();
    for (let key in instanceMesh) delete instanceMesh[key];
}

function processMesh(mesh, matrixList) {
    
    mesh.material=new MeshStandardMaterial({
        map:mesh.material.map,
        color:mesh.material.color,
    })
    // const classification=new Engine3D.Classification(mesh,[])
    // const code=classification.code
    // if(classification.code){
    //     console.log(classification.code.type)
    //     console.log(mesh,classification.mesh2)
    //     mesh=classification.mesh2//mesh.geometry=classification.mesh2.geometry
    //     mesh.material=new MeshBasicMaterial()
    //     mesh.material.color.r=2.0
    //         mesh.material.color.g=0.5
    //         mesh.material.color.b=0.0
    // }
    
    // return
        
            
    // console.log(mesh.name,mesh.name>200)
    if(
        mesh.name<20
        // &&mesh.name<50
    ){
        // mesh.material=new MeshBasicMaterial({
        //     color:new Vector3(0,0,0)
        // })
    }
    mesh.material.aoMapIntensity=0//无用
    mesh.material.lightMapIntensity=0

    mesh.material.envMapIntensity=0.3//环境光
    mesh.material.metalness=0
    mesh.material.roughness=0

    if(
        mesh.name>20
        &&mesh.name<50
    ){//汽车
        mesh.material.envMapIntensity=1//5//
        mesh.material.metalness=0//8//2
        mesh.material.roughness=0
    }else if(mesh.name<20){//地板
        mesh.material.envMapIntensity=0.//0.3//环境光
        mesh.material.metalness=0.
        mesh.material.roughness=1.
    // }else if(mesh.name>10&&mesh.name<26){//草地和路面
    //     mesh.material=new MeshStandardMaterial({
    //         map:mesh.material.map,
    //         color:mesh.material.color,
    //         normalMap: normalMap,
    //     })
    }else{
        mesh.material.envMapIntensity=0.4//0.3//环境光
        mesh.material.metalness=0.1
        mesh.material.roughness=0.
    }
    if(mesh.name>10&&mesh.name<26){//草地和路面
        
// var textureLoader = new THREE.TextureLoader();
// // 加载法线贴图
// var textureNormal = textureLoader.load('./法线贴图/3_256.jpg');
// var material = new THREE.MeshPhongMaterial({
//   color: 0xff0000,
//   normalMap: textureNormal, //法线贴图
//   //设置深浅程度，默认值(1,1)。
//   normalScale: new THREE.Vector2(3, 3),
// }); //材质对象Material
    }
    // mesh.material.envMapIntensity=1//5//
    // mesh.material.metalness=0//8//2
    // mesh.material.roughness=0

    if(true){
        const classification=new Engine3D.Classification(mesh,matrixList)
        const code=classification.code
        if(classification.code&&code.type=="cylinder"){
            const s=0.5*Math.max(classification.scale[0],classification.scale[1],classification.scale[2])
            mesh.material.map.repeat.x*=s
            mesh.material.map.repeat.y*=s
            return classification.mesh2
        }
    }
    
    // console.log(mesh)
    var instancedMesh = new InstancedMesh(mesh.geometry, mesh.material, matrixList.length)
    for(let i=0; i<matrixList.length; i++) {
        instancedMesh.setMatrixAt(i, matrixList[i])
    }
    
    // instancedMesh.material.onBeforeCompile=function(shader,render){
    //     console.log(
    //     //    "onBeforeCompile",
    //     //     shader.fragmentShader,
    //         shader.vertexShader
    //     );
    //     console.log(
    //         //    "onBeforeCompile",
    //             shader.fragmentShader,
    //             // shader.vertexShader
    //         );
    // };
    // console.log(mesh.name)

    // if(code&&code.type=="cylinder")
    return instancedMesh;
}

function quickSort(arr_1, arr_2, begin, end) {
    if(begin >= end)
        return;
    var l = begin;
    var r = end;
    var temp = arr_1[begin];
    while(l < r) {
        while(l < r && arr_1[r] <= temp)
            r --;
        while(l < r && arr_1[l] >= temp)
            l ++;
        [arr_1[l], arr_1[r]] = [arr_1[r], arr_1[l]];
        [arr_2[l], arr_2[r]] = [arr_2[r], arr_2[l]];
    }
    [arr_1[begin], arr_1[l]] = [arr_1[l], arr_1[begin]];
    [arr_2[begin], arr_2[l]] = [arr_2[l], arr_2[begin]];
    quickSort(arr_1, arr_2, begin, l - 1);
    quickSort(arr_1, arr_2, l + 1, end);
}

function positionMatch(pos,position){
    return Math.round(pos.x) === Math.round(position.x) &&
        Math.round(pos.y) === Math.round(position.y) &&
        Math.round(pos.z) === Math.round(position.z);
}