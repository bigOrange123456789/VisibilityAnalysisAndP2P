class TreeSkeleton {
  constructor(array) {
    this.positions = [];
    this.children = [];

    let offset = 0;
    // console.log(array)
    if(array){
      array.forEach((v) => {
        v.toArray(this.positions, offset);
        offset += 3;
      });
    }
  }
  add(child) {
    this.children.push(child);
  }
  setTreeObj(treeObj) {
    this.treeObj = treeObj;
  }
  getRootPosition() {
    return new THREE.Vector3().fromArray(this.positions, 0);
  }
}
export { TreeSkeleton };
