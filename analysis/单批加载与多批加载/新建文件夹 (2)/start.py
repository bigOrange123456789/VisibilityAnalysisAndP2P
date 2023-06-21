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
if __name__ == "__main__":#开始执行代码
    Main({
        "pack_num":2000,#529,
        "path_vdList":"data/vd0.json",
        "path_file":"../../dist/assets/space8Zip",
        "path_result":
            #"data/result.json"
            'C:/Users/admin/Downloads/result.json'
            #"data/result_n300t100.json",#路径为空就进行模拟
    })
    import os
    os.remove("C:/Users/admin/Downloads/result.json")
    #test()
