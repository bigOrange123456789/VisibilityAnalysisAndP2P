import {
    Box3, Box3Helper, BufferAttribute, Group, InstancedMeshEx, Matrix4, Quaternion, Scene, Vector3
} from "three/build/three.module";
// import {FileLoader, LoadingManager} from "../three/build/three";
// import {GLTFLoaderEx} from "../three/examples/jsm/loaders/GLTFLoaderEx";
import {Engine3D}from"../../main.js"
const GLTFLoaderEx=Engine3D.GLTFLoaderEx
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";

export class SpacePartitioning{
    constructor(gltfScene,structDesc,matrixDesc,projectName){
        gltfScene.visible = false
        this.structList = []
        for(let i=0; i<structDesc.length; i++)
            for(let j=0; j<structDesc[i].length; j++)
                this.structList.push(structDesc[i][j])
        this.matrixList = matrixDesc
        this.meshList = new Array(this.structList.length)
        this.instanceBoxList = new Array(this.structList.length)
        this.instanceSphereList = new Array(this.structList.length)
        this.projectName = projectName

        this.sceneBox = null
        this.standardSize = 3000

        // console.log(this.structList)
        // console.log(this.matrixList)
        // console.log(this.projectName)

        this.loadFiles()
    }
    loadFiles(){    // 加载模型
        var self = this
        const start = 0
        const end = Math.ceil(this.structList.length/300)
        var i = start
        var interval = setInterval(function(){
            loadGLTF(i)
            if(++i===end) clearInterval(interval)
        },10)

        function loadGLTF(i){
            var url = "assets/models/"+self.projectName+"/"+self.projectName+"_output"+i+".gltf"     // 在这里修改模型文件的加载地址
            new GLTFLoaderEx().load(url,(gltf)=>{
                var meshNodeList = gltf.scene.children[0].children
                for(let j=0; j<meshNodeList.length; j++){
                    var meshIndex = parseInt(meshNodeList[j].name)
                    self.meshList[meshIndex] = meshNodeList[j].clone()
                    self.readModel(meshIndex,self.meshList[meshIndex],self.matrixList[self.structList[meshIndex].n].it)
                }
            })
        }

        var load_check = setInterval(function(){
            var num = 0
            for(let i=0; i<self.meshList.length; i++){
                if(self.meshList[i]) num++
            }
            if(num===self.meshList.length){             //加载完成时
                console.log("load over")
                clearInterval(load_check)
                // console.log(self.meshList)
                // self.exportGLTF()
                // console.log(self.instanceBoxList)
                // console.log(self.sceneBox)
                self.uniformScene()
            }else{
                console.log(Math.round((num/self.meshList.length)*10000)/100+"%")
            }
        },1000)
    }
    readModel(meshIndex,mesh,matrices) {
        // console.log(mesh)
        // console.log(matrices)
        mesh.geometry.computeBoundingBox()
        mesh.geometry.computeBoundingSphere()
        var instance_boxes = []
        var instance_spheres = []
        matrices.push([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0])
        for(let i=0; i<matrices.length; i++){
            let mat = matrices[i]
            let instance_matrix = new Matrix4().set(
                mat[0], mat[1], mat[2], mat[3],
                mat[4], mat[5], mat[6], mat[7],
                mat[8], mat[9], mat[10], mat[11],
                0, 0, 0, 1)
            let box = mesh.geometry.boundingBox.clone().applyMatrix4(instance_matrix)
            let sphere = mesh.geometry.boundingSphere.clone().applyMatrix4(instance_matrix)
            if(this.sceneBox) this.sceneBox.union(box)
            else this.sceneBox = box.clone()
            instance_boxes.push(box)
            instance_spheres.push(sphere)
        }
        this.instanceBoxList[meshIndex] = instance_boxes
        this.instanceSphereList[meshIndex] = instance_spheres
    }
    uniformScene(){
        var temp = new Group()

        var maxEdge = Math.max(this.sceneBox.max.x-this.sceneBox.min.x,this.sceneBox.max.y-this.sceneBox.min.y,this.sceneBox.max.z-this.sceneBox.min.z)
        var scalar = this.standardSize/maxEdge
        this.sceneBox.min.multiplyScalar(scalar)
        this.sceneBox.max.multiplyScalar(scalar)
        temp.scale.multiplyScalar(scalar)

        var center = this.sceneBox.getCenter(new Vector3())
        this.sceneBox.min.sub(center)
        this.sceneBox.max.sub(center)
        temp.position.sub(center)

        temp.updateWorldMatrix()
        this.matrixWorld = temp.matrixWorld
        for(let i=0; i<this.instanceBoxList.length; i++)
            for(let j=0; j<this.instanceBoxList[i].length; j++){
                this.instanceBoxList[i][j].applyMatrix4(this.matrixWorld)
                this.instanceSphereList[i][j].applyMatrix4(this.matrixWorld)
            }

        this.buildTree()
    }
    buildTree(){
        var meshList = []
        var meshSurfaceList = []
        for(let i=0; i<this.instanceBoxList.length; i++){
            if(this.instanceBoxList[i]){
                meshList.push(i)
                var surface = 0
                for(let j=0; j<this.instanceBoxList[i].length; j++){
                    var Size = getSize(this.instanceBoxList[i][j])
                    surface += (Size.x*Size.y+Size.x*Size.z+Size.y*Size.z)
                }
                meshSurfaceList.push(surface)
            }
        }
        quickSort(meshSurfaceList,meshList,0,meshList.length-1)

        var node_list1 = partition(12,this.sceneBox)
        var x_times1 = node_list1.length
        var y_times1 = node_list1[0].length
        var z_times1 = node_list1[0][0].length
        var x_length1 = (this.sceneBox.max.x-this.sceneBox.min.x)/x_times1
        var y_length1 = (this.sceneBox.max.y-this.sceneBox.min.y)/y_times1
        var z_length1 = (this.sceneBox.max.z-this.sceneBox.min.z)/z_times1
        for(let m=0; m<Math.floor(meshList.length/20); m++){
            let i = meshList[m]
            for(let j=0; j<this.instanceBoxList[i].length; j++){
                let box = this.instanceBoxList[i][j]
                let x_start,x_end,y_start,y_end,z_start,z_end
                [x_start,x_end] = computeSE(box.min.x,box.max.x,this.sceneBox.min.x,x_length1,x_times1);
                [y_start,y_end] = computeSE(box.min.y,box.max.y,this.sceneBox.min.y,y_length1,y_times1);
                [z_start,z_end] = computeSE(box.min.z,box.max.z,this.sceneBox.min.z,z_length1,z_times1);
                for(let x=x_start; x<x_end; x++)
                    for(let y=y_start; y<y_end; y++)
                        for(let z=z_start; z<z_end; z++)
                            if(!node_list1[x][y][z].meshIndex.includes(i))
                                node_list1[x][y][z].meshIndex.push(i)
            }
        }

        var node_list2 = partition(15,this.sceneBox)
        var x_times2 = node_list2.length
        var y_times2 = node_list2[0].length
        var z_times2 = node_list2[0][0].length
        var x_length2 = (this.sceneBox.max.x-this.sceneBox.min.x)/x_times2
        var y_length2 = (this.sceneBox.max.y-this.sceneBox.min.y)/y_times2
        var z_length2 = (this.sceneBox.max.z-this.sceneBox.min.z)/z_times2
        for(let m=Math.floor(meshList.length/100); m<meshList.length; m++){
            let i = meshList[m]
            for(let j=0; j<this.instanceBoxList[i].length; j++){
                let box = this.instanceBoxList[i][j]
                let x_start,x_end,y_start,y_end,z_start,z_end
                [x_start,x_end] = computeSE(box.min.x,box.max.x,this.sceneBox.min.x,x_length2,x_times2);
                [y_start,y_end] = computeSE(box.min.y,box.max.y,this.sceneBox.min.y,y_length2,y_times2);
                [z_start,z_end] = computeSE(box.min.z,box.max.z,this.sceneBox.min.z,z_length2,z_times2);
                for(let x=x_start; x<x_end; x++)
                    for(let y=y_start; y<y_end; y++)
                        for(let z=z_start; z<z_end; z++)
                            if(!node_list2[x][y][z].meshIndex.includes(i))
                                node_list2[x][y][z].meshIndex.push(i)
            }
        }

        var result = {l:{},s:{},matrix:this.matrixWorld.elements}
        var l_n = 0
        var s_n = 0
        for(let i=0; i<node_list1.length; i++)
            for(let j=0; j<node_list1[i].length; j++)
                for(let k=0; k<node_list1[i][j].length; k++)
                    if(node_list1[i][j][k].meshIndex.length){
                        let node = node_list1[i][j][k]
                        result.l[l_n] = {
                            i:node.meshIndex,
                            b:[[node.box.min.x,node.box.min.y,node.box.min.z],[node.box.max.x,node.box.max.y,node.box.max.z]]
                        }
                        l_n++
                    }

        for(let i=0; i<node_list2.length; i++)
            for(let j=0; j<node_list2[i].length; j++)
                for(let k=0; k<node_list2[i][j].length; k++)
                    if(node_list2[i][j][k].meshIndex.length){
                        let node = node_list2[i][j][k]
                        result.s[s_n] = {
                            i:node.meshIndex,
                            b:[[node.box.min.x,node.box.min.y,node.box.min.z],[node.box.max.x,node.box.max.y,node.box.max.z]]
                        }
                        s_n++
                    }

        download(result,"sceneGraph.json")

        var self = this
        setTimeout(function(){
            download(self.instanceSphereList,"boundingSphere.json")
        },200)

        setTimeout(function(){
            download(self.instanceBoxList,"boundingBox.json")
        },400)

        setTimeout(function(){
            self.exportGLTF()
        },600)
    }
    exportGLTF(){
        const export_start = 0
        const export_end = this.meshList.length
        var self = this
        var index = export_start
        var exporting = setInterval(function(){
            let scene = new Scene()
            let group = new Group()
            let object = self.meshList[index].clone()
            group.add(object)
            scene.add(group)
            let fileName = "model"+index+".glb"
            new GLTFExporter().parse([scene],function(result){
                let myBlob = new Blob([result],{type:'application/octet-stream'})
                let link = document.createElement('a')
                link.href = URL.createObjectURL(myBlob)
                link.download = fileName
                link.click()
            },{binary:true})
            if(++index===export_end){
                clearInterval(exporting)
                console.log("export end")
            }
        },200)
    }
}

