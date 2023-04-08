from Mesh import Mesh
import numpy as np
import matplotlib.pyplot as plt
import math
import json
class Voxelization:
    def __init__(self,config):
        # return
        self.voxel_size=config["voxel_size"]#0.2
        self.min_coords=config["min_coords"]#[-121000]
        self.max_coords=config["max_coords"]#[]

        self.f=[]
        for i in range(config["objNumber"]):
            mesh=Mesh(config["pathPre"]+str(i)+".obj")
            self.addF(mesh)
        
        # m0 = Mesh('test2.obj')
        # f=self.getF(m0)
        self.getVoxel(self.f)
        self.saveVoxel("voxel.json")
        self.showVoxel()
    # def __init__(self,config):
    #     # return
    #     self.voxel_size=0.2
    #     m0 = Mesh('test2.obj')
    #     self.f=self.getF(m0)
    #     self.setCoords()
    #     v=self.getVoxel(self.f)
    #     self.saveVoxel("voxel.json")
    #     # self.showVoxel(v)
    def getF(self,mesh):
        f=[]
        for i in range(len(mesh.face)):
            f0=mesh.getTriangle(i)[0]
            f.append(f0)
        return f
    def addF(self,mesh):
        for i in range(len(mesh.face)):
            f0=mesh.getTriangle(i)[0]
            self.f.append(f0)
    def setCoords(self):
        self.min_coords=np.min(self.f, axis=(0,1))
        self.max_coords=np.max(self.f, axis=(0,1))
    def getTest(self):
        return [[[0,0,0], [0,1,0], [1,0,0]],
             [[1,0,0], [0,1,0], [1,1,0]],
             [[0,0,1], [0,1,1], [1,0,1]],
             [[1,0,1], [0,1,1], [1,1,1]],
             [[0,0,0], [0,0,1], [0,1,0]],
             [[0,1,0], [0,0,1], [0,1,1]],
             [[1,0,0], [1,0,1], [1,1,0]],
             [[1,1,0], [1,0,1], [1,1,1]],
             [[0,0,0], [0,0,1], [1,0,0]],
             [[1,0,0], [0,0,1], [1,0,1]],
             [[0,1,0], [0,1,1], [1,1,0]],
             [[1,1,0], [0,1,1], [1,1,1]]]
    def showVoxel(self,voxels):
        # 可视化体素化结果
        fig = plt.figure()
        ax = fig.gca(projection='3d')
        ax.voxels(voxels, edgecolor='k')
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
        plt.show()
    def getVoxel(self,triangles):
        # 确定体素分辨率
        voxel_size = self.voxel_size

        # 计算体素坐标范围
        min_coords = self.min_coords#np.min(triangles, axis=(0,1))
        max_coords = self.max_coords#np.max(triangles, axis=(0,1))
        x_range = np.arange(min_coords[0], max_coords[0]+voxel_size, voxel_size)
        y_range = np.arange(min_coords[1], max_coords[1]+voxel_size, voxel_size)
        z_range = np.arange(min_coords[2], max_coords[2]+voxel_size, voxel_size)

        # 创建体素对象并初始化为0
        voxels = np.zeros((len(x_range), len(y_range), len(z_range)), dtype=np.int8)

        # 对于每个三角形，将其覆盖的体素点设置为1
        
        for x in range(voxels.shape[0]):
            print(voxels.shape[0],x)
            for y in range(voxels.shape[1]):
                for z in range(voxels.shape[2]):        
                    box=self.getBox(x,y,z)
                    for triangle in triangles:
                        if self.intersect(triangle,box):
                            voxels[x, y, z] = 1
                            continue
        self.voxels=voxels
        return voxels
    def saveVoxel(self,path):
        import json
        json.dump(
            self.voxels.tolist(),
            open(path, 'w'), 
            indent=4 )


    def getBox(self,x,y,z):
        self.minX=self.min_coords[0]
        self.minY=self.min_coords[1]
        self.minZ=self.min_coords[2]
        s=self.voxel_size
        box0= [
            [(x-0.5)*s+self.minX,(x+0.5)*s+self.minX],
            [(y-0.5)*s+self.minY,(y+0.5)*s+self.minY],
            [(z-0.5)*s+self.minZ,(z+0.5)*s+self.minZ]
        ]
        box=[]
        for i in range(2):
            for j in range(2):
                for k in range(2):
                    box.append([box0[0][i],box0[1][j],box0[2][k]])
        return box
    
    def intersect(self,triangle,box):
        # 定义一个三角形
        triangle = np.array(triangle)#np.array([[0, 0, 0], [1, 0, 0], [0, 1, 0]])
            
        box = np.array(box)
        #np.array([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]])
            
        # 计算三角形的法向量
        normal = np.cross(triangle[1]-triangle[0], triangle[2]-triangle[0])
            
        # 对于每个可能的分离轴
        for axis in [np.array([1, 0, 0]), np.array([0, 1, 0]), np.array([0, 0, 1]), normal]:
            # 计算三角形在轴上的投影
            tri_min = np.min(np.dot(triangle, axis))
            tri_max = np.max(np.dot(triangle, axis))
                
            # 计算方块在轴上的投影
            box_min = np.min(np.dot(box, axis))
            box_max = np.max(np.dot(box, axis))
                
            # 判断是否有重叠
            if tri_max < box_min or tri_min > box_max:
                # 分离轴定理：如果三角形和方块在某个分离轴上没有重叠，则它们不相交
                return False#print("三角形和方块不相交")
                break
        else:
            # 如果没有任何一个分离轴上没有重叠，则三角形和方块相交
            return True#print("三角形和方块相交")
            
if __name__ == "__main__":
    # Voxelization()
    id=6
    path="F:/gitHubRepositories/VisibilityAnalysisAndP2P/config/config"+str(id)+".json"
    c_all=json.load(open(path, 'r'))
    c=c_all["src"]["Building_new"]["createSphere"]
    c["x"][0]
    Voxelization({
        "voxel_size":c["x"][2],
        "min_coords":[
            c["x"][0],
            c["y"][0],
            c["z"][0]
        ],
        "max_coords":[
            c["x"][1],
            c["y"][1],
            c["z"][1]
        ],
        "pathPre":"F:/gitHubRepositories/vk-precompute-main/model6/obj/",
        "objNumber":1278
    })
    print()
# if __name__ == "__main__":
#     Voxelization({})



