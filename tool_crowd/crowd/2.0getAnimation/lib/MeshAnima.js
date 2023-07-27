export class MeshAnima{
    constructor(skinnedMesh,n){
        this.name=skinnedMesh[0]
        this.skeleton=skinnedMesh[1]//存储了骨骼数据
        this.n=n//每一段动画中的帧数
        this.result={
                "config":[],
                "frameNumber": 0,
                "boneNumber": 0,
                "animation1":[],
                "animation2":[]
        }
        // var frameData0=[]
            // for(var i=0;i<skeleton.bones.length;i++){
            //     var mat_arr=skeleton.boneInverses[i].elements
            //     for(var j=0;j<4;j++)//4行
            //         for(var k=0;k<3;k++)//3列
            //             frameData0.push(mat_arr[4*j+k])
            // }
            // result.animation1.push(frameData0)
            // result.config.push(frameData0.length)
        this.boneMatrice1=[]//一组动画中的全部数据
        this.boneMatrice2=[]
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
    additionFrameData(){
        var skeleton=this.skeleton
        var frameData1=[]
        var frameData2=[]
        for(var i=0;i<skeleton.bones.length;i++){
            var m1=skeleton.boneInverses[i].clone ();
            var m2=skeleton.bones[i].matrixWorld.clone ();
            // frameData1.push( m2.multiply ( m1 ) )
            frameData1.push( m1 )
            frameData2.push( m2 )
        }
        this.boneMatrice1.push(frameData1)
        this.boneMatrice2.push(frameData2)
    }
    finishOneAnima(){
        var skeleton=this.skeleton
        var boneMatrice1_sim=MeshAnima.dim3_to_dim1(this.boneMatrice1)
        var boneMatrice2_sim=MeshAnima.dim3_to_dim1(this.boneMatrice2)
        var result0={
                "config":[boneMatrice1_sim.length],
                "frameNumber": this.n,
	            "boneNumber": skeleton.bones.length,
                "animation1":[boneMatrice1_sim],
                "animation2":[boneMatrice2_sim]
        }
        this.result.frameNumber=result0.frameNumber
        this.result.boneNumber=result0.boneMatrices
        this.result.config.push(result0.config[0])
        this.result.animation1.push(result0.animation1[0])
        this.result.animation2.push(result0.animation2[0])
        this.boneMatrice1=[]//一组动画中的全部数据
        this.boneMatrice2=[]
    }
    download(){//download(result,name) download(meshAnima.result,skeleton_all[index1][0]+".json")
        var result=this.result
        var name=this.name+".json"
        var str=JSON.stringify(result , null, "\t")
        var link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = URL.createObjectURL(new Blob([str], { type: 'text/plain' }));
        link.download =name//"crowdData_male.json";
        link.click();
    }
}