let assets_base64={
}
const assets={}
import * as THREE from "three";
export class Instanced1Animation {
    constructor( buffer ) {
		let itemSize1=4
		let itemSize2=2
		let headSize=4
		let head = new Uint32Array(buffer.slice(0, headSize * itemSize1))
		let config_len=head[0]
		let config_0=head[1]
		let animationDataLength=head[2]
		let frameNumber=head[3]
		var config=[]
		for(var i=0;i<config_len;i++)
			config.push(config_0)
		
		let animationTextureLength = 
			THREE.MathUtils.ceilPowerOfTwo( Math.sqrt(animationDataLength / 4) )
		let length=animationTextureLength
		let data1 = new Uint16Array(buffer.slice(
			headSize * itemSize1, 
			headSize * itemSize1+head[2]* itemSize2
			))
		let data1_ = new Uint16Array(length * length * 4)
		data1_.set(data1)

		let data2 = new Uint16Array(buffer.slice(
			headSize * itemSize1+head[2]* itemSize2, 
			buffer.byteLength
			))	
		let data2_ = new Uint16Array(length * length * 4)
		data2_.set(data2)
		
		let map1 = new THREE.DataTexture()
		map1.type = THREE.HalfFloatType
		map1.image = {
			  data: data1_,
			  width: animationTextureLength,
			  height: animationTextureLength,
		}	
		map1.needsUpdate = true
		let map2 = new THREE.DataTexture()
		map2.type = THREE.HalfFloatType
		map2.image = {
			  data: data2_,
			  width: animationTextureLength,
			  height: animationTextureLength,
		}	
		map2.needsUpdate = true

		this.config=config
		this.frameNumber=frameNumber
		this.animationTextureLength=animationTextureLength
		this.animationTexture={value:map1}
		this.animationTexture2={value:map2}
    }	
	static loadAnimJSON_Old( path ) {
        return new Promise( (resolve, reject) => { 
            const animationLoader = new THREE.FileLoader();
            animationLoader.load( path, data => {
                const animationData = JSON.parse( data );
                getAnimaTexture(animationData)
                resolve( animationData );
            } );
        } );
        function getAnimaTexture(animations){// 将动画数据保存为图片Texture格式//animations是读取的json对象
            getAnimation2(animations)
            // console.log(animations)
            const animationData = animations.animation.flat();
            const animationData2 = animations.animation2.flat();
            const animationDataLength = animations.config.reduce((prev, cur) => prev + cur, 0); // sum
            const animationTextureLength = THREE.MathUtils.ceilPowerOfTwo( Math.sqrt(animationDataLength / 4) );
            animations.animationTextureLength=animationTextureLength
            animations.animationTexture={ value: array2Texture(
                animationData, 
                animationTextureLength
                ) }
            animations.animationTexture2={ value: array2Texture(
                animationData2, 
                animationTextureLength
                ) }
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
    static loadAnimJSON( path ) {//?这里似乎执行了三次
        if(path==null)return null//非skinnedmesh
        return new Promise( (resolve, reject) => { 
            let loader = new THREE.FileLoader();
			loader.setResponseType("arraybuffer");
			loader.load(
  				path,
  				buffer => {
					let itemSize1=4
					let itemSize2=2
                    let headSize=4
    				let head = new Uint32Array(buffer.slice(0, headSize * itemSize1))
    				let config_len=head[0]
					let config_0=head[1]
                    let animationDataLength=head[2]
                    let frameNumber=head[3]
                    var config=[]
                    for(var i=0;i<config_len;i++)
                        config.push(config_0)
					
					let animationTextureLength = 
						THREE.MathUtils.ceilPowerOfTwo( Math.sqrt(animationDataLength / 4) )
                    let length=animationTextureLength
					let data1 = new Uint16Array(buffer.slice(
						headSize * itemSize1, 
						headSize * itemSize1+head[2]* itemSize2
						))
                    let data1_ = new Uint16Array(length * length * 4)
                    data1_.set(data1)

				    let data2 = new Uint16Array(buffer.slice(
						headSize * itemSize1+head[2]* itemSize2, 
						buffer.byteLength
						))	
                    let data2_ = new Uint16Array(length * length * 4)
                    data2_.set(data2)
					
    				let map1 = new THREE.DataTexture()
    				map1.type = THREE.HalfFloatType
    				map1.image = {
      					data: data1_,
      					width: animationTextureLength,
      					height: animationTextureLength,
    				}	
                    map1.needsUpdate = true
					let map2 = new THREE.DataTexture()
    				map2.type = THREE.HalfFloatType
    				map2.image = {
      					data: data2_,
      					width: animationTextureLength,
      					height: animationTextureLength,
    				}	
                    map2.needsUpdate = true

                    var animationData={
                        config:config,
                        frameNumber:frameNumber,
                        animationTextureLength:animationTextureLength,
                        animationTexture:{value:map1},
                        animationTexture2:{value:map2}
                    }
                    resolve( animationData );
  				}	
			)//end
        } );
    }
	static createAnimation(path){
		if(path==null)return null//非skinnedmesh
        return new Promise( (resolve, reject) => { 
            let loader = new THREE.FileLoader();
			loader.setResponseType("arraybuffer");
			loader.load(
  				path,
  				buffer => {
					
                    resolve( new Instanced1Animation(buffer) );
  				}	
			)//end
        } );
	}
}