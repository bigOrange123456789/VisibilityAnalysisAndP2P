import {
    Engine3D,
    Scene3D,
    CameraUtil,
    View3D,
    AtmosphericComponent,
    ComponentBase,
    Time,
    AxisObject,
    Object3DUtil,
    KelvinUtil,
    DirectLight,
    Object3D,
    HoverCameraController,
    MeshRenderer,
    LitMaterial,
    BoxGeometry,
    UnLit,
    UnLitMaterial,
    Interpolator,
    Camera3D,
    VertexAttributeName,
    PlaneGeometry, VertexAttribute, GeometryBase, Color, InstancedMesh, Matrix4, Vector3, matrixRotate
} from '@orillusion/core';
import { Stats } from '@orillusion/stats';
import dat from 'dat.gui';

class Sample_AddRemove {
    constructor() {
        this.view = View3D;
    }
    async run() {
        // init engine
        await Engine3D.init();
        // create new Scene
        let scene = new Scene3D();
        scene.addComponent(Stats);
        // add atmospheric sky
        let sky = scene.addComponent(AtmosphericComponent);
        sky.sunY = 0.6;

        // create camera
        let cameraObj = new Object3D();
        let mainCamera = cameraObj.addComponent(Camera3D);
        // adjust camera view
        mainCamera.perspective(60, Engine3D.aspect, 0.1, 5000.0);
        // add camera node
        scene.addChild(cameraObj);
        // set camera controller
        let controller = cameraObj.addComponent(HoverCameraController);
        controller.setCamera(15, -30, 300);

        // add a basic direct light
        let lightObj = new Object3D();
        lightObj.rotationX = 45;
        lightObj.rotationY = 60;
        lightObj.rotationZ = 150;
        let dirLight = lightObj.addComponent(DirectLight);
        dirLight.lightColor = KelvinUtil.color_temperature_to_rgb(5355);
        dirLight.intensity = 40;
        scene.addChild(lightObj);
        sky.relativeTransform = dirLight.transform;

        // create a view with target scene and camera
        this.view = new View3D();
        this.view.scene = scene;
        this.view.camera = mainCamera;

        // start render
        Engine3D.startRenderView(this.view);
        await this.initScene();
    }

    async initScene() {
        let list = [];
        let player = await Engine3D.res.loadGltf('https://cdn.orillusion.com/PBR/Duck/Duck.gltf');
        console.log(player);
        let geometry = player.getComponentsInChild(MeshRenderer)[0].geometry;
        let material = player.getComponentsInChild(MeshRenderer)[0].material;
        console.log(geometry);
        console.log(material);
        // this.view.scene.addChild(player);

        let test_player = new Object3D();
        let test_mr = test_player.addComponent(MeshRenderer);
        test_mr.geometry = new GeometryBase();
        test_mr.geometry.setIndices(geometry.getAttribute(VertexAttributeName.indices).data);
        test_mr.geometry.setAttribute(VertexAttributeName.normal, geometry.getAttribute(VertexAttributeName.normal).data);
        test_mr.geometry.setAttribute(VertexAttributeName.position, geometry.getAttribute(VertexAttributeName.position).data);
        test_mr.geometry.setAttribute(VertexAttributeName.uv, geometry.getAttribute(VertexAttributeName.uv).data);
        console.log(test_mr.geometry);
        test_mr.material = new LitMaterial();
        test_mr.material.baseColor = new Color(0.8, 0.8, 0.0, 1);
        console.log(geometry.subGeometries[0].lodLevels[0]);
        test_mr.geometry.addSubGeometry(geometry.subGeometries[0].lodLevels[0]);
        // this.view.scene.addChild(test_player);

        let obj = new InstancedMesh(test_mr.geometry, test_mr.material, 20);
        for (let i = 0; i < 20; i++) {
            let transformMatrix = new Matrix4();
            let rand = Math.random();
            transformMatrix.setScale(new Vector3(0.1, 0.1, 0.1));
            // matrixRotate(rand * Math.PI * 2, new Vector3(0, 1, 0), transformMatrix);
            transformMatrix.translate(new Vector3(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100));
            obj.setMatrixAt(i, transformMatrix);
            console.log(transformMatrix);
        }
        this.view.scene.addChild(obj);

        // let buttons = {
        //     add: async () => {
        //         let clone = test_player.clone();
        //         clone.transform.x = Math.random() * 200 - 100;
        //         clone.transform.y = Math.random() * 200 - 100;
        //         clone.transform.z = Math.random() * 200 - 100;
        //         clone.scaleX = clone.scaleY = clone.scaleZ = 0.25;
        //
        //         this.view.scene.addChild(clone);
        //         list.push(clone);
        //     },
        //     remove: async () => {
        //         let index = Math.floor(list.length * Math.random());
        //         let obj = list[index];
        //         if (obj) {
        //             list.splice(index, 1);
        //             this.view.scene.removeChild(obj);
        //             obj.destroy(true);
        //         }
        //     }
        // };
        // // add first one
        // await buttons.add();
        // // gui
        // const gui = new dat.GUI();
        // let folder = gui.addFolder('Orillusion');
        // folder.add(buttons, 'add');
        // folder.add(buttons, 'remove');
        // folder.open();
    }
}

new Sample_AddRemove().run();
