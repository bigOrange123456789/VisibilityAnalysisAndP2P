import { StateCode } from "./StateCode"
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import  toByteArray  from  './base64'//import  base64  from  './base64'
import * as THREE from 'three'
export class RTXGINetwork
{
	/*Client 2 Server*/
	C2SSocket: WebSocket;
	/*Server IP*/
	ServerIP = "127.0.0.1";//'114.95.45.234';//
	/*Server Port*/
	ServerPort = "5600";
	/*Sync Web Service*/
	SyncWebService = "";
	/*scene id*/
	SceneId = "";
	/*irradiance*/
	IrradianceTex = {};
	/*distance*/
	DistanceTex = {};
	/*rtao used*/
	usedRtao = false;
	/*rtao*/
	RtaoTex = {};
	/*volume desc update*/
	isDescTouch = false;
	/*scene name*/
	sceneName = "";
	/*Volume Desc*/
	/*camera position*/
	cameraPosition = new THREE.Vector3();
	/*camera fov*/
	cameraFov = 68;
	/*directional light count*/
	directionalLightCt = 0;
	/*directionalLight direction*/
	dLightDirection = new THREE.Vector3();
	/*Scene min/max*/
	SceneMin = new THREE.Vector3();
	SceneMax = new THREE.Vector3();
	/*point light count*/
	pointLightCt = 0;
	/*point lights array*/
	pointLightParams = [];
	/*spot light count*/
	spotLightCt = 0;
	/*spot light array*/
	spotLightParams = [];
	/*viewBias*/
	viewBias = 0.0;
	/*normal bias*/
	normalBias = 0.0;
	numIrradianceTexels = 6;
	/*num distance texels*/
	numDistanceTexels=14;
	/*exposure*/
	exposure = 2.0;
	/*tonemapping*/
	tonemapping = true;
	/*gamma*/
	gamma = true;
	/*origin*/
	origin = new THREE.Vector3();
	/*probe grid counts*/
	probeGridCounts = new Int32Array(3);
	/*probe grid spacing*/
	probeGridSpacing = new THREE.Vector3();
	/*ready*/
	ready()
	{
		return this.C2SSocket != null && 
		this.C2SSocket.readyState == WebSocket.OPEN;
	}
	/*constructor*/
	constructor()
	{
		this.CreateC2S();
	}
	/*send to server*/
	sendToServer(msg)
	{
		this.C2SSocket.send(msg);
	}
	/*read blob*/
	ReadBlob(msg)
	{
		/*state code blob*/
		let msgBlob = new Blob([msg.data]);
		let headerReader = new FileReader();
		headerReader.onload = (e: ProgressEvent) =>
		{
			if (headerReader.readyState == FileReader.DONE) 
			{
				let dataJson = JSON.parse(headerReader.result);
				/*RTXGI probe irr and dis texture*/
				if(dataJson.type == StateCode.C2S_RTXGI_ProbeHdr)
				{
					if(dataJson.irradiance){
						/*irradiance*/
						let irradianceData = toByteArray(dataJson.irradiance);
						/*update loader*/
						let irradianceBlob = new Blob([irradianceData],{ type: "image/hdr"});
						let irradianceUrl = URL.createObjectURL(irradianceBlob);
						/*irradiance loader*/
						let irradianceLoader = new RGBELoader()
								.setDataType(THREE.FloatType)
								.load(irradianceUrl,
									function (texture) {
										texture.minFilter = THREE.LinearFilter;
										texture.magFilter = THREE.LinearFilter;
										texture.wrapS = THREE.RepeatWrapping;
										texture.wrapT = THREE.RepeatWrapping;
									}
						);
						this.IrradianceTex = irradianceLoader;
					}
					/*rtao texture*/
					if(dataJson.rtao)
					{
						//console.log("rtao:"+ rtaoData);
						let rtaoData = toByteArray(dataJson.rtao);
						/*update loader*/
						let rtaoBlob = new Blob([rtaoData],{ type: "image/png"});
						let rtaoUrl = URL.createObjectURL(rtaoBlob);
						/*irradiance loader*/
						let rtaoLoader = new THREE.TextureLoader()
								.load(rtaoUrl,
									function (texture) {
										texture.minFilter = THREE.LinearFilter;
										texture.magFilter = THREE.LinearFilter;
										texture.wrapS = THREE.RepeatWrapping;
										texture.wrapT = THREE.RepeatWrapping;
									}
						);
						this.RtaoTex = rtaoLoader;
						this.usedRtao = true;
					}
					
				}else if(dataJson.type == StateCode.C2S_RTXGI_ProbePng)
				{
					/*irradiance*/
					let irradianceData = toByteArray(dataJson.irradiance);
					/*update loader*/
					let irradianceBlob = new Blob([irradianceData],{ type: "image/png"});
					let irradianceUrl = URL.createObjectURL(irradianceBlob);
					/*irradiance loader*/
					let irradianceLoader = new THREE.TextureLoader()
							.load(irradianceUrl,
								function (texture) {
									 texture.minFilter = THREE.LinearFilter;
									 texture.magFilter = THREE.LinearFilter;
									 texture.wrapS = THREE.RepeatWrapping;
									 texture.wrapT = THREE.RepeatWrapping;
								}
					);
					this.IrradianceTex = irradianceLoader;
				}else if(dataJson.type == StateCode.C2S_RTXGI_VolumeDesc){
					if(!this.isDescTouch)
					{
						this.sceneName = dataJson.sceneF;
						this.cameraPosition = new THREE.Vector3();
						this.cameraPosition.x = dataJson.cameraPX;
						this.cameraPosition.y = dataJson.cameraPY;
						this.cameraPosition.z = dataJson.cameraPZ;
						
						this.cameraFov = dataJson.fov;
						
						/*Light init data*/
						/*directional light*/
						this.directionalLightCt = dataJson.dlightCount;
						if(this.directionalLightCt == 1){
							this.dLightDirection.x = dataJson.direction.x;
							this.dLightDirection.y = dataJson.direction.y;
							this.dLightDirection.z = dataJson.direction.z;
						}
						
						this.SceneMin.x = dataJson.minx;
						this.SceneMin.y = dataJson.miny;
						this.SceneMin.z = dataJson.minz;
						
						this.SceneMax.x = dataJson.maxx;
						this.SceneMax.y = dataJson.maxy;
						this.SceneMax.z = dataJson.maxz;
						
						/*point light*/
						this.pointLightCt = dataJson.plightCount;
						if(this.pointLightCt > 0){
							/*set param to params*/
							this.pointLightParams = dataJson.plightData;
						}
						
						/*spot light*/
						this.spotLightCt = dataJson.slightCount;
						if(this.spotLightCt > 0){
							/*set param to params*/
							this.spotLightParams = dataJson.slightData;
						}
						
						/*distance texture*/
						/*irradiance*/
						let distanceData = toByteArray(dataJson.distance);
						/*distance loader*/
						let distanceBlob = new Blob([distanceData],{ type: "image/hdr"});
						let distanceUrl = URL.createObjectURL(distanceBlob);
						let distanceLoader = new RGBELoader()
							.setDataType(THREE.FloatType)
							.load(distanceUrl,
								function (texture) {
									texture.minFilter = THREE.LinearFilter;
									texture.magFilter = THREE.LinearFilter;
									texture.wrapS = THREE.RepeatWrapping;
									texture.wrapT = THREE.RepeatWrapping;
								}
						);
						this.DistanceTex = distanceLoader;
						
						/*irradiance*/
						let irradianceData = toByteArray(dataJson.irradiance);
						/*update loader*/
						let irradianceBlob = new Blob([irradianceData],{ type: "image/hdr"});
						let irradianceUrl = URL.createObjectURL(irradianceBlob);
						/*irradiance loader*/
						let irradianceLoader = new RGBELoader()
							.setDataType(THREE.FloatType)
							.load(irradianceUrl,
								function (texture) {
									 texture.minFilter = THREE.LinearFilter;
									 texture.magFilter = THREE.LinearFilter;
									 texture.wrapS = THREE.RepeatWrapping;
									 texture.wrapT = THREE.RepeatWrapping;
								}
						);
						this.IrradianceTex = irradianceLoader;
						
						/*rtao texture*/
						if(dataJson.rtao)
						{
							//console.log("rtao:"+ dataJson.rtao);
							let rtaoData = toByteArray(dataJson.rtao);
							/*update loader*/
							let rtaoBlob = new Blob([rtaoData],{ type: "image/png"});
							let rtaoUrl = URL.createObjectURL(rtaoBlob);
							/*irradiance loader*/
							let rtaoLoader = new THREE.TextureLoader()
									.load(rtaoUrl,
										function (texture) {
											texture.minFilter = THREE.LinearFilter;
											texture.magFilter = THREE.LinearFilter;
											texture.wrapS = THREE.RepeatWrapping;
											texture.wrapT = THREE.RepeatWrapping;
										}
							);
							this.RtaoTex = rtaoLoader;
							this.usedRtao = true;
						}
						
						this.viewBias = dataJson.viewB;
						this.normalBias = dataJson.normalB;
						this.numIrradianceTexels = dataJson.numIT;
						this.numDistanceTexels = dataJson.numDT;
						this.exposure = dataJson.exposure;
						this.tonemapping = dataJson.tonemapping;
						this.gamma = dataJson.gamma;
						
						this.origin = new THREE.Vector3();
						this.origin.x = dataJson.originX;
						this.origin.y = dataJson.originY;
						this.origin.z = dataJson.originZ;
					
						this.probeGridCounts = new Int32Array(3);
						this.probeGridCounts[0] = dataJson.pgcX;
						this.probeGridCounts[1] = dataJson.pgcY;
						this.probeGridCounts[2] = dataJson.pgcZ;
					
						this.probeGridSpacing = new THREE.Vector3();
						this.probeGridSpacing.x = dataJson.pgsX;
						this.probeGridSpacing.y = dataJson.pgsY;
						this.probeGridSpacing.z = dataJson.pgsZ;
						this.isDescTouch = true;
					}
				}
			}
		}
		headerReader.readAsText(msgBlob,"UTF-8");
	}
	
	/*Create C2SSocket*/
	CreateC2S()
	{
		/*connect*/
		try
		{
			var hostAddress = "ws//" + this.ServerIP + ":" +
			this.ServerPort + "/" + this.SyncWebService;
			this.C2SSocket = new WebSocket('ws://127.0.0.1:5600');//new WebSocket('ws://114.95.45.234:5600');//
		}
		catch(ex)
		{
			console.log(ex);
		}
		/*message callback*/
		try
		{
			/*onopen*/
			this.C2SSocket.onopen = (msg: Event) => {
				console.log("ready to sync scene!");
			}
			/*onmessage*/
			this.C2SSocket.onmessage = (msg: Event) => {
				this.ReadBlob(msg);
			}
			/*onclose*/
			this.C2SSocket.onclose = (msg) => {
				window.alert("RTXGI Sync: 暂时无法访问服务器，请稍后！");
			}
			/*onerror*/
			this.C2SSocket.onerror = (msg) => {
				console.log(msg);
			}
		}
		catch(ex){
			console.log(ex);
		}
	}
	/*set irradiance and distance probe*/
	ConstructorProbe(irradiance, distance)
	{
		this.IrradianceTex = irradiance;
		this.DistanceTex = distance;
	}
}