class Node{
    constructor(id,min,max){
        this.id = id
        this.meshIndex = []
        this.meshMatrices = []
        this.box = new Box3(min,max)
        this.center = new Vector3((min.x+max.x)/2,(min.y+max.y)/2,(min.z+max.z)/2)
        this.radius = max.clone().sub(min).length()/2
        this.leftNode = null
        this.rightNode = null
    }
    addData(index){
        this.meshIndex.push(index)
    }
    createLeftNode(box){
        this.leftNode = new Node(this.id*2,box.min,box.max)
    }
    createRightNode(box){
        this.rightNode = new Node(this.id*2+1,box.min,box.max)
    }
    containPoint(pos){
        return this.box.containsPoint(pos)
    }
}

function partition(times,sceneBox){
    var node = new Node(0,sceneBox.min,sceneBox.max)
    while(times>0){
        let leftBox = getSubBox(node.box,0)
        node = new Node(node.id*2,leftBox.min,leftBox.max)
        times--
    }
    // console.log(node.box)
    var x_times = Math.round((sceneBox.max.x-sceneBox.min.x)/(node.box.max.x-node.box.min.x))
    var y_times = Math.round((sceneBox.max.y-sceneBox.min.y)/(node.box.max.y-node.box.min.y))
    var z_times = Math.round((sceneBox.max.z-sceneBox.min.z)/(node.box.max.z-node.box.min.z))
    // console.log(x_times,y_times,z_times)
    var x_length = (sceneBox.max.x-sceneBox.min.x)/x_times
    var y_length = (sceneBox.max.y-sceneBox.min.y)/y_times
    var z_length = (sceneBox.max.z-sceneBox.min.z)/z_times
    // console.log(x_length,y_length,z_length)
    var node_set = []
    for(let i=0; i<x_times; i++){
        let x_list = []
        for(let j=0; j<y_times; j++){
            let y_list = []
            for(let k=0; k<z_times; k++){
                let min = new Vector3(
                    sceneBox.min.x+i*x_length,
                    sceneBox.min.y+j*y_length,
                    sceneBox.min.z+k*z_length)
                let max = new Vector3(
                    sceneBox.min.x+(i+1)*x_length,
                    sceneBox.min.y+(j+1)*y_length,
                    sceneBox.min.z+(k+1)*z_length)
                let node = new Node(i*y_times*z_times+j*z_times+k,min,max)
                y_list.push(node)
            }
            x_list.push(y_list)
        }
        node_set.push(x_list)
    }
    // console.log(node_set)
    return node_set
}

