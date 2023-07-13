import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'//dat.gui.module.js';
export class UI{
    constructor(buiding) {
        this.gui = new GUI({ title: 'Thickness Control' });
        this.init(buiding.material.uniforms)
    }
    init(uniforms){
        const gui = this.gui

        const ThicknessControls = function () {

            this.distortion = uniforms[ 'thicknessDistortion' ].value;
            this.ambient = uniforms[ 'thicknessAmbient' ].value;
            this.attenuation = uniforms[ 'thicknessAttenuation' ].value;
            this.power = uniforms[ 'thicknessPower' ].value;
            this.scale = uniforms[ 'thicknessScale' ].value;

        };

        const thicknessControls = new ThicknessControls();

        gui.add( thicknessControls, 'distortion' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( function () {

            uniforms[ 'thicknessDistortion' ].value = thicknessControls.distortion;

        } );

        gui.add( thicknessControls, 'ambient' ).min( 0.01 ).max( 5.0 ).step( 0.05 ).onChange( function () {

            uniforms[ 'thicknessAmbient' ].value = thicknessControls.ambient;

        } );

        gui.add( thicknessControls, 'attenuation' ).min( 0.01 ).max( 5.0 ).step( 0.05 ).onChange( function () {

            uniforms[ 'thicknessAttenuation' ].value = thicknessControls.attenuation;

        } );

        gui.add( thicknessControls, 'power' ).min( 0.01 ).max( 16.0 ).step( 0.1 ).onChange( function () {

            uniforms[ 'thicknessPower' ].value = thicknessControls.power;

        } );

        gui.add( thicknessControls, 'scale' ).min( 0.01 ).max( 50.0 ).step( 0.1 ).onChange( function () {

            uniforms[ 'thicknessScale' ].value = thicknessControls.scale;

        } );
    }
}