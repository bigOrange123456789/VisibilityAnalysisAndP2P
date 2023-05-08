import json
import os
import pandas as pd
class Analysis:
    def __init__(self,path_pre):
        self.path_pre=path_pre
        self.fileList=self.load()
        self.result={
            "p2p"   :self.getResult(True),
            "no-p2p":self.getResult(False),
        }
    def load(self):
        fileList=[]
        nameList=os.listdir(self.path_pre)
        for name in nameList:
            file=json.load(open(path_pre+name, 'r'))
            file["fileName"]=name
            fileList.append(file)
        self.fileList=fileList
        return self.fileList
    def getNum(self,p2pFlag):
        n=0
        for file in self.fileList:
            if file["useP2P"]==p2pFlag:
                n+=1
        return n
    def getSum(self,p2pFlag,tagList):#tagList=["count_pack_request","zip"]
        sum=0
        for file in self.fileList:
            if file["useP2P"]==p2pFlag:
                data=file
                for t in tagList:
                    data=data[t]
                if not data==None:
                    sum+=data
        return sum
    def getMax(self,p2pFlag,tagList):#tagList=["count_pack_request","zip"]
        max=-9999999
        for file in self.fileList:
            if file["useP2P"]==p2pFlag:
                data=file
                for t in tagList:
                    data=data[t]
                if data>max:
                    max=data
        return max
    def div(self,a,b):
        if b==0:
            return 0
        else :
            return a/b
    def getResult(self,p2pFlag):
        n0=self.getNum(p2pFlag)
        n=n0
        if n0==0:n=1
        return {
         "useP2P":p2pFlag,
         "饱满度":self.div(
            self.getSum(p2pFlag,["plumpness","sum"]),
            self.getSum(p2pFlag,["plumpness","num"])
         ),
         "平均加载延迟":self.getSum(p2pFlag,["delay","load","ave"])/n,
         "最大加载延迟":self.getSum(p2pFlag,["delay","load","max"])/n,

         "平均转发延迟":self.getSum(p2pFlag,["delay","forward","ave"])/n,
         "最大转发延迟":self.getSum(p2pFlag,["delay","forward","max"])/n,

         "平均解析延迟":self.getSum(p2pFlag,["delay","parse","ave"])/n,
         "最大解析延迟":self.getSum(p2pFlag,["delay","parse","max"])/n,

         "P2P数据包平均解析延迟":self.getSum(p2pFlag,["delay","parse_edgeP2P","ave"])/n,
         "P2P数据包最大解析延迟":self.getSum(p2pFlag,["delay","parse_edgeP2P","max"])/n,

         "平均延迟":self.getSum(p2pFlag,["loadDelay","ave"])/n,
         "服务器请求次数":self.getSum(p2pFlag,["count_pack_request","zip"])/n,
         "服务器负载":self.getSum(p2pFlag,["count_pack_request","zip"]),
         "服务器响应次数":self.getSum(p2pFlag,["count_pack_server"])/n,
         "服务器功率":self.getSum(p2pFlag,["count_pack_server"]),
         "边缘服务器负载":self.getSum(p2pFlag,["count_pack_p2p"])/n,
         "边缘服务器功率":self.getSum(p2pFlag,["count_pack_p2p"]),
         "加载后未使用":self.div(
            self.getSum(p2pFlag,["count_mesh_p2p_NotUsed"])+
            self.getSum(p2pFlag,["count_mesh_server_NotUsed"]),
            self.getSum(p2pFlag,["count_mesh_p2p"])+
            self.getSum(p2pFlag,["count_mesh_server"])),
         "重复加载":self.div(
            self.getSum(p2pFlag,["count_pack_p2p"])+
            self.getSum(p2pFlag,["count_pack_server"])-
            self.getSum(p2pFlag,["count_mesh_p2p"])-
            self.getSum(p2pFlag,["count_mesh_server"]),
            self.getSum(p2pFlag,["count_pack_p2p"])+
            self.getSum(p2pFlag,["count_pack_server"])),
         "FPS":self.div(
            self.getSum(p2pFlag,["frameCount"]),
            self.getSum(p2pFlag,["testTime"])),
         "测试人数":n
        }
    
if __name__ == "__main__":#用于测试  
    def inTime(path_pre,useP2P,time0):
        file_list=os.listdir(path_pre)
        num=0
        for name in file_list:
            file=json.load(open(path_pre+name, 'r'))
            if file["useP2P"]==useP2P:
                t1=[
                    file["date"][5],
                    file["date"][3]
                ]
                t2=[
                    int(name.split('.')[1].split('-')[1]),
                    int(name.split('.')[1].split('-')[2]),
                ]
                time1=t1[0]+t1[1]/60
                time2=t2[0]+t2[1]/60
                # print(time1,time2)
                if time1<time0 and time0<time2:
                    num+=1
        return num
    def getTimeMax(path_pre,useP2P):#完成时间
        file_list=os.listdir(path_pre)
        max=-10000
        for name in file_list:
            file=json.load(open(path_pre+name, 'r'))
            if file["useP2P"]==useP2P:
                t=[
                    int(name.split('.')[1].split('-')[1]),
                    int(name.split('.')[1].split('-')[2]),
                ]
                time0=t[0]+t[1]/60
                if time0>max:
                    max=time0
        return max
    def getTimeMin(path_pre,useP2P):#开始时间
        file_list=os.listdir(path_pre)
        min=10000
        for name in file_list:
            file=json.load(open(path_pre+name, 'r'))
            if file["useP2P"]==useP2P:
                t=[
                    file["date"][5],
                    file["date"][3]
                ]
                time0=t[0]+t[1]/60
                if time0<min:
                    min=time0
        return min
    def save(tag,arr):
        df = pd.DataFrame(arr, columns=tag)
        df.to_excel('result.xlsx', index=False)
    def save2(tag,arr):
        df = pd.DataFrame(arr, columns=tag)
        df.to_excel('result2.xlsx', index=False)
    
    
    arr=[]

    path_pre="detection/"

    anaysis=Analysis(path_pre)
    tag=list(anaysis.result["p2p"].keys())
    arr=[
        list(anaysis.result["p2p"].values()),
        list(anaysis.result["no-p2p"].values())
    ]
    save(tag,arr)

    tag=[]
    arr=[]
    path_pre="detection/"
    t=min([getTimeMin(path_pre,True),getTimeMin(path_pre,False)])-5/60
    print(t,max([getTimeMax(path_pre,True),getTimeMax(path_pre,False)]))
    arr1=[]
    arr2=[]
    while t<max([getTimeMax(path_pre,True),getTimeMax(path_pre,False)])+10/60:        
            tag.append("%.2f" % round(t, 2))
            arr1.append(inTime(path_pre,False,t))
            arr2.append(inTime(path_pre,True ,t))
            t+=(1/60)
    save2(tag,[arr1,arr2])
