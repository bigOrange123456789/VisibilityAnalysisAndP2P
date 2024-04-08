import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import {MyUI} from "./myLib/MyUI";
import {SceneManager} from "./SceneManager";
import {TilesLoader} from "./myLib/TilesLoader";
class App{
    rootPath="./assets/huayi/"
    constructor(){
        this.body = document.body
        this.canvas = document.getElementById('myCanvas')
        this.canvas.width = this.body.clientWidth
        this.canvas.height = this.body.clientHeight

        window.addEventListener('resize', this.resize.bind(this), false)

        this.setScene()

    }
    setScene(){
        this.renderer = new THREE.WebGLRenderer({
            alpha:true,
            antialias:true,
            canvas:this.canvas,
            preserveDrawingBuffer:true
        })
        // this.renderer = new WebGPURenderer()
        this.renderer.setSize(this.body.clientWidth,this.body.clientHeight)
        this.body.appendChild(this.renderer.domElement)

        this.scene = new THREE.Scene()
        window.scene = this.scene

        // const axes = new THREE.AxesHelper(2000)
        // this.scene.add(axes)

        this.camera = new THREE.PerspectiveCamera(60,this.body.clientWidth/this.body.clientHeight,0.1, 3000000)//10, 3000000)
        this.camera.position.set(3032.4,400.9,-3486.2)
        this.scene.add(this.camera)
        window.camera=this.camera

        this.orbitControl = new OrbitControls(this.camera,this.renderer.domElement)
        this.orbitControl.panSpeed = 0.1
        this.orbitControl.zoomSpeed = 0.15
        this.orbitControl.rotateSpeed = 0.3
        this.orbitControl.target = new THREE.Vector3(2025.7,0,-2167.1)
        this.camera.lookAt(2025.7,0,-2167.1)//new THREE.Vector3(-4705.1,3136.1,7205.7),

        this.addLight()
        // this.addGround()
        this.addSkyBox()
        this.addGUI()
        this.addMyUI()
        this.addAutoMove()

        this.sceneManager = new SceneManager(this.renderer, this.scene, this.camera, this.rootPath)

        window.tiles = null
        if(false)
        new TilesLoader().reinstantiateTiles()

        // var self = this;
        // setInterval(function(){
        //     var s = "new THREE.Vector3("
        //     s += self.camera.position.x.toFixed(1).toString()
        //     s += ","
        //     s += self.camera.position.y.toFixed(1).toString()
        //     s += ","
        //     s += self.camera.position.z.toFixed(1).toString()
        //     s += "),"
        //     console.log(s)
        // }, 2000)

        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)
    }
    animate(){
        requestAnimationFrame(this.animate)
        this.stats.update()

        if(window.autoMoving){
            this.autoMove()
        }

        if(window.tiles){
            window.tiles.setCamera(this.camera)
            window.tiles.setResolutionFromRenderer(this.camera,this.renderer)
            window.tiles.update()
        }
        // this.camera.updateMatrixWorld();
        // this.tilesRenderer.update();

        // this.renderer.clear()
        // this.renderer.render(this.scene, this.camera)
    }
    resize(){
        const {clientHeight, clientWidth} = this.body.parentElement
        this.camera.aspect = clientWidth / clientHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(clientWidth, clientHeight)
    }
    addLight(){
        const dir1 = new THREE.DirectionalLight(0xffffff, 0.5*3)
        dir1.position.set(-0.4, 0.6, 0.8)
        this.scene.add(dir1)

        const dir2 = new THREE.DirectionalLight(0xffffff, 0.5*3)
        dir2.position.set(0.4, 0.6, -0.8)
        this.scene.add(dir2)

        const amb = new THREE.AmbientLight(0xffffff, 0.8)
        this.scene.add(amb)
    }
    addGround(){
        const plane_geo = new THREE.PlaneBufferGeometry(10000,10000);
        const plane = new THREE.Mesh(plane_geo,new THREE.MeshStandardMaterial({color:0x666666}));
        plane.rotation.x = -Math.PI/2
        plane.position.set(2025.7,-0.1,-2167.1)
        this.scene.add(plane)
        new THREE.TextureLoader().load(this.rootPath+"terrain/terrain.png",(texture)=>{
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            texture.repeat.set(100,100)
            plane.material = new THREE.MeshStandardMaterial({
                map:texture,
                // side:2,
            })
        })
    }
    addSkyBox(){
        this.scene.environment=///////////改动的部分--单行///////////
        this.scene.background = new THREE.CubeTextureLoader().setPath(this.rootPath+"skyBox/").load([
            "right.jpg", "left.jpg", "top.jpg", "bottom.jpg", "front.jpg", "back.jpg"
        ],()=>{})
    }
    addGUI(){
        this.stats = new Stats();
        this.stats.dom.height = '48px';
        [].forEach.call(this.stats.dom.children, (child) => (child.style.display = ''));

        // const gui = new GUI({
        //     name: 'My GUI',
        //     width: 240,
        //     closed: true
        // })

        const statsContainer = document.createElement('div')
        statsContainer.id = 'stats-container'
        this.stats.domElement.style.width = 240+'px'
        this.stats.domElement.style.position = 'absolute'
        this.stats.domElement.style.top = 0+'px'
        this.stats.domElement.style.left = this.body.clientWidth-240+'px'
        this.stats.domElement.style.right = 0+'px'
        this.stats.domElement.style.opacity = '0.6'
        statsContainer.appendChild(this.stats.domElement)
        this.body.appendChild(statsContainer)
    }
    addMyUI(){
        const ui = new MyUI()
        const width = window.innerWidth
        const height = window.innerHeight

        const camera_pos = [
            new THREE.Vector3(2025.7,415.1,-809.9),
            new THREE.Vector3(3173.66,92.1293,-2383.9),
            new THREE.Vector3( 2532.51,138.683,-1627.7),
            new THREE.Vector3(1562.48,55.9909,-1491.8),
            new THREE.Vector3(1982.3,242.8,-2302.8),
            new THREE.Vector3(762.083,74.0897,-2478.7),
            new THREE.Vector3(332.651,32.8352,-2177.9),
            new THREE.Vector3(2227.67,195.937,-3309.2),
            new THREE.Vector3(-149.772,51.5546,-74),
        ]
        const camera_tar = [
            new THREE.Vector3(2025.7,0,-2167.1),
            new THREE.Vector3(2990.5,11.8,-2383.9),
            new THREE.Vector3(2377.1,12.8,-1627.7),
            new THREE.Vector3(1368.6,6.9,-1491.8),
            new THREE.Vector3(1981.5,11.6,-2197.7),
            new THREE.Vector3(951.4,9.6,-2478.7),
            new THREE.Vector3(531.4,10.5,-2177.9),
            new THREE.Vector3(2154.5,9.8,-3309.2),
            new THREE.Vector3(-5.5,10.5,-74.0),
        ]
        const inf = {
            '1st':0,
            '2nd':1,
            '3rd':2,
            '4th':3,
            '5th':4,
            '6th':5,
            '7th':6,
            '8th':7,
            '9th':8
        }

        const self = this
        const names = Object.keys(inf)
        for(let i=0; i<names.length; i++){
            new ui.Button(names[i], '#666666', '#444444', '#DDDDDD',
                height/30, width/150,
                width/12, height/20,
                height/90,height*(2*i-2*names.length+28)/30,()=>{
                    let id = inf[names[i]]
                    self.camera.position.copy(camera_pos[id])
                    self.camera.lookAt(camera_tar[id])
                    self.orbitControl.target = camera_tar[id].clone()
                    self.sceneManager.preLoadViewPoint(id)
                })
        }
    }
    addAutoMove(){
        const initialPoints = [
            new THREE.Vector3(2947.5,32.3,-2587.9),
            new THREE.Vector3(2939.8,19.4,-2200.6),
            new THREE.Vector3(2466.1,34.4,-1921.7),
            new THREE.Vector3(2177.5,26.1,-1890.6),
            new THREE.Vector3(1910.6,51.7,-2163.1),
            new THREE.Vector3(2035.6,39.3,-1593.6),
            new THREE.Vector3(2395.3,34.5,-1613.4),
            new THREE.Vector3(2378.6,20.2,-1411.6),
            new THREE.Vector3(2178.3,42.1,-1287.5),
            new THREE.Vector3(1890.8,43.7,-1424.1),
            new THREE.Vector3(1769.5,22.3,-1433.7),
            new THREE.Vector3(1587.0,41.5,-1476.4),
            new THREE.Vector3(1149.7,36.8,-1509.0),
            new THREE.Vector3(719.8,23.5,-1805.9),
            new THREE.Vector3(466.5,41.3,-2194.4),
            new THREE.Vector3(345.5,28.2,-2348.1),
            new THREE.Vector3(839.7,24.3,-2441.0),
            new THREE.Vector3(1178.1,22.2,-2532.1),
            new THREE.Vector3(2056.5,35.5,-3258.9),
        ]

        this.curve = new THREE.CatmullRomCurve3(initialPoints)
        this.curve.curveType = "centripetal"
        this.curve.closed = true

        // const boxGeometry = new THREE.BoxGeometry(10, 10, 10)
        // const boxMaterial = new THREE.MeshBasicMaterial()
        // const curveHandles = []
        // for (const handlePos of initialPoints) {
        //     const handle = new THREE.Mesh(boxGeometry, boxMaterial)
        //     handle.position.copy(handlePos)
        //     curveHandles.push(handle)
        //     this.scene.add(handle)
        // }
        //
        // const points = this.curve.getPoints(50)
        // const line = new THREE.LineLoop(
        //     new THREE.BufferGeometry().setFromPoints(points),
        //     new THREE.LineBasicMaterial({ color: 0x00ff00 })
        // )
        // this.scene.add(line)

        this.loopTime = 300 * 20    // 假设20帧，运行300秒
        this.passedTime = 0
        window.autoMoving = false

        const self = this
        const ui = new MyUI()
        const width = window.innerWidth
        const height = window.innerHeight
        new ui.Button("Auto Roam", '#F4A460', '#F4A430', '#FFD700',
            height/30, width/150,
            width/12, height/20,
            height/90,height*28/30,()=>{
                window.autoMoving = !window.autoMoving
                self.orbitControl.enablePan = !window.autoMoving
                self.orbitControl.enableZoom = !window.autoMoving
                self.orbitControl.enableRotate = !window.autoMoving
            })
    }
    autoMove(){
        if(this.passedTime >= this.loopTime){
            window.autoMoving = !window.autoMoving
            this.orbitControl.enablePan = !window.autoMoving
            this.orbitControl.enableZoom = !window.autoMoving
            this.orbitControl.enableRotate = !window.autoMoving
            this.passedTime = 0
            return
        }
        let t = this.passedTime / this.loopTime
        let position = this.curve.getPointAt(t)
        let tangent = this.curve.getTangentAt(t).multiplyScalar(100)
        let lookAtVec = tangent.add(position)
        this.camera.position.copy(position)
        this.orbitControl.target = lookAtVec
        this.camera.lookAt(lookAtVec)
        let closeComponentsCount = Math.max(this.sceneManager.closeComponentsCount, 200)
        this.passedTime += 1600/closeComponentsCount
        // console.log("speed: "+1600/closeComponentsCount)
    }
    setGPUScene(){

    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App()
})
