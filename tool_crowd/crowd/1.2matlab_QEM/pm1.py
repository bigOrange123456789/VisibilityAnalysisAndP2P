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
        # print(faceRe[i],mesh1["f"][faceRe[i]])
        # print(faceRe[i],type(faceRe[i]))
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
def judge0(mesh1,mesh2):#(path1,path2):
    
    # mesh1=loadJson(path1)
    # mesh2=loadJson(path2)
    # mesh1=Josn2Mesh(mesh1_json["CloM_A_Eye_lash_geo"])
    # mesh2=Josn2Mesh(mesh2_json["CloM_A_Eye_lash_geo"])
    # print( all(mesh1==mesh2) )
    # print(mesh1)
    # mesh1=Josn2Mesh(mesh1)
    # mesh2=Josn2Mesh(mesh2)
    v1=mesh1["v"]
    v2=mesh2["v"]
    f1=mesh1["f"]
    f2=mesh2["f"]
    for i in v1:
        if not i in v2:
            print(i)
            print(v1[i])
            print(v2[i])
            return "False ( not i in v2 ),  i:"+str(i)
        d1=v1[i]
        d2=v2[i]
        # print(d1,d2)
        if not len(d1)==len(d2):
            return False
        for j in range(len(d1)):
            if not d1[j]==d2[j]:
                return "False ( not d1[j]==d2[j] ),  i:"+str(i)
    for i in f1:
        d1=f1[i]
        if not i in f2:
            return "False not i in f2,  i:"+str(i)
        d2=f2[i]
        if not len(d1)==len(d2):
            return False
        for j in range(len(d1)):
            if not d1[j]==d2[j]:
                print("f",i,j)
                return False
    return True
def judge(path1,path2):
    group1=loadJson(path1)
    group2=loadJson(path2)
    # mesh1=Josn2Mesh(mesh1_json["CloM_A_Eye_lash_geo"])
    # mesh2=Josn2Mesh(mesh2_json["CloM_A_Eye_lash_geo"])
    # print( all(mesh1==mesh2) )
    for name in group1:
        if name in group2:
            mesh1=group1[name]
            mesh2=group2[name]
            jud=judge0(mesh1,mesh2)
            if not jud:
                return False
            print(name,jud)
        else:
            print("group2 have not "+name)
            return False
    return True

def keys(obj):
    result=[]
    for i in obj:
        result.append(i)
    return result
def values(obj):
    result=[]
    for i in obj:
        result.append(obj[i])
    return result
def toJson(mesh):
        data={
            "position":[],
            "uv":[],
            "skinWeight":[],
            "skinIndex":[],
            "index":[]
        }
        v_id=keys(mesh['v'])
        v=values(mesh['v'])
        f=values(mesh['f'])
        l={}
        for i in range(len(v)):
            v0=v[i]
            l[v_id[i]]=i
            data['position'].append(v0[0])
            data['position'].append(v0[1])
            data['position'].append(v0[2])

            data['uv'].append(v0[3])
            data['uv'].append(v0[4])

            data['skinIndex'].append(v0[5])
            data['skinIndex'].append(v0[6])
            data['skinIndex'].append(v0[7])
            data['skinIndex'].append(v0[8])

            data['skinWeight'].append(v0[9])
            data['skinWeight'].append(v0[10])
            data['skinWeight'].append(v0[11])
            data['skinWeight'].append(v0[12])
        for i in range(len(f)):
            for j in range(3):
                # print(i,j,f[i][j])
                if f[i][j] in l:
                    elem=l[f[i][j]]
                    data['index'].append(elem)
                else:
                    print("error:f[i][j] ",f[i][j])
        return data
    

