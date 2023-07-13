import * as THREE from "three";
class LightProducer{
    constructor(scene){
        // Lights

        scene.add( new THREE.AmbientLight( 0x888888 ) );

        const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.03 );
        directionalLight.position.set( 0.0, 0.5, 0.5 ).normalize();
        scene.add( directionalLight );

        const pointLight1 = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x888888 } ) );
        for(let i=0;i<7;i++)
        pointLight1.add( new THREE.PointLight( 0x888888, 7.0, 300 ) );
        //pointLight1.add( new THREE.PointLight( 0x888888, 7.0, 300 ) );
        scene.add( pointLight1 );
        pointLight1.position.x = 0;
        pointLight1.position.y = - 50;
        pointLight1.position.z = 350;

        const pointLight2 = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x888800 } ) );
        pointLight2.add( new THREE.PointLight( 0x888800, 1.0, 500 ) );
        scene.add( pointLight2 );
        pointLight2.position.x = - 100;
        pointLight2.position.y = 20;
        pointLight2.position.z = - 260;
    }

}
export { LightProducer }