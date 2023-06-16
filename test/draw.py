import json
import os
import matplotlib.pyplot as plt
import numpy as np
PACK_NUM=529
MAX=9999999
MIN=-9999999
class Simulate:
    def __init__(self,main):
        self.time0=0.32
        self.speed={
            "send":1000*2.5,
            "decode":1000,
        }
        self.packList=main.packList
        self.request()
        self.send2()
        self.decode2()
    def request(self):
        loading,_=self.packList[0].sortList("vd")
        for i in range(len(loading)):
            id=loading[i]
            self.packList[id].time0=(i+1)*self.time0
    def send1(self):
        for pack in self.packList:
            if not pack.time0==-1:
                pack.time1=pack.time0+pack.size/self.speed['send']#
    def send2(self):
        for pack in self.packList:
            if not pack.time0==-1:
                pack.initTemp(pack.time0)
        sorted_indices,arr_time=self.packList[0].sortList('temp')
        arr_time.append(MAX)
        num=0#正在处理的数据包个数
        speed=self.speed['send']
        for i in range(len(sorted_indices)):
            packid=sorted_indices[i]
            pack=self.packList[packid]
            # 新增一个需要处理的数据包
            num+=1
            pack.p=True
            v=speed*(num**0.5)#当前系统对单个数据包的处理速度

            for pack in self.packList:
                if pack.p:
                    t0=pack.s/v
                    space=(arr_time[i+1]-arr_time[i])
                    if t0<=space:
                        pack.t=arr_time[i]+t0  #开始被处理的时间
                        pack.s=0        #还需要处理的数据量
                        pack.p=False    #处理完成，之后不需要处理了
                        num-=1
                    else:
                        pack.s=pack.s-space*v
        for pack in self.packList:
            # print(pack.time0+pack.size/self.speed['send'],pack.t,"pack.t")
            if not pack.t==-1:
                pack.time1=pack.t#pack.time0+pack.size/self.speed['send']#
        #print(num)
    def send3(self):
        for pack in self.packList:
            if not pack.time0==-1:
                pack.initTemp(pack.time0)
        sorted_indices,arr_time=self.packList[0].sortList('temp')
        arr_time.append(MAX)
        num=0#正在处理的数据包个数
        speed=self.speed['send']
        delayTime=10
        for i in range(len(sorted_indices)):
            packid=sorted_indices[i]
            pack=self.packList[packid]
            # 新增一个需要处理的数据包
            num+=1
            pack.p=True
            time0=arr_time[i]+100
            while True:
                if num==0:break
                v=speed*(num**0.5)#当前系统对单个数据包的处理速度
                space=(arr_time[i+1]-time0)
                min_pack=-1
                for pack in self.packList:
                    if pack.p:
                        pack.life=delayTime+pack.s/v
                        if pack.life<=space:
                            pack.t=arr_time[i]+pack.life  #开始被处理的时间
                            if min_pack==-1 or pack.t<min_pack.t:
                                min_pack=pack
                if min_pack==-1:break
                else:
                    min_pack.s=0
                    min_pack.p=False
                    num-=1
                    space=min_pack.life
                    for pack in self.packList:
                        if pack.p:
                            pack.s=pack.s-space*v
                    time0+=space
        for pack in self.packList:
            # print(pack.time0+pack.size/self.speed['send'],pack.t,"pack.t")
            if not pack.t==-1:
                pack.time1=pack.t#pack.time0+pack.size/self.speed['send']#
    def send0(self):
        for pack in self.packList:
            if not pack.time0==-1:
                pack.initTemp(pack.time0)
        sorted_indices,arr_time=self.packList[0].sortList('temp')
        arr_time.append(MAX)
        num=0#正在处理的数据包个数
        speed=self.speed['send']
        delayTime=10
        for i in range(len(sorted_indices)):
            packid=sorted_indices[i]
            pack=self.packList[packid]
            # 新增一个需要处理的数据包
            num+=1
            pack.p=True
            

            time0=arr_time[i]+100
            while True:
                if num==0:break
                v=speed/(num**0.005)#当前系统对单个数据包的处理速度
                space=(arr_time[i+1]-time0)
                min_pack=-1
                for pack in self.packList:
                    if pack.p:
                        pack.life=delayTime+pack.s/v
                        if pack.life<=space:
                            pack.t=arr_time[i]+pack.life  #开始被处理的时间
                            if min_pack==-1 or pack.t<min_pack.t:
                                min_pack=pack
                if min_pack==-1:break
                else:
                    min_pack.s=0
                    # min_pack.time1
                    min_pack.p=False
                    num-=1
                    space=min_pack.life
                    # for pack in self.packList:
                    #     if pack.p:
                    #         pack.s=pack.s-space*v
                    time0+=space

        for pack in self.packList:
            # print(pack.time0+pack.size/self.speed['send'],pack.t,"pack.t")
            # if not pack.t==-1:
                pack.time1=pack.t#pack.time0+pack.size/self.speed['send']#
        print(num)
    
    def decode1(self):#独立
        for pack in self.packList:
            if not pack.time1==-1:
                pack.time2=pack.time0+pack.size/self.speed['decode']#
    def decode2(self):
        for pack in self.packList:
            if not pack.time1==-1:
                pack.initTemp(pack.time1)
        sorted_indices,arr_time=self.packList[0].sortList('temp')
        arr_time.append(MAX)
        num=0#正在处理的数据包个数
        speed=self.speed['send']
        for i in range(len(sorted_indices)):
            packid=sorted_indices[i]
            pack=self.packList[packid]
            # 新增一个需要处理的数据包
            num+=1
            pack.p=True
            v=speed*(num**0.5)#当前系统对单个数据包的处理速度

            for pack in self.packList:
                if pack.p:
                    t0=pack.s/v
                    space=(arr_time[i+1]-arr_time[i])
                    if t0<=space:
                        pack.t=arr_time[i]+t0  #开始被处理的时间
                        pack.s=0        #还需要处理的数据量
                        pack.p=False    #处理完成，之后不需要处理了
                        num-=1
                    else:
                        pack.s=pack.s-space*v
        for pack in self.packList:
            # print(pack.time0+pack.size/self.speed['send'],pack.t,"pack.t")
            if not pack.t==-1:
                pack.time2=pack.t#pack.time0+pack.size/self.speed['send']#
        # print(num)
    def decode0(self):#独立
        my_list=[]
        for pack in self.packList:
            if not pack.time1==-1:
                my_list.append(pack.time1)
        sorted_indices = sorted(range(len(my_list)), key=lambda x: my_list[x])
        time=0
        for i in sorted_indices:
            pack=self.packList[i]
            if time<pack.time1:#web需要等待
                time=pack.time1
            pack.time2=time+pack.size/self.speed['decode']
