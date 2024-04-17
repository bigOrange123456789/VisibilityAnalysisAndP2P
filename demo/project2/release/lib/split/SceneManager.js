import {
    BufferAttribute, BufferGeometry, CanvasTexture, Color,
    FileLoader,
    Group, InstancedMesh,
    LoadingManager,
    Matrix4,  MeshStandardMaterial, Vector2,
    Vector3, 
} from "three";
import { ZipLoader } from "../ziploader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class SceneManager {
    constructor(opt) {
        this.projectName = window.projectName;
        this.scene = opt.scene;
        this.camera = opt.camera;
        this.instanceGroup = new Group();
        this.instanceGroup.name="instanceGroup-split"
        console.log("this.instanceGroup[split]",this.instanceGroup)
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

        this.server_ip = "ws://"+window.ParamURL.server_ip//"ws://47.100.183.30:4002";
        this.startConnect();
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

        // worker多线程
        this.worker = new Worker("./worker.js");
        this.worker.postMessage(this.projectName);
        this.worker.onmessage = (e)=>{
            // console.log(e.data.uvs)
            // console.log(e.data);
            let index = e.data.index;
            let pos = this.loadingModelList.indexOf(index);
            if(pos!==-1) this.loadingModelList.splice(pos,1);
            if(!this.loadedModelList.includes(index))
                this.loadedModelList.push(index)

            let geometry = new BufferGeometry();
            geometry.setAttribute('position', new BufferAttribute(e.data.geometry.vertices,3));
            if(e.data.geometry.normals) geometry.setAttribute('normal', new BufferAttribute(e.data.geometry.normals,3))
            else geometry.computeVertexNormals();
            if(e.data.geometry.uvs) geometry.setAttribute('uv', new BufferAttribute(e.data.geometry.uvs,2));
            if(e.data.geometry.indices) geometry.setIndex(new BufferAttribute(e.data.geometry.indices,1));
            // console.log(geometry)
            let material = new MeshStandardMaterial({
                name: e.data.material.name,
                color: new Color(e.data.material.color.r, e.data.material.color.g, e.data.material.color.b),
                // emissive: new Color(e.data.material.emissive.r, e.data.material.color.g, e.data.material.color.b),
                roughness: e.data.material.roughness,
                metalness: e.data.material.metalness,
                transparent: e.data.material.opacity !== 1,
                opacity: e.data.material.opacity
            });
            if(e.data.material.image){
                material.map = new CanvasTexture(e.data.material.image,300,1000,1000,1006,1008,1022,1009,1)
                material.map.offset = new Vector2(e.data.material.offset.x, e.data.material.offset.y);
                material.map.repeat = new Vector2(e.data.material.repeat.x, e.data.material.repeat.y);
                material.map.encoding = 3001;
                material.map.flipY = false;
            }
            this.addInsModel(e.data.index, e.data.matrix, geometry, material);
        };
    }
    animate() {
        if (!this.camera.position.equals(this.pre_camera_position) && !this.httping) {
            this.httping = true
            this.sceneCulling();
        }
        this.setVisibility(this.visibleModelList);
        this.processLoadList(this.toLoadModelList)
        this.manageCaches()

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
            if (list.includes(index)) {
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
        if(this.loadingModelList.length>this.loadlimit) return;
        // console.log("loading:",this.loadingModelList.length)
        var to_load_list = [];
        for(let i=0; i<load_list.length; i++){
            let ind = load_list[i];
            if(i<this.loadlimit && !this.loadingModelList.includes(ind)){
                to_load_list.push(ind);
                this.toLoadModelList.splice(this.toLoadModelList.indexOf(ind),1);
                this.loadingModelList.push(ind);
            }
        }
        this.worker.postMessage(to_load_list);
    }
    loadModelZip(index) {
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
                    new GLTFLoader(loader).load(
                        "blob:assets/models/" +
                        self.projectName +
                        "/model" +
                        index +
                        ".gltf",
                        (gltf) => {
                            var mesh = gltf.scene.children[0].children[0];
                            self.addInsModel(index, matrix, mesh.geometry, mesh.material);
                        }
                    );
                }
            );
        });
    }
    addInsModel(index, matrix, geometry, material){
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

        let instance_mesh = processMesh(geometry, material, matrix4List);
        instance_mesh.receiveShadow = true;
        instance_mesh.castShadow = true;

        this.instanceGroup.add(instance_mesh);
        this.loaded_mesh[index] = instance_mesh;

        geometry.computeBoundingBox()
        let box = geometry.boundingBox.clone().applyMatrix4(this.instanceGroup.matrixWorld)
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

function processMesh(geometry, material, matrixList) {
    const instancedMesh = new InstancedMesh(geometry, material, matrixList.length)
    if(!geometry.index) return instancedMesh
    for(let i=0; i<matrixList.length; i++){
        let instanceMatrix = matrixList[i]
        instancedMesh.setMatrixAt(i, instanceMatrix)
    }
    return instancedMesh
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
