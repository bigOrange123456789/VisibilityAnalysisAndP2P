import * as THREE from "three";

const randomRangeLinear = (min, max) => {
  return Math.random() * (max - min) + min;
};

const disturbedCurveNode = (start, end, disturb, gravity) => {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const d = start.distanceTo(end);
  const l = d * disturb;
  // 不受重力影响
  if (gravity === 0) {
    mid.add(
      new THREE.Vector3(
        Math.random() * 2 * l - l,
        Math.random() * 2 * l - l,
        Math.random() * 2 * l - l
      )
    );
  }
  // 受重力影响，g与枝条长度成正比
  else {
    mid.add(
      new THREE.Vector3(
        Math.random() * 2 * l - l,
        Math.random() * l * gravity,
        Math.random() * 2 * l - l
      )
    );
  }
  return [start, mid, end];
};

const makeVector3 = (vector) => {
  return new THREE.Vector3(vector.x, vector.y, vector.z);
};

const makeVectors = (positions) => {
  // positions 是长度一定能被3整除的数组
  const vectors = [];
  let l = positions.length;
  for (let i = 0; i < l; i += 3) {
    vectors.push(new THREE.Vector3().fromArray(positions, i));
  }
  return vectors;
};


////////////////////////////////
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LeafGeometry } from "./TreeBuilder/LeafGeometry";
import { FlowerGeometry } from "./TreeBuilder/FlowerGeometry";
import { TreeSkeleton } from "./TreeBuilder/TreeSkeleton";
import { BranchTubeGeometry } from "./TreeBuilder/BranchTubeGeometry";

/*************************************************************************************
 * CLASS NAME:  TreeBuilder
 * DESCRIPTION: A novel tree editor & generator on the webpage.
 * NOTE:        I'm a piece of shit not knowing to use THREE.TubeGeometry!
 *              (Anyway, at least I tried.😂)
 *
 *************************************************************************************/
class TreeBuilder {
  constructor(
    treeObj,
    mergeLeaves = true,
    scene = null,
    verticalAxis = "y-axis"
  ) {
    this.scene = scene;
    this.treeObj = treeObj;
    this.branchGeometries = [];
    this.cnt = 0; // 叶子计数器
    this.mergeLeaves = mergeLeaves;
    if (mergeLeaves) this.matrices = [];
    if (verticalAxis === "y-axis")
      this.verticalAxis = new THREE.Vector3(0, 1, 0);
    else if (verticalAxis === "z-axis")
      this.verticalAxis = new THREE.Vector3(0, 0, 1);
  }

  init(treeObj, mergeLeaves = true, verticalAxis = "y-axis") {
    this.treeObj = treeObj;
    this.mergeLeaves = mergeLeaves;
    if (mergeLeaves) this.matrices = [];
    if (verticalAxis === "y-axis")
      this.verticalAxis = new THREE.Vector3(0, 1, 0);
    else if (verticalAxis === "z-axis")
      this.verticalAxis = new THREE.Vector3(0, 0, 1);
  }

  setModelPrecision(segment) {
    this.treeObj.segment = segment;
  }

  clearMesh() {
    this.branchGeometries = [];
    this.cnt = 0;
    if (this.mergeLeaves) this.matrices = [];
  }

  randomMatrices(
    curve,
    points,
    base_position,
    position_noise,
    base_angle,
    angle_noise,
    number
  ) {
    const matrices = [];
    let pointsLength = points.length;
    let dir;
    for (let i = 1; i <= number; i++) {
      let base = Math.floor(
        pointsLength *
          (base_position + randomRangeLinear(-position_noise, position_noise))
      );
      let position = points[base];
      let tangent = curve.getTangent(base / pointsLength);
      let orthogonal = new THREE.Vector3(
        0,
        1,
        -tangent.y / tangent.z
      ).normalize();
      if (i === 1) {
        dir = new THREE.Vector3()
          .copy(tangent)
          .applyAxisAngle(
            orthogonal,
            base_angle + randomRangeLinear(-angle_noise, angle_noise)
          )
          .applyAxisAngle(tangent, (Math.random() * Math.PI) / 2)
          .normalize();
      } else {
        dir.applyAxisAngle(tangent, (2 * Math.PI) / number).normalize();
      }
      let rot_angle = this.verticalAxis.angleTo(dir);
      let rot_axis = new THREE.Vector3()
        .crossVectors(this.verticalAxis, dir)
        .normalize();

      let trans = new THREE.Matrix4().makeTranslation(
        position.x,
        position.y,
        position.z
      );
      let rot1 = new THREE.Matrix4().makeRotationAxis(
          this.verticalAxis,
          Math.random() * 2 * Math.PI
        ), // (0,2pi)
        rot2 = new THREE.Matrix4().makeRotationAxis(rot_axis, rot_angle);
      let rot = new THREE.Matrix4().multiply(rot2).multiply(rot1);
      let matrix = new THREE.Matrix4().multiply(trans).multiply(rot);
      matrices.push(matrix);
    }
    return matrices;
  }

