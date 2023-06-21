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
        loading,_=self.packList.sortList("vd")
        for i in range(len(loading)):
            id=loading[i]
            self.packList.getPack(id).time0=(i+1)*self.time0
    def send1(self):
        for pack in self.packList.traverse():
            if not pack.time0==-1:
                pack.time1=pack.time0+pack.size/self.speed['send']#
    def send2(self):
        for pack in self.packList.traverse():
            if not pack.time0==-1:
                pack.initTemp(pack.time0)
        sorted_indices,arr_time=self.packList.sortList('temp')
        arr_time.append(MAX)
        num=0#正在处理的数据包个数
        speed=self.speed['send']
        for i in range(len(sorted_indices)):
            packid=sorted_indices[i]
            pack=self.packList.getPack(packid)
            # 新增一个需要处理的数据包
            num+=1
            pack.p=True
            v=speed*(num**0.5)#当前系统对单个数据包的处理速度

            for pack in self.packList.traverse():
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
        for pack in self.packList.traverse():
            # print(pack.time0+pack.size/self.speed['send'],pack.t,"pack.t")
            if not pack.t==-1:
                pack.time1=pack.t#pack.time0+pack.size/self.speed['send']#
        #print(num)
    def send3(self):
        for pack in self.packList.traverse():
            if not pack.time0==-1:
                pack.initTemp(pack.time0)
        sorted_indices,arr_time=self.packList.sortList('temp')
        arr_time.append(MAX)
        num=0#正在处理的数据包个数
        speed=self.speed['send']
        delayTime=10
        for i in range(len(sorted_indices)):
            packid=sorted_indices[i]
            pack=self.packList.getPack(packid)
            # 新增一个需要处理的数据包
            num+=1
            pack.p=True
            time0=arr_time[i]+100
            while True:
                if num==0:break
                v=speed*(num**0.5)#当前系统对单个数据包的处理速度
                space=(arr_time[i+1]-time0)
                min_pack=-1
                for pack in self.packList.traverse():
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
                    for pack in self.packList.traverse():
                        if pack.p:
                            pack.s=pack.s-space*v
                    time0+=space
        for pack in self.packList.traverse():
            # print(pack.time0+pack.size/self.speed['send'],pack.t,"pack.t")
            if not pack.t==-1:
                pack.time1=pack.t#pack.time0+pack.size/self.speed['send']#
    def send0(self):
        for pack in self.packList.traverse():
            if not pack.time0==-1:
                pack.initTemp(pack.time0)
        sorted_indices,arr_time=self.packList.sortList('temp')
        arr_time.append(MAX)
        num=0#正在处理的数据包个数
        speed=self.speed['send']
        delayTime=10
        for i in range(len(sorted_indices)):
            packid=sorted_indices[i]
            pack=self.packList.getPack(packid)
            # 新增一个需要处理的数据包
            num+=1
            pack.p=True
            

            time0=arr_time[i]+100
            while True:
                if num==0:break
                v=speed/(num**0.005)#当前系统对单个数据包的处理速度
                space=(arr_time[i+1]-time0)
                min_pack=-1
                for pack in self.packList.traverse():
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
                    # for pack in self.packList.traverse():
                    #     if pack.p:
                    #         pack.s=pack.s-space*v
                    time0+=space

        for pack in self.packList.traverse():
            # print(pack.time0+pack.size/self.speed['send'],pack.t,"pack.t")
            # if not pack.t==-1:
                pack.time1=pack.t#pack.time0+pack.size/self.speed['send']#
        print(num)
    
    def decode1(self):#独立
        for pack in self.packList.traverse():
            if not pack.time1==-1:
                pack.time2=pack.time0+pack.size/self.speed['decode']#
    def decode2(self):
        for pack in self.packList.traverse():
            if not pack.time1==-1:
                pack.initTemp(pack.time1)
        sorted_indices,arr_time=self.packList.sortList('temp')
        arr_time.append(MAX)
        num=0#正在处理的数据包个数
        speed=self.speed['send']
        for i in range(len(sorted_indices)):
            packid=sorted_indices[i]
            pack=self.packList.getPack(packid)
            # 新增一个需要处理的数据包
            num+=1
            pack.p=True
            v=speed*(num**0.5)#当前系统对单个数据包的处理速度

            for pack in self.packList.traverse():
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
        for pack in self.packList.traverse():
            # print(pack.time0+pack.size/self.speed['send'],pack.t,"pack.t")
            if not pack.t==-1:
                pack.time2=pack.t#pack.time0+pack.size/self.speed['send']#
        # print(num)
    def decode0(self):#独立
        my_list=[]
        for pack in self.packList.traverse():
            if not pack.time1==-1:
                my_list.append(pack.time1)
        sorted_indices = sorted(range(len(my_list)), key=lambda x: my_list[x])
        time=0
        for i in sorted_indices:
            pack=self.packList.getPack(i)
            if time<pack.time1:#web需要等待
                time=pack.time1
            pack.time2=time+pack.size/self.speed['decode']
