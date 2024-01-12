import matplotlib.pyplot as plt
from Main import Main
def test():
        x =[100,    200,    500,    800,    1200,   1500]
        y0=[0.92,   0.92,   0.92,   0.92,   0.92,   0.92]#206
        y1=[1.03,   1.22,   1.5,    1.63,   1.85,   2.55]#100
        y2=[1.52,   1.79,   2.85,   5.62,   7.35,   6.82]#50
        plt.plot(x, y0,label="method1(N=206)")
        # plt.plot(x, y1, marker='o',label="method2(N=100)")
        plt.plot(x, y2, marker='o',label="method2(N=50 )")
        plt.xlabel('delay time(ms)')
        plt.ylabel('Degree of visibility(sr)')
        plt.legend()# 添加图例
        plt.show()# 显示图形

        x =[100,    200,    500,    800,    1200,   1500]
        y0=[3961,   3961,   3961,   3961,   3961,   3961]#206
        y1=[3910,   3981,   3943,   3915,   4048,   3998]#100
        y2=[3922,   4135,   3987,   3883,   4814,   4424]#50
        plt.plot(x, y0,label="method1(N=206)")
        plt.plot(x, y1, marker='o',label="method2(N=100)")
        plt.plot(x, y2, marker='o',label="method2(N=50 )")
        plt.xlabel('delay time(ms)')
        plt.ylabel('initialization time(ms)')
        plt.legend()# 添加图例
        plt.show()# 显示图形
def remove():
    import os
    os.remove("C:/Users/admin/Downloads/result.json")  
def start():
     Main({
        "pack_num":529,
        "path_vdList": "data/vd0.json",
        "path_mapSize":"data/mapSize.json",
        "path_file":"../../dist/assets/space8Zip",
        "path_result":
            #"data/result.json"
            #'C:/Users/admin/Downloads/result.json'
            "data/远程+单批+渲染.json"
            #"data/result_n300t100.json",#路径为空就进行模拟
    })
def start2():
    arr=[]
    arr_result=[]
    for s1 in ["远程","本地"]:
        for s2 in ["单批","双批"]:
            for s3 in ["渲染","不渲染"]:
                name=s1+"+"+s2+"+"+s3
                main=Main({
                    "pack_num":529,
                    "path_vdList": "data/vd0.json",
                    "path_mapSize":"data/mapSize.json",
                    "path_file":"../../dist/assets/space8Zip",
                    "path_result":
                        #"data/result.json"
                        #'C:/Users/admin/Downloads/result.json'
                        "data/"+name+".json"
                        #"data/result_n300t100.json",#路径为空就进行模拟
                })
                main.name=name
                arr.append(main)
                print(name+":")
                # print("平均解析时间:\t",main.getVDAndTime())
                result=main.FuYunKai()#draw2()
                arr_result.append(
                     [name,result[0],result[1],result[2],result[3],result[4],result[5]])
    import matplotlib.pyplot as plt
    plt.rcParams['font.sans-serif'] = ['SimHei'] # 用来正常显示中文标签SimHei
    plt.rcParams['axes.unicode_minus'] = False # 用来正常显示负号

    import pandas as pd
    writer=pd.ExcelWriter("result.xlsx")
    for i in range(8):
        main=arr[i]
        data=main.to_excel2()
        data.to_excel(writer, main.name)
    #########
    # arr=[]
    # for pack in self.packList.traverse():  
    #         arr.append([id,vd,size,res,time0,time1,time2])
    tag=["实验类型",
         "总加载时间为(ms)",'任务总量(B)','任务总数(个)',
         '平均带宽利用率(%)','吞吐率(个/ms)','平均解析时间(ms)']
    data0 = pd.DataFrame(arr_result, columns=tag)
    data0.to_excel(writer, "分析结果")
    #########
    writer.close()# writer.save()
    # import matplotlib.pyplot as plt
    # plt.rcParams['font.sans-serif'] = ['SimHei'] # 用来正常显示中文标签SimHei
    # plt.rcParams['axes.unicode_minus'] = False # 用来正常显示负号

    # import pandas as pd
    # writer=pd.ExcelWriter("result.xlsx")
    # for i in range(8):
    #     main=arr[i]
    #     data=main.to_excel2()
    #     data.to_excel(writer, main.name)
    # writer.close()# writer.save()

    # for i in range(8):
    #     plt.subplot(2, 4, i+1)
    #     main=arr[i]
    #     main.draw03()
    #     plt.title(main.name)        
    # plt.legend()# 添加图例
    # plt.show()# 显示图形

    # for i in range(8):
    #     plt.subplot(2, 4, i+1)
    #     main=arr[i]
    #     main.draw02()
    #     plt.title(main.name)        
    # plt.legend()# 添加图例
    # plt.show()# 显示图形

    # for i in range(8):
    #     main=arr[i]
    #     plt.subplot(1, 3, 1)
    #     main.draw01('request')#request loaded parsed 
    #     plt.title('排序依据:发出请求时间') 
    #     plt.subplot(1, 3, 2)
    #     main.draw01('loaded')#request loaded parsed 
    #     plt.title('排序依据:完成加载时间') 
    #     plt.subplot(1, 3, 3)
    #     main.draw01('parsed')#request loaded parsed 
    #     plt.title('排序依据:完成解析时间') 
    #     plt.suptitle(main.name)
    #     plt.legend()# 添加图例
    #     plt.show()# 显示图形
    
    # for i in range(8):
    #     plt.subplot(2, 4, i+1)
    #     main=arr[i]
    #     main.draw01('request')
    #     plt.title(main.name)        
    # plt.suptitle('排序依据:发出请求时间')
    # plt.legend()# 添加图例
    # plt.show()# 显示图形

    # for i in range(8):
    #     plt.subplot(2, 4, i+1)
    #     main=arr[i]
    #     main.draw01('loaded')
    #     plt.title(main.name)        
    # plt.suptitle('排序依据:完成加载时间')
    # plt.legend()# 添加图例
    # plt.show()# 显示图形

    # for i in range(8):
    #     plt.subplot(2, 4, i+1)
    #     main=arr[i]
    #     main.draw01('parsed')
    #     plt.title(main.name)        
    # plt.suptitle('排序依据:完成解析时间')
    # plt.legend()# 添加图例
    # plt.show()# 显示图形    

if __name__ == "__main__":#开始执行代码
    start2()
    #test()
