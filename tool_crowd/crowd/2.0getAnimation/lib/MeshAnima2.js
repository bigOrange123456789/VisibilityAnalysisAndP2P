export class MeshAnima{
    constructor(skinnedMesh,n){
        this.name=skinnedMesh[0]
        this.skeleton=skinnedMesh[1]//存储了骨骼数据
        this.n=n//每一段动画中的帧数
        this.result={
                "config":[],
                "frameNumber": 0,
                "boneNumber": 0,
                "animation":[]
        }
        this.boneMatrice=[]
    }
    static dim3_to_dim1(boneMatrice1){
        var boneMatrice2=[]
        for(var k1=0;k1<boneMatrice1.length;k1++){//遍历每一帧
            for(var k2=0;k2<boneMatrice1[k1].length;k2++){//遍历每一根骨骼
                var mat_arr=boneMatrice1[k1][k2].elements
                for(var j=0;j<4;j++)//4行
                    for(var k=0;k<3;k++)//3列
                        boneMatrice2.push(mat_arr[4*j+k])
            }
        }
        return boneMatrice2
    }
    additionFrameData1(){
        var skeleton=this.skeleton
        var frameData=[]
        for(var i=0;i<skeleton.bones.length;i++){
            var m1=skeleton.boneInverses[i].clone ();
            frameData.push( m1 )
        }
        this.boneMatrice.push(frameData)
    }
    additionFrameData2(){
        var skeleton=this.skeleton
        var frameData=[]
        for(var i=0;i<skeleton.bones.length;i++){
            var m2=skeleton.bones[i].matrixWorld.clone ();
            frameData.push( m2 )
        }
        // console.log("matrixWorld",frameData)
        this.boneMatrice.push(frameData)
    }
    finishOneAnima(){
        var skeleton=this.skeleton
        var boneMatrice_sim=MeshAnima.dim3_to_dim1(this.boneMatrice)
        var result0={
                "config":[boneMatrice_sim.length],
                "frameNumber": this.n,
	            "boneNumber": skeleton.bones.length,
                "animation":[boneMatrice_sim]
        }
        this.result.frameNumber=result0.frameNumber
        this.result.boneNumber=result0.boneMatrices
        this.result.config.push(result0.config[0])
        this.result.animation.push(result0.animation[0])
        this.boneMatrice=[]//一组动画中的全部数据
    }
    download(){//download(result,name) download(meshAnima.result,skeleton_all[index1][0]+".json")
        var result=this.result
        var name="test.json"//var name=this.name+".json"
        var str=JSON.stringify(result , null, "\t")
        var link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = URL.createObjectURL(new Blob([str], { type: 'text/plain' }));
        link.download =name//"crowdData_male.json";
        link.click();
    }
}