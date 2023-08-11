import {MeshAnima } from './lib/MeshAnima3.js'
export class ExtractAnimation {
    constructor(glb) {
        var camera, scene, renderer;
        var light;
        init();
        render();
        function init() {
            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 10000);
            camera.position.z = 20;
            scene = new THREE.Scene();
            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0xddddff);
            document.body.appendChild( renderer.domElement );
            light = new THREE.AmbientLight(0xffffff,1.0)
            scene.add(light);
        }
        function render(){
            renderer.render( scene, camera );
            requestAnimationFrame(render);
        }
        var animationType=prompt(
            "请输入动画编号:(动画总数"+glb.animations.length+")",
            Array.from(Array(glb.animations.length)).map((e, i) => i)+""//"0,1,2,3,4"
            ).split(",")//挥手 点赞 跳跃 //哈欠 鼓掌 举手
        var animations=[];
        for(var i=0;i<animationType.length;i++){
            var index=Math.floor(animationType[i])
            animations.push(
                glb.animations[index]
            )
        }

        glb.scene.traverse(node=>{
            if(node instanceof THREE.Object3D||node instanceof THREE.Group){
                // node.applyMatrix4(new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1))
                // node.matrixAutoUpdate=true
                // node.matrix.set(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)
                // node.matrixAutoUpdate=true
                node.position.set(0,0,0)
                node.rotation.set(0,0,0)
                node.scale.set(1,1,1)
            }
        })

        scene.add(glb.scene)

        

        var skeleton_all=get_skeleton(glb)//获取所有的SkinMesh对象
        var n= prompt("动画的总帧数为:",animations[0].tracks[0].times.length);//帧数量

        var meshAnima=new MeshAnima(skeleton_all[0],n)

        function next(index1,index2){//mesh编号, 动画编号
            console.log("skinnedmesh编号",index1,skeleton_all.length)
            if(index2==animations.length){
                meshAnima.download()
                alert("finish!")
                return
            }else{//获取这个动画每一帧的数据
                play1(
                    glb,
                    animations[index2],
                    skeleton_all[index1][1],
                    skeleton_all[index1][0]+".json",
                    n,
                    meshAnima,//meshAnima_All,//
                    result0=>{
                        next(index1,index2+1)
                    }
                )
            }
        }
        next(0,0)

        
        function get_skeleton(glb){
            var index0=0
            var skeleton_all=[]
            glb.scene.traverse(function (node) {
                if(node instanceof THREE.SkinnedMesh){
                    node.skeleton.parent=node
                    skeleton_all.push([node.name,node.skeleton])
                    // skeleton_all.push([index0+"."+node.name,node.skeleton])
                    index0++
                }  
            })
            return skeleton_all
        }
        function play1(glb,animation,skeleton,name,n,meshAnima,cb){
            console.log("glb",glb)
            console.log("该模型的骨骼个数为:",skeleton.bones.length)
            console.log("animation",animation)
            // var animation=glb.animations[0];
            var times=glb.animations[0].tracks[0].times;
            var time_all=times[times.length-1]//总时间
            var mixer = new THREE.AnimationMixer(glb.scene);
            var action=mixer.clipAction(animation);
            action.play();
    
            var t=0;
            var interval=setInterval(function () {
    
                if(t<=n){//0~n
                    if(t==0){
                        mixer.update(0.000001);//0~n-1
                        meshAnima.additionFrameData1()//保存逆矩阵
                    }else{//1~n
                        meshAnima.additionFrameData2()//保存世界矩阵
                        // for(let i=0;i<meshAnima_All.length;i++)
                        //     meshAnima_All[i].additionFrameData()
                        mixer.update(time_all/(n-1))
                    }
                    t++;
                }else{
                    clearInterval(interval)
                    meshAnima.finishOneAnima()
                    // for(let i=0;i<meshAnima_All.length;i++)
                    //     meshAnima_All[i].finishOneAnima()//addition(result)
                    if(cb)cb()
                }
            },30)
        }
    }

    
}