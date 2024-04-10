import { Vector3 } from '../math/Vector3.js';
import { Vector2 } from '../math/Vector2.js';
import { Box3 } from '../math/Box3.js';
import { EventDispatcher } from './EventDispatcher.js';
import { BufferAttribute, Float32BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute } from './BufferAttribute.js';
import { Sphere } from '../math/Sphere.js';
import { Object3D } from './Object3D.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Matrix3 } from '../math/Matrix3.js';
import * as MathUtils from '../math/MathUtils.js';
import { arrayMax } from '../utils.js';
import { BufferGeometry } from './BufferGeometry.js';

let _id = 0;

const _m1 = /*@__PURE__*/ new Matrix4();
const _obj = /*@__PURE__*/ new Object3D();
const _offset = /*@__PURE__*/ new Vector3();
const _box = /*@__PURE__*/ new Box3();
const _boxMorphTargets = /*@__PURE__*/ new Box3();
const _vector = /*@__PURE__*/ new Vector3();

class BufferGeometryEx extends BufferGeometry {

	constructor() {

		super();
	}

	addGroupInstanced ( start, count, materialIndex , instanceIndex, invisible = false) {

		this.groups.push( {
			start: start,
			count: count,
			materialIndex: materialIndex !== undefined ? materialIndex : 0,
			instanceIndex: instanceIndex,
			invisible: invisible
		} );
	}

	setGroupBufferStart(instanceIndex, _start) 
	{
		this.groups[instanceIndex].start = _start;
	}

	setGroupBufferCount(instanceIndex, _count) 
	{
		this.groups[instanceIndex].count = _count;
	}

	setGroupInvisible ( instanceIndex, invisible = false) 
	{
		this.groups[instanceIndex].invisible = invisible;
	}

}

BufferGeometryEx.prototype.isBufferGeometry = true;

export { BufferGeometryEx };
