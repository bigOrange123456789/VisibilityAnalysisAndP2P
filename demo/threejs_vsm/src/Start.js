import * as THREE from 'three';
import Stats from './stats.module.js';
import { GUI } from './lil-gui.module.min.js';
import {MapControls,OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
export class Start{
    constructor(body){
        let camera, scene, renderer, clock, stats;
			let dirLight, spotLight;
			let dirGroup;
            
			init();
			
			function init() {
				initScene();
				initMisc();

				// Init gui
				const gui = new GUI();

				const config = {
					spotlightRadius: 4,
					spotlightSamples: 8,
					dirlightRadius: 4,
					dirlightSamples: 8
				};

				const spotlightFolder = gui.addFolder( 'Spotlight' );
				spotlightFolder.add( config, 'spotlightRadius' ).name( 'radius' ).min( 0 ).max( 25 ).onChange( function ( value ) {

					spotLight.shadow.radius = value;

				} );

				spotlightFolder.add( config, 'spotlightSamples', 1, 25, 1 ).name( 'samples' ).onChange( function ( value ) {

					spotLight.shadow.blurSamples = value;

				} );
				spotlightFolder.open();

				const dirlightFolder = gui.addFolder( 'Directional Light' );
				dirlightFolder.add( config, 'dirlightRadius' ).name( 'radius' ).min( 0 ).max( 25 ).onChange( function ( value ) {

					dirLight.shadow.radius = value;

				} );

				dirlightFolder.add( config, 'dirlightSamples', 1, 25, 1 ).name( 'samples' ).onChange( function ( value ) {

					dirLight.shadow.blurSamples = value;

				} );
				dirlightFolder.open();

				document.body.appendChild( renderer.domElement );
				

			}

			function initScene() {

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.set( 0, 10, 30 );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x222244 );
				scene.fog = new THREE.Fog( 0x222244, 50, 100 );

				// Lights
				scene.add( new THREE.AmbientLight( 0x444444 ) );

				spotLight = new THREE.SpotLight( 0xff8888 );
				spotLight.angle = Math.PI / 5;
				spotLight.penumbra = 0.3;
				spotLight.position.set( 8, 10, 5 );
				spotLight.castShadow = true;
				spotLight.shadow.camera.near = 8;
				spotLight.shadow.camera.far = 200;
				spotLight.shadow.mapSize.width = 256;
				spotLight.shadow.mapSize.height = 256;
				spotLight.shadow.bias = - 0.002;
				spotLight.shadow.radius = 4;
				scene.add( spotLight );


				dirLight = new THREE.DirectionalLight( 0x8888ff );
				dirLight.position.set( 3, 12, 17 );
				dirLight.castShadow = true;
				dirLight.shadow.camera.near = 0.1;
				dirLight.shadow.camera.far = 500;
				dirLight.shadow.camera.right = 17;
				dirLight.shadow.camera.left = - 17;
				dirLight.shadow.camera.top	= 17;
				dirLight.shadow.camera.bottom = - 17;
				dirLight.shadow.mapSize.width = 512;
				dirLight.shadow.mapSize.height = 512;
				dirLight.shadow.radius = 4;
				dirLight.shadow.bias = - 0.0005;

				dirGroup = new THREE.Group();
				dirGroup.add( dirLight );
				scene.add( dirGroup );

				// Geometry
				const material = new THREE.MeshPhongMaterial( {
					color: 0x999999,
					shininess: 0,
					specular: 0x222222
				} );

				const cylinderGeometry = new THREE.CylinderGeometry( 0.75, 0.75, 7, 32 );

				const pillar1 = new THREE.Mesh( cylinderGeometry, material );
				pillar1.position.set( 8, 3.5, 8 );
				pillar1.castShadow = true;
				pillar1.receiveShadow = true;

				const pillar2 = pillar1.clone();
				pillar2.position.set( 8, 3.5, - 8 );
				const pillar3 = pillar1.clone();
				pillar3.position.set( - 8, 3.5, 8 );
				const pillar4 = pillar1.clone();
				pillar4.position.set( - 8, 3.5, - 8 );

				scene.add( pillar1 );
				scene.add( pillar2 );
				scene.add( pillar3 );
				scene.add( pillar4 );

				const planeGeometry = new THREE.PlaneGeometry( 200, 200 );
				const planeMaterial = new THREE.MeshPhongMaterial( {
					color: 0x999999,
					shininess: 0,
					specular: 0x111111
				} );

				const ground = new THREE.Mesh( planeGeometry, planeMaterial );
				ground.rotation.x = - Math.PI / 2;
				ground.scale.multiplyScalar( 3 );
				ground.castShadow = true;
				ground.receiveShadow = true;
				scene.add( ground );

			}

			function initMisc() {

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.shadowMap.enabled = true;
				renderer.shadowMap.type = THREE.VSMShadowMap;

				// Mouse control
				const controls = new OrbitControls( camera, renderer.domElement );
				controls.target.set( 0, 2, 0 );
				controls.update();

				clock = new THREE.Clock();

				stats = new Stats();
				document.body.appendChild( stats.dom );

			}

			
            this.renderer=renderer
            this.camera=camera
            this.scene=scene
            this.stats=stats
            this.clock=clock

            this.dirLight=dirLight
            this.spotLight=spotLight
            this.dirGroupdirGroup
            this.dirGroup=dirGroup
            
            window.addEventListener('resize', this.resize.bind(this), false)

            this.animate = this.animate.bind(this)
            this.animate();
    }
    init(){
        const self=this
        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)
        // this.test()
        
        // this.initSky()
        this.initWander()
        // if(false)
        this.panel = new Panel(this)
        this.lightProducer=new LightProducer(this.scene,this.camera)
        // this.loadJson(
        //     "LoadingProgressive/pos.json",
        //     data=>{
                let data=null
                // setTimeout(()=>{
                //     console.log("data",data)
                // new TreeManager(self.scene).init(data) 
                // })
                // if(typeof AvatarManager!=="undefined")
                // for(let i=0;i<2;i++)
                    // new AvatarManager(self.scene,self.camera,data)
                // self.TreeManager.init(data) 
            // }
        // )
        // self.TreeManager = new TreeManager(self.scene,data) 
          
        this.initCSM();

        this.building = new Building(this.scene, this.camera,this.csm,()=>{
            this.ui=new UI(this)
        })
        
        // console.log(this.csm)
        // console.log(this.lightProducer.ambient)
        // window.capture=()=>{
        //     self.capture()
        // }
        // new Test2(this.scene)

        
        // this.getCubeMapTexture('assets/textures/environment/skybox.hdr').then(
        //     ({ envMap }) => {
        //       self.scene.background = envMap
        //       self.scene.backgroundIntensity=0.8
        //     }
        //   )
        Engine3D.MapLoader.getCubeMapTexture('assets/textures/environment/skybox.jpg',this.renderer).then(
            ({ envMap }) => {
              self.scene.background = envMap
              self.scene.backgroundIntensity=0.8

              self.scene.backgroundIntensity=0.4
              if(self.unrealBloom)if(self.unrealBloom.bloomPass)
              self.unrealBloom.bloomPass.strength=0.55

            //   self.scene.environment = envMap
            //   self.scene.backgroundIntensity=0//=0.1
            }
        )
        Engine3D.MapLoader.getCubeMapTexture('assets/textures/environment/evn.jpg',this.renderer).then(
        //this.getCubeMapTexture('assets/textures/environment/footprint_court_2k.hdr').then(
            ({ envMap }) => {
                // envMap.flipY=true 
              self.scene.environment = envMap
            //   self.scene.background = envMap//test
            //   self.scene.backgroundIntensity=0.1
            //   self.unrealBloom.bloomPass.strength=1.5
              window.scene=self.scene
            }
        )

        // setTimeout(()=>{
            // new Engine3D.PathPlanning()
        // },3000)
        
        // const center=new THREE.Object3D()
        // center.position.set( 126.06182686202473,  21,  161.6807662956592)
        const scene=new THREE.Scene()
        scene.add(
            new Engine3D.PathLine({
                path:[],
                camera:this.camera,
                delayTime:500
              })
          )
        scene.add(this.scene)
        this.miniMap = new Engine3D.MiniMap({
            target: this.camera,//center,//this.player,
            scene: scene,//this.scene,
            mapSize: 100*12,
            mapRenderSize: 160,
          });


          
        
        // this.miniMap = new Engine3D.MiniMap({
        //     target: this.camera,//this.player,
        //     scene: this.scene,
        //     mapSize: 12,
        //     mapRenderSize: 160,
        //   });
          
        
    }
    initScene(){
        // this.renderer = new THREE.WebGLRenderer({
        //     alpha:true,
        //     antialias: true,
        //     canvas:this.canvas,
        //     preserveDrawingBuffer:true
        // })
        // this.renderer.setSize(this.body.clientWidth,this.body.clientHeight)
        // this.renderer.setPixelRatio(window.devicePixelRatio)
        // this.body.appendChild(this.renderer.domElement)

        // // 渲染器开启阴影效果
        // this.renderer.shadowMap.enabled = true

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,//抗锯齿
            alpha:true,
            // canvas:this.canvas
        })
        document.body.appendChild( this.renderer.domElement );
        this.canvas=this.renderer.domElement
        // this.renderer.flag=11102
        // this.renderer = new WebGPURenderer({ 
        //     antialias: true,//抗锯齿
        //     alpha:true,
        //     canvas:this.canvas
        // })
        // this.renderer = new WebGPURenderer()
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)//this.body.clientWidth,this.body.clientHeight)
		// 告诉渲染器需要阴影效果
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMapSoft = true;
		this.renderer.setClearColor(0xcccccc)
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // BasicShadowMap,PCFSoftShadowMap, PCFShadowMap,VSMShadowMap
		this.renderer.shadowMap.autoUpdate = true;
		//this.renderer.tonemapping = THREE.NoToneMapping;
        //this.renderer.toneMapping = THREE.ReinhardToneMapping;this.renderer.toneMappingExposure=2.14
		this.renderer.setScissorTest = true;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        this.body.appendChild(this.renderer.domElement)
        window.renderer=this.renderer
        //////////////////////////////////////
		// this.litRenderTarget = new THREE.WebGLRenderTarget(
		// 	window.innerWidth,
		// 	window.innerHeight,
		// 	{
		// 	minFilter: THREE.NearestFilter,
		// 	magFilter: THREE.NearestFilter,
		// 	format: THREE.RGBAFormat,
		// 	type: THREE.FloatType
		// 	}
		// )
        //////////////////


        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute'
        this.stats.domElement.style.left = '0px'
        this.stats.domElement.style.top = '0px'
        var statsContainer = document.createElement('div')
        statsContainer.id = 'stats-container'
        statsContainer.appendChild(this.stats.domElement)
        this.body.appendChild(statsContainer)

        this.scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera(
            (this.config["FlipY"]?-1:1)*30,//50,
            this.body.clientWidth/this.body.clientHeight,
            this.config.camera.near,//3,//
            this.config.camera.far//200,//
            )
            // ( 65, width / height, 3, 10 )

        window.camera=this.camera
        this.camera.position.set(
            this.config.camera.position.x,
            this.config.camera.position.y,
            this.config.camera.position.z
        )
        this.camera.rotation.set(
            this.config.camera.rotation.x,
            this.config.camera.rotation.y,
            this.config.camera.rotation.z
        )

        window.camera=this.camera
        
        this.scene.add(this.camera)
        window.scene=this.scene

        this.playerControl=new Engine3D.PlayerControl(this.camera,this.config["FlipY"],true)
        this.playerControl.target.set(
            this.config.camera.target.x,
            this.config.camera.target.y,
            this.config.camera.target.z
        )
        this.playerControl.mode.set("viewpoint")
        this.playerControl.speed.moveBoard =this.config.speed     //this.config.speed.moveBoard//1
        this.playerControl.speed.moveWheel0=this.config.speed*0.01//this.config.speed.moveWheel0//0.01

        // this.orbitControl = new OrbitControls(this.camera,this.renderer.domElement)
        // window.orbitControl=this.orbitControl
        // this.orbitControl.target.set(
        //     -340.67888298324596, 
        //     8.573750000000038,  
        //     199.38166396137652
        // )
        // this.camera.lookAt(
        //     -340.67888298324596, 
        //     8.573750000000038,  
        //     199.38166396137652
        // )

        // this.playerControl.target.set(
        //     this.config.camera.target.x,
        //     this.config.camera.target.y,
        //     this.config.camera.target.z
        // )
        // this.orbitControl.target = camera_tar[id].clone()

        


    }

    initCSM() {

        //window.material.side = THREE.BackSide;
        this.csm = new THREE.CSM({
            fade: true,
            maxFar: this.camera.far,
            cascades: 4,//4,
            shadowMapSize: 1024,//1024,
            lightDirection: new THREE.Vector3(0.5, -1, 1).normalize(),
            camera: this.camera,
            parent: this.scene,
            lightIntensity: 2.9,//1.,//
            lightColor: new THREE.Color(0xffffff),//new THREE.Color(0xf7f2d9),
            shadowBias: -0.0004,
            mode: 'practical',
            lightMargin: 200
        });
        window.csm=this.csm
        //this.csm.lightIntensity = 1000;
        //let mesh = new THREE.Mesh(new THREE.BoxGeometry(), material);
        //mesh.castShadow = true;
        //mesh.receiveShadow = true;

        //this.scene.add(mesh);();
    }
    animate() {
        const renderer=this.renderer
        const camera=this.camera
        const scene=this.scene
        const stats=this.stats
        const clock=this.clock

        const dirLight=this.dirLight
        const dirGroup=this.dirGroup
        // requestAnimationFrame( animate );

				const delta = clock.getDelta();
                const time=delta

				dirGroup.rotation.y += 0.7 * delta;
				dirLight.position.z = 17 + Math.sin( time * 0.001 ) * 5;

				renderer.render( scene, camera );

				stats.update();
        requestAnimationFrame(this.animate)
    }
    resize(){
        // this.canvas.width = window.innerWidth;//this.body.clientWidth
        // this.canvas.height = window.innerHeight;//this.body.clientHeight
        this.camera.aspect = window.innerWidth / window.innerHeight;//clientWidth / clientHeight
        this.camera.updateProjectionMatrix()
        if(this.renderer)this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    initSky() {
        if(this.config.render=="false")return
        new SkyController(this.scene,this.camera,this.renderer)
    }
    setSpeed(){
        if(this.config.pathList)
        for(let i=0;i<this.config.pathList.length;i++)
            for(let j=0;j<this.config.pathList[i].length;j++){
                this.config.pathList[i][j][6]/=this.speed
            }
    }
    loadJson(path,cb){
        // console.log(path)
        var xhr = new XMLHttpRequest()
        xhr.open('GET', path, true)
        xhr.send()
        xhr.onreadystatechange = ()=> {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var json_data = JSON.parse(xhr.responseText)
                cb(json_data)
            }
        }
    }
    addTool(obj){
        obj.loadJson=(path,cb)=>{
            console.log(path)
            var xhr = new XMLHttpRequest()
            xhr.open('GET', path, true)
            xhr.send()
            xhr.onreadystatechange = ()=> {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var json_data = JSON.parse(xhr.responseText)
                    cb(json_data)
                }
            }
        }
    }
}