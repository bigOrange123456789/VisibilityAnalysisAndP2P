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
    updateParams(params0,customizeTree){
        const handler = {// 拦截器函数
            set(target, property, value) {
              const flag=params0[property]!==value
              const result=Reflect.set(target, property, value)
              if(flag)customizeTree.updateTree()
              return result
            },
          }
        return new Proxy(params0, handler)
    }
    init(main){
        // this.control_treeSeed(main.customizeTree)
        this.control_treeEdit(main.customizeTree)
        
        const folder = this.gui.addFolder("树枝分叉")

        const folder0=folder.addFolder("一级分叉")
        this.control_branches(main.customizeTree,0,0,folder0)
        this.control_branches(main.customizeTree,0,1,folder0)
        this.control_branches(main.customizeTree,0,2,folder0)
        this.control_branches(main.customizeTree,0,3,folder0)
        this.control_branches(main.customizeTree,0,4,folder0)

        const folder1=folder.addFolder("二级分叉")
        folder1.add(this.updateParams({"使用二级分叉":true},main.customizeTree),"使用二级分叉").onChange(value=>{
            main.customizeTree.param.depth=value?2:1
        })
        this.control_branches(main.customizeTree,1,0,folder1)
        this.control_branches(main.customizeTree,1,1,folder1)
        
        this.control_Leaves(main.customizeTree)
        this.add_button(main.customizeTree)
    }
    add_button(customizeTree){
        this.gui.add({
            buttonClicked: function() {
                customizeTree.saveJson()
            }
        }, 'buttonClicked').name('导出参数')
        this.gui.add({
            buttonClicked: function() {
                customizeTree.saveGLTF()
            }
        }, 'buttonClicked').name('导出模型')
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
        this.gui.add( params, 'seed')
        
        const folder = this.gui.addFolder("枝干参数")
        
        folder.add( 
            this.updateParams({radius:customizeTree.param.branches[0].radius},customizeTree), 
            "radius", 
            0.00001, 
            0.8 
        ).step( 0.00001 ).onChange(value=>{
            customizeTree.param.branches[0].radius=value
        })
        // folder.add( params, 'depth', {2:1,3:2} )
        folder.add( params, 'disturb', 0.00001, 0.1 ).step( 0.00001 )
        folder.add( params, 'gravity', 0.00001, 100 ).step( 0.01 )
        
        // folder.add( params, 'tubular_segments', 1, 20 ).step( 1 )
        // folder.add( params, 'radial_segments' , 2, 15 ).step( 1 )
        folder.add( params, 'sample_offset', 0.00001, 0.03 ).step( 0.00001 )

    }
    control_branches_old(customizeTree){
        // fork_position, noisel，  fork_angle，noise2，  next_level length, noise3，   number
        // 分叉位置，      位置范围 ，分叉角度，  角度范围， 下一级枝干长度，     长度的范围，下一级分叉个数
        const branch=customizeTree.param.branches[0]
        const fork00=branch.fork[0]
        let params0={
            "pos1_means"   : fork00[0], //0.4
            "pos1_range"   : fork00[1]/fork00[0], //0.05
            "angle1_means" : fork00[2], //1.25
            "angle1_range" : fork00[3]/fork00[2], //0.08
            "length1_means": fork00[4], //4
            "length1_range": fork00[5]/fork00[4], //0.5
            "conunt1"      :fork00[6], //5
        }
        const handler = {// 拦截器函数
            set(target, property, value) {
              const flag=params0[property]!==value
              const result=Reflect.set(target, property, value)
              if(flag)customizeTree.updateTree()
              return result
            },
          }
        const params=new Proxy(params0, handler);
        // console.log(params)
        const folder = this.gui.addFolder("一级分叉A段")
        
        folder.add( params, "pos1_means"   , 0.00001, 0.8 ).step( 0.00001 ).onChange(value=>{fork00[0]=value})
        folder.add( params, "pos1_range"   , 0.00001, 0.5 ).step( 0.00001 ).onChange(value=>{fork00[1]=value*fork00[0]})
        folder.add( params, "angle1_means" , 0.00001, 5   ).step( 0.00001 ).onChange(value=>{fork00[2]=value})
        folder.add( params, "angle1_range" , 0.00001, 0.5 ).step( 0.00001 ).onChange(value=>{fork00[3]=value*fork00[2]})
        folder.add( params, "length1_means", 0.00001, 10  ).step( 0.00001 ).onChange(value=>{fork00[4]=value})
        folder.add( params, "length1_range", 0.00001, 0.5 ).step( 0.00001 ).onChange(value=>{fork00[5]=value*fork00[4]})
        folder.add( params, "conunt1"      , 1, 50  ).step(1).onChange(value=>{fork00[6]=value})
    }
    control_branches(customizeTree,fork_id,group_id,folder_root){
        const branch=customizeTree.param.branches[fork_id]
        const fork=branch.fork[group_id]
        let params0={
            "pos_means"   : fork[0], //0.4
            "pos_range"   : fork[1]/fork[0], //0.05
            "angle_means" : fork[2], //1.25
            "angle_range" : fork[3]/fork[2], //0.08
            "length_means": fork[4], //4
            "length_range": fork[5]/fork[4], //0.5
            "conunt"      :fork[6], //5
        }
        const params=this.updateParams(params0,customizeTree)
        let name=""
        
        if(fork_id==0)name+="一级"
        else          name+="二级"
        name+="分叉"
        if(group_id==0)     name+="A段"
        else if(group_id==1)name+="B段"
        else if(group_id==2)name+="C段"
        else if(group_id==3)name+="D段"
        else if(group_id==4)name+="E段"
        
        const folder = folder_root.addFolder(name)//this.gui.addFolder(name)
        folder.close()
        folder.add( params, "pos_means"   , 0.00001, 0.8 ).step( 0.00001 ).onChange(value=>{fork[0]=value})
        folder.add( params, "pos_range"   , 0.00001, 0.5 ).step( 0.00001 ).onChange(value=>{fork[1]=value*fork[0]})
        folder.add( params, "angle_means" , 0.00001, 5   ).step( 0.00001 ).onChange(value=>{fork[2]=value})
        folder.add( params, "angle_range" , 0.00001, 0.5 ).step( 0.00001 ).onChange(value=>{fork[3]=value*fork[2]})
        folder.add( params, "length_means", 0.00001, 10  ).step( 0.00001 ).onChange(value=>{fork[4]=value})
        folder.add( params, "length_range", 0.00001, 0.5 ).step( 0.00001 ).onChange(value=>{fork[5]=value*fork[4]})
        folder.add( params, "conunt"      , 1, 50  ).step(1).onChange(value=>{fork[6]=value})
    }

    control_Leaves(customizeTree){
        const leaf  =this.updateParams(customizeTree.param.leaf,              customizeTree)
        const leaves=this.updateParams(customizeTree.param.branches[2].leaves[0],customizeTree)
        // console.log(customizeTree.param.branches[2].leaves,leaves)
        const params=this.updateParams({
            '纹理':"resources/images/fgwt/",
            "pos_means"   : leaves[0],         //0.6
            "pos_range"   : leaves[1]/leaves[0], //0.4
            "angle_means" : leaves[2],         //0.6
            "angle_range" : leaves[3]/leaves[2], //0
            "conunt"      :leaves[4],          //3
        },customizeTree)
        
        const folder = this.gui.addFolder("叶子")
        folder.add( {"显示叶子":false}, '显示叶子' ).onChange( value => {
            customizeTree.param.showLeaves=value
            customizeTree.updateLeaves()
        } )
        folder.add( params, '纹理', [
            "resources/images/fgwt/",
            "resources/images/guihua/",
            "resources/images/guohuai/",
            "resources/images/hongfeng/",
            "resources/images/mufurong/",
            "resources/images/xiangzhang/"
        ] ).onChange( value => {
            customizeTree.param.path=value
        } )
        folder.add( leaf, "scale"    , 0.00001, 5 ).step( 0.00001 )
        folder.add( leaf, "alphaTest", 0.00001, 1 ).step( 0.00001 )

        // folder.add( params, "pos_means"   , 0.30001, 0.7 ).step( 0.00001 ).onChange(value=>{leaves[0]=value})
        // folder.add( params, "pos_range"   , 0.00001, 0.5 ).step( 0.00001 ).onChange(value=>{leaves[1]=value*leaves[0]})
        folder.add( params, "angle_means" , 0.00001, 5   ).step( 0.00001 ).onChange(value=>{leaves[2]=value})
        folder.add( params, "angle_range" , 0.00001, 0.5 ).step( 0.00001 ).onChange(value=>{leaves[3]=value*leaves[2]})
        folder.add( params, "conunt"      , 1, 50  ).step(1).onChange(value=>{leaves[4]=value})

        //位置_均值 角度 数量[ leaves_position, noise1, leaves_angle, noise2, number]
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