import json

print("1.获取smatrix")
def get_smatrix():
        smatrix={}
        path="0.files/smatrix.json"
        j=json.load(
            open(path)
        )
        print(path,len(j.values()))
        for i in j:
            # smatrix[i]=j[i]
            smatrix[int(i)]=[#将json格式转换为数组格式
                j[i]["id"],
                j[i]["it"]
            ]
        return smatrix
smatrix=get_smatrix()
'''
smatrix.json
[number]
    {
        "id":
        "it":矩阵
    }
structdesc.json
"name"
"start"
"close"
'''

print("2.获取structdesc")
def get_structdesc():
    structdesc=[]

    path="0.files/structdesc.json"
    j=json.load(
            open(path)
    )
    for j0 in j:
            structdesc.append(j0)
    print(path,len(j),len(structdesc))
    #开始删除i
    structdesc_sim=[]
    for i1 in structdesc:
        row=[]#.append([])
        for i2 in i1:
            row.append({
                "n":i2["n"],
                "s":i2["s"],
                "c":i2["c"]
            })
        structdesc_sim.append(row)
    return structdesc_sim
structdesc=get_structdesc()

print("3.计算meshesConfig")
def get_meshesConfig(structdesc,smatrix):
    meshesConfig=[]
    for structdesc0 in structdesc:
        # structdesc0
        matrixConfig={}
        for i in structdesc0:
            name=i["n"]
            matrixConfig[name]=smatrix[int(name)]
        meshesConfig.append({
            "matrixConfig":matrixConfig,
            "structdesc0":structdesc0
        })
    return meshesConfig
meshesConfig=get_meshesConfig(structdesc,smatrix)

print("4.保存meshesConfig")
import os
def mkdir(path):
    if not os.path.exists(path):
        os.makedirs(path) 
def save_meshesConfig(path0,meshesConfig):
    mkdir(path0)
    index=0
    for meshConfig in meshesConfig:
        mkdir(path0+"/"+str(index))
        json.dump(
            meshConfig,
            open(path0+"/"+str(index)+"/"+str(index)+".json","w")
        )
        index=index+1

# print("5.保存实例化matrix")
# def save_meshesConfig2(path0,meshesConfig):
#     mkdir(path0)
#     index=0
#     for meshConfig in meshesConfig:
#         mkdir(path0+"/"+str(index))
#         matrixConfig=meshConfig["matrixConfig"]
#         structdesc0=meshConfig["structdesc0"]
#         # print(meshConfig)
#         if len(structdesc0)==0:
#             matrices=[]
#         else:
#             id=structdesc0[0]["n"]
#             matrices=matrixConfig[id][1]
#         json.dump(
#             matrices,
#             open(path0+"/"+str(index)+"/.json","w")
#         )
#         index=index+1

save_meshesConfig("out2",meshesConfig)
# print("5.简化meshesConfig.")
# mkdir("meshesConfig_sim")
# index=0
# for meshConfig in meshesConfig:
#     json.dump(
#         meshConfig,
#         open("meshesConfig/"+str(index)+".json","w")
#     )
#     index=index+1
print("finish")