class Pack:
    def __init__(self,config):
        self.packList=config['packList']
        self.size=config['size']
        self.vd=config['vd']
        self.id=config['id']
        self.time0=-1#config['time0']
        self.time1=-1#receive
        self.time2=-1#parse
        self.initTemp(-1)
    def initTemp(self,time):
        self.t=time#开始被处理的时间
        self.s=self.size#还需要处理的数据量
        self.p=False#没有被处理
    def print0(self):
        print("size:",self.size,"\ttime1:",self.time1,"\ttime2",self.time2)
    def sortList(self,type):
        arr=[]
        arr2=[]
        temp={}
        for id in range(len(self.packList)):
            pack=self.packList[id]
            if type=="request": d=pack.time0
            elif type=="loaded":d=pack.time1
            elif type=="parsed":d=pack.time2
            # elif type=="parsed-loaded":
            #     d=pack.time2-pack.time1
            #     if d<=0:d=-1
            elif type=="temp": d=pack.t
            elif type=="vd":
                d=pack.vd
                if d<=0:d=-1
                # print(d,d<=0)
            else:
                print("error!",type)
                exit(0)
            if not d==-1:
                arr.append(d)
                arr2.append(id)
                temp[id]=len(arr)-1
        indices = sorted(arr2, key=lambda x: arr[temp[x]])
        arr.sort()
        return indices,arr#id,value
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
    def initPackSize(self):
        path="../dist/assets/space8Zip"
        self.packSize=[]
        for i in range(PACK_NUM):
            s = os.path.getsize(path+"/"+str(i)+".zip")
            self.packSize.append(s)
        return self.packSize
    def initResult(self):
        file_path_result="result_n300t100.json"
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
        vdList=json.load(open("vd0.json"))#[2,1,0]
        packSize=self.initPackSize()#[2,3,4]
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

        self.initResult()#Simulate(self)#
        
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