import json
import os
import matplotlib.pyplot as plt
from Simulate import Simulate
from PackList import PackList
MAX=9999999
MIN=-9999999
class Main:
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
            vd0+=self.packList.getPack(id).vd#vd0+=arr_vd[id]#
            x.append(arr_time[i])
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
        list0,_=self.packList.sortList('parsed')#['id']
        x0_min=MAX
        x0_max=MIN
        for y0 in range(len(list0)):
            id=list0[y0]
            pack=self.packList.getPack(id)
            x=[pack.time0,pack.time1,pack.time2]
            if x[0]<x0_min:x0_min=x[0]
            if x[0]>x0_max:x0_max=x[0]

            # print(pack.time0)
            # print(np.array(pack.time0))
            # print(np.max(np.array(pack.time0)))
            # 
            y=[y0+1,y0+1,y0+1]
            plt.plot(x, y, linewidth=0.1, marker='o', markersize=1)
        print("x0_min:",x0_min,",x0_max:",x0_max)
        print( "time0:", (x0_max-x0_min)/(len(list0)-1))
        plt.xlabel('time(ms)')
        plt.ylabel('ID of packet')
        plt.title('1:processing time of packet')  

        plt.subplot(1, 3, 3)
        for type in["vd"]:#["request","loaded","forwarded","parsed"]:
            x,y,x2,y2=self.getVDAndTime()
            plt.plot(x, y,label="FD")
            plt.plot(x2, y2, linestyle='dashed',label="ave FD")
        plt.xlabel('time(ms)')
        plt.ylabel('Fill Degree')
        plt.title('3:Fill Degree')

        plt.subplot(1, 3, 2)
        for type in["request","loaded","parsed"]:#["request","loaded","forwarded","parsed"]:
            _,x=self.packList.sortList(type)#['value']
            y=list(range(1, len(x)+1, 1))
            plt.plot(x, y,label=type)
        plt.xlabel('time(ms)')
        plt.ylabel('Number of packets')
        plt.title('2:Number of packets')
        
        plt.legend()# 添加图例
        plt.show()# 显示图形
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
      
    def __init__(self,param):
        vdList=[]#json.load(open(param["path_vdList"]))#[2,1,0]
        packSize=[]#self.initPackSize("../../dist/assets/space8Zip",param["pack_num"])#[2,3,4]
        self.packList=PackList(packSize,vdList)
        if param["path_result"]=="":Simulate(self)
        else:                       self.initResult(param["path_result"])
        self.timeStart=self.packList.getTimeStart()
        self.draw()