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
        this.afterProcessing(this.result)
        console.log("result",this.result)
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
    afterProcessing(animations){
        this.result.frameNumber=parseInt(
            this.result.frameNumber
        )
        getAnimaTexture(animations)
        console.log("animations",animations)
        function getAnimaTexture(animations){// 将动画数据保存为图片Texture格式//animations是读取的json对象
            getAnimation2(animations)
            console.log(animations)
            const animationData = animations.animation.flat();
            const animationData2 = animations.animation2.flat();
            const animationDataLength = animations.config.reduce((prev, cur) => prev + cur, 0); // sum
            const animationTextureLength = THREE.MathUtils.ceilPowerOfTwo( Math.sqrt(animationDataLength / 4) );
            animations.animationTextureLength=animationTextureLength
            animations.animationTexture={ value: array2Texture(
                animationData, 
                animationTextureLength
                ) };
            animations.animationTexture2={ value: array2Texture(
                animationData2, 
                animationTextureLength
                ) };
        }
        function array2Texture(array, length) {
            let data = new Float32Array(length * length * 4); // RGB:3 RGBA:4
            data.set(array);
            let texture = new THREE.DataTexture(data, length, length, THREE.RGBAFormat, THREE.FloatType);
            texture.needsUpdate = true;
            return texture;
        }
        function getAnimation2(animations){
            console.log("getAnimation2 start")
            animations.animation2=[]
            animations.config2=[]
            let frameNumber=parseInt(animations["frameNumber"])
            let boneNumber=animations.config[0]/((frameNumber+1)*12)//animations["boneNumber"]
            animations.boneNumber=boneNumber
            // console.log("animations.animation.length",animations.animation.length)
            for(let i=0;i<animations.animation.length;i++){
                let animation=animations.animation[i];
                let animation2=[]
                // console.log("frameNumber,boneNumber:",frameNumber,boneNumber)
                for(let f=0;f<frameNumber;f++){
                    for(let b=0;b<boneNumber;b++){
                        let m1=getMatrix(animation,0,b)//boneInverses
                        let m2=getMatrix(animation,f+1,b)//bones[i].matrixWorld
                        let m0=m2.multiply ( m1 )
                        
                        for(let k1=0;k1<4;k1++)//4行
                            for(let k2=0;k2<3;k2++)//3列
                                animation2.push(m0.elements[4*k1+k2])
                    }
                }
                animations.animation2.push(animation2)
                animations.config2.push(animation2.length)
            }
            console.log("getAnimation2 end")
            function getMatrix(arr,f_i,b_i){
                let s=f_i*boneNumber*12+b_i*12
                const m = new THREE.Matrix4();
                m.set( 
                    arr[s+0], arr[s+3], arr[s+6], arr[s+9], 
                    arr[s+1], arr[s+4], arr[s+7], arr[s+10], 
                    arr[s+2], arr[s+5], arr[s+8], arr[s+11],
                    0,0,0,1
                )
                return m
            }
        }

    }
}