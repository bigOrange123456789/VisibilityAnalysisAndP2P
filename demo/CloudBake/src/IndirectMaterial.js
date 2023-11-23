import * as THREE from '../three.module'//import * as THREE from 'three'
export class IndirectMaterial extends THREE.ShaderMaterial {
	static loadGLSL(name){
		return new Promise((resolve, reject) => {
				let xhr = new XMLHttpRequest();
				xhr.onload=()=>resolve(xhr.responseText)
				xhr.onerror =  event => reject(event);
				xhr.open('GET',"./shader/"+name+".glsl" )
				xhr.overrideMimeType("text/html;charset=utf-8")
				xhr.send()
			})
	}
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
		function array2Texture_old(array, w,h) {
			let data = new Float32Array(w * h * 3); // RGB:3 RGBA:4
			data.set(array);
			let texture = new THREE.DataTexture(
				data, w, h, 
				THREE.RGBFormat,// 使用RGB三个通道 //THREE.RGBAFormat 四个通道
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
		IndirectMaterial.prototype.vertexShader  = await IndirectMaterial.loadGLSL('indirectVS')//document.getElementById('indirectVS').innerHTML
		IndirectMaterial.prototype.fragmentShader= await IndirectMaterial.loadGLSL('indirectFS')//document.getElementById('indirectFS').innerHTML
		IndirectMaterial.prototype.probeIrradiance0=await IndirectMaterial.Json2Texture()
		if(cb)cb()
	}
    constructor(materialOld,param) {
		// const param={
		// 	exposure:2,
		// 	tonemapping:true,
		// 	gamma:true,
		// 	viewBias:0.3,
		// 	normalBias:0.1,
		// 	numIrradianceTexels:6,
		// 	numDistanceTexels:6,
		// 	origin:new THREE.Vector3 (-0.4000000059604645,  5.400000095367432,  -0.25) ,
		// 	probeGridCounts:[11, 11, 11],
		// 	probeGridSpacing:new THREE.Vector3( 2.0399999618530273,  1,  0.8999999761581421)
		// }
		// console.log(IndirectMaterial.prototype.probeIrradiance0)
		IndirectMaterial.prototype.probeIrradiance0.needsUpdate = true;
		super({//new THREE.ShaderMaterial({//
			uniforms: {
				//Declare texture uniform in shader
				GBufferd: { type: 't', value: null },
				probeIrradiance: { 
					type: 't', 
					value: IndirectMaterial.prototype.probeIrradiance0//null 
				},
				probeDistance:{ 
					type: 't', 
					value: null 
				},
				// probeDistance: { type: 't', value: null },
				screenWidth: { value: window.innerWidth },
				screenHeight: { value: window.innerHeight },
				notCompareFlag: { value: false },
				dGI: { value: true },
				exposure: { value : param.exposure },
				tonemapping: { value: param.tonemapping },
				gamma: { value: param.gamma },
				DDGIVolume: {
				  value: {
					origin: new THREE.Vector3(0, 0, 0),
					probeGridCounts: new Int32Array(3),
					probeGridSpacing: new THREE.Vector3(0, 0, 0),
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
			vertexShader: IndirectMaterial.prototype.vertexShader,
			fragmentShader: IndirectMaterial.prototype.fragmentShader
		})
		window.indirectMaterial=this
		this.uniforms.GBufferd.value = this._initLitRenderTarget().texture
		this.uniforms.DDGIVolume.value.origin = param.origin
		this.uniforms.DDGIVolume.value.probeGridCounts = param.probeGridCounts
		this.uniforms.DDGIVolume.value.probeGridSpacing = param.probeGridSpacing
		this.needsUpdate = true

		if (materialOld.color) {
			this.uniforms.originColor.value = materialOld.color
		}
		if (materialOld.map != null) {
			this.uniforms.useMap.value = true
			materialOld.map.encoding = THREE.sRGBEncoding
			this.uniforms.colorMap.value = materialOld.map
		}
		if (materialOld.emissive.x != 0 && materialOld.emissive.y != 0 && materialOld.emissive.z != 0) {
			this.uniforms.emissiveColor.value = materialOld.emissive;
		}
		if (materialOld.emissiveMap != null) {
			this.uniforms.useEmissiveMap.value = true;
			materialOld.emissiveMap.encoding = THREE.sRGBEncoding
			this.uniforms.emissiveMap.value = node.material.emissiveMap;
		}
		this.param={
			exposure:param.exposure,
			tonemapping:param.tonemapping,
			gamma:param.gamma,
			viewBias:param.viewBias,
			normalBias:param.normalBias,
			numIrradianceTexels:param.numIrradianceTexels,
			numDistanceTexels:param.numDistanceTexels,
			origin:param.origin ,
			probeGridCounts:param.probeGridCounts,
			probeGridSpacing:param.probeGridSpacing
		}
    }
	_initLitRenderTarget(){
		const litRenderTarget = new THREE.WebGLRenderTarget(
			window.innerWidth,
			window.innerHeight,
			{
			  minFilter: THREE.NearestFilter,
			  magFilter: THREE.NearestFilter,
			  format: THREE.RGBAFormat,
			  type: THREE.FloatType
			}
		)
		litRenderTarget.texture.type = 1015
		litRenderTarget.texture.format = 1023

		function onWindowResize() {
			litRenderTarget.setSize(window.innerWidth, window.innerHeight)
			requestAnimationFrame(onWindowResize);
		}
		onWindowResize() 
		return litRenderTarget 
	}
	probeIrradianceUpdate(irradianceLoader){
		this.uniforms.probeIrradiance.value = irradianceLoader
		window.irradianceLoader=irradianceLoader
		// if(!window.flag00){
		// 	window.flag00=true
		// 	this.DataTexture2Json()
		// }
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