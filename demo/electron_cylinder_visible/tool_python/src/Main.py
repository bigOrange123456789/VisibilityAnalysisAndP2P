import time as t
import json
import cv2
from Cylinder3D import Cylinder3D
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
        imgOld= cv2.imread(self.opt["inPath"], cv2.IMREAD_UNCHANGED)
        img   = cv2.imread(self.opt["inPath"], cv2.IMREAD_UNCHANGED)
        size = img.shape
        w = size[1] #宽度
        h = size[0] #高度
        # print("w",w)
        # print("size",size)
        # for i in range(w):
        #     for j in range(10):
        #         img[j,i] = [255, 0, 0,100]

        self.cylinder.drawAt(img,imgOld)
        #获得指定位置的像素值
        test = img[88,142]
        print (test)
        #修改像素值
        img[88,142] = [1, 255, 255,100]
        print (test)
        
        # #分别查看BGR通道像素
        # blue = img[88,142,0]
        # print (blue)
        # green = img[88,142,1]
        # print (blue)
        # red = img[88,142,2]
        # print (blue)
        
        #显示图像
        cv2.imshow("Demo", img)
        
        #等待显示
        cv2.waitKey(0)
        cv2.destroyAllWindows()
        cv2.imwrite(self.opt["outPath"],img)


