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
    PlaneGeometry, VertexAttribute, GeometryBase, Color, InstancedMesh, Matrix4, Vector3, matrixRotate, OrbitController
} from '@orillusion/core';
import { Stats } from '@orillusion/stats';
import dat from 'dat.gui';
import {SceneManager} from "./SceneManager_gpu";

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
        mainCamera.perspective(60, Engine3D.aspect, 1.0, 8000.0);
        // add camera node
        // cameraObj.localPosition = new Vector3(3032.4,400.9,-3486.2);
        mainCamera.lookAt(new Vector3(3032.4,400.9,-3486.2), new Vector3(2025.7,0,-2167.1))
        // set camera controller
        let controller = cameraObj.addComponent(OrbitController);
        // controller.target = new Vector3(2025.7,0,-2167.1);
        controller.target = new Vector3(0,0,0);
        // controller.setCamera(15, -30, 300);
        scene.addChild(cameraObj);

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
        new SceneManager(this.view.scene, this.view.camera);
    }
}

new Sample_AddRemove().run();
