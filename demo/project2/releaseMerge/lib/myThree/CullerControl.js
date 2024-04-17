import {FileLoader, Frustum, Matrix4, Vector3, Sphere} from "three";
import {GPU} from "gpu.js"

class CullerControl{
    constructor(camera, meshNum){
        this.camera = camera
        this.meshNum = meshNum
        this.points = []
        this.objects = []
        this.field_objects = []
        this.json_loaded = false
        this.preload_list = []

        // this.loadJson()
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        var self = this
        // setInterval(function(){
        //     var visible_list = self.judgeVisibility1()
        //     self.setVisibility(visible_list)
        // },100)
        window.culling=()=>{
            self.judgeVisibility1()
            // self.judgeVisibility3()
        }
    }
    loadJson(){
        var culler = this
        var url = "./assets/spheres/"+window.param.projectName+"_sph.json"
        var loader = new FileLoader()
        loader.load(url, function(data){
            // console.log(JSON.parse(data))
            var spheres_list = JSON.parse(data).spheres
            for(let i=0; i<culler.meshNum; i++){
                var spheres = []
                for(let j=0; j<spheres_list[i].length; j++){
                    var sphere = new Sphere(new Vector3(spheres_list[i][j].center.x,spheres_list[i][j].center.y,spheres_list[i][j].center.z),spheres_list[i][j].radius)
                    spheres.push(sphere)
                }
                window.bounding_sph[i] = spheres
            }
            culler.json_loaded = true
            // console.log(window.bounding_sph)
            culler.animate = culler.animate.bind(culler);
            requestAnimationFrame(culler.animate);
            // culler.points = JSON.parse(data).points
            // culler.objects = JSON.parse(data).objects
            // console.log("culler json loaded")
            // var sum_objects = []
            // for(let i=0; i<culler.objects.length; i++){
            //     sum_objects = sum_objects.concat(culler.objects[i].filter(v => !sum_objects.includes(v)))
            // }
            // console.log(sum_objects.length)
        })
    }
    animate(){
        requestAnimationFrame(this.animate)
        var start = performance.now()
        var length = this.judgeVisibility3()
        // console.log("time:"+(performance.now()-start).toFixed(2).toString()+" list:"+length)
    }
    judgeVisibility1(){
        //视野内+投影面积
        var vis_num = 0
        var frustum = getFrustum(this.camera)
        for(let i=0; i<this.meshNum; i++){
            if(window.loaded[i]===1){
                if(intersectSpheres(window.bounding_sph[i], frustum, this.camera.position)){
                    vis_num++
                    window.loaded_mesh[i].visible = true
                } else {
                    window.loaded_mesh[i].visible = false
                }
            }
        }
        // console.log(vis_num)
    }
    judgeVisibility2(){
        //分块
        var objects_in_field = []
        for(let i=0; i<this.points.length; i++){
            var point = new Vector3(this.points[i].x,this.points[i].y,this.points[i].z)
            var res = point.project(this.camera)
            if(res.x>-1&&res.x<1&&res.y>-1&&res.y<1&&res.z>-1&&res.z<1){
                objects_in_field = objects_in_field.concat(this.objects[i].filter(v => !objects_in_field.includes(v)))
            }
        }
        this.field_objects = objects_in_field
        // console.log(objects_in_field.length)

        for(let i=0; i<this.meshNum; i++){
            if(window.loaded[i]===1){
                window.loaded_mesh[i].visible = objects_in_field.indexOf(i) !== -1;
            }
        }
    }
    judgeVisibility3(){
        //进行可视性排序，只显示有限个构件
        var visible_list = []
        var frustum = getFrustum(this.camera)
        for(let i=0; i<this.meshNum; i++){
            // if(window.loaded[i]===1)
                if(intersectSpheres(window.bounding_sph[i], frustum, this.camera.position)){
                    visible_list.push({
                        meshIndex:i,
                        value:window.bounding_sph[i][0].radius/getDistance(window.bounding_sph[i],this.camera.position)
                    })
                }
        }
        // console.log(visible_list)
        quickSort(visible_list, 0, visible_list.length-1)
        var max_num = 600
        var length = visible_list.length<max_num?visible_list.length:max_num
        var list = []
        for(let i=0; i<length; i++){
            list.push(visible_list[i].meshIndex)
        }
        for(let i=0; i<this.meshNum; i++){
            if(list.indexOf(i)!==-1){
                if(window.loaded[i]===1){
                    window.loaded_mesh[i].visible = true
                }
            } else if(window.loaded[i]===1){
                window.loaded_mesh[i].visible = false
            }
        }
        return list.length
    }
    setVisibility(visible_list){
        for(let i=0; i<this.meshNum; i++){
            if(window.loaded[i]===1){
                window.loaded_mesh[i].visible = visible_list.indexOf(i) !== -1;
            }
        }
    }
    ifVisible(meshIndex){
        if(!this.json_loaded) return true
        // if(!this.field_objects.includes(meshIndex)) return false
        var frustum = getFrustum(this.camera)
        return intersectSpheres(window.bounding_sph[meshIndex], frustum, this.camera.position)
    }
}

function getFrustum(camera)
{
    var frustum = new Frustum();
    frustum.setFromProjectionMatrix( new Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
    return frustum;
}

function intersectSphere(center, radius, frustum, cam_pos) {
    const planes = frustum.planes
    const negRadius = -radius
    // console.log(planes)
    for(let i=0; i<planes.length; i++){
        const distance = planes[i].distanceToPoint(center)
        // const distance = kernelCal(center.x,center.y,center.z,planes[i].normal.x,planes[i].normal.y,planes[i].normal.z,planes[i].constant)[0]
        // console.log(distance)
        if (distance<negRadius){
            return false
        }
    }
    var vis_radius = radius/(center.clone().sub(cam_pos).length())
    // var vis_radius2 = radius*radius/(center.clone().sub(cam_pos).length())
    // console.log(vis_radius2)
    if(vis_radius<0.02) return false
    // if(vis_radius2<0.5) return false
    return true
}

function intersectSpheres(spheres, frustum, cam_pos){
    if(!spheres) return false
    for(let i=0; i<spheres.length; i++){
        if(intersectSphere(spheres[i].center, spheres[i].radius, frustum, cam_pos)){
            return true
        }
    }
    return false
}

function getDistance(spheres, cam_pos){
    var minDis = spheres[0].center.clone().sub(cam_pos).length()
    for(let i=1; i<spheres.length; i++){
        var dis = spheres[i].center.clone().sub(cam_pos).length()
        if(dis<minDis) minDis = dis
    }
    return minDis
}

function quickSort(arr, begin, end) {
    if(begin >= end)
        return;
    var l = begin;
    var r = end;
    var temp = arr[begin];
    while(l < r) {
        while(l < r && arr[r].value <= temp.value)
            r --;
        while(l < r && arr[l].value >= temp.value)
            l ++;
        [arr[l], arr[r]] = [arr[r], arr[l]];
    }
    [arr[begin], arr[l]] = [arr[l], arr[begin]];
    quickSort(arr, begin, l - 1);
    quickSort(arr, l + 1, end);
}

const gpu = new GPU()
var kernelCal = gpu.createKernel(function(sx,sy,sz,px,py,pz,constant){
    const dot = sx*px+sy*py+sz*pz
    return dot + constant
}).setOutput([1])

export{CullerControl}