def compute(index0):
    getReal(index0)
    pack1_json=loadJson("data2/"+str(index0)+".json.pack.json")
    mesh1_json=loadJson("data2/"+str(index0)+".json")
    # group1={}
    group2={}
    group3={}
    print(index0)
    for name in mesh1_json:#['CloM_A_head_geo']:#
        if len(pack1_json[name])==0:
            continue
        # print("pack1_json[name]:",pack1_json[name])
        pack1=pack1_json[name]#[0]
        if type(pack1)==type([]):
            pack1=pack1[0]
        else:
            pack1=[pack1]
        mesh1_=mesh1_json[name]
        # print(index0,name,mesh1_)
        mesh1=Josn2Mesh(mesh1_)
        # group1[name]=mesh1#group1[name]=toJson(mesh1)#json.dump(mesh1,open("data2/pm.py"+str(index0)+"_real.json","w"), indent=4, ensure_ascii=False)
        for i in range(len(pack1)):
            p=pack1[len(pack1)-1-i]

            mesh1=updateMesh(mesh1,p)
        group2[name]=mesh1#group2[name]=toJson(mesh1)#json.dump(mesh1,open("data2/pm.py"+str(index0+1)+"_predict.json","w"), indent=4, ensure_ascii=False)
        group3[name]=toJson(mesh1)
        # print(mesh1["f"][5590])
    # json.dump(group1,open("data2/pm.py"+str(index0)+"_real.json","w"), indent=4, ensure_ascii=False)
    json.dump(group2,open("data2/pm.py"+str(index0+1)+"_predict.json","w"), indent=4, ensure_ascii=False)

    json.dump(group3,open("data3/"+str(index0+1)+".json","w"), indent=4, ensure_ascii=False)
def loadGroup(index0):
    mesh1_json=loadJson("data2/"+str(index0)+".json")
    group2={}
    for name in mesh1_json:#['CloM_A_head_geo']:#
        mesh1_=mesh1_json[name]
        mesh1=Josn2Mesh(mesh1_)
        group2[name]=mesh1
    return group2


def compute2(index0,group2):
    pack1_json=loadJson("data2/"+str(index0)+".json.pack.json")
    # group1={}
    # group2={}
    group3={}
    print(index0)
    for name in group2:#['CloM_A_head_geo']:#
        if len(pack1_json[name])==0:
            continue
        # print("pack1_json[name]:",pack1_json[name])
        pack1=pack1_json[name]#[0]
        if type(pack1)==type([]):
            pack1=pack1[0]
        else:
            pack1=[pack1]
        # print(index0,name,mesh1_)
        mesh1=group2[name]
        # group1[name]=mesh1#group1[name]=toJson(mesh1)#json.dump(mesh1,open("data2/pm.py"+str(index0)+"_real.json","w"), indent=4, ensure_ascii=False)
        for i in range(len(pack1)):
            p=pack1[len(pack1)-1-i]
            mesh1=updateMesh(mesh1,p)
        group2[name]=mesh1
        group3[name]=toJson(mesh1)
        # print(mesh1["f"][5590])
    # json.dump(group1,open("data2/pm.py"+str(index0)+"_real.json","w"), indent=4, ensure_ascii=False)
    # print(group2)
    json.dump(group2,open("data2/pm.py"+str(index0+1)+"_predict.json","w"), indent=4, ensure_ascii=False)

    json.dump(group3,open("data3/"+str(index0+1)+".json","w"), indent=4, ensure_ascii=False)
    return group2
def getReal(index0):
    mesh1_json=loadJson("data2/"+str(index0)+".json")
    group1={}
    for name in mesh1_json:#['CloM_A_head_geo']:#
        mesh1_=mesh1_json[name]
        mesh1=Josn2Mesh(mesh1_)
        group1[name]=mesh1
        # print(mesh1["f"][5590])
    json.dump(group1,open("data2/pm.py"+str(index0)+"_real.json","w"), indent=4, ensure_ascii=False)

def test1():
    group2=loadGroup(2)
    # print(group2)
    for j in [  2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19 ]:
        # print(group2)
        group2=compute2(j,group2)

    # for j in [  3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19  ]:
    #     jud=judge(
    #         "data2/pm.py"+str(j)+"_real.json",
    #         "data2/pm.py"+str(j)+"_predict.json")
    #     print(j,jud)
def test2():
    for j in [  1,2 ]:
         compute(j)
    for j in [  2  ]:
        print(j)
        jud=judge(
            "data2/pm.py"+str(j)+"_real.json",
            "data2/pm.py"+str(j)+"_predict.json")
        print(jud)
if __name__ == "__main__":#用于测试
    test1()
    # compute(1)
    # getReal(1)
    # getReal(2)
    # for j in [  2  ]:
    #     print(j)
    #     judge(
    #         "data2/pm.py"+str(j)+"_real.json",
    #         "data2/pm.py"+str(j)+"_predict.json")
