import json
import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
PACK_NUM=529
MAX=9999999
MIN=-9999999
class Pack:
    def __init__(self,config):
        self.size=config['size']
        self.vd=config['vd']
        self.id=config['id']
        self.order=config['order']
        self.time0=-1#config['time0']
        self.time1=-1#receive
        self.time2=-1#parse
    def p(self):
        print("size:",self.size,"\ttime1:",self.time1,"\ttime2",self.time2)
class Draw:
    def getNumAndTime(self,type):
        arr=[]
        for id in self.result:
            d=self.result[id][type]
            arr.append(d)
        arr.sort()
        x=arr
        y=list(range(1, len(x)+1, 1))
        return x,y
    def getVDAndTime(self):
        arr_time=[]
        arr_vd=[]
        for id in self.result:
            d=self.result[id]['parsed']
            arr_time.append(d)
            arr_vd.append(
                self.packList[int(id)].vd
            )
        # arr.sort()
        sorted_indices = sorted(range(len(arr_time)), key=lambda x: arr_time[x])
        x=arr_time
        x=[self.timeStart]
        y=[0]
        vd0=0
        area=0
        w=0
        h=0
        for id in sorted_indices:
            w=arr_time[id]-x[len(x)-1]
            h=vd0
            area=area+w*h
            x.append(arr_time[id])
            y.append(vd0)
            vd0+=arr_vd[id]
            x.append(arr_time[id])
            y.append(vd0)

        timeAll=x[len(x)-1]-self.timeStart
        print("总加载时间为：",timeAll)
        vd_ave=area/timeAll
        x2=[x[0],x[len(x)-1]]
        y2=[vd_ave,vd_ave]
        print("可见度的平均值为:",vd_ave)
        return x,y,x2,y2

        
    def draw(self):
        plt.subplot(1, 3, 1)
        list0=self.initList('parsed')
        for y0 in range(len(list0)):
            id=str(list0[y0])
            request=self.result[id]['request']
            loaded=self.result[id]['loaded']
            parsed=self.result[id]["parsed"]
            x=[request,loaded,parsed]
            y=[y0+1,y0+1,y0+1]
            # plt.plot(x, y, linewidth=0.1)
            plt.plot(x, y, linewidth=0.1, marker='o', markersize=1)
        plt.xlabel('time(ms)')
        plt.ylabel('ID of packet')
        plt.title('1:processing time of packet')

        plt.subplot(1, 3, 3)
        for type in["vd"]:#["request","loaded","forwarded","parsed"]:
            x,y,x2,y2=self.getVDAndTime()
            plt.plot(x, y,label="vd")
            plt.plot(x2, y2, linestyle='dashed',label="ave vd")
        plt.xlabel('time(ms)')
        plt.ylabel('Degree of visibility')
        plt.title('3:Degree of visibility')

        plt.subplot(1, 3, 2)
        for type in["request","loaded","parsed"]:#["request","loaded","forwarded","parsed"]:
            x,y=self.getNumAndTime(type)
            plt.plot(x, y,label=type)
        plt.xlabel('time(ms)')
        plt.ylabel('Number of packets')
        plt.title('2:Number of packets')

        # 添加图例
        plt.legend()

        # 显示图形
        plt.show()

    def initPackSize(self):
        path="../dist/assets/space8Zip"
        self.packSize=[]
        for i in range(PACK_NUM):
            s = os.path.getsize(path+"/"+str(i)+".zip")
            self.packSize.append(s)
        return self.packSize
    def initVdList(self):
        file_path="vd0.json"
        return json.load(open(file_path, 'r'))
    def initResult(self):
        file_path_result="result_n50t800.json"
        print(file_path_result)
        return json.load(open(file_path_result, 'r'))
    def initTimeStart(self):
        min0=MAX
        for id in range(len(self.packList)):
            time0=self.packList[id].time0
            if (not time0==-1) and time0<min0:min0=time0
        return min0    
    def initList(self,type):
        arr=[]
        arr0=[]
        for id in range(len(self.packList)):
            if type=="request":
                t=self.packList[id].time0
            elif type=="parsed":
                t=self.packList[id].time2
            arr.append(t)
            arr0.append(t)
        sorted_indices = sorted(range(len(arr)), key=lambda x: arr[x])
        
        List=[]
        for i in range(len(sorted_indices)):
            id=sorted_indices[i]
            if not arr0[id]==-1:
                List.append(id)
        return List
    def __init__(self):
        vdList=self.initVdList()#[2,1,0]
        packSize=self.initPackSize()#[2,3,4]
        time={
            "start":1 #启动时间
        }
        self.speed={
            "send":1,
            "decode":1,
        }
        
        self.packList=[]
        for id in range( PACK_NUM ):
            self.packList.append(
                Pack({
                    #"time0":time["start"],
                    "size":packSize[id],
                    "vd":vdList[id],
                    "id":id,
                    "order":-1
                })
            )
            # self.packList['config']

        self.result=self.initResult()
        for id in self.result:
            request=self.result[id]['request']
            loaded=self.result[id]['loaded']
            parsed=self.result[id]["parsed"]
            id=int(id)#
            pack=self.packList[id]
            pack.time0=pack.request=request
            pack.time1=pack.loaded=loaded
            pack.time2=pack.parsed=parsed
        self.timeStart=self.initTimeStart()
        self.draw()

#Draw()
def test():
        # x =[100,    200,    500,    800,    1200,   1500]
        # y0=[0.92,   0.92,   0.92,   0.92,   0.92,   0.92]#206
        # y1=[1.03,   1.22,   1.5,    1.63,   1.85,   2.55]#100
        # y2=[1.52,   1.79,   2.85,   5.62,   7.35,   6.82]#50
        # plt.plot(x, y0,label="method1(N=206)")
        # # plt.plot(x, y1, marker='o',label="method2(N=100)")
        # plt.plot(x, y2, marker='o',label="method2(N=50 )")
        # plt.xlabel('delay time(ms)')
        # plt.ylabel('Degree of visibility(sr)')


        x =[100,    200,    500,    800,    1200,   1500]
        y0=[3961,   3961,   3961,   3961,   3961,   3961]#206
        y1=[3910,   3981,   3943,   3915,   4048,   3998]#100
        y2=[3922,   4135,   3987,   3883,   4814,   4424]#50
        plt.plot(x, y0,label="method1(N=206)")
        plt.plot(x, y1, marker='o',label="method2(N=100)")
        plt.plot(x, y2, marker='o',label="method2(N=50 )")
        plt.xlabel('delay time(ms)')
        plt.ylabel('initialization time(ms)')


        # 添加图例
        plt.legend()

        # 显示图形
        plt.show()
test()