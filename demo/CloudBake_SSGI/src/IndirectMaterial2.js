import * as THREE from 'three'
// import{indirectFS}from"../shader/indirectFS.js"
// import{indirectVS}from"../shader/indirectVS.js"
import{fs}from"../shader/SSGIFS/main.js"
import{vs}from"../shader/SSGIVS/main.js"
export class IndirectMaterial2 extends THREE.ShaderMaterial {
	static async Json2Texture(){
		return new Promise( (resolve, reject) => { 
			new THREE.FileLoader().load(
				'./CloudBake/probeIrradiance.json',
				data => {
					const J=JSON.parse( data )
					const texture=array2Texture(J.data, J.width,J.height)
					// self.uniforms.probeIrradiance.value.image=texture
					console.log(texture)
					resolve(texture)
				}
			)
		} );
		function array2Texture(array0, w,h) {
			const array=[]
			for(let i=0;i<array0.length/3;i++){
				array.push(array0[3*i  ])
				array.push(array0[3*i+1])
				array.push(array0[3*i+2])
				array.push(0)
			}
			let data = new Float32Array(w * h * 4); // RGB:3 RGBA:4
			data.set(array);
			let texture = new THREE.DataTexture(
				data, w, h, 
				THREE.RGBAFormat,// 使用RGB三个通道 //THREE.RGBAFormat 四个通道
				THREE.FloatType);
			texture.needsUpdate = true;
			return texture;
		}
	}
	static async Hdr2Texture(){
		return new Promise( (resolve, reject) => { 
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'probeIrradiance.hdr', true);
			xhr.responseType = 'arraybuffer';
			xhr.onload = function() {
				var buffer = xhr.response;
				// 解析HDR文件
				var loader = new RGBELoader();
				var texture = loader.parse(buffer);
				resolve(texture)
			};
			xhr.send();
		} )
	}
	static async pre(cb){
		IndirectMaterial2.prototype.probeIrradiance0=await IndirectMaterial2.Json2Texture()
		if(cb)cb()
	}
    constructor(materialOld,param,uniforms) {
		
		if(IndirectMaterial2.prototype.probeIrradiance0)
			IndirectMaterial2.prototype.probeIrradiance0.needsUpdate = true;
		super({//new THREE.ShaderMaterial({//
			uniforms: {
				mytex0:uniforms.mytex0,
				mytex1:uniforms.mytex1,
				mytex2:uniforms.mytex2,
				mytex3:uniforms.mytex3,
				mytex4:uniforms.mytex4,
				// mytex0:uniforms.mytex0,
				//Declare texture uniform in shader
				GBufferd: uniforms.GBufferd,//IndirectMaterial.initLitRenderTarget(),
				screenWidth: uniforms.screenWidth,//{ value: window.innerWidth },
				screenHeight: uniforms.screenHeight,//{ value: window.innerHeight },

				dGI: uniforms.dGI,
				probeIrradiance: uniforms.probeIrradiance,//{value: null}, //IndirectMaterial.prototype.probeIrradiance0//null 
				probeDistance:uniforms.probeDistance,//{value: null}, // probeDistance: { type: 't', value: null },
				
				rtaoBufferd: uniforms.rtaoBufferd,//{ value: null },
				useRtao: uniforms.useRtao,//{ value: true },

				notCompareFlag: { value: false },
								
				exposure: { value : param.exposure },
				tonemapping: { value: param.tonemapping },
				gamma: { value: param.gamma },
				DDGIVolume: {
				  value: {
					origin: param.origin,//new THREE.Vector3(0, 0, 0),
					probeGridCounts: param.probeGridCounts,//new Int32Array(3),
					probeGridSpacing: param.probeGridSpacing,//new THREE.Vector3(0, 0, 0),
					viewBias: param.viewBias,
					normalBias: param.normalBias,
					probeNumIrradianceTexels: param.numIrradianceTexels,
					probeNumDistanceTexels: param.numDistanceTexels,
					probeIrradianceEncodingGamma: 5.0
				  }
				},
				colorMap: { type: "t", value: null },
				emissiveColor: { value: new THREE.Vector3(0, 0, 0) },
				emissiveMap: { type: "t", value: null },
				useMap: { value: false },
				useEmissiveMap: { value: false },
				originColor: { value: new THREE.Vector3(0, 0, 0) },	
			  },
			vertexShader: vs,//indirectVS,
			fragmentShader: fs,//indirectFS
		})
		this.vertexShader=vs
		this.fragmentShader=fs
		this.needsUpdate = true

		if (materialOld.color) {
			this.uniforms.originColor.value = materialOld.color
		}
		if (materialOld.map) {
			this.uniforms.useMap.value = true
			materialOld.map.encoding = //THREE.sRGBEncoding
				// THREE.SRGBColorSpace
				THREE.LinearSRGBColorSpace
				// THREE.NoColorSpace
			this.uniforms.colorMap.value = materialOld.map
		}
		if (materialOld.emissive) {
			this.uniforms.emissiveColor.value = materialOld.emissive;
		}
		if (materialOld.emissiveMap ) {
			this.uniforms.useEmissiveMap.value = true;
			materialOld.emissiveMap.encoding = THREE.sRGBEncoding
			this.uniforms.emissiveMap.value = node.material.emissiveMap;
		}
		this.param=param
    }
	DataTexture2Json(){
		const image=this.uniforms.probeIrradiance.value.image
		let k0=0
		for(let k=image.data.length-1;k>=0&&image.data[k]==0;k++,k0++);
		console.log("k0",k0)
		const data=[]
		for(let i=0;i<image.data.length-k0;i++)
			data.push(image.data[i]==0?0:parseFloat(image.data[i].toFixed(7)))
		// 将场景对象转换为 JSON 字符串
		const J= JSON.stringify({
			param:this.param,
			data:data,
			height:image.height,
			width:image.width
		});
		console.log(this.param,J)
		const link = document.createElement('a');
		link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(J);
		link.download = 'probeIrradiance.json';
		document.body.appendChild(link);
		link.click();
	}
}
// IndirectMaterial0.prototype.isMeshStandardMaterial = true;