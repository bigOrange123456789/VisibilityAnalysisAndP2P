export class ExtractGeometry {
    constructor(glb) {
        const self=this
        const result={}
        glb.scene.traverse( node => {
            if(node instanceof THREE.Mesh){
                self.saveGeometry(node,result)
            }
        })
        self.exportJson(result,"20.json")
    }
    saveGeometry(node,result){
        function arr(a){
            var b=[];
            for(var i=0;i<a.length;i++)
                b.push(a[i])
            return b
        }
        console.log(node,node.geometry.attributes)
        result[node.name]={}
        const tags=//,'normal']//normal可以在前端根据拓扑关系重新计算，不需要传输//重新计算有损失
            node instanceof THREE.SkinnedMesh?['position','normal','uv','skinIndex','skinWeight']:['position','normal','uv']
        var attributes=node.geometry.attributes
        console.log(":1:",node,attributes)
        for(var i=0;i<tags.length;i++ ){
            var t=tags[i]
            console.log(":2:",node,attributes,t,attributes[t])
            result[node.name][t]=
                arr(attributes[t].array)
        }
        if(node.geometry.index!==null)
            result[node.name]["index"]=
                arr(node.geometry.index.array)
    }
    
    exportJson(result,fileName){
        var myBlob=new Blob([JSON.stringify(result)], { type: 'text/plain' })
        let link = document.createElement('a')
        link.href = URL.createObjectURL(myBlob)
        link.download = fileName
        link.click()
    }

}
// new AvatarManager("temp/woman01.gltf")
// new AvatarManager("assets/avatar/sim/woman01/sim.glb")
// new AvatarManager("assets/avatar/sim/tree/sim.glb")
//new AvatarManager("./sim.glb")