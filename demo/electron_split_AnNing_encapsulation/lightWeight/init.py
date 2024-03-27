import json
import os
import struct
def remove(dir_path):
    print("Clearing folder:"+dir_path)
    import os
    # os.walk会得到dir_path下各个后代文件夹和其中的文件的三元组列表，顺序自内而外排列，如 o下有1文件夹，1下有2文件夹：[('o\1\2', [], ['a.py','b']), ('o\1', ['2'], ['c']), ('o', ['1'], [])]
    for root, dirs, files in os.walk(dir_path, topdown=False):
        #root: 各级文件夹绝对路径
        #dirs: root下一级文件夹名称列表，如 ['文件夹1','文件夹2']
        #files: root下文件名列表，如 ['文件1','文件2']
        for name in files:# 第一步：删除文件
            os.remove(os.path.join(root, name))  # 删除文件
        for name in dirs:# 第二步：删除空文件夹
            os.rmdir(os.path.join(root, name)) # 删除一个空目录
if __name__ == "__main__":#pathon init.py 
    import sys
    if len(sys.argv)<2:
        print("ERR:请指定config.json的路径")
        exit(0)
    path=sys.argv[1]
    remove(path)
    os.makedirs(path+"/asssets_linux")
    os.makedirs(path+"/asssets_linux/occluder")
    os.makedirs(path+"/temp")