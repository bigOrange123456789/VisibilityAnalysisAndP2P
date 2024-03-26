// import { Parameter } from './parametric/Parameter.js'
import { Classification } from './parametric/Classification.js'
// import * as THREE from "./electron/three.module.js"
const THREE = require("three");
import * as THREE_EX from "./electron/three.module.ex.js"
import Stats from './electron/stats.module.js'
// import Stats from 'three/examples/jsm/libs/stats.module.js'
// import Stats from '../../../lib/three_electron/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from './electron/GLTFLoader.js'//
import { GLTFLoaderEx } from './electron/GLTFLoaderEx.js'//
import { GLTFExporter } from './electron/GLTFExporter.js'//'three/examples/jsm/exporters/GLTFExporter';

// import * as THREE from "three"
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'//
// const GLTFLoader= require("three/examples/jsm/loaders/GLTFLoader");


// import { OrbitControls } from './electron/OrbitControls.js'
import { OrbitControls } from './electron/OrbitControls.ex.js'
export class Engine3D{
    static versionId="2023.12.15;16:45"
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