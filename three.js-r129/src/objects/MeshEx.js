import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { BufferGeometryEx } from '../core/BufferGeometryEx.js';
import { Mesh } from './Mesh.js';

class MeshEx extends Mesh {

	constructor( geometry = new BufferGeometryEx(), material = new MeshBasicMaterial() ) {

		super(geometry, material);
	}

}

export { MeshEx };
