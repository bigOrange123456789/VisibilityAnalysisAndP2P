import {TilesRenderer} from "./three0/TilesRenderer"
import {Box3, Matrix4, Vector3, Sphere, Group, Quaternion} from "three";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

export class TilesLoader{
    constructor(){
        this.tiles = null;
        this.offsetParent = new Group();
        this.offsetParent.scale.set(0.1,0.1,0.1);
        this.offsetParent.position.x += 1500;
        this.offsetParent.position.y += 400;
        let axis = new Vector3(-0.78, 0, -0.56);
        this.offsetParent.rotateOnAxis(axis, 1.6)
        window.scene.add(this.offsetParent);
    }
    reinstantiateTiles(){
        // console.log(window.location.origin)
        this.tiles = new TilesRenderer('./assets/huayi/output4/tileset.json')
        this.tiles.fetchOptions.headers = {}

        this.tiles.preprocessURL = uri => {
            return uri.toString()
        }

        this.tiles.onLoadTileSet = () => {
            const box = new Box3()
            const sphere = new Sphere()
            const matrix = new Matrix4()

            let position
            let distanceToEllipsoidCenter

            if ( this.tiles.getOrientedBounds( box, matrix ) ) {
                position = new Vector3().setFromMatrixPosition( matrix );
                distanceToEllipsoidCenter = position.length();
            } else if ( this.tiles.getBoundingSphere( sphere ) ) {
                position = sphere.center.clone();
                distanceToEllipsoidCenter = position.length();
            }

            const surfaceDirection = position.normalize()
            const up = new Vector3( 0, 1, 0 )
            const rotationToNorthPole = rotationBetweenDirections( surfaceDirection, up )

            this.tiles.group.quaternion.x = rotationToNorthPole.x
            this.tiles.group.quaternion.y = rotationToNorthPole.y
            this.tiles.group.quaternion.z = rotationToNorthPole.z
            this.tiles.group.quaternion.w = rotationToNorthPole.w

            this.tiles.group.position.y = - distanceToEllipsoidCenter
            // console.log(this.tiles.group)
        }
        this.setupTiles()
    }
    setupTiles(){

        this.tiles.fetchOptions.mode = 'cors';

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( 'https://unpkg.com/three@0.123.0/examples/js/libs/draco/gltf/' );

        const loader = new GLTFLoader( this.tiles.manager );
        loader.setDRACOLoader( dracoLoader );

        this.tiles.manager.addHandler( /\.gltf$/, loader );
        this.offsetParent.add( this.tiles.group );

        window.tiles = this.tiles
    }
}

function rotationBetweenDirections( dir1, dir2 ) {
    const rotation = new Quaternion();
    const a = new Vector3().crossVectors( dir1, dir2 );
    rotation.x = a.x;
    rotation.y = a.y;
    rotation.z = a.z;
    rotation.w = 1 + dir1.clone().dot( dir2 );
    rotation.normalize();

    return rotation;
}
