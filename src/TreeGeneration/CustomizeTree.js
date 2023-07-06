import * as THREE from "three";
/*************************************************************************************
 * CLASS NAME:  CustomizeTree
 * DESCRIPTION: 整合各种treeObj
 * NOTE:
 *
 *************************************************************************************/
class CustomizeTree {
  constructor() {
    this.indices = new Map([
      ["普通乔木", 0],
      ["桂花", 1],
      ["国槐", 2],
      ["木芙蓉", 3],
      ["海棠", 4],
      ["红枫", 5],
      ["红果冬青", 6],
      ["鸡蛋花", 7],
      ["柳树", 8],
      ["香樟", 9],
      ["TEST", 10],
    ]);
    this.content = [
      {
        name: "普通乔木",
        path: "resources/images/fgwt/",
        depth: 2,
        disturb: 0.01,
        gravity: 10,
        shrink: { single: 0.3, multi: 0.3, root: true },
        tubular_segments: 10,
        radial_segments: 6,
        sample_offset: 0.005,
        leaf: {
          geometry: { style: "cross", width: 1, height: 1 },
          scale: 2,
          alphaTest: 0.5,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 10, 0),
            radius: 0.3,
            fork: [
              // [ fork_position, noise1, fork_angle, noise2, next_level_length, noise3, number ]
              [0.4, 0.05, Math.PI / 2.5, Math.PI / 36, 4, 0.5, 5],
              [0.5, 0.04, Math.PI / 3, 0, 3, 0.5, 4],
              [0.6, 0.04, Math.PI / 5, 0, 3, 0.5, 4],
              [0.7, 0.03, Math.PI / 6, 0, 3, 0.5, 3],
              [0.9, 0, 0, 0, 2, 1, 1],
            ],
          },
          // middle node
          {
            fork: [
              [0.5, 0.1, Math.PI / 5, Math.PI / 36, 2, 0.5, 2],
              [0.8, 0.1, Math.PI / 5, 0, 1, 0.5, 2],
            ],
          },
          // leaf node
          {
            leaves: [
              // [ leaves_position, noise1, leaves_angle, noise2, number]
              [0.6, 0.4, Math.PI / 5, 0, 3],
            ],
          },
        ],
      },
      {
        name: "桂花",
        path: "resources/images/guihua/",
        depth: 4,
        disturb: 0.02,
        gravity: 0,
        shrink: { single: 0.4, multi: 0.5, root: true },
        tubular_segments: 5,
        radial_segments: 6,
        sample_offset: 0.01,
        leaf: {
          geometry: { style: "cross", width: 1, height: 1 },
          scale: 0.8,
          alphaTest: 0.5,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 8, 0),
            radius: 0.3,
            fork: [[0.6, 0.3, Math.PI / 5, Math.PI / 36, 4, 0.5, 5]],
          },
          // middle node
          {
            fork: [[0.5, 0.4, Math.PI / 6, 0, 3, 0.5, 5]],
          },
          {
            fork: [[0.5, 0.4, Math.PI / 6, 0, 2, 0.5, 2]],
          },
          {
            fork: [[0.5, 0.4, Math.PI / 6, 0, 1, 0.5, 3]],
          },
          // leaf node
          {
            leaves: [[0.8, 0.2, Math.PI / 6, 0, 5]],
          },
        ],
      },
      {
        name: "国槐",
        path: "resources/images/guohuai/",
        depth: 5,
        disturb: 0.02,
        gravity: 2,
        shrink: { single: 0.4, multi: 0.4, root: true },
        tubular_segments: 5,
        radial_segments: 6,
        sample_offset: 0.01,
        leaf: {
          geometry: { style: "cross", width: 0.5, height: 1, foldDegree: 0.3 },
          scale: 0.6,
          alphaTest: 0.5,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 10, 0),
            radius: 0.5,
            fork: [
              [0.5, 0.1, Math.PI / 4, Math.PI / 36, 4, 0.5, 3],
              [0.8, 0.1, Math.PI / 4, Math.PI / 36, 4, 0.5, 3],
              [0.9, 0, 0, 0, 3, 0.5, 1],
            ],
          },
          // middle node
          {
            fork: [[0.6, 0.2, Math.PI / 5, Math.PI / 36, 3, 0.5, 3]],
          },
          {
            fork: [[0.6, 0.2, Math.PI / 5, Math.PI / 36, 2, 0.5, 3]],
          },
          {
            fork: [[0.6, 0.3, Math.PI / 5, Math.PI / 36, 1, 0.5, 3]],
          },
          {
            fork: [[0.5, 0.4, Math.PI / 5, Math.PI / 36, 0.5, 0.2, 3]],
          },
          // leaf node
          {
            leaves: [[0.5, 0.4, Math.PI / 6, 0, 5]],
          },
        ],
      },

      {
        name: "木芙蓉",
        path: "resources/images/mufurong/",
        depth: 4,
        disturb: 0.03,
        gravity: 10,
        shrink: { single: 0.2, multi: 0.45, root: false },
        tubular_segments: 10,
        radial_segments: 4,
        sample_offset: 0,
        leaf: {
          geometry: {
            style: "surround",
            width: 1,
            height: 1,
          },
          scale: 0.15,
          alphaTest: 0.5,
        },
        flower: {
          scale: 0.08,
          alphaTest: 0.5,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, -0.1, 0),
            end: new THREE.Vector3(0, 0, 0),
            radius: 0.3,
            fork: [[0.7, 0.1, Math.PI / 11, Math.PI / 36, 3, 0.5, 4]],
          },
          // middle node
          {
            fork: [[0.7, 0.2, Math.PI / 6, Math.PI / 36, 2, 0.5, 3]],
          },
          {
            fork: [[0.7, 0.2, Math.PI / 6, Math.PI / 36, 1, 0.5, 3]],
          },
          {
            fork: [[0.7, 0.2, Math.PI / 6, Math.PI / 36, 0.8, 0.2, 3]],
          },
          // leaf node
          {
            leaves: [[0.7, 0.3, Math.PI / 3, 0, 3]],
          },
        ],
      },
      {
        name: "海棠",
        depth: 4,
        disturb: 0.15,
        gravity: 0,
        shrink: { single: 0.85, multi: 0.45, root: true },
        segment: 10,
        angle: Math.PI / 2,
        leaves: {
          total: 3240,
          each: 20,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 100, 0),
            radius: 3,
            fork: { min: 0.2, max: 0.8 },
          },
          // middle node
          {
            number: 6,
            length: { min: 50, max: 60 },
            fork: { min: 0.1, max: 0.8 },
          },
          {
            number: 3,
            length: { min: 45, max: 55 },
            fork: { min: 0.1, max: 0.9 },
          },
          {
            number: 3,
            length: { min: 20, max: 30 },
            fork: { min: 0.1, max: 0.9 },
          },
          // leaf node
          {
            number: 3,
            length: { min: 5, max: 10 },
          },
        ],
      },
      {
        name: "红枫",
        path: "resources/images/hongfeng/",
        depth: 4,
        disturb: 0.05,
        gravity: -2,
        shrink: { single: 0.85, multi: 0.45, root: true },
        segment: 5,
        angle: Math.PI / 4,
        leaves: {
          geometry: { style: "classic", width: 1, height: 1, foldDegree: 0 },
          scale: 1,
          total: 3240,
          each: 10,
          alphaTest: 0.5,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 6, 0),
            radius: 0.5,
            fork: { min: 0.7, max: 0.9 },
          },
          // middle node
          {
            number: 5,
            length: { min: 2, max: 3 },
            fork: { min: 0.8, max: 0.9 },
          },
          {
            number: 3,
            length: { min: 1, max: 2 },
            fork: { min: 0.7, max: 0.9 },
          },
          {
            number: 6,
            length: { min: 2, max: 3 },
            fork: { min: 0.4, max: 0.9 },
          },
          // leaf node
          {
            number: 3,
            length: { min: 1, max: 2 },
            fork: { min: 0.1, max: 1 },
          },
        ],
      },
      {
        name: "红果冬青",
        depth: 4,
        disturb: 0.1,
        gravity: 3,
        shrink: { single: 0.9, multi: 0.45, root: true },
        segment: 10,
        angle: Math.PI / 4,
        leaves: {
          total: 3240,
          each: 20,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 20, 0),
            radius: 1.5,
            fork: { min: 0.8, max: 1 },
          },
          // middle node
          {
            number: 5,
            length: { min: 5, max: 10 },
            fork: { min: 0.8, max: 0.9 },
          },
          {
            number: 3,
            length: { min: 20, max: 25 },
            fork: { min: 0.1, max: 0.6 },
          },
          {
            number: 3,
            length: { min: 10, max: 15 },
            fork: { min: 0.1, max: 0.6 },
          },
          // leaf node
          {
            number: 3,
            length: { min: 5, max: 10 },
          },
        ],
      },
      {
        name: "鸡蛋花",
        depth: 6,
        disturb: 0.05,
        gravity: -4,
        shrink: { single: 0.9, multi: 0.4, root: true },
        segment: 10,
        angle: Math.PI / 3,
        geometry: "sphere",
        leaves: {
          total: 3240,
          each: 20,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 10, 0),
            radius: 1,
            fork: { min: 0.8, max: 1 },
          },
          // middle node
          {
            number: 6,
            length: { min: 5, max: 10 },
            fork: { min: 0.8, max: 1 },
          },
          {
            number: 2,
            length: { min: 5, max: 8 },
            fork: { min: 0.8, max: 1 },
          },
          {
            number: 2,
            length: { min: 5, max: 8 },
            fork: { min: 0.1, max: 0.6 },
          },
          {
            number: 2,
            length: { min: 5, max: 8 },
            fork: { min: 0.1, max: 0.6 },
          },
          {
            number: 2,
            length: { min: 5, max: 8 },
            fork: { min: 0.1, max: 0.6 },
          },
          // leaf node
          {
            number: 2,
            length: { min: 5, max: 7 },
          },
        ],
      },
      {
        name: "柳树",
        depth: 4,
        disturb: 0.1,
        gravity: 5,
        shrink: { single: 0.95, multi: 0.3, root: true },
        segment: 15,
        angle: Math.PI / 3,
        leaves: {
          total: 3240,
          each: 20,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 20, 0),
            radius: 2,
            fork: { min: 0.5, max: 0.8 },
          },
          // middle node
          {
            number: 6,
            length: { min: 10, max: 15 },
            fork: { min: 0.5, max: 0.8 },
          },
          {
            number: 4,
            length: { min: 5, max: 8 },
            fork: { min: 0.8, max: 1 },
          },
          {
            number: 4,
            length: { min: 10, max: 20 },
            fork: { min: 0.1, max: 0.8 },
          },
          // leaf node
          {
            number: 4,
            length: { min: 0.5, max: 1 },
          },
        ],
      },
      {
        name: "香樟",
        path: "resources/images/xiangzhang/",
        depth: 4,
        disturb: 0.1,
        gravity: 0,
        shrink: { single: 0.95, multi: 0.5, root: true },
        segment: 10,
        angle: Math.PI / 2,
        leaves: {
          geometry: {
            style: "cross_and_reverse",
            width: 1,
            height: 1,
            foldDegree: 0.3,
          },
          scale: 2.5,
          total: 1000,
          each: 10,
          alphaTest: 0.3,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 5, 0),
            radius: 0.6,
            fork: { min: 0.8, max: 1 },
          },
          // middle node
          {
            number: 4,
            length: { min: 5, max: 6 },
            fork: { min: 0.5, max: 1 },
          },
          {
            number: 2,
            length: { min: 3, max: 4 },
            fork: { min: 0.5, max: 1 },
          },
          {
            number: 2,
            length: { min: 2, max: 3 },
            fork: { min: 0.1, max: 1 },
          },
          // leaf node
          {
            number: 2,
            length: { min: 1, max: 2 },
            fork: { min: 0.1, max: 1 },
          },
        ],
      },
      {
        name: "TEST",
        path: "resources/images/xiangzhang/",
        depth: 5,
        disturb: 0,
        gravity: 0,
        shrink: { single: 0.95, multi: 0.5, root: true },
        segment: 10,
        angle: Math.PI / 3,
        leaves: {
          geometry: {
            style: "cross_and_reverse",
            width: 1,
            height: 1,
            foldDegree: 0.3,
          },
          scale: 1.5,
          total: 1000,
          each: 5,
          alphaTest: 0.3,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 10, 0),
            radius: 0.6,
            fork: { min: 0.5, max: 1 },
          },
          // middle node
          {
            number: 4,
            length: { min: 5, max: 6 },
            fork: { min: 0.5, max: 1 },
          },
          {
            number: 4,
            length: { min: 3, max: 4 },
            fork: { min: 0.5, max: 1 },
          },
          {
            number: 2,
            length: { min: 2, max: 3 },
            fork: { min: 0.1, max: 1 },
          },
          // leaf node
          {
            number: 2,
            length: { min: 1, max: 2 },
            fork: { min: 0.1, max: 1 },
          },
          {
            number: 2,
            length: { min: 0.5, max: 1 },
            fork: { min: 0.1, max: 1 },
          },
        ],
      },
    ];
  }

  getTree(name) {
    const { indices, content } = this;
    const id = indices.get(name);
    return content[id];
  }
}

export { CustomizeTree };
