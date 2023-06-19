import json
import os
import matplotlib.pyplot as plt
from Simulate import Simulate
from Pack import Pack
PACK_NUM=529
MAX=9999999
MIN=-9999999
class Main:
    def getVDAndTime(self):
        sorted_indices,arr_time=self.packList[0].sortList('parsed')
        
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
            vd0+=self.packList[id].vd#vd0+=arr_vd[id]#
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
        list0,_=self.packList[0].sortList('parsed')#['id']
        x0_min=MAX
        x0_max=MIN
        for y0 in range(len(list0)):
            id=list0[y0]
            pack=self.packList[id]
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
            _,x=self.packList[0].sortList(type)#['value']
            y=list(range(1, len(x)+1, 1))
            plt.plot(x, y,label=type)
        plt.xlabel('time(ms)')
        plt.ylabel('Number of packets')
        plt.title('2:Number of packets')
        
        plt.legend()# 添加图例
        plt.show()# 显示图形
    def initPackSize(self,path):
        self.packSize=[]
        for i in range(PACK_NUM):
            s = os.path.getsize(path+"/"+str(i)+".zip")
            self.packSize.append(s)
        return self.packSize
    def initResult(self,file_path_result):
        print(file_path_result.split("_")[1])
        result=json.load(open(file_path_result, 'r'))
        for id in result:
            pack=self.packList[int(id)]
            pack.time0=result[id]['request']
            pack.time1=result[id]['loaded']
            pack.time2=result[id]["parsed"]
    def initTimeStart(self):
        min0=MAX
        for id in range(len(self.packList)):
            time0=self.packList[id].time0
            if (not time0==-1) and time0<min0:min0=time0
        return min0    
    def __init__(self):
        vdList=json.load(open("data/vd0.json"))#[2,1,0]
        packSize=self.initPackSize("../../dist/assets/space8Zip")#[2,3,4]
        self.packList=[]
        for id in range( PACK_NUM ):
            self.packList.append(
                Pack({
                    "size":packSize[id],
                    "vd":vdList[id],
                    "id":id,
                    "packList":self.packList
                })
            )

        Simulate(self)#self.initResult("data/result_n300t100.json")#
        
        self.timeStart=self.initTimeStart()
        self.draw()

Main()
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
# test()