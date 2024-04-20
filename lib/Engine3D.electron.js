// import { Parameter } from './parametric/Parameter.js'
import { Classification } from './parametric/Classification.js'
const THREE = require("three");
// import * as THREE_EX from "./electron/threejs/three.module.ex.js"
// import { GLTFLoaderEx } from './electron/threejs/GLTFLoaderEx.js'//
import * as THREE_EX from"../three.js-r129/build/three.module.js";// "./electron/threejs/three.module.ex.js"//
import { GLTFLoaderEx } from '../three.js-r129/examples/jsm/loaders/GLTFLoaderEx.js';

import Stats from '../three.js-r129/examples/jsm/libs/stats.module.js'//'./electron/threejs/stats.module.js'//
import { GLTFLoader } from '../three.js-r129/examples/jsm/loaders/GLTFLoader.electron.js';//'./electron/threejs/GLTFLoader.js'//'../three.js-r129/examples/jsm/loaders/GLTFLoader.js';//

import { GLTFExporter } from '../three.js-r129/examples/jsm/exporters/GLTFExporter.js';//'./electron/threejs/GLTFExporter.js'//'three/examples/jsm/exporters/GLTFExporter';//
import { OrbitControls } from '../three.js-r129/examples/jsm/controls/OrbitControls.js'//'./electron/threejs/OrbitControls.ex.js'//
export class Engine3D{
    static versionId="2024.04.18;01:27"
    //start.js
    // static Parameter=Parameter
    static Classification=Classification

    static THREE=THREE
    static THREE_EX=THREE_EX
    static Stats=Stats
    static GLTFLoader=GLTFLoader
    static GLTFLoaderEx=GLTFLoaderEx
    static GLTFExporter=GLTFExporter

    static OrbitControls=OrbitControls
    // static OrbitControls_EX=OrbitControls_EX
}