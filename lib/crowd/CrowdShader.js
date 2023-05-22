import assets  from './my_shader.json'
import * as THREE from "three"

export class CrowdShader{
	constructor(opt){
		this.opt=opt
		this.path0="./assets/avatar/shader/"
	}
	test(){
		if (material){}
		var colorParsChunk = [
			'attribute vec4 instanceColor;',
			'varying vec4 vInstanceColor;',
			'#include <common>'
		].join( '\n' );
		
		material.onBeforeCompile = shader => {
			shader.vertexShader = shader.vertexShader
				.replace( '#include <common>', colorParsChunk )
				.replace( '#include <begin_vertex>', instanceColorChunk );

			shader.fragmentShader = shader.fragmentShader
				.replace( '#include <common>', fragmentParsChunk )
				.replace( 'gl_FragColor = vec4( outgoingLight, diffuseColor.a );', colorChunk );
		};
		
	}
	async init(){
		let opt=this.opt
		var vert =await this.load("vert_MeshStandardMaterial")
		vert=this.addGlsl(vert,
			await this.load(
				opt["isSimShader"]?"vert_anim_sim":"vert_anim"
			)
		)//("vert_anim"))//
		var frag =await this.load("frag_MeshStandardMaterial")
		if(opt.scattering){
			var lights_physical_pars_fragment2=
				THREE.ShaderChunk["lights_physical_pars_fragment"]+//this.load("lights_physical_pars_fragment")+
				await this.load("frag_lights_physical_pars_fragment_Scattering")
			frag = frag.replace( '#include <lights_physical_pars_fragment>', lights_physical_pars_fragment2 )
		}
		// vert = vert.replace( '#include <project_vertex>', await this.load("vert_ProjectVertex") )
		this.fragmentShader=frag
		this.vertexShader=vert
	}
	addGlsl(origin,str0,tag){
		if(!tag)tag='#include <common>' 
		var str1='\n' + str0+ '\n' + tag + '\n' 
		return origin
				.replace( tag, str1 );
	}
	load(name) {
		let url=this.path0+name+".glsl"
		if(!assets[url]){
			console.log("加载shader",url)
			assets[url]=
				new Promise((resolve, reject) => {
            		let xhr = new XMLHttpRequest();
            		xhr.onload =  () => {
                		resolve(xhr.responseText)
            		};
            		xhr.onerror =  event => reject(event);
            		xhr.open('GET', url);
            		xhr.overrideMimeType("text/html;charset=utf-8");
            		xhr.send();
        		});
		}
        return assets[url]

    }
}