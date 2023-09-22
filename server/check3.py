pathpre ="./vd_data/KaiLiNan_new2/"
pathpre2="./vd_data/KaiLiNan_new4/"
import json
import os
import math
import time as t
noload=json.load(open("noload.json"))
noload2={}
for i in range(4000):
    noload2[i]=False
for i in noload:
    noload2[int(i)]=True
# print(noload2)

t00=t.time()
def mkdir(path):
    if not os.path.exists(path):
        os.makedirs(path) 

jsonPathErr=[]
def getJson(path):
    try:
        return json.load(
            open(path,"r")
        )
    except Exception as e:
        print("无法解析的json文件:",path,e)
        jsonPathErr.append(path)#exit(0)
def saveJson(path,data):
    json.dump(
        data,
        open(path,"w")
    )
def isNull(path):
    if os.path.getsize(path)==0:
        jsonPathErr.append(path)#exit(0)
config=getJson(pathpre+"config.json")
# print(config)
t0=t.time()
print(int(t0-t00))
print("1.开始检验数据的完整性")
def getName(config,i1,i2,i3):
    min=config["min"]
    step=config["step"]
    max=config["max"]
    x0=min[0]+(max[0]-min[0])*i1/step[0]
    y0=min[1]+(max[1]-min[1])*i2/step[1]
    z0=min[2]+(max[2]-min[2])*i3/step[2]
    if math.floor(x0)==x0:x0=int(x0)
    if math.floor(y0)==y0:y0=int(y0)
    if math.floor(z0)==z0:z0=int(z0)
    return str(x0)+","+str(y0)+","+str(z0)
def check(config):
    orderMin=2
    orderMax=-1
    numNoExists=0
    step=config["step"]
    flag_nopath=False
    for i1 in range(step[0]+1):
        print(i1,"\t",step[0]+1,end="\r")
        for i2 in range(step[1]+1):
            for i3 in range(step[2]+1):
                path=pathpre+getName(config,i1,i2,i3)+".json"
                file_exists=os.path.exists(path)
                if not file_exists:
                    A=step[0]+1
                    B=step[1]+1
                    C=step[2]+1
                    order=i1+A*i2+A*B*i3
                    orderAll=A*B*C
                    if (order/orderAll)<orderMin:orderMin=(order/orderAll)
                    if (order/orderAll)>orderMax:orderMax=(order/orderAll)
                    print("文件不存在:",path,order,order/orderAll)
                    numNoExists+=1
                    flag_nopath=True
                else:
                    isNull(path)#data[path]=getJson(path)
                    with open(path) as f:
                        json_data = json.load(f)
                        position = {}
                        if True:#
                            def test(d):
                                if d==None:
                                    return {}
                                d2={}
                                for i in d:
                                    if not noload2[int(i)]:
                                        d2[i]=float('{:.2e}'.format(d[i]))#d[i]
                                return d2
                            position[str(1)]=test(json_data[str(1)])
                            position[str(2)]=test(json_data[str(2)])

                            position[str(3)]=test(json_data[str(3)])
                            position[str(4)]=test(json_data[str(4)])

                            position[str(5)]=test(json_data[str(5)])
                            position[str(6)]=test(json_data[str(6)])
                            with open(pathpre2+getName(config,i1,i2,i3)+".json", 'w') as f2:
                                json.dump(position, f2)
                                f2.close()
                        
    print("已检测完全部构件     ")
    print("orderMin:",orderMin)
    print("orderMax:",orderMax)
    print("不存在的文件数量为:",numNoExists)
    if len(jsonPathErr)==0:
        print("没有空的json文件")
    else:
        print("无法解析的json文件数量为:",len(jsonPathErr))
        saveJson("jsonPathErr.json",jsonPathErr)
        exit(0)
    if not flag_nopath:
        print("没有缺失的文件")
check(config)
t1=t.time()
print("本次检测耗时:",int(t1-t0))