  buildSkeletonRec(start, end, fatherSkeleton, depth = 0) {
    if (depth > this.treeObj.depth) return;

    let disturb = depth === this.treeObj.depth ? 0 : this.treeObj.disturb;
    let gravity = this.treeObj.gravity;
    const nodes = disturbedCurveNode(
      makeVector3(start),
      makeVector3(end),
      disturb,
      gravity
    );
    const curSkeleton = new TreeSkeleton(nodes);
    fatherSkeleton.add(curSkeleton);

    const curve = new THREE.CatmullRomCurve3(nodes);
    const points = curve.getPoints(50);
    const pointsLength = points.length; // 51
    const cur_node = this.treeObj.branches[depth],
      next_node = this.treeObj.branches[depth + 1];
    if (!next_node) return;

    const fork = cur_node.fork;
    let dir, tangent;
    for (let i = 0; i < fork.length; i++) {
      for (let j = 1; j <= fork[i][6]; j++) {
        let base = Math.floor(
          pointsLength *
            (fork[i][0] + randomRangeLinear(-fork[i][1], fork[i][1]))
        );
        let s = points[base];
        if (j === 1) {
          tangent = curve.getTangent(base / pointsLength);
          let orthogonal = new THREE.Vector3(
            0,
            1,
            -tangent.y / tangent.z
          ).normalize();
          dir = new THREE.Vector3()
            .copy(tangent)
            .applyAxisAngle(
              orthogonal,
              fork[i][2] + randomRangeLinear(-fork[i][3], fork[i][3])
            )
            .applyAxisAngle(tangent, (Math.random() * Math.PI) / 2)
            .normalize();
        } else {
          dir.applyAxisAngle(tangent, (2 * Math.PI) / fork[i][6]).normalize();
        }
        let e = new THREE.Vector3().addVectors(
          s,
          dir.multiplyScalar(
            fork[i][4] + randomRangeLinear(-fork[i][5], fork[i][5])
          )
        );
        this.buildSkeletonRec(s, e, curSkeleton, depth + 1);
      }
    }
  }

  buildTreeRec(skeleton, radius, depth = 0) {
    if (depth > this.treeObj.depth) return;

    // radius = radius <= 0.1 ? 0.1 : radius;
    const vectors = makeVectors(skeleton.positions);
    const curve = new THREE.CatmullRomCurve3(vectors);
    const curveLength = vectors[0].distanceTo(vectors.at(-1));
    const points = curve.getPoints(50);
    const { tubular_segments, radial_segments, sample_offset } = this.treeObj; // 树干分成的段数

    if (skeleton.children.length === 0) {
      // 叶子节点
      const leaves = this.treeObj.branches.at(-1).leaves;
      for (let i = 0; i < leaves.length; i++) {
        let matrices = this.randomMatrices(
          curve,
          points,
          leaves[i][0],
          leaves[i][1],
          leaves[i][2],
          leaves[i][3],
          leaves[i][4]
        );
        if (this.mergeLeaves) this.matrices.push(...matrices);
      }
    }

    const branchGeometry = new BranchTubeGeometry(
      curve,
      tubular_segments,
      radius,
      radial_segments,
      false,
      ((1 - this.treeObj.shrink.single) * radius) / tubular_segments,
      curveLength * sample_offset
    );
    this.branchGeometries.push(branchGeometry);
    skeleton.children.forEach((child) => {
      this.buildTreeRec(child, radius * this.treeObj.shrink.multi, depth + 1);
    });
  }

  buildKmeansSkeletonRec(
    data,
    fatherSkeleton,
    baseZ = 0,
    startArray = [],
    depth = 0
  ) {
    let totalDepth = this.treeObj.depth;
    if (depth > totalDepth || data.length < 100) return;

    let centroids, clusters ;
    let l = centroids.length;
    let startVector, centroidVector, endVector;
    let disturb = this.treeObj.disturb,
      gravity = this.treeObj.gravity,
      fork_min = this.treeObj.branches[depth].fork.min,
      fork_max = this.treeObj.branches[depth].fork.max;

    for (let i = 0; i < l; i += 3) {
      let nextStartArray = [];
      centroidVector = new THREE.Vector3().fromArray(centroids, i);
      startVector =
        startArray.length > 0
          ? startArray[i / 3]
          : new THREE.Vector3(centroidVector.x, centroidVector.y, baseZ);
      endVector = new THREE.Vector3()
        .addVectors(startVector, centroidVector)
        .divideScalar(2);
      if (depth === totalDepth)
        endVector.setX(centroidVector.x).setY(centroidVector.y);

      // 存储骨架
      let treeNodes = disturbedCurveNode(
        startVector,
        endVector,
        disturb,
        gravity
      );
      let curSkeleton = new TreeSkeleton(treeNodes);
      fatherSkeleton.add(curSkeleton);

      // 生成下次递归的开始节点
      if (depth + 1 <= totalDepth) {
        let curve = new THREE.CatmullRomCurve3(treeNodes);
        let points = curve.getPoints(50);
        let pointsLength = points.length;
        for (let j = 0; j < this.treeObj.branches[depth + 1].number; j++) {
          let base = Math.floor(
            pointsLength * randomRangeLinear(fork_min, fork_max)
          );
          nextStartArray.push(points[base]);
        }
      }

      this.buildKmeansSkeletonRec(
        clusters.get(i / 3),
        curSkeleton,
        baseZ,
        nextStartArray,
        depth + 1
      );
    }
  }

