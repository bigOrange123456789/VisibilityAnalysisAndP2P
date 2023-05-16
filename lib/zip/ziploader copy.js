/**
 * @author Takahiro / https://github.com/takahirox
 */
import {
  LoaderUtils,
  DefaultLoadingManager,
  FileLoader
  } from 'three';
  
import JSZip from 'jszip';


function ZipLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
	this.crossOrigin=false

}

function checkJSZipAvailability( onError ) {

	if ( typeof JSZip === 'undefined' ) {

		var error = new Error( 'ZipLoader: Import JSZip https://stuk.github.io/jszip/' );

		if ( onError !== undefined ) {

			onError( error );
			return false;

		} else {

			throw error;

		}

	}

	return true;

}

Object.assign( ZipLoader.prototype, {

	constructor: ZipLoader,

	load: function ( url, onProgress, onError ) {

		if ( ! checkJSZipAvailability( onError ) ) return;

		var scope = this;

		var promise = JSZip.external.Promise;

		var baseUrl = 'blob:' + LoaderUtils.extractUrlBase( url );
		scope.baseUrl=baseUrl

		return new promise( function ( resolve, reject ) {
			// console.log("url",url)
			// console.log("crossOrigin",scope.crossOrigin)
			if(false){//if(scope.crossOrigin){//跨源请求
				// var oReq = new XMLHttpRequest();
				// oReq.getResponseHeader("Content-Type");
        		// oReq.open("POST", url, true);
       	 		// oReq.responseType = "arraybuffer";
        		// oReq.onload =()=>{
				// 	this.count[ip]--
				// 	var data=oReq.response;//ArrayBuffer
				// 	var imageType = oReq.getResponseHeader("Content-Type");
				// 	var blob = new Blob([data], { type: imageType });//用于图片解析
				// 	var unityArray=new Uint8Array(data)//用于glb文件解析
				// 	//callback(unityArray,blob)
				// 	console.log(unityArray)
					
				// 	// resolve(unityArray)
				// }//接收数据
        		// oReq.onerror=reject
        		// oReq.send({"test":123});//发送请求
        	
				
        	var oReq = new XMLHttpRequest();
        	oReq.open("POST", url, true);
        	oReq.responseType = "arraybuffer";
        	oReq.onload = ()=>{
            	var data=oReq.response;//ArrayBuffer
            	var imageType = oReq.getResponseHeader("Content-Type");
            	var blob = new Blob([data], { type: imageType });//用于图片解析
            	var unityArray=new Uint8Array(data)//用于glb文件解析
            	console.log(unityArray,blob)
        	}//接收数据
        	oReq.onerror=(e)=>{
            	console.log(e,url)//异常处理
        	}
        	oReq.send({"test":123});//发送请求

				var path="dist/assets/models/huayi/"+this.meshIndex+".zip"
				var oReq = new XMLHttpRequest();
				oReq.open("POST", "http://"+socket0, true);
				oReq.responseType = "arraybuffer";
				oReq.onload = ()=>{
					this.arrayBuffers=oReq.response;//ArrayBuffer
					cb()
				}//接收数据
				oReq.onerror=e=>{//异常处理
				setTimeout(()=>{
					this.request0(
					this.crossDomain.getSocket(),//换一台服务器请求
					cb
					)//重新请求
				},1000*(0.5*Math.random()+1))//1~1.5秒后重新加载
				console.log("error",e,path)
				}
				oReq.send(path);//发送请求


			}else{//同源请求
				var loader = new FileLoader( scope.manager );
				loader.setResponseType( 'arraybuffer' );
				loader.load( url, resolve, onProgress, reject );
			}
		} ).then( function ( buffer ) {
			scope.buffer=buffer
		} )

	},
	parse:function(baseUrl,buffer,onerror){
		var promise = JSZip.external.Promise;
		return new promise( function ( resolve, reject ) {
			resolve(buffer);
		} ).then( function ( buffer ) {
			return JSZip.loadAsync( buffer );

		} ).then( function ( zip ) {

			var fileMap = {};

			var pendings = [];

			for ( var file in zip.files ) {

				var entry = zip.file( file );

				if ( entry === null ) continue;

				pendings.push( entry.async( 'blob' ).then( function ( file, blob ) {

					fileMap[ baseUrl + file ] = URL.createObjectURL( blob );

				}.bind( this, file ) ) );

			}

			return promise.all( pendings ).then( function () {

				return fileMap;

			} );

		} ).then( function ( fileMap ) {

			return {

				urlResolver: function ( url ) {

					return fileMap[ url ] ? fileMap[ url ] : url;

				},

				find: function ( query ) {

					if ( typeof query === 'string' ) {

						query = new RegExp( query.replace( /\./g, '\\.' ) );

					}

					var files = [];

					for ( var key in fileMap ) {

						if ( key.match( query ) !== null ) {

							files.push( key );

						}

					}

					return files;

				}

			};

		} ).catch( onerror );
	}

} );


export { ZipLoader };
