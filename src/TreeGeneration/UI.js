import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'//dat.gui.module.js';
import * as THREE from "three";

export class UI{
    constructor(main) {
        this.gui = new GUI();
        this.gui._closed=true
        window.gui=this.gui
        window.panelDiv=this.gui.domElement
        this.params = {}
        this.init(main)
    }
    init(main){
        this.control_treeSeed(main.customizeTree)
        this.control_treeEdit(main.customizeTree)
        
    }
    control_treeSeed(customizeTree){
        const result={}
        for(let i of customizeTree.content){
            result[i.name]=i
        }
        const params={"species":customizeTree.param.name}
        const folder = this.gui.addFolder("treeSeed")
        folder.add( params, 'species', result ).onChange( value => {
            customizeTree.buildtree(value.name);
        } );
    }
    control_treeEdit(customizeTree){
        const params=customizeTree.param
        
        const folder = this.gui.addFolder("Edit")
        folder.add( params, 'seed')
        folder.add( params, 'showLeaves').onChange( () => {
            customizeTree.updateLeaves()
        } )
        folder.add( params, 'depth', {2:1,3:2} )
        folder.add( params, 'disturb', 0.00001, 0.1 ).step( 0.00001 )
        folder.add( params, 'gravity', 0, 100 ).step( 0.01 )
        
        folder.add( params, 'tubular_segments', 1, 20 ).step( 1 )
        folder.add( params, 'radial_segments' , 2, 15 ).step( 1 )
        folder.add( params, 'sample_offset', 0, 0.03 ).step( 0.00001 )

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
    control_material(scene){
        const gui=this.gui
        const params=this.params
        params.metalness=0.95//0.5
        params.roughness=0.5
        params.envMapIntensity=1//0.5
        params.backgroundIntensity=scene.backgroundIntensity
        // params.emissiveIntensity=0.5
        const folder = gui.addFolder("材质")
        folder.add( params, 'metalness', 0.0, 3. ).step( 0.001 ).onChange( function ( value ) {
            scene.traverse(node=>{
                if(node instanceof THREE.Mesh&& !node.underground){
                    const material=node.material
                    material.metalness=material.metalness0+value
                }
            })
        } );
        folder.add( params, 'roughness', -2.0, 3. ).step( 0.001 ).onChange( function ( value ) {
            scene.traverse(node=>{
                if(node instanceof THREE.Mesh&& !node.underground){
                    const material=node.material
                    material.roughness=material.roughness0+value
                }
            })
        } );
        folder.add( params, 'envMapIntensity', -1.0, 4. ).step( 0.001 ).onChange( function ( value ) {
            scene.traverse(node=>{
                if(node instanceof THREE.Mesh&& !node.underground){
                    const material=node.material
                    material.envMapIntensity=material.envMapIntensity0+value
                }
            })
        } );
        folder.add( params, 'backgroundIntensity', -0.5, 2. ).step( 0.001 ).onChange( function ( value ) {
            scene.backgroundIntensity=value
        } );
        
    }
    control_light(directionalLight,ambient){
        const gui=this.gui
        const params=this.params
        var directionFolder = gui.addFolder('光照');
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

        // params['shadow_radius']=directionalLight.shadow.radius
        // directionFolder.add( params, 'shadow_radius', 0, 20 ).step( 0.05 ).onChange( function ( value ) {
        //     directionalLight.shadow.radius = value
        // } );
        /*visible*/
        params['平行光启用']=directionalLight.visible
        directionFolder
        .add(params, '平行光启用')
        .onChange(function(e) {
            directionalLight.visible = e
        });


        /*power*/
        params['环境光强度']=ambient.intensity
        directionFolder
        .add(params, '环境光强度', -0.5, 3.0)
        .step(0.1)
        .onChange(function(e) {
            ambient.intensity = e
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
}