import {
    TextureLoader,
    Object3D,
    SpriteMaterial,
    Sprite,

    BoxGeometry,
    MeshBasicMaterial,
    Mesh,

    SphereGeometry,
    CylinderGeometry,
    Vector2,
    Vector3,
    Raycaster,
    Texture,
    PointsMaterial,
    BufferGeometry,
    Float32BufferAttribute,
    Points
} from 'three'
export {Board}
class Board{
    constructor(parent,config) {
        this.config=config
        this.root=new Object3D()
        this.spheres=[]
        this.indexs=[]
        this.marks = []
        parent.add(this.root)
        this.init()
    }
    radiographic(){//射线检测
        var scope=this
        const raycaster = new Raycaster();
        const mouse = new Vector2();
        document.addEventListener( 'mousemove', (event)=>{
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1 ;
        }, false );//鼠标移动事件
        function click(){
            var flag=false;//没有点击到
            raycaster.setFromCamera( mouse, window.c )
            check(scope.indexs,(intersect)=>{
                var p=intersect.object.myPosition
                window.c.position.set(p[0],p[1],p[2])
                //window.c.rotation.set(p[3],p[4],p[5])
                window.c.lookAt(p[3],p[4],p[5])
                //scope.div.style.display="none"
            })
            function check(arr,cb1,cb2){
                var intersects = raycaster.intersectObjects( arr )
                if(intersects.length!==0){
                    cb1(intersects[0])
                    flag=true
                } else if(cb2)cb2()
            }
            return flag
        }
        window.addEventListener('click',click,false)
        document.addEventListener( 'touchstart', ()=>{
            var x0=mouse.x
            var y0=mouse.y

            var i0=-10,j0=-50
            var interval=setInterval(()=>{
                i0+=10
                if(i===10){
                    i0=-10;
                    j0+=10
                }
                mouse.x=x0+i
                mouse.y=y0+j
                if(click())return//如果点击到就不用再点击了
                if(j0===50)clearInterval(interval)
            },10)

        }, false )
        //document.addEventListener( 'touchend', click, false )
        //alert(window.innerWidth+","+window.innerHeight)
        //alert("new4")
    }
    indexMark(){
        //尺寸，坐标，场景
        function Mark(size, position, scene, text){
            var material = new MeshBasicMaterial({color: 0xff0000});
            var cylinder = new CylinderGeometry(3*size, 3*size, 1*size, 18, 3);
            var mark_1 = new Mesh(cylinder, material);
            scene.add(mark_1);

            mark_1.rotateX(Math.PI/2);
            mark_1.position.x = position.x;
            mark_1.position.y = position.y+5*size;
            mark_1.position.z = position.z;
            var box = new BoxGeometry(1*size, 8*size, 1*size);
            var mark_2 = new Mesh(box, material);
            mark_2.position.x = position.x;
            mark_2.position.y = position.y;
            mark_2.position.z = position.z;

            window.test=mark_2.position
            scene.add(mark_2);

            if(!position.x&&!position.y&&!position.z){
                mark_1.material.visible = false;
                mark_2.material.visible = false;
            }

            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.font = "30px Arial ";

            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.moveTo(0,0);//(10,30);
            ctx.lineTo(150,0);
            ctx.lineTo(150,50);
            ctx.lineTo(0,50);
            ctx.lineTo(0,0);
            ctx.closePath()
            ctx.fillStyle = "white";  //填充颜色
            ctx.fill();  //填充

            ctx.lineWidth=5;//描边
            ctx.strokeStyle = "red";  //描边颜色
            ctx.stroke();  //描边


            ctx.fillStyle = "black";

            ctx.fillText(text, 45, 40);
            //console.log(text.length);
            ctx.globalAlpha = 1;

            //将画布生成的图片作为贴图给精灵使用，并将精灵创建在设定好的位置
            let texture = new Texture(canvas);
            texture.needsUpdate = true;
            //创建精灵，将该材质赋予给创建的精灵
            let spriteMaterial = new PointsMaterial({
                map: texture,
                //sizeAttenuation: true,
                size: 40*size,
                transparent: true,
                opacity: 1,
            });
            //创建坐标点，并将材质给坐标
            let geometry = new BufferGeometry();
            let vertices = [0, 0, 0];
            geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
            let sprite = new Points(geometry, spriteMaterial);
            sprite.position.set(
                position.x,//-4*size,
                position.y+4*size, position.z);
            //scene.add(sprite);

            return mark_1
        }

        var size = 10
        if(window.param.projectName==='HaiNing'){
            size = 15
        }else if(window.param.projectName==='KaiLiNan'){
            size = 0.4
        }else if(window.param.projectName==='LanQiao'){
            size = 10
        }else if(window.param.projectName==='QinLaiLi'){
            size = 5
        }else if(window.param.projectName==='RenFuYiYuan'){
            size = 60
        }else if(window.param.projectName==='XinYu'){
            size = 2
        }else if(window.param.projectName==='YunXi'){
            size = 5
        }else{ }
        for(var i in this.config){
            var c=this.config[i]
            var m=Mark(size, new Vector3(
                c.boardPos[0],
                c.boardPos[1],
                c.boardPos[2]), this.root,c.boardName);
            setInterval(()=>{
                //console.log(m.scale)
                if(m.scale.x===1) m.scale.set(0.5,0.5,0.5)
                else m.scale.set(1,1,1)
            },500)
            this.indexs.push(m)
            m.myPosition=c.camera
        }
        var scope=this;
        setInterval(()=>{
            var arr=scope.indexs
            if(arr.length===0)
               return
            if(arr[0].scale.x===1){
                for(var i=0;i<arr.length;i++)
                    arr[i].scale.set(0.5,0.5,0.5)
            }else {
                for(var i=0;i<arr.length;i++)
                    arr[i].scale.set(1,1,1)
            }
        },500)
    }
    init(){

        var scope=this
        var buttons=document.getElementsByClassName("myButton")
        //console.log(buttons)
        for(var i=0;i<buttons.length;i++){
            buttons[i].myid=i
            buttons[i].onclick=function(){
                var p=scope.indexs[this.myid].myPosition
                window.c.position.set(p[0],p[1],p[2])
                window.c.rotation.set(p[3],p[4],p[5])
                scope.div.style.display="none"
            }
        }
        this.radiographic()//添加射线检测
        this.indexMark()//添加索引标签

        //用于测试
        //window.add=()=>{scope.add('./img/sprite.png',window.c.position.x,window.c.position.y,window.c.position.z)}
    }
    add(url,x,y,z){
        if(window.isMobile){//if(true){//
            const geometry = new SphereGeometry( 0.4, 8, 8 );
            const red = new MeshBasicMaterial( { color: 0xff0000 } );
            const sphere = new Mesh( geometry, red );

            const geometry2 = new SphereGeometry( 8, 8, 8 );
            geometry2.side=2
            const red2 = new MeshBasicMaterial({
                transparent: true,
                opacity: 0,//1,//
            });
            red2.side=2
            const sphere2 = new Mesh( geometry2, red2 );
            //sphere.position.set(x,y,z)
            sphere2.position.set(x,y,z)
            sphere2.add( sphere )
            this.root.add( sphere2 )
            setInterval(()=>{//小球闪烁功能的实现
                if(sphere.scale.x===1)sphere.scale.set(0.5,0.5,0.5)
                else sphere.scale.set(1,1,1)
            },500)
            this.spheres.push(sphere2)

            const map = new TextureLoader().load( url );
            const material = new SpriteMaterial( { map: map } );
            const sprite = new Sprite( material );
            sprite.position.set(x,y,z)
            sprite.scale.set(1,1,1)
            sprite.visible=false;
            this.root.add( sprite );
            sphere2.sprite=sprite
            return sphere2
        }else{
            const geometry = new SphereGeometry( 0.4, 8, 8 );
            const red = new MeshBasicMaterial( { color: 0xff0000 } );
            const sphere = new Mesh( geometry, red );
            sphere.position.set(x,y,z)
            this.root.add( sphere )
            if(window.isMobile)this.root.add( sphere2 )
            setInterval(()=>{//小球闪烁功能的实现
                if(sphere.scale.x===1)sphere.scale.set(0.5,0.5,0.5)
                else sphere.scale.set(1,1,1)
            },500)
            window.sphere=sphere
            this.spheres.push(sphere)

            const map = new TextureLoader().load( url );
            const material = new SpriteMaterial( { map: map } );
            const sprite = new Sprite( material );
            sprite.position.set(x,y,z)
            sprite.scale.set(1,1,1)
            sprite.visible=false;
            this.root.add( sprite );
            window.sprite=sprite
            sphere.sprite=sprite
            return sphere
        }
    }
}
