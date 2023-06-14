
import json
import os
import pandas as pd
class pack:
    def __init__(self,config):
        self.time0=config['time0']
        self.size=config['size']
        self.vd=config['vd']
        self.id=config['id']
        self.order=config['order']
        self.time1=-1#receive
        self.time2=-1
    def p(self):
        print("size:",self.size,"\ttime1:",self.time1,"\ttime2",self.time2)
class Predict:
    def initPackSize(self):
        path="../dist/assets/space8Zip"
        self.packSize=[]
        for i in range(529):
            s = os.path.getsize(path+"/"+str(i)+".zip")
            self.packSize.append(s)
        return self.packSize
    def __init__(self):
        vdList=[2,1,0]
        loadingList=[0,1,2]
        packSize=self.initPackSize()#[2,3,4]
        time={
            "start":1 #启动时间
        }
        self.speed={
            "send":1,
            "decode":1,
        }

        self.packList=[]
        for order in range( len(loadingList) ):
            id=loadingList[order]
            self.packList.append(
                pack({
                    "time0":time["start"],
                    "size":packSize[id],
                    "vd":vdList[id],
                    "id":id,
                    "order":order
                })
            )
        self.send()
        self.decode()
    

    def send(self):
        for pack in self.packList:
            pack.time1=pack.time0+pack.size/self.speed['send']
    def decode(self):
        my_list=[]
        for pack in self.packList:
            my_list.append(pack.time1)
        sorted_indices = sorted(range(len(my_list)), key=lambda x: my_list[x])
        time=0
        # packList2=[]
        for i in sorted_indices:
            # packList2.append(self.packList[i])
            pack=self.packList[i]
            if time<pack.time1:#web需要等待
                time=pack.time1
            pack.time2=time+pack.size/self.speed['decode']
        




Predict()