import {Engine3D}from"../main.js"
const WebGLRenderer=Engine3D.THREE_EX.WebGLRenderer
const Scene=Engine3D.THREE_EX.Scene
import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  sRGBEncoding,
  Vector3,
} from "three";
import { GUI } from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class Viewer {
  constructor(el, options) {
    this.el = el;
    this.options = options;

    this.lights = [];
    this.content = null;

    this.gui = null;

    this.prevTime = 0;

    this.stats = new Stats();
    this.stats.dom.height = "48px";
    [].forEach.call(
      this.stats.dom.children,
      (child) => (child.style.display = "")
    );

    this.scene = new Scene();

    const fov = 60;
    this.defaultCamera = new PerspectiveCamera(
      fov,
      el.clientWidth / el.clientHeight,
      1,
      5000
    );
    this.activeCamera = this.defaultCamera;
    this.activeCamera.layers.enableAll();
    // this.defaultCamera.up.set(0, 0, 1);

    this.sceneEx = new Scene();
    window.scene = this.sceneEx;
    this.sceneEx.add(this.defaultCamera);

    this.renderer = window.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setClearColor(0x66ccff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    this.renderer.autoClear = false;
    this.renderer.toneMappingExposure = 1.25; //色调映射曝光度
    this.renderer.shadowMap.enabled = true;

    window.orbitControl = this.orbitControl = new OrbitControls(
      this.defaultCamera,
      this.renderer.domElement
    );
    this.orbitControl.autoRotate = false;
    this.orbitControl.autoRotateSpeed = -10;
    this.orbitControl.screenSpacePanning = true;

    this.el.appendChild(this.renderer.domElement);

    this.addGUI();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener("resize", this.resize.bind(this), false);

    this.setupScene();

    /**************************************************************/
    var _self = this;
    this.onKeyDown = function (event) {};

    this.onKeyUp = function (event) {};

    this.onMouseMove = function (event) {};

    window.addEventListener("keydown", this.onKeyDown, false);
    window.addEventListener("keyup", this.onKeyUp, false);
    window.addEventListener("click", this.onMouseMove, true);
  }

  animate() {
    requestAnimationFrame(this.animate);

    this.stats.update();

    this.render();
  }

  render() {
    // this.slmLoader.render(this.activeCamera, this.sceneRootNodeEx ? this.sceneRootNodeEx.matrixWorld: null);

    this.renderer.clear();

    // this.renderer.render(this.scene, this.activeCamera);

    this.renderer.render(this.sceneEx, this.activeCamera);
  }

  resize() {
    const { clientHeight, clientWidth } = this.el.parentElement;

    this.defaultCamera.aspect = clientWidth / clientHeight;
    this.defaultCamera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  }

  setupScene() {
    this.setCamera();

    this.addLights();

    window.content = this.content;
  }

  setCamera() {
    var self = this;
    // setInterval(function () {
    //   var s = "new Vector3(";
    //   s += self.defaultCamera.position.x.toFixed(1).toString();
    //   s += ",";
    //   s += self.defaultCamera.position.y.toFixed(1).toString();
    //   s += ",";
    //   s += self.defaultCamera.position.z.toFixed(1).toString();
    //   s += "),";
    //   console.log(s);
    // }, 2000);

    this.defaultCamera.position.set(0, 1500, 0);
    this.defaultCamera.lookAt(0, 0, 0);

    this.activeCamera = this.defaultCamera;
    window.camera = this.activeCamera;
  }

  addLights() {
    const directionalLight = new DirectionalLight(0xffffff, 3.5);
    directionalLight.position.set(0.5, 1.2, 0.5);
    this.sceneEx.add(directionalLight);
    var amb = new AmbientLight(0xffffff, 1.5);
    this.sceneEx.add(amb);
  }

  addGUI() {
    const gui = (this.gui = new GUI({
      autoPlace: false,
      width: 260,
      hideable: true,
    }));

    const perfFolder = gui.addFolder("Performance");
    const perfLi = document.createElement("li");
    this.stats.dom.style.position = "static";
    perfLi.appendChild(this.stats.dom);
    perfLi.classList.add("gui-stats");
    perfFolder.__ul.appendChild(perfLi);

    const guiWrap = document.createElement("div");
    this.el.appendChild(guiWrap);
    guiWrap.classList.add("gui-wrap");
    guiWrap.appendChild(gui.domElement);
    gui.open();
  }
}
