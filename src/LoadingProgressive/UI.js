import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'//dat.gui.module.js';
import * as THREE from "three";
import { SSRPass  } from 'three/examples/jsm/postprocessing/SSRPass.js';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
export class UI{
    constructor(main) {
        this.gui = new GUI();
        window.gui=this.gui
        window.panelDiv=this.gui.domElement
        this.params = {
            exposure: 1,
            bloomStrength: 1.5,
            bloomThreshold: 0,
            bloomRadius: 0
        };
        this.init(main)
    }
    init(main){
        this.gui.domElement.addEventListener('mouseover', function(event) {
                window.inPanel=true
        }, false);
        this.gui.domElement.addEventListener('mouseout', function(event) {
                window.inPanel=false
        }, false);
        
        this.control_camera(main.camera,main.playerControl)
        this.control_envMap(main.scene)
        // this.control_renderer(main.renderer)
        this.control_directionalLight(main.lightProducer.directionalLight)
        this.control_bloomPass(main.postprocessing.unrealBloom.bloomPass)
        this.control_godrays(main.postprocessing.godrays,main.postprocessing)
        this.control_ssr(main.postprocessing.unrealBloom.ssrPass)
        // this.control_bokeh(main.postprocessing.unrealBloom.bokehPass)
        // this.control_lut(main.postprocessing.unrealBloom.lutPass)
        //this.control_sao(main.postprocessing.unrealBloom.saoPass)
        this.control_ssao(main.postprocessing.unrealBloom.ssaoPass)
    }
    control_camera(camera,playerControl) {
        var viewpointState = {
            viewpoint:"默认视点",
            mode:'viewpoint'
        }
        
        var list_viewpoint = ["默认视点","视点1","视点2","视点3","视点4","视点5","视点6","视点7"]
        var camera_pos = [
            new THREE.Vector3(-43.486343682038736,  2.127206120237504,  -8.698678933445201),
            new THREE.Vector3(48.55640273290092,  1.9142025592268763,  -7.314690567468844),
            new THREE.Vector3(47.298827892375,  1.7232932395224025,  -7.348360792773678),
            new THREE.Vector3( -58.92759054201366, 39.57529059951184,  -130.21318894586796),
            new THREE.Vector3(-1.0911605157232827,  0.7075214699744158,  -99.90313103529786),
            new THREE.Vector3( -64.39189399430883,  8.99856114154391,  -74.3016535116766),
            new THREE.Vector3( -1.5994877198648538,  1.4997407676957795,  -77.1512219063800),
            new THREE.Vector3( -54.63874349381954,  18.532468360185952,  46.071540822),
        ]
        var camera_tar = [
            new THREE.Vector3(0,0,0),
            new THREE.Vector3( 51.03516532171532,  2.290497364346837,  -7.248324342451475),
            new THREE.Vector3( 51.03516532171532,  2.290497364346837,  -7.248324342451475),
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(-0.9868855788301696,  0.7075214699744165,  -99.03513139079297),
            new THREE.Vector3( -65.34712509322323,  9.472649100434154,  -69.41033714095124),
            new THREE.Vector3(-1.9992580266994615,  1.6314769709077197,  -59.25814512545),
            new THREE.Vector3( -66.03747192556759,  9.679838586814231,  41.845030134054),
        ]
        const gui=this.gui
        const folder = gui.addFolder("camera")
        folder.add(viewpointState,'viewpoint').options(list_viewpoint).onChange(()=>{
            let id = 0;
            for (let i=0;i<7;i++) {
                if (viewpointState.viewpoint == list_viewpoint[i]) id = i;
            }
            camera.position.copy(camera_pos[id])
            camera.lookAt(camera_tar[id])
        })

        var opt2=["viewpoint","model"]
        folder.add(viewpointState,'mode').options(opt2).onChange(()=>{
            let id = 0;
            for (let i=0;i<7;i++) {
                if (viewpointState.mode == opt2[i]) id = i;
            }
            playerControl.mode.set(viewpointState.mode)
        })
    }
    control_envMap(scene){
        const gui=this.gui
        const params=this.params
        params.metalness=0.95//0.5
        params.roughness=0.5
        params.envMapIntensity=1//0.5
        // params.emissiveIntensity=0.5
        const folder = gui.addFolder("材质")
        folder.add( params, 'metalness', 0.0, 3. ).step( 0.005 ).onChange( function ( value ) {
            scene.traverse(node=>{
                if(node instanceof THREE.Mesh&&(node.id!==171||node.id!==174)){
                    const material=node.material
                    material.metalness=material.metalness0+value
                }
            })
        } );
        folder.add( params, 'roughness', -2.0, 3. ).step( 0.005 ).onChange( function ( value ) {
            scene.traverse(node=>{
                if(node instanceof THREE.Mesh&&(node.id!==171||node.id!==174)){
                    const material=node.material
                    material.roughness=material.roughness0+value
                }
            })
        } );
        folder.add( params, 'envMapIntensity', -1.0, 4. ).step( 0.005 ).onChange( function ( value ) {
            scene.traverse(node=>{
                if(node instanceof THREE.Mesh&&(node.id!==171||node.id!==174)){
                    const material=node.material
                    material.envMapIntensity=material.envMapIntensity0+value
                }
            })
        } );
    }
    control_directionalLight(directionalLight){
        const gui=this.gui
        const params=this.params
        var directionFolder = gui.addFolder('平行光');
        /*color*/
        params['平行光颜色']=directionalLight.color
        directionFolder
        .addColor(params, '平行光颜色')
        .onChange(function(e)
        {
            directionalLight.color = new THREE.Color(e);
        });
        /*power*/
        params['平行光强度']=directionalLight.intensity
        directionFolder
        .add(params, '平行光强度', 0.0, 10.0)
        .step(0.1)
        .onChange(function(e) {
            directionalLight.intensity = e
        });
        /*direction*/
        params['平行光方向X']=directionalLight.target.position.x -directionalLight.position.x
        directionFolder
        .add(params, '平行光方向X', -1.0, 1.0)
        .step(0.01)
        .onChange(function(e) {
            directionalLight.target.position.x =
            directionalLight.position.x + e;
        });
        params['平行光方向Y']=directionalLight.target.position.y -directionalLight.position.y
        directionFolder
        .add(params, '平行光方向Y', -1.0, -0.6)
        .step(0.01)
        .onChange(function(e) {
            directionalLight.target.position.y = 
            directionalLight.position.y + e;
        });
        params['平行光方向Z']=directionalLight.target.position.z -directionalLight.position.z
        directionFolder
        .add(params, '平行光方向Z', -1.0, 1.0)
        .step(0.01)
        .onChange(function(e) {
            directionalLight.target.position.z = 
            directionalLight.position.z + e;
        });
        /*shadow*/
        params['平行光阴影']=directionalLight.castShadow 
        directionFolder
        .add(params, '平行光阴影')
        .onChange(function(e) {
            directionalLight.castShadow = e
        });
        /*visible*/
        params['平行光启用']=directionalLight.visible
        directionFolder
        .add(params, '平行光启用')
        .onChange(function(e) {
            directionalLight.visible = e
        });
    }
    control_renderer(renderer){
        const gui=this.gui
        const params=this.params
        params.exposure=Math.pow(renderer.toneMappingExposure, 1/4 );
        const folder = gui.addFolder("tone mapping")
        folder.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
            renderer.toneMappingExposure = Math.pow( value, 4.0 );
        } );
    }
    control_bloomPass(bloomPass){
        const gui=this.gui
        const params=this.params
        params.bloomThreshold=bloomPass.threshold;
        params.bloomStrength=bloomPass.strength;
        params.bloomRadius=bloomPass.radius;
        const folder = gui.addFolder("辉光")
        folder.add( params, 'bloomStrength', 0.0, 1.5 ).step( 0.05 ).onChange( function ( value ) {
            bloomPass.strength = Number( value );
        } );
        folder.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
            bloomPass.threshold = Number( value );
        } );
        folder.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
            bloomPass.radius = Number( value );
        } );
    }
    control_godrays(godrays,postprocessing){
        const gui=this.gui
        const params=this.params
        params.filterLen=godrays.filterLen;
        params.TAPS_PER_PASS=godrays.TAPS_PER_PASS;
        params.godrays_stength=postprocessing.godrays_stength.value
        const folder = gui.addFolder("隙间光")
        folder.add( params, 'godrays_stength', 0.0, 1.5 ).step( 0.05 ).onChange( function ( value ) {
            postprocessing.godrays_stength.value=value
        } );
        folder.add( params, 'filterLen', 0.5, 2.0 ).step( 0.01 ).onChange( function ( value ) {
            godrays.filterLen = Number( value );
        } );
        folder.add( params, 'TAPS_PER_PASS', 1.0, 10.0 ).step( 0.1 ).onChange( function ( value ) {
            godrays.TAPS_PER_PASS = Number( value );
        } );
    }
    control_ssr(ssrPass){
        const gui=this.gui
        const params=this.params
        params.ssr_thickness=ssrPass.thickness;
        params.ssr_maxDistance=ssrPass.maxDistance
        params.ssr_opacity=ssrPass.opacity
        const folder = gui.addFolder("屏幕空间反射")
        folder.add( params, 'ssr_maxDistance', 0.0, 200.).step( 0.5 ).onChange( function ( value ) {
            ssrPass.maxDistance = Number( value );
        } );
        //opacity
        folder.add( params, 'ssr_opacity', 0.0, 2.).step( 0.05 ).onChange( function ( value ) {
            ssrPass.opacity =  value 
        } );
        folder.add( ssrPass, 'infiniteThick' );
        folder.add( ssrPass, 'fresnel' )
        folder.add( ssrPass, 'distanceAttenuation' )
        folder.add( ssrPass, 'bouncing' )
        folder.add( ssrPass, 'output', {
            'Default': SSRPass.OUTPUT.Default,
            'SSR Only': SSRPass.OUTPUT.SSR,
            'Beauty': SSRPass.OUTPUT.Beauty,
            'Depth': SSRPass.OUTPUT.Depth,
            'Normal': SSRPass.OUTPUT.Normal,
            'Metalness': SSRPass.OUTPUT.Metalness,
        } ).onChange( function ( value ) {
            ssrPass.output = parseInt( value );
        } );
        folder.add( ssrPass, 'blur' );

        //maxDistance
        // folder.add( ssrPass, 'thickness' ).min( 0 ).max( .1 ).step( .0001 );
    }
    control_sao(saoPass){
        const gui=this.gui
        const folder = gui.addFolder("可缩放环境光遮挡")
        const params=this.params
        folder.add( saoPass.params, 'output', {
            'Beauty': SAOPass.OUTPUT.Beauty,
            'Beauty+SAO': SAOPass.OUTPUT.Default,
            'SAO': SAOPass.OUTPUT.SAO,
            'Depth': SAOPass.OUTPUT.Depth,
            'Normal': SAOPass.OUTPUT.Normal
        } ).onChange( function ( value ) {
            saoPass.params.output = parseInt( value );
        } );
        folder.add( saoPass.params, 'saoBias', - 1, 1 );
        folder.add( saoPass.params, 'saoIntensity', 0, 1 );
        folder.add( saoPass.params, 'saoScale', 0, 10 );
        folder.add( saoPass.params, 'saoKernelRadius', 1, 100 );
        folder.add( saoPass.params, 'saoMinResolution', 0, 1 );
        folder.add( saoPass.params, 'saoBlur' );
        folder.add( saoPass.params, 'saoBlurRadius', 0, 200 );
        folder.add( saoPass.params, 'saoBlurStdDev', 0.5, 150 );
        folder.add( saoPass.params, 'saoBlurDepthCutoff', 0.0, 0.1 );
    }
    control_bokeh(bokehPass){

        const gui=this.gui
        const folder = gui.addFolder("散焦景深")
        const params=this.params
        params.bokehPass_aperture=bokehPass.uniforms.aperture.value
        folder.add( params, 'bokehPass_aperture', 0.0, 1. ).step( 0.001 ).onChange( function ( value ) {
            bokehPass.uniforms.aperture.value=value
        } );

        params.bokehPass_maxblur=bokehPass.uniforms.maxblur.value
        folder.add( params, 'bokehPass_maxblur', 0, 0.1 ).step( 0.0001 ).onChange( function ( value ) {
            bokehPass.uniforms.maxblur.value=value
        } );

        // params.bokehPass_focus=bokehPass.uniforms.focus.value
        // folder.add( params, 'bokehPass_focus', 0, 5 ).step( 0.01 ).onChange( function ( value ) {
        //     bokehPass.uniforms.focus.value=value
        // } );


        // params.bokehPass_farClip=bokehPass.uniforms.farClip.value
        // folder.add( params, 'bokehPass_farClip', 50000, 5000000 ).step( 1000 ).onChange( function ( value ) {
        //     bokehPass.uniforms.farClip.value=value
        // } );

        // params.bokehPass_nearClip=bokehPass.uniforms.nearClip.value
        // folder.add( params, 'bokehPass_nearClip', 0, 50 ).step( 0.1 ).onChange( function ( value ) {
        //     bokehPass.uniforms.nearClip.value=value
        // } );
    }
    control_lut(lutPass){
        const gui=this.gui
        const folder = gui.addFolder("LookupTable")
        const params=this.params
        params.lutPass_intensity=lutPass.uniforms.intensity.value
        folder.add( params, 'lutPass_intensity', 0.0, 0.8 ).step( 0.005 ).onChange( function ( value ) {
            lutPass.uniforms.intensity.value=value
        } );
    }
    control_ssao(ssaoPass){
        const gui=this.gui
        const folder = gui.addFolder("屏幕空间环境光遮蔽")


        folder.add( ssaoPass, 'output', {
            'Default': SSAOPass.OUTPUT.Default,
            'SSAO Only': SSAOPass.OUTPUT.SSAO,
            'SSAO Only + Blur': SSAOPass.OUTPUT.Blur,
            'Beauty': SSAOPass.OUTPUT.Beauty,
            'Depth': SSAOPass.OUTPUT.Depth,
            'Normal': SSAOPass.OUTPUT.Normal
        } ).onChange( function ( value ) {

            ssaoPass.output = parseInt( value );

        } );
        folder.add( ssaoPass, 'kernelRadius' ).min( 0 ).max( 32 );
        folder.add( ssaoPass, 'minDistance' ).min( 0.001 ).max( 0.02 );
        folder.add( ssaoPass, 'maxDistance' ).min( 0.01 ).max( 0.3 );
        
    }


}