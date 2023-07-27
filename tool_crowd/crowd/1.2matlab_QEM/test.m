
addpath('src');
m1=Mesh("data/monkey");
m2=MeshJson("data/monkey");
m2=MeshJson("test");
m2.simplify(0.5);
m2.download();
m2.downloadJson();


a=savejson('jmesh.json',[1,2;3,4]);
class(a);

