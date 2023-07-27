import {
    Box3,
    BufferAttribute,
    Group,
    InterleavedBuffer,
    InterleavedBufferAttribute,
    Scene,
    Vector3
} from "./three/build/three.module";
import { GLTFExporter } from "./three/examples/jsm/exporters/GLTFExporter.js";

class MeshSplitter{
    constructor(gltfScene,structDescription,projectName){
        if(structDescription.length===1)
            this.meshNodeList = gltfScene.children
        else this.meshNodeList = gltfScene.children[0].children
        this.structDescription = structDescription
        this.projectName = projectName
        this.stride = 3
        // var box = new Box3().setFromObject(gltfScene.children[0])
        // console.log(box)
        // var center = new Vector3(
        //     (box.max.x+box.min.x)/2,
        //     (box.max.y+box.min.y)/2,
        //     (box.max.z+box.min.z)/2,)
        // console.log(Math.round(center.x*100)/100+","+Math.round(center.y*100)/100+","+Math.round(center.z*100)/100)
        // console.log(this.meshNodeList)
        // console.log(this.structDescription)
        console.log(this.projectName+" 已载入")
    }
    splitToChildren(){
        var index = 0
        var self = this
        var interval = setInterval(function(){
            if(index>=self.structDescription.length){
                self.splitStructDescription()
                // self.jumpToNext()
                clearInterval(interval)
                return
            }
            var N = 0
            for(let n=0; n<index; n++)
                N+=self.structDescription[n].length
            var sum_group = new Group()
            var node = self.meshNodeList[index]
            var groups = self.structDescription[index]
            var stride = node.geometry.attributes.position.data.stride
            // console.log(node)
            // window.sceneRootNode.add(node)
            for(let i=0; i<groups.length; i++){
                if(i%100===0)
                    console.log(index+"/"+self.structDescription.length+", "+i+"/"+groups.length)
                var group = groups[i]
                var object = node.clone()
                object.geometry = node.geometry.clone()
                var index_arr = []
                for(let j=0; j<group.c*3; j+=3){
                    for(let k=0; k<3; k++){
                        index_arr.push(node.geometry.index.array[group.s*3+j+k])
                    }
                }
                // console.log(index_arr)
                // var ori_faces = []
                // for(let j=0; j<index_arr.length; j+=3){
                //     var ori_face = []
                //     for(let k=0; k<3; k++){
                //         ori_face.push(new Vector3(
                //             node.geometry.attributes.position.array[index_arr[j+k]*stride],
                //             node.geometry.attributes.position.array[index_arr[j+k]*stride+1],
                //             node.geometry.attributes.position.array[index_arr[j+k]*stride+2]
                //         ))
                //     }
                //     ori_faces.push(ori_face)
                // }
                // console.log(ori_faces)
                var position_arr = []
                var uv3_arr = []
                var pushed_index = []
                var updated_index_arr = []
                for(let j=0; j<index_arr.length; j++){
                    var t = pushed_index.indexOf(index_arr[j])
                    if(t===-1){
                        pushed_index.push(index_arr[j])
                        updated_index_arr.push(position_arr.length/self.stride)
                        // console.log(t+"  "+position_arr.length/this.stride)
                        for(let k=0; k<self.stride; k++){
                            position_arr.push(node.geometry.attributes.position.array[index_arr[j]*stride+k])
                            uv3_arr.push(node.geometry.attributes.uv3.array[index_arr[j]*stride+k])
                        }
                        // position_arr.push(node.geometry.attributes.position.array[index_arr[j]*stride])
                        // position_arr.push(node.geometry.attributes.position.array[index_arr[j]*stride+1])
                        // position_arr.push(node.geometry.attributes.position.array[index_arr[j]*stride+2])
                        // // position_arr.push(node.geometry.attributes.position.array[index_arr[j]*stride+3])
                        // uv3_arr.push(node.geometry.attributes.uv3.array[index_arr[j]*stride])
                        // uv3_arr.push(node.geometry.attributes.uv3.array[index_arr[j]*stride+1])
                        // uv3_arr.push(node.geometry.attributes.uv3.array[index_arr[j]*stride+2])
                        // // uv3_arr.push(node.geometry.attributes.uv3.array[index_arr[j]*stride+3])
                    }else{
                        updated_index_arr.push(t)
                        // console.log(t+"  "+t)
                    }
                }
                // console.log(updated_index_arr)
                var new_position_array = new Float32Array(position_arr)
                var new_uv3_array = new Uint8Array(uv3_arr)
                var new_index_array = new Uint16Array(updated_index_arr)
                object.geometry.attributes.position = new BufferAttribute(new_position_array,3)
                // object.geometry.attributes.position = new InterleavedBufferAttribute(
                //     new InterleavedBuffer(new_position_array,this.stride),
                //     3,0,false
                // )
                object.geometry.attributes.uv3 = new BufferAttribute(new_uv3_array,3)
                // object.geometry.attributes.uv3 = new InterleavedBufferAttribute(
                //     new InterleavedBuffer(new_uv3_array,this.stride),
                //     3,0,false
                // )
                object.geometry.index = new BufferAttribute(new_index_array,1)
                object.geometry.computeBoundingBox()
                object.geometry.computeBoundingSphere()
                object.name = (N+i).toString()
                delete object.geometry.attributes.normal
                // console.log(object)
                sum_group.add(object)
            }
            var scene = new Scene()
            scene.add(sum_group)
            // console.log(sum_group)
            // window.sceneRootNode.add(sum_group)
            var fileName = self.projectName+"_output"+index+".gltf"
            new GLTFExporter().parse(scene,function(result){
                var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
                let link = document.createElement('a')
                link.href = URL.createObjectURL(myBlob)
                link.download = fileName
                link.click()
                // self.splitToChildren(index+1)
            });
            index++
        },300)
    }
    splitStructDescription(){
        var new_structDesc = []
        for(let i=0; i<this.structDescription.length; i++){
            for(let j=0; j<this.structDescription[i].length; j++){
                this.structDescription[i][j].s = 0
                new_structDesc.push([this.structDescription[i][j]])
            }
        }
        // console.log(new_structDesc.length)
        var myBlob=new Blob([JSON.stringify(new_structDesc)], { type: 'text/plain' })
        let link = document.createElement('a')
        link.href = URL.createObjectURL(myBlob)
        link.download = this.projectName+"_structdesc.json"
        link.click()
        this.jumpToNext()
    }
    jumpToNext(){
        console.log(this.projectName+" 处理完成")
        var projectList = ["HaiNing","RenFuYiYuan"]
        var i = projectList.indexOf(this.projectName)
        if(i!==-1&&++i<projectList.length){
            var url = "http://localhost:3000/?scene=" + projectList[i]
            setTimeout(function(){
                console.log("跳转至 "+projectList[i])
                window.location.href = url
            },5000)
        }else{
            console.log("项目列表全部处理完成")
        }
    }
    splitAverage(){
        // console.log(this.meshNodeList)
        // console.log(this.structDescription)
        var num = 31
        var c = this.structDescription[0][0].c/num
        var new_structDescription = []
        for(let i=0; i<num; i++){
            new_structDescription.push({
                n:i.toString(),
                c:c,
                s:i*c
            })
        }
        // console.log(new_structDescription)
        this.structDescription[0] = new_structDescription
        this.splitToChildren()
    }
}

export {MeshSplitter}