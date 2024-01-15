import {
    InstancedMesh,
    LoadingManager,
    Matrix4,
    MeshBasicMaterial,
    Raycaster,Vector2,
    CylinderGeometry,
    Object3D,
    BufferGeometry,
    BufferAttribute,
    MeshStandardMaterial,
    Color,
    CanvasTexture,
    Mesh

} from "three";
export class CoderDecoder{
    constructor(){}
    static encoderGltf(gltf){
        if(!gltf||!gltf.scene)return
        var mesh = null//gltf.scene.children[0].children[0]
        gltf.scene.traverse(o=>{
            if(o instanceof Mesh){ mesh=o }
        })
        return CoderDecoder.encoder(mesh)
    }
    static encoder(mesh){
        if(!mesh)return null
        const code={
            name:mesh.name,
            geometry: {
                vertices: mesh.geometry.attributes.position.array,
                normals: mesh.geometry.attributes.normal? mesh.geometry.attributes.normal.array : null,
                uvs: mesh.geometry.attributes.uv? mesh.geometry.attributes.uv.array : null,
                indices: mesh.geometry.index? mesh.geometry.index.array : null
            },
            material: {
                color: mesh.material.color,
                roughness: mesh.material.roughness,//1-Ns,
                metalness: mesh.material.metalness,//Ns,
                opacity: mesh.material.opacity,
                emissive: mesh.material.emissive,
                image: mesh.material.map? mesh.material.map.image : null,
                offset: mesh.material.map? mesh.material.map.offset : null,
                repeat: mesh.material.map? mesh.material.map.repeat : null,
            }
        }
        return code
    }
    static decoder(code){
        let geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(code.geometry.vertices,3));
        if(code.geometry.normals) geometry.setAttribute('normal', new BufferAttribute(code.geometry.normals,3))
        else geometry.computeVertexNormals();
        if(code.geometry.uvs) geometry.setAttribute('uv', new BufferAttribute(code.geometry.uvs,2));
        if(code.geometry.indices) geometry.setIndex(new BufferAttribute(code.geometry.indices,1));
        // console.log(geometry)
        let material = new MeshStandardMaterial({
            color: new Color(code.material.color.r, code.material.color.g, code.material.color.b),
            // emissive: new Color(code.material.emissive.r, code.material.color.g, code.material.color.b),
            roughness: code.material.roughness,
            metalness: code.material.metalness,
            transparent: code.material.opacity !== 1,
            opacity: code.material.opacity
        });
        // console.log(material.roughness)
        if(code.material.image){
            // material.map = new CanvasTexture(code.material.image)
            material.map = new CanvasTexture(code.material.image,300,1000,1000,1006,1008,1022,1009,1)
            material.map.offset = new Vector2(code.material.offset.x, code.material.offset.y);
            material.map.repeat = new Vector2(code.material.repeat.x, code.material.repeat.y);
            material.map.encoding = 3001;
            material.map.flipY = false;
        }
        const mesh=new Mesh(geometry,material)
        mesh.name=code.name
        return mesh
    }
    static decoderTest(code){
        let geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(code.geometry.vertices,3));
        let material = new MeshStandardMaterial();
        const mesh=new Mesh(geometry,material)
        mesh.name=code.name
        return mesh
    }
}


