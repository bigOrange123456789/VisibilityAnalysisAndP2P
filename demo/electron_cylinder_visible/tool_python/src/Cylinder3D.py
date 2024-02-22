import numpy as np
import time as t
import json
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

        c = np.array([0,700,0,1])
        print("p\n",self.P)
        c2=np.dot(self.P,c)
        # c3=c2/c2[3]
        print("c3\n",c2)
    def drawAt(self,img,imgOld):
        density=150
        maxtest=-999
        mintest=999
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
                depth=p4[2]
                depth1=(1-(depth+1)/2)*255.

                x=int(u*img.shape[0])
                y=int(v*img.shape[1])
                pointSize=3
                for k1 in range(2*pointSize):
                    for k2 in range(2*pointSize):
                        x2=x+k1-pointSize
                        y2=y+k2-pointSize
                        if 0<=x2 and x2<img.shape[0] and 0<=y2 and y2<img.shape[1]: 
                            

                            
                            depth2=imgOld[x2,y2][0]
                            if not depth2==0 and not depth2==255 and depth1<depth2:
                                img[x2,y2] = [0,  255,0,255]
                            else:
                                img[x2,y2] = [0, 0, 255,255]


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