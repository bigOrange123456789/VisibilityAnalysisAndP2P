import * as THREE from "three"
import {
	Box3,
	EquirectangularReflectionMapping,
	FloatType,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import "./style.css"


import * as POSTPROCESSING from "./src2/postprocessing"
import { VelocityDepthNormalPass } from "./src2/temporal-reproject/pass/VelocityDepthNormalPass"
import { HBAOEffect } from "./src2/hbao/HBAOEffect"

const scene = new THREE.Scene()
scene.matrixWorldAutoUpdate = false
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 250)
scene.add(camera)
const canvas = document.querySelector(".webgl")
let rendererCanvas = canvas
// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas: rendererCanvas,
	antialias: true,//抗锯齿
    alpha:true,
})
renderer.autoClear = false
renderer.setSize(window.innerWidth, window.innerHeight)


// since using "rendererCanvas" doesn't work when using an offscreen canvas
const controls = new OrbitControls(camera, document.querySelector("#orbitControlsDomElem"))
controls.enableDamping = true

camera.position.fromArray([0, 7, 25])
controls.target.set(0, 7, 0)
controls.maxPolarAngle = Math.PI / 2
controls.minDistance = 5

let composer

new RGBELoader().setDataType(FloatType).load("hdr/chinese_garden_1k.hdr", envMap => {

	envMap.mapping = EquirectangularReflectionMapping

	scene.environment = envMap

})

const gltflLoader = new GLTFLoader()
const draco = new DRACOLoader()
draco.setDecoderConfig({ type: "js" })
draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/")
gltflLoader.setPath("gltf/")
gltflLoader.setDRACOLoader(draco)
gltflLoader.load( "sponza_no_textures.optimized.glb", asset => {
	scene.add(asset.scene)
	new Box3().setFromObject(asset.scene)

	initScene()
})

const loadingEl = document.querySelector("#loading")
loadingEl.remove()

const initScene = async () => {
	const hbaoOptions = {
		resolutionScale: 1,
		spp: 16,
		distance: 2.1399999999999997,
		distancePower: 1,
		power: 2,
		bias: 39,
		thickness: 0.1,
		color: 0,
		useNormalPass: false,
		velocityDepthNormalPass: null,
		normalTexture: null,
		iterations: 1,
		samples: 5
	}
	composer = new POSTPROCESSING.EffectComposer(renderer)
	const renderPass = new POSTPROCESSING.RenderPass(scene, camera)
	composer.addPass(renderPass)

	const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
	composer.addPass(velocityDepthNormalPass)

	const hbaoEffect = new HBAOEffect(composer, camera, scene, hbaoOptions)
	const hbaoPass = new POSTPROCESSING.EffectPass(camera, hbaoEffect)
	composer.addPass(hbaoPass)

	loop()
}



const loop = () => {

	controls.update()

	composer.render()

	window.requestAnimationFrame(loop)
}
