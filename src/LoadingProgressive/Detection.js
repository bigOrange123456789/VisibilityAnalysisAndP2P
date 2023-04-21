import config from '../../config/configOP.json'
export class Detection {//需要服务器
    constructor(meshes) {
        this.meshes=meshes
        this.dectionURL=config.src.Detection.urlDetectionServer
        this.date=[
            new Date().getMonth(),
            new Date().getDate(),
            new Date().getHours(),
            new Date().getSeconds(),
            new Date().getMilliseconds()
        ]
        // this.time0=performance.now()
        // this.

        this.count_pack_p2p=0//P2P加载数量
        this.count_pack_server=0//服务器获取数量

        this.count_mesh_p2p=0
        this.count_mesh_server=0
        
        this.close=false
        this.pack_circumstances={}
        var scope=this

        this.testTime=90//60//window.param.testTime;//测试时间
        this.frameCount=0;//记录帧数量
        function testFrame(){
            scope.frameCount++
            requestAnimationFrame(testFrame);
        }testFrame()
        setTimeout(()=>{
            console.log("end")
            scope.finish()
        },scope.testTime*1000)
    }
    getLoadDelay(){
        let delay=0
        let delayMax=0
        let count=0
        for(let id in this.meshes){
            const mesh=this.meshes[id]
            if(mesh.used){//延迟只统计被使用过的对象
                if(mesh.LoadDelay>delayMax){
                    delayMax=mesh.LoadDelay
                }
                delay+=mesh.LoadDelay
                count++
            }
        }
        return {
            "ave":delay/count,
            "max":delayMax
        }
    }
    receivePack(type){
        if(type=="p2p")this.count_pack_p2p++
        else if(type=="server")this.count_pack_server++
        else console.log("error:receivePack type")
    }
    receiveMesh(mesh){
        if(mesh.originType=="cloud")this.count_mesh_server++
        else if(mesh.originType="edgeP2P")this.count_mesh_p2p++
        else console.log("error:mesh.originType")
    }
    count_mesh_p2p_NotUsed(){
        let count=0
        for(let id in this.meshes){
            const mesh=this.meshes[id]
            if(mesh.originType="edgeP2P"&&!mesh.used)
                count++
        }
        return count
    }
    count_mesh_server_NotUsed(){
        let count=0
        for(let id in this.meshes){
            const mesh=this.meshes[id]
            if(mesh.originType="cloud"&&!mesh.used)
                count++
        }
        return count
    }
    finish(){
        this.close=true
        var data={
            count_pack_p2p  :this.count_pack_p2p,
            count_pack_server:this.count_pack_server,

            count_mesh_p2p  :this.count_mesh_p2p,
            count_mesh_server:this.count_mesh_server,

            count_mesh_p2p_NotUsed:this.count_mesh_p2p_NotUsed(),
            count_mesh_server_NotUsed:this.count_mesh_server_NotUsed(),

            loadDelay:this.getLoadDelay(),

            frameCount:this.frameCount,//测试所用的帧数
            testTime:this.testTime,//测试时间
            
            url:window.location.href,//地址以及参数
            date:this.date,         //测试日期

            useP2P:window.useP2P
            
        }
        console.log(data)
        var oReq = new XMLHttpRequest();
        oReq.open("POST", this.dectionURL, true);
        oReq.responseType = "arraybuffer";
        oReq.onload = function () {//接收数据
            var unitArray=new Uint8Array(oReq.response) //网络传输基于unit8Array
            var str=String.fromCharCode.apply(null,unitArray)//解析为文本
            console.log(str)
            if(!new URLSearchParams(window.location.search).has("autoMove"))
                alert("测试完成，感谢您的配合！")
            setTimeout(()=>{
                if(new URLSearchParams(window.location.search).has("back"))
                    location.href=new URLSearchParams(window.location.search).get('back')
                // window.location.href="https://smart3d.tongji.edu.cn/cn/index.htm"
            },100)
            // window.location.href="https://smart3d.tongji.edu.cn/cn/index.htm"
            //window.opener = null;//为了不出现提示框
            // window.close();//关闭窗口//完成测试，关闭窗口
            // window.location.href="http://58.34.91.211:28081/?scene=KaiLiNan&useP2P=true&useP2P=true&needDetection=true&onlyP2P=true"
        };
        oReq.send(JSON.stringify(data));//发送请求
    }
}