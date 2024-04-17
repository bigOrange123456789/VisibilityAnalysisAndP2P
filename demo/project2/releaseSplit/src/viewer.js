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
import { MyUI } from "../lib/MyUI.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { WanderControl } from "../lib/WanderControl";

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

  addMyUI() {
    var ui = new MyUI();
    var self = this;
    var width = window.innerWidth;
    var height = window.innerHeight;

    var camera_pos = [
      new Vector3(0, -1800, 550),
      new Vector3(-303.8, -1529.9, 332.2),
      new Vector3(272.8, -1362.1, 290.2),
      new Vector3(-267.3, -743.3, -44.6),
      new Vector3(268.9, -1404.7, -255.3),
      new Vector3(26.9, -1540.6, -150.2),
    ];
    var camera_tar = [
      new Vector3(0, -1050, -100),
      new Vector3(-303.2, -1360.1, 196.8),
      new Vector3(273.1, -1322.6, 203.9),
      new Vector3(-265.3, -728.9, -94.8),
      new Vector3(268.5, -1373.5, -276.6),
      new Vector3(27.6, -1375.8, -260.1),
    ];
    var inf = {
      "6th": 5,
      "5th": 4,
      "4th": 3,
      "3rd": 2,
      "2nd": 1,
      "1st": 0,
    };

    var names = Object.keys(inf);
    for (let i = 0; i < names.length; i++) {
      new ui.Button(
        names[i],
        "#888888",
        "#666666",
        "#DDDDDD",
        height / 36,
        width / 150,
        width / 12,
        height / 20,
        height / 90,
        height - (height / 15) * (i + 1.5),
        () => {
          var id = inf[names[i]];
          self.defaultCamera.position.copy(camera_pos[id]);
          self.defaultCamera.lookAt(camera_tar[id]);
          self.orbitControl.target = camera_tar[id].clone();
        }
      );
    }

    var route = [
      new Vector3(0, -1800, 550),
      new Vector3(29.8, -1490.9, -87.4),
      new Vector3(-263.9, -1490.0, -192.1),
      new Vector3(-262.3, -1494.6, 275.4),
      new Vector3(-259.2, -1387.8, 268.4),
      new Vector3(-259.2, -1319.1, 16.8),
      new Vector3(-259.7, -1329.6, -26.1),
      new Vector3(-246.0, -1311.0, -252.3),
      new Vector3(-244.6, -828.1, -274.5),
      new Vector3(181.7, -764.0, -168.7),
      new Vector3(314.1, -1241.7, -193.1),
      new Vector3(-1.2, -1419.8, -168.2),
      new Vector3(0, -1800, 550),
      new Vector3(0, -1050, -100),
    ];
    this.wanderControl = new WanderControl(this.defaultCamera, route, 300);

    // new ui.Button("自动漫游", "#F4A460", '#666666', '#FFD700',
    //     height/36, width/150,
    //     width/12, height/20,
    //     height/90, 13.5*height/15, (b)=>{
    //       if(!this.wanderControl.wander){
    //         console.log("start wander")
    //         this.wanderControl.init()
    //         this.wanderControl.startWander()
    //       } else {
    //         console.log("stop wander")
    //         this.wanderControl.wander = false
    //       }
    //     });

    window.ondblclick = function () {
      if (!self.wanderControl.wander) {
        // console.log("start wander")
        // self.wanderControl.init()
        // self.wanderControl.startWander()
      } else {
        self.wanderControl.wander = false;
      }
    };
  }
}