function getSize(box){
    return {
        x:box.max.x-box.min.x,
        y:box.max.y-box.min.y,
        z:box.max.z-box.min.z
    }
}

function getSubBox(box,LR){
    var boxAxis = getSize(box)
    var center = new Vector3((box.min.x+box.max.x)/2,(box.min.y+box.max.y)/2,(box.min.z+box.max.z)/2)
    if(!LR){//0-left
        if(boxAxis.x>=boxAxis.y && boxAxis.x>=boxAxis.z){//x最长
            return new Box3(box.min,new Vector3(center.x,box.max.y,box.max.z))
        }else if(boxAxis.y>=boxAxis.x && boxAxis.y>=boxAxis.z){//y最长
            return new Box3(box.min,new Vector3(box.max.x,center.y,box.max.z))
        }else{//z最长
            return new Box3(box.min,new Vector3(box.max.x,box.max.y,center.z))
        }
    }else{//1-right
        if(boxAxis.x>=boxAxis.y && boxAxis.x>=boxAxis.z){//x最长
            return new Box3(new Vector3(center.x,box.min.y,box.min.z),box.max)
        }else if(boxAxis.y>=boxAxis.x && boxAxis.y>=boxAxis.z){//y最长
            return new Box3(new Vector3(box.min.x,center.y,box.min.z),box.max)
        }else{//z最长
            return new Box3(new Vector3(box.min.x,box.min.y,center.z),box.max)
        }
    }
}

function getBoundingBox(boxes){
    var boundingBox = boxes[0].clone()
    for(let i=1; i<boxes.length; i++){
        boundingBox.min.min(boxes[i].min)
        boundingBox.max.max(boxes[i].max)
    }
    return boundingBox
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

function computeSE(min,max,scene_min,scene_length,times){
    var start = Math.max(Math.floor((min-scene_min)/scene_length),0)
    var end = Math.min(Math.ceil((max-scene_min)/scene_length),times)
    return [start,end]
}

function download(data,name){
    var myBlob=new Blob([JSON.stringify(data)], { type: 'text/plain' })
    let link = document.createElement('a')
    link.href = URL.createObjectURL(myBlob)
    link.download = name
    link.click()
}
