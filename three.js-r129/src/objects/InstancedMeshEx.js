import { BufferAttribute } from '../core/BufferAttribute.js';
import { InstancedMesh } from './InstancedMesh.js';

class InstancedMeshEx extends InstancedMesh {

	constructor( geometry, material, count, multiCounts, hasTexcoordAttribute) {

		super( geometry, material, count );

		if (multiCounts)
		{
			this.multiCounts = [];
			this.instanceOffsets = [];

			this.dynMultiCounts = [];

			var totalCount = 0;
			for (var i = 0 ; i < multiCounts.length ; ++i)
			{
				this.instanceOffsets.push(totalCount);
				totalCount += multiCounts[i];

				this.multiCounts.push(multiCounts[i]);

				this.dynMultiCounts.push(-1);
			}

			this.instanceMatricesArray = new BufferAttribute( new Float32Array( totalCount * 16 ), 16 );
			this.instanceColorsArray = new BufferAttribute( new Float32Array( totalCount * 4 ), 4 );

			if (hasTexcoordAttribute)
			{
				this.instanceTexcoordsArray = new BufferAttribute( new Float32Array( totalCount * 4 ), 4 );
			}
		}
	}

	setInstanceMatrixAt (iIndex, index, matrix ) {

		if (this.instanceMatricesArray)
		{
			var matrixOffset = this.instanceOffsets[iIndex];
			matrix.toArray( this.instanceMatricesArray.array, (matrixOffset + index) * 16);
		}
	}

	setInstanceColorAt(iIndex, index, color4 ) {

		if (this.instanceColorsArray)
		{
			var colorOffset = this.instanceOffsets[iIndex];
			color4.toArray( this.instanceColorsArray.array, (colorOffset + index) * 4);
		}
	}

	getInstanceColorAt(iIndex, index, color4 ) {

		if (instanceColorsArray)
		{
			var colorOffset = this.instanceOffsets[iIndex];
			color4.fromArray( this.instanceColorsArray.array, (colorOffset + index) * 4);
		}
	}

	setInstanceTexcoordAt(iIndex, index, texcoord4 ) {

		if (this.instanceTexcoordsArray)
		{
			var texcoordOffset = this.instanceOffsets[iIndex];
			texcoord4.toArray( this.instanceTexcoordsArray.array, (texcoordOffset + index) * 4);
		}
	}
}

InstancedMeshEx .prototype.isInstancedMesh = true;

export { InstancedMeshEx };
