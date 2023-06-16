import ComboControls from '@cognite/three-combo-controls'
import * as THREE from '../build/three.module'
export class Control extends ComboControls{
    constructor(camera, renderer) {
        super(camera, renderer.domElement)//new ComboControls(camera, renderer.domElement)
        const controls=this
        this.isPC=true//Control.checkAgent_isPC(navigator)
        if(this.isPC){
            controls.keyboardPanSpeed = 1.0
            controls.keyboardDollySpeed = 0.5
            controls.minZoom = -50 // minimum zoom distance, only available when camera is orthographic
            controls.maxZoom = 50
            controls.minPolarAngle = 0 // minium polar angle around the target (radians)
            controls.maxPolarAngle = Math.PI // maximum polar angle around the target (radians)
            controls.minAzimuthAngle = -Infinity // minimum azimuth angle around the target (radians)
            controls.maxAzimuthAngle = Infinity // maximum azimuth angle around the target (radians)
            controls.dynamicTarget = true
            controls.minDistance = 0.1 // minimum distance to the target (see also dynamicTarget)
            controls.maxDistance = 50 // maximum distance to the target
            controls.keyboardSpeedFactor = 0.4
        }else{
            // 如果使用animate方法时，将此函数删除
            //controls.addEventListener( 'change', render );
            // 使动画循环使用时阻尼或自转 意思是否有惯性
            controls.enableDamping = true;
            //动态阻尼系数 就是鼠标拖拽旋转灵敏度
            controls.dampingFactor = 0.25;
            //是否可以缩放
            controls.enableZoom = true;
            //是否自动旋转
            controls.autoRotate = false;
            //设置相机距离原点的最远距离
            controls.minDistance = 0.1;
            //设置相机距离原点的最远距离
            controls.maxDistance = 100;
            //是否开启右键拖拽
            controls.enablePan = true;
        }
    }
    run(){
        const controls=this
        if(this.isPC){
            var clock = new THREE.Clock();
            var deltaTime = clock.getDelta();
            controls.update(deltaTime);
        }else{
            controls.update();
        }
    }
    static checkAgent_isPC(navigator){
        const userAgent = navigator.userAgent.toLowerCase();
        if(userAgent.indexOf('android') == -1 &&
        userAgent.indexOf('iphone') == -1 &&
        userAgent.indexOf('ipad') == -1 &&
        userAgent.indexOf('macintosh') == -1 &&
        userAgent.indexOf('mac os x') == -1){
            return true;
        }else{
            return false;
        }
    }
}