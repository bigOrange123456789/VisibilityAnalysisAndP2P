class Main{
    constructor(body){
        this.body = body
        this.canvas = document.getElementById('myCanvas')

        this.initScene()
        this.initLight()
        this.loadModel()
        
        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        
        // this.animate = this.animate.bind(this)
        // requestAnimationFrame(this.animate)
    }
    loadModel(){
        this.object=new THREE.Object3D()
        this.scene.add( this.object )

        const geometry = new THREE.BoxGeometry( 1, 1, 1 ) 
        const material = new THREE.MeshBasicMaterial( {color: 0x10ff00} ) 
        const cube = new THREE.Mesh( geometry, material ) 
        this.object.add( cube )

        
        const self=this
        // new THREE.GLTFLoader().load(path, async (glb0) => {
           
        // })
        
    }
    initScene(){
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,//抗锯齿
            alpha:true,
            canvas:this.canvas,
            preserveDrawingBuffer:true
        })
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)//this.body.clientWidth,this.body.clientHeight)
		// 告诉渲染器需要阴影效果
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMapSoft = true;
		this.renderer.setClearColor(0xffffff)//(0xcccccc)
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // BasicShadowMap,PCFSoftShadowMap, PCFShadowMap,VSMShadowMap
		this.renderer.shadowMap.autoUpdate = true;
		this.renderer.tonemapping = THREE.NoToneMapping;
        //this.renderer.toneMapping = THREE.ReinhardToneMapping;this.renderer.toneMappingExposure=2.14
		this.renderer.setScissorTest = true;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        this.body.appendChild(this.renderer.domElement)
        window.renderer=this.renderer

        this.scene = new THREE.Scene()

        
        const fov = 45;
        const aspect = 2;
        const near = 0.1;
        const far = 10000;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(
            0,5,0
        )
        window.camera=this.camera
        this.scene.add(this.camera)
        window.scene=this.scene

    }
    initLight(){
        console.log(this)
        const amLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(amLight);
        const dirlight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirlight.position.set(5, 15, 5);
        dirlight.castShadow = true;
        dirlight.shadow.camera.top = 20;
        dirlight.shadow.camera.right = 20;
        dirlight.shadow.camera.bottom = -20;
        dirlight.shadow.camera.left = -20;
        dirlight.shadow.camera.near = 1;
        dirlight.shadow.camera.far = 100;
        this.scene.add(dirlight);
    }
    animate() {
        this.controls.update()
        // renderer.setRenderTarget(this.litRenderTarget)
        renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.animate)
    }
    lookAt() {
        const obj=this.object
        const camera= this.camera
        const controls= this.controls
        const frameArea = (sizeToFitOnScreen, boxSize, boxCenter, camera) => {
          const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
          const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
          const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
          const direction = new THREE.Vector3()
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(1, 0, 1))
            .normalize();
          // move the camera
          camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
          // pick some near and far values for the frustum that will contain the box.
          camera.near = boxSize / 100;
          camera.far = boxSize * 100;
          camera.updateProjectionMatrix();
          // point the camera to look at the center of the box
          camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
        }
      
        // compute the box that contains all the stuff from root and below
        const box = new THREE.Box3().setFromObject(obj);
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());
        // set the camera to frame the box
        frameArea(boxSize * 0.7, boxSize, boxCenter, camera);
        // update the Trackball controls to handle the new size
        controls.maxDistance = boxSize * 100;
        controls.target.copy(boxCenter);
        controls.update();
    }
    test(){
        const width =this.renderer.domElement.clientWidth.clientWidth
        const height=this.renderer.domElement.clientWidth.clientHeight
        const target=new THREE.WebGLRenderTarget( width, height )
        this.renderer.setRenderTarget( target )
        this.renderer.render(this.scene, this.camera)
        
        const self=this
        var pixels = new Uint8Array(
                width * height * 4
        )// 根据像素数据获取透明通道的值
        self.renderer.readRenderTargetPixels(target,0, 0, width, height, pixels);
        var transparentValues = [];
        for (var i = 0; i < pixels.length; i += 4) {
            var alpha = pixels[i + 3] / 255; // 将像素的Alpha通道值转换为[0, 1]范围
            transparentValues.push(alpha);
        }
        // 打印透明通道的值
        console.log("transparentValues",transparentValues);
        
    }
    capture() {
        function resizeRendererToDisplaySize(renderer) {
            const canvas = renderer.domElement;
            const pixelRatio = window.devicePixelRatio;
            const width = (canvas.clientWidth * pixelRatio) | 0;
            const height = (canvas.clientHeight * pixelRatio) | 0;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
              renderer.setSize(width, height, false);
            }
            return needResize;
        }
        if (resizeRendererToDisplaySize(this.renderer)) {
          const canvas = this.renderer.domElement;
          this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
          this.camera.updateProjectionMatrix();
        }
        this.renderer.render(this.scene, this.camera);

        const imageURL = this.renderer.domElement.toDataURL("image/png");
        var anchor = document.createElement("a");
        anchor.href = imageURL;
        anchor.download = "preview.png";
        anchor.click();

        
      }
      capture2() {
        this.renderer.render(this.scene, this.camera);

        // 获取Canvas的2D上下文
        const canvas =  document.createElement('canvas');
        var context = canvas.getContext('2d');

        // 将渲染结果绘制到Canvas上
        context.drawImage(this.renderer.domElement, 0, 0);

        // 导出图像为DataURL
        var dataURL = canvas.toDataURL('image/png');
        // 创建一个图像元素
        var image = new Image();

        // 设置图像的源为DataURL
        image.src = dataURL;

        // 添加图像到文档中
        document.body.appendChild(image);
        
      }
}
window.main=new Main(document.body)