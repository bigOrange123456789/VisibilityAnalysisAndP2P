import numpy as np
import time as t
import json
import cv2
class Cylinder3D:
    def __init__(self,opt):
        self.opt=opt
        data=json.load(open(self.opt["MVP_Path"]))
        M=data["cylinder"]
        V=data["viewMatrix"]
        P=data["projectionMatrix"]
        self.M=[]
        for i in range(len(M)):
            self.M.append(
                self.arr2matrix(M[i])
            )
        self.V=self.arr2matrix(V)
        self.P=self.arr2matrix(P)
    def drawAt(self,img):
        density=150
        for i in range(2*density):
            px=0
            py=i/density-1.
            pz=0
            for j in range(len(self.M)):
                p0 = np.array([px,py,pz,1])
                p1 = np.dot(self.M[j], p0)
                p2 = np.dot(self.V   , p1)
                p3 = np.dot(self.P   , p2)
                p4 = p3/p3[3]
                u=1-(p4[1]+1)/2
                v=(p4[0]+1)/2
                x=int(u*img.shape[0])
                y=int(v*img.shape[1])
                pointSize=3
                for k1 in range(2*pointSize):
                    for k2 in range(2*pointSize):
                        x2=x+k1-pointSize
                        y2=y+k2-pointSize
                        if 0<=x2 and x2<img.shape[0] and 0<=y2 and y2<img.shape[1]: 
                            img[x2,y2] = [0, 0, 255,100]
                # img[u*,i] = [255, 0, 0,100]
                # print("self.M[0]",self.M[0])
                # print("self.V",self.V)
                # print("self.P",self.P)
                # print("p3",p3)
                # print("p4\n",p4)

    @staticmethod
    def arr2matrix(arr):
        return np.array([
            [arr[0],arr[4],arr[ 8],arr[12]],
            [arr[1],arr[5],arr[ 9],arr[13]],
            [arr[2],arr[6],arr[10],arr[14]],
            [arr[3],arr[7],arr[11],arr[15]]])
    def test_matrix(self):
        a = np.array([
            [1,2,3],
            [4,5,6],
            [2,5,6]])
        b = np.array([
            [1,0,0],
            [0,2,0],
            [0,0,1]])
        c = np.array([1,1,0])
        # c = np.dot(a, b)
        print(np.dot(a, b))
        print(np.dot(a, c))
        print(c.T)
class Main:
    def __init__(self,opt):
        self.opt=opt
        self.cylinder=Cylinder3D(self.opt)
        self.test()
        
    @staticmethod
    def remove(dir_path):
        print()
    @staticmethod
    def loadJson(path):
        import json
        return json.load(open(path))
    @staticmethod
    def saveImg(image,name):
        cv2.imwrite(name,image)
    def test(self):
        img = cv2.imread(self.opt["inPath"], cv2.IMREAD_UNCHANGED)
        size = img.shape
        w = size[1] #宽度
        h = size[0] #高度
        print("w",w)
        print("size",size)
        for i in range(w):
            for j in range(10):
                img[j,i] = [255, 0, 0,100]

        self.cylinder.drawAt(img)
        #获得指定位置的像素值
        test = img[88,142]
        print (test)
        #修改像素值
        img[88,142] = [1, 255, 255,100]
        print (test)
        
        #分别查看BGR通道像素
        blue = img[88,142,0]
        print (blue)
        green = img[88,142,1]
        print (blue)
        red = img[88,142,2]
        print (blue)
        
        #显示图像
        cv2.imshow("Demo", img)
        
        #等待显示
        cv2.waitKey(0)
        cv2.destroyAllWindows()


