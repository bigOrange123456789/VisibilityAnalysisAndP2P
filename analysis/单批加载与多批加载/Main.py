import json
import os
import matplotlib.pyplot as plt
from Simulate import Simulate
from PackList import PackList
MAX=9999999
MIN=-9999999
class Main:
    def FuYunKai(self):#根据傅韵凯的要求计算： 平均带宽利用率、吞吐率、平均解析时间
        sorted_indices,arr_time=self.packList.sortList('loaded')
        timeEnd=arr_time[len(arr_time)-1]
        timeStart=self.timeStart

        time_parsed=0
        size=0
        for i in range(len(arr_time)):
            id=sorted_indices[i]
            time_parsed+=self.packList.getPack(id).get("parsed-loaded")
            size+=self.packList.getPack(id).size
            # print(size)
            # print(time_parsed)
    

        timeAll=timeEnd-timeStart
        print("总加载时间为(ms):",timeAll)
        print("任务总量(B):",size)
        n=len(arr_time)
        print("任务总数(个):",n)
        print("平均带宽利用率(%):",
              100*(size/(timeAll*1))#str(100*(size/(timeAll*1)))+"/SpeedMax"
              )#size/(SpeedMax*timeAll)
        print("吞吐率(个/ms):",n/timeAll)
        print("平均解析时间(ms):",time_parsed/len(arr_time))
        

        return [
            timeAll,
            size,
            n,
            100*(size/(timeAll*1)),#str(100*(size/(timeAll*1)))+"/SpeedMax",
            n/timeAll,
            time_parsed/len(arr_time),
        ]
        # arr=[]
        # for pack in self.packList.traverse():  
        #         arr.append([id,vd,size,res,time0,time1,time2])
        # tag=["总加载时间为(ms):",'任务总量(B):','任务总数(个)',
        #      '平均带宽利用率(%)','吞吐率(个/ms):','平均解析时间(ms):']
        # import pandas as pd
        # df = pd.DataFrame(arr, columns=tag)
        # return df
  
    def getVDAndTime(self):
        sorted_indices,arr_time=self.packList.sortList('parsed')
        
        x=arr_time
        x=[self.timeStart]
        y=[0]
        vd0=0
        area=0
        w=0
        h=0
        for i in range(len(arr_time)):
            w=arr_time[i]-x[len(x)-1]
            h=vd0
            area=area+w*h
            x.append(arr_time[i])
            y.append(vd0)
            id=sorted_indices[i]
            vd0=vd0+self.packList.getPack(id).vd/self.packList.vdAll#vd0+=arr_vd[id]#
            x.append(arr_time[i])
            y.append(vd0)

        timeAll=x[len(x)-1]-self.timeStart
        print("总加载时间为：",timeAll)
        vd_ave=area/timeAll
        x2=[x[0],x[len(x)-1]]
        y2=[vd_ave,vd_ave]
        print("可见度的平均值为:",vd_ave)
        return x,y,x2,y2     
    def draw2(self):
        plt.subplot(1, 2, 2)
        self.draw03()
        plt.title('3:Fill Degree')

        plt.subplot(1, 2, 1)
        self.draw02()
        plt.title('2:Number of packets')
        
        plt.legend()# 添加图例
        plt.show()# 显示图形
    def draw1(self):
        plt.subplot(1, 3, 1)
        self.draw01()
        plt.title('1:processing time of packet')  

        plt.subplot(1, 3, 3)
        self.draw03()
        plt.title('3:Fill Degree')

        plt.subplot(1, 3, 2)
        self.draw02()
        plt.title('2:Number of packets')
        
        plt.legend()# 添加图例
        plt.show()# 显示图形
    def draw01(self,sortName):#sortName= request loaded parsed 
        list0,_=self.packList.sortList(sortName)#['id']
        x0_min=MAX
        x0_max=MIN
        for y0 in range(len(list0)):
            id=list0[y0]
            pack=self.packList.getPack(id)
            x=[pack.time0,pack.time1,pack.time2]
            if x[0]<x0_min:x0_min=x[0]
            if x[0]>x0_max:x0_max=x[0]

            y=[y0+1,y0+1,y0+1]

            temp=x
            x=y
            y=temp
            # plt.plot(x, y, linewidth=0.1, marker='o', markersize=1)
            
            if y0==0:
                plt.plot([x[0],x[1]], [y[0],y[1]], linewidth=0.1, markersize=1,color='black',label="loading")
                plt.plot([x[1],x[2]], [y[1],y[2]], linewidth=0.1, markersize=1,color='r',label="parsing")
                plt.plot(x[0], y[0], marker='o', linewidth=0,markersize=1,color='indigo',label="request")
                plt.plot(x[1], y[1], marker='o', linewidth=0,markersize=1,color='g',label="loaded")
                plt.plot(x[2], y[2], marker='o', linewidth=0,markersize=1,color='b',label="parsed")
            else:
                # plt.plot(x, y, linewidth=0.1, markersize=1,color='black')
                plt.plot([x[0],x[1]], [y[0],y[1]], linewidth=0.1, markersize=1,color='black')
                plt.plot([x[1],x[2]], [y[1],y[2]], linewidth=0.1, markersize=1,color='r')
                plt.plot(x[0], y[0], marker='o', markersize=1,color='indigo')
                plt.plot(x[1], y[1], marker='o', markersize=1,color='g')
                plt.plot(x[2], y[2], marker='o', markersize=1,color='b')

            
        print("x0_min:",x0_min,",x0_max:",x0_max)
        print( "time0:", (x0_max-x0_min)/(len(list0)-1))
        plt.ylabel('time(ms)')
    def draw03(self):
        for type in["vd"]:#["request","loaded","forwarded","parsed"]:
            x,y,x2,y2=self.getVDAndTime()
            plt.plot(x, y,label="FD")
            plt.plot(x2, y2, linestyle='dashed',label="ave FD")
        plt.xlabel('time(ms)')
        plt.ylabel('Fill Degree')
    def draw02(self):
        for type in["request","loaded","parsed"]:#["request","loaded","forwarded","parsed"]:
            _,x=self.packList.sortList(type)#['value']
            y=list(range(1, len(x)+1, 1))
            plt.plot(x, y,label=type)
        plt.xlabel('time(ms)')
        plt.ylabel('Number of packets')
    def initPackSize(self,path,PACK_NUM):
        self.packSize=[]
        for i in range(PACK_NUM):
            s = os.path.getsize(path+"/"+str(i)+".zip")
            self.packSize.append(s)
        return self.packSize
    def initResult(self,file_path_result):
        if len(file_path_result.split("_"))>1:
            print("第一批包的数量和中间的等待时间为:",file_path_result.split("_")[1].split('.json')[0])
        result=json.load(open(file_path_result, 'r'))
        for id in result:
            pack=self.packList.getPack(int(id))
            pack.time0=result[id]['request']
            pack.time1=result[id]['loaded']
            pack.time2=result[id]["parsed"]
    def to_excel(self,name):
        arr=[]
        for pack in self.packList.traverse():
            id=pack.id
            vd=pack.vd
            size=pack.size
            time0=pack.time0
            time1=pack.time1
            time2=pack.time2
            res=pack.res
            # print(id,vd,size,time0,time1,time2,res)
            if time0!=-1:
                arr.append([id,vd,size,res,time0,time1,time2])
        tag=["id",'可见度','file size','res','time0','time1','time2']
        import pandas as pd
        df = pd.DataFrame(arr, columns=tag)
        df.to_excel('result.xlsx', name,index=False, encoding='utf-8')
    def to_excel2(self):
        arr=[]
        for pack in self.packList.traverse():
            id=pack.id
            vd=pack.vd
            size=pack.size
            time0=pack.time0
            time1=pack.time1
            time2=pack.time2
            res=pack.res
            # print(id,vd,size,time0,time1,time2,res)
            if time0!=-1:
                arr.append([id,vd,size,res,time0,time1,time2])
        tag=["id",'可见度(球面度)','文件大小(字节)','贴图分辨率(像素)','发出请求的时刻(毫秒)','收到数据包的时刻(毫秒)','完成解析的时刻(毫秒)']
        import pandas as pd
        df = pd.DataFrame(arr, columns=tag)
        return df

    def __init__(self,param):
        vdList=json.load(open(param["path_vdList"]))#[2,1,0]
        packSize=self.initPackSize("../../dist/assets/space8Zip",param["pack_num"])#[2,3,4]
        mapSize=json.load(open(param["path_mapSize"]))
        self.packList=PackList(packSize,vdList,mapSize)
        if param["path_result"]=="":Simulate(self)
        else:                       self.initResult(param["path_result"])
        self.timeStart=self.packList.getTimeStart()
        #self.test()
        # return
        # self.draw1()