  // public
  buildSkeleton() {
    const { treeObj } = this;
    const trunk = treeObj.branches[0];
    const treeSkeleton = new TreeSkeleton();
    this.buildSkeletonRec(trunk.start, trunk.end, treeSkeleton);
    treeSkeleton.setTreeObj(treeObj);
    return treeSkeleton;
  }

  // public
  buildKmeansSkeleton(data, baseZ) {
    const { treeObj } = this;
    const treeSkeleton = new TreeSkeleton();
    this.buildKmeansSkeletonRec(data, treeSkeleton, baseZ);
    treeSkeleton.setTreeObj(treeObj);
    return treeSkeleton;
  }

  // public
  buildTree(skeleton) {
    if (skeleton.children.length === 0) return;
    const { treeObj, branchGeometries, mergeLeaves, matrices, verticalAxis } =
      this;

    const loader = new THREE.TextureLoader();
    const g = treeObj.leaf.geometry;
    let flowerMaterial, leafMaterial, flowerTexture, leafTexture;
    const tree = new THREE.Group();

    if (treeObj.flower) {
      flowerTexture = loader.load(treeObj.path + "flower_base.png");
      flowerTexture.colorSpace = THREE.SRGBColorSpace;
      flowerMaterial = new THREE.MeshLambertMaterial({
        map: flowerTexture,
        side: THREE.DoubleSide,
        alphaTest: treeObj.leaf.alphaTest,
      });
    }
    leafTexture = loader.load(treeObj.path + "leaf_base.png");
    leafTexture.colorSpace = THREE.SRGBColorSpace;
    leafMaterial = new THREE.MeshLambertMaterial({
      map: leafTexture,
      // map: loader.load(treeObj.path + "leaf_base_standard.png"),
      // normalMap: loader.load(treeObj.path + "leaf_normal_standard.png"),
      side: THREE.DoubleSide,
      alphaTest: treeObj.leaf.alphaTest,
    });

    // 1. 实例化方式做树叶，递归函数前创建mesh
    // if (!mergeLeaves) {
    //   this.leaf = new THREE.InstancedMesh(
    //     new Leaf(
    //       g.style,
    //       g.width,
    //       g.height,
    //       treeObj.leaves.scale,
    //       g.foldDegree,
    //       verticalAxis
    //     ).generate(),
    //     leafMaterial,
    //     treeObj.leaves.total
    //   );
    // }

    // 2. 执行递归
    const trunk = treeObj.branches[0];
    this.buildTreeRec(skeleton.children[0], trunk.radius);

    // 3. 合并方式做树叶，递归函数后创建mesh
    if (mergeLeaves) {
      const leafGeometries = [];
      matrices.forEach((matrix) => {
        leafGeometries.push(
          new LeafGeometry(
            g.style,
            g.width,
            g.height,
            g.foldDegree,
            verticalAxis
          )
            .generate()
            .scale(treeObj.leaf.scale, treeObj.leaf.scale, treeObj.leaf.scale)
            .applyMatrix4(matrix)
        );
      });
      const mergedLeavesGeometry = mergeGeometries(leafGeometries, false);
      this.leaf = new THREE.Mesh(mergedLeavesGeometry, leafMaterial);
      tree.add(this.leaf);

      if (treeObj.flower) {
        const flowerGeometries = [];
        matrices.forEach((matrix) => {
          flowerGeometries.push(
            new FlowerGeometry()
              .generate()
              .scale(
                treeObj.flower.scale,
                treeObj.flower.scale,
                treeObj.flower.scale
              )
              .translate(0, 0.12, 0)
              .applyMatrix4(matrix)
          );
        });
        const mergedFlowersGeometry = mergeGeometries(flowerGeometries, false);
        this.flower = new THREE.Mesh(mergedFlowersGeometry, flowerMaterial);

        tree.add(this.flower);
      }
    }

    // 4. 枝干
    const twigGeometry = mergeGeometries(branchGeometries, false);
    // const treeTexture = loader.load(treeObj.path + "tree_base_standard.png");
    const twigTexture = loader.load(treeObj.path + "tree_base.png");
    twigTexture.colorSpace = THREE.SRGBColorSpace;
    // const treeNormalTexture = loader.load(
    //   treeObj.path + "tree_normal_standard.png"
    // );
    twigTexture.wrapS = /*treeNormalTexture.wrapS =*/ THREE.RepeatWrapping;
    twigTexture.repeat.set(2, 1);
    // treeNormalTexture.repeat.set(2, 1);
    const twigMaterial = new THREE.MeshLambertMaterial({
      map: twigTexture,
      // wireframe: true,
      // normalMap: treeNormalTexture,
    });
    const twig = new THREE.Mesh(twigGeometry, twigMaterial);
    tree.add(twig);
    return tree;
  }
}

export { TreeBuilder };
