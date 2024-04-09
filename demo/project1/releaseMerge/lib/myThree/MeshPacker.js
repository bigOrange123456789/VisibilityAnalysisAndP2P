import { Box3, Color, Group, Scene } from "three/build/three.module.js";
// import { GLTFLoaderEx } from 'three/examples/jsm/loaders/GLTFLoaderEx.js';
import {Engine3D}from"../../main.js"
const GLTFLoaderEx=Engine3D.GLTFLoaderEx
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

var loadList = window.param.loadList                    // 模型文件加载顺序

class MeshPacker{
    constructor(structDesc,matrixDesc){                 // 从SLMLoader中读入
        this.projectName = window.param.projectName
        this.meshNum = 0
        for(let i=0; i<structDesc.length; i++)
            this.meshNum += structDesc[i].length
        console.log("mesh number: "+this.meshNum)
        this.gltfFileNum = 36                           // 要加载的gltf/glb文件总数
        this.meshList = new Array(this.meshNum)         // 模型文件数组
        this.structDesc = []
        for(let i=0; i<structDesc.length; i++)
            for(let j=0; j<structDesc[i].length; j++)
                this.structDesc.push([structDesc[i][j]])
        this.matrixDesc = matrixDesc
        this.newMeshList = []
        this.newStructDesc = []
        this.newMatrixDesc = {}
        this.fileSize = 1000*1024                       // 每组文件的大致大小，单位byte
    }
    loadFiles(){
        var self = this
        var i = 0
        var interval = setInterval(function(){
            loading(i)
            if(++i>=self.gltfFileNum)
                clearInterval(interval)
        },10)

        function loading(i){                            // 模型加载函数
            var url = "assets/models/"+self.projectName+"/"+self.projectName+"_output"+i+".gltf"     // 在这里修改模型文件的加载地址
            new GLTFLoaderEx().load(url,(gltf)=>{
                var meshNodeList = gltf.scene.children[0].children
                for(let j=0; j<meshNodeList.length; j++){
                    var meshIndex = parseInt(meshNodeList[j].name)
                    self.meshList[meshIndex] = meshNodeList[j].clone()
                }
            })
        }
        var load = setInterval(function(){
            var num = 0
            for(let i=0; i<self.meshList.length; i++){
                if(self.meshList[i]) num++
            }
            if(num===self.meshList.length){             //加载完成时
                console.log("load over")
                clearInterval(load)
                // console.log(self.meshList)
                // console.log(self.structDesc)
                // console.log(self.matrixDesc)
                self.process()
            }else{
                console.log(Math.round((num/self.meshList.length)*10000)/100+"%")
            }
        },1000)
    }
    process(){                                          // 开始处理
        // 按参数（表面积）排序的结果
        var load_list = []
        var param_list = []
        for(let i=0; i<this.meshNum; i++){
            var param = calParam(new Box3().setFromObject(this.meshList[i]))
            var pos = searchInsert(param_list,param)
            param_list.splice(pos,0,param)
            load_list.splice(pos,0,i)
        }
        // console.log(load_list)
        for(let i=0; i<load_list.length; i++){
            this.remark(load_list[i])
        }

        // 按深度图计算（外壳加载顺序排序）的结果
        // for(let i=0; i<loadList.length; i++){
        //     this.remark(loadList[i])
        // }
        // for(let i=0; i<this.meshNum; i++){
        //     if(!loadList.includes(i))
        //         this.remark(i)
        // }

        // console.log(this.newMeshList)
        // console.log(this.newStructDesc)
        // console.log(this.newMatrixDesc)

        var file_size_list = []
        this.sizeCalculate(0,file_size_list)
    }
    remark(i){                                          // 生成新的调度序列
        var mesh = this.meshList[i].clone()
        var new_name = this.newMeshList.length.toString()
        mesh.name = new_name
        this.newMeshList.push(mesh)
        var past_struct = this.structDesc[i]
        var past_n = past_struct[0].n
        var past_matrix = this.matrixDesc[past_n]
        past_struct[0].n = new_name
        this.newStructDesc.push(past_struct)
        this.newMatrixDesc[new_name] = past_matrix
    }
    sizeCalculate(i,file_size_list){                    // 构件文件大小计算
        if(i>=this.newMeshList.length){//this.newMeshList.length
            console.log("size calculate over")
            this.pack_size(file_size_list)
            return
        }else if(i%1000===0){
            console.log(i+"/"+this.newMeshList.length)
        }
        var self = this
        var mesh = this.newMeshList[i].clone()
        var group = new Group()
        group.add(mesh)
        var scene = new Scene()
        scene.add(group)
        new GLTFExporter().parse(scene,function(result){
            var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
            file_size_list.push(myBlob.size)
            self.sizeCalculate(i+1,file_size_list)
        })
    }
    pack_size(file_size_list){                          // 按构件文件大小划分数据包
        var groups = [[0]]
        var groups_size = [file_size_list[0]]
        for(let i=1; i<file_size_list.length; i++){
            var size = file_size_list[i]
            var the_group_size = groups_size[groups_size.length-1]
            if(the_group_size+size>this.fileSize){
                groups.push([i])
                groups_size.push(file_size_list[i])
            }else{
                groups[groups.length-1].push(i)
                groups_size[groups_size.length-1]+=file_size_list[i]
            }
        }
        console.log("groups calculate over")
        // console.log(groups)
        // console.log(groups_size)
        var self = this
        var index = -1
        var pack = setInterval(function(){
            if(++index===groups.length){//groups.length
                console.log("export over")
                clearInterval(pack)
                return
            }
            console.log(index+"/"+groups.length)
            var pack_group = groups[index]
            // var str = []
            var mat = {}
            var group = new Group()
            for(let i=0; i<pack_group.length; i++){
                var p = pack_group[i]
                // str.push(self.newStructDesc[p])
                mat[p] = self.newMatrixDesc[p]
                group.add(self.newMeshList[p].clone())
            }
            downloadPack(index,mat,group)
        },300)
    }
}

function calParam(box){
    var a = box.max.x-box.min.x
    var b = box.max.y-box.min.y
    var c = box.max.z-box.min.z
    return (a*b+b*c+c*a)
}

function searchInsert(nums, target) {
    const n = nums.length
    let left = 0, right = n - 1, ans = n
    while (left <= right) {
        let mid = ((right - left) >> 1) + left
        if (target >= nums[mid]) {
            ans = mid
            right = mid - 1
        } else {
            left = mid + 1
        }
    }
    return ans
}

function downloadPack(index,mat,group){
    var file_index = index.toString()
    // setTimeout(function(){
    //     download(str,"structdesc"+file_index+".json")
    // },0)
    setTimeout(function(){
        download(mat,"matrix"+file_index+".json")
    },0)
    setTimeout(function(){
        var scene = new Scene()
        scene.add(group)
        var fileName = "model"+file_index+".gltf"
        new GLTFExporter().parse(scene,function(result){
            var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
            let link = document.createElement('a')
            link.href = URL.createObjectURL(myBlob)
            link.download = fileName
            link.click()
        })
    },0)
}

function download(data,name){
    var myBlob=new Blob([JSON.stringify(data)], { type: 'text/plain' })
    let link = document.createElement('a')
    link.href = URL.createObjectURL(myBlob)
    link.download = name
    link.click()
}

export {MeshPacker}
