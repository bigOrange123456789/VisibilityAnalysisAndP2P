import * as THREE from 'three'
export class SH{
    //1279, y: 719
    //width: 1280,height: 720,
    constructor(SSGITestPram,cb){
        this.cb=cb
        this.SSGITestPram=SSGITestPram
        this.width=this.SSGITestPram.width
        this.height=this.SSGITestPram.height
        console.log("sh.js")
        console.log("THREE.RGBFormat",THREE.RGBFormat)
        console.log("THREE.RGBAFormat",THREE.RGBAFormat)
        const self=this
        this.loadJson(
            "./CloudBake/sh.json",
            json_data=>{
                self.init(json_data)
            }
        )
    }
    loadJson(path,cb){
        // if(!path)path="./CloudBake/sh.json"
        var xhr = new XMLHttpRequest()
        xhr.open('GET', path, true)
        xhr.send()
        xhr.onreadystatechange = ()=> {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var json_data = JSON.parse(xhr.responseText)
                // console.log("json_data:",json_data)
                if(cb)cb(json_data)
            }
        }
    }
    init(json_data){
        this.json_data=json_data
        console.log("json_data:",json_data)
        this.tex0=this.getTex(this.toArr(0))
        this.tex1=this.getTex(this.toArr(1))
        this.tex2=this.getTex(this.toArr(2))
        this.tex3=this.getTex(this.toArr(3))
        this.tex4=this.getTex(this.toArr(4))
        // this.tex5=this.getTex(this.toArr(3))
        if(this.cb)this.cb(this)
    }
    // getMap4(arr){
	// 	let data = new Uint16Array(this.width * this.height * 4)
	// 	data.set(arr)
		
	// 	const map = new THREE.DataTexture()
	// 	map.type = THREE.HalfFloatType
	// 	map.image = {
	// 		  data: data,
	// 		  width: this.width,
	// 		  height: this.height,
	// 	}	
	// 	map.needsUpdate = true
    //     return map
    // }
    toArr(flag){//falg:0~8
        const arr = new Array(this.width * this.height * 4)
        for(let i=0;i<this.json_data.length;i++){
            const item=this.json_data[i]
            const x=item.x
            const y=item.y
            const index=y*this.width+x
            arr[4*index+0]=parseFloat(item.v[flag][0])
            arr[4*index+1]=parseFloat(item.v[flag][1])
            arr[4*index+2]=parseFloat(item.v[flag][2])
            arr[4*index+3]=parseFloat(0)
        }
        return arr
    }
    getTex(arr){
        // console.log(arr)
        if(this.width * this.height * 4!==arr.length)
            console.error("this.width * this.height * 4!==arr.length")
		let data = new Float32Array(arr.length)
		data.set(arr)
		const map = new THREE.DataTexture(
            data, 
            this.width, 
            this.height, 
            THREE.RGBAFormat,
            THREE.FloatType
        )
		map.needsUpdate = true

        // let map2 = new THREE.DataTexture()
		map.type = THREE.FloatType//THREE.HalfFloatType
		map.image = {
			  data: data,
			  width: this.width,
			  height: this.height,
		}	
		// map.needsUpdate = true

        console.log(map)
        // return map
        return {"value":map}
    }
}