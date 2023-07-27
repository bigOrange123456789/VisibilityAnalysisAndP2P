import json
def loadJson(path):
    return json.load(open(path))
def Josn2Mesh(mesh1_):
    mesh1={
        "v":{},
        "f":{}
    }
    l=mesh1_["vId"]
    if type(mesh1_["fId"])==type([]):
     for i in range(len(mesh1_["fId"])):
        fid0=mesh1_["fId"][i]
        face0=[
            l[mesh1_["index"][3*i]],
            l[mesh1_["index"][3*i+1]],
            l[mesh1_["index"][3*i+2]]
        ]
        mesh1["f"][fid0]=face0

    for i in range(len(mesh1_["vId"])):
        vid0=mesh1_["vId"][i]
        vertex0=[
            mesh1_["position"][3*i],
            mesh1_["position"][3*i+1],
            mesh1_["position"][3*i+2],

            mesh1_["uv"][2*i],
            mesh1_["uv"][2*i+1],

            mesh1_["skinIndex"][4*i],
            mesh1_["skinIndex"][4*i+1],
            mesh1_["skinIndex"][4*i+2],
            mesh1_["skinIndex"][4*i+3],

            mesh1_["skinWeight"][4*i],
            mesh1_["skinWeight"][4*i+1],
            mesh1_["skinWeight"][4*i+2],
            mesh1_["skinWeight"][4*i+3],
        ]
        mesh1["v"][vid0]=vertex0
    return mesh1
def updateMesh(mesh1,increment):
    aI=     increment["aI"]
    aPos=   increment["aPos"]
    aUV=    increment["aUV"]
    aSkinWeight=increment["aSkinWeight"]
    aSkinIndex= increment["aSkinIndex"]

    bI=     increment["bI"]
    bPos=   increment["bPos"]
    bUV=    increment["bUV"]
    bSkinWeight=increment["bSkinWeight"]
    bSkinIndex= increment["bSkinIndex"]
    
    mesh1["v"][aI]=[
        aPos[0],
        aPos[1],
        aPos[2],

        aUV[0],
        aUV[1],

        aSkinIndex[0],
        aSkinIndex[1],
        aSkinIndex[2],
        aSkinIndex[3],

        aSkinWeight[0],
        aSkinWeight[1],
        aSkinWeight[2],
        aSkinWeight[3]
        ]
    mesh1["v"][bI]=[
        bPos[0],
        bPos[1],
        bPos[2],
        
        bUV[0],
        bUV[1],

        bSkinIndex[0],
        bSkinIndex[1],
        bSkinIndex[2],
        bSkinIndex[3],

        bSkinWeight[0],
        bSkinWeight[1],
        bSkinWeight[2],
        bSkinWeight[3]
        ]

    faceRe=increment["faceRe"]
    if not type(faceRe)==type([]):
        faceRe=[faceRe]
    for i in range(len(faceRe)):
        face0=mesh1["f"][faceRe[i]]
        for j in range(3):
            if face0[j]==aI:
                face0[j]=bI
    
    x=increment["face"]["x"]
    y=increment["face"]["y"]
    z=increment["face"]["z"]
    d=increment["face"]["d"]
    if not type(x)==type([]):
        x=[x]
        y=[y]
        z=[z]
        d=[d]
    for i in range(len(d)):
        mesh1["f"][d[i]]=[
            x[i],
            y[i],
            z[i]
            ]
    return mesh1
def processGroup(mesh1_,pack1_):
    pack1_=loadJson("data3/1.json.pack.json")
if __name__ == "__main__":#用于测试
    # pack1_json=loadJson("data3/2.json.pack.json")
    # mesh1_json=loadJson("data3/2.json")
    pack1_json=loadJson("2.json.pack.json")
    mesh1_json=loadJson("2.json")
    #5099
    for name in ["CloM_A_Xiezi_geo"]:#mesh1_json:
        print(name)
        if len(pack1_json[name])==0:
            continue
        pack1=pack1_json[name][0]
        mesh1_=mesh1_json[name]
        mesh1=Josn2Mesh(mesh1_)
        print(mesh1)
