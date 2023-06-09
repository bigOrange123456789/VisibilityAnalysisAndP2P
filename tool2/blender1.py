outpath="C:\\Users\\admin\\Desktop\\save\\"
import bpy
class ModelProcessingTool:
    def __init__(self):
        self.printList=[]
        # self.updateMaterial()
        self.updateMaterial()
        self.w()
        return
    def getLod(self,outpath,number):
        number=20
        min=0.001
        step=(1-min)/(number-1)
        for i in range(20):
            self.simplification_all(min+i*step)
            fileName=str(i+1)+".glb"#name+"_"+str(i)+".glb"
            bpy.ops.export_scene.gltf(filepath=outpath+fileName, export_apply=True)
        print("finished!")

    def __getObj():
        return bpy.data.objects;
    def batch(self):
        self.path="E:\\myModel3D\\in"
        self.names=[
            "1.fbx",
            "2.fbx"
            ]
        self.processOne(0);
        

    def processOne(self,index):
        if index>=len(self.names):
            return;
        self.delete_all()#删除场景中的全部对象
        self.load_fbx(self.path,self.names[index])
        
        #激活全部对象
        for i in bpy.data.objects:#激活剩下的对象
            bpy.context.view_layer.objects.active=i;
        
        #文件处理
        for i in bpy.data.objects:
            i.rotation_euler.z=0;

        #全选
        bpy.ops.object.select_all(action='SELECT')#取消选择

        #下载
        #self.download("E:\\myModel3D\\out","glb")
        bpy.ops.export_scene.fbx(filepath="E:\\myModel3D\\out"+"\\"+self.names[index])

        #处理下一个
        self.processOne(index+1);

    def w(self):
        filepath = bpy.path.abspath('D:\\print.txt')# 获取文件路径
        with open(filepath, 'w') as f:# 打开文件并写入字符串
            for str0 in self.printList:
                f.write(str0+'\n')
    def wType(self,node):
        for key in dir(node):
            attr_value = getattr(node, key)
            attr_type = type(attr_value).__name__
            self.printList.append(key+':'+attr_type)
        self.printList.append("end\n\n\n")
    def updateMaterial(self):
        for material in bpy.data.materials:
            if material.node_tree:
                nodes = material.node_tree.nodes
                for node in nodes:       
                    # 获取材质的 Diffuse BSDF 节点
                    # diffuse_node = nodes.get("Diffuse BSDF")
                    # color_input = diffuse_node.inputs.get("Color")
                    # color_input.default_value = (1.0, 0.0, 0.0, 1.0)
                    
                    if node.type == "MAPPING":
                        # 获取 Mapping 节点的属性
                        mapping_node=node
                        location = mapping_node.inputs["Location"].default_value
                        rotation = mapping_node.inputs["Rotation"].default_value
                        scale = mapping_node.inputs["Scale"].default_value
                        location.x=0
                        location.y=0
                        location.z=0
                        scale.x=1
                        scale.y=1
                        scale.z=1
    def setSpecular(self):
        for material in bpy.data.materials:  
            if material.node_tree:# 检查节点树是否存在
                nodes = material.node_tree.nodes# 获取材质的节点树
                principled_node = nodes.get("Principled BSDF")# 获取材质的 Principled BSDF 节点
                if principled_node:# 如果存在 Principled BSDF 节点，则修改高光属性
                    principled_node.inputs["Specular"].default_value = 0.5  # 将高光强度设置为 0.5
                    principled_node.inputs["Roughness"].default_value = 0.2 
    def move(self,mesh):
        mesh.location.x+=2
    def start(self):
        '''
        #self.delete_all()#删除场景中的全部对象
        #self.load_all("E:\\myModel3D\\2")
        self.delete_noMesh()#删除非mesh对象
        self.merge()
        self.simplification_all(0.5)#输入网格的压缩比
        self.separate('MATERIAL')
        self.reName()
        self.separate('LOOSE')
        #self.download("E:\\myFile\\test\\test")
        '''
        self.process()
        
    def process(self):
        self.delete_all()#删除场景中的全部对象
        self.load_fbx("E:\\myModel3D\\fbx","602E.fbx")
        self.delete_noMesh()#删除非mesh对象
        self.merge()
        self.simplification_all(0.5)#输入网格的压缩比
        self.separate('MATERIAL')
        self.reName()
        self.separate('LOOSE')
        self.download("E:\\myModel3D\\result\\","glb")

    def delete_all(self):
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)
        #bpy.ops.object.delete()

    def merge(self):
        bpy.ops.object.select_all(action='DESELECT')#取消选择
        bpy.ops.object.select_by_type(type='MESH')#选中所有mesh对象
        bpy.ops.object.join()#合并

    def simplification_all(self,r):
        for obj in bpy.data.objects:
            if obj.type=="MESH":
                self.simplification(r,obj)
    def simplification(self,r,obj):
        obj.modifiers.new("dec", type = "DECIMATE")#decimate 毁灭#精简
        obj.modifiers["dec"].ratio = r
        bpy.ops.object.mode_set(mode='OBJECT')

        bpy.ops.object.modifier_apply(modifier='dec')

    def separate(self,type0):
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.separate(type=type0)#SELECTED  "LOOSE"
        bpy.ops.object.mode_set(mode='OBJECT')

    def reName(self):
        k0=0;
        for i in bpy.context.selectable_objects:
            if i.type == 'MESH':
                i.name ="mesh"+str(k0);# "改名网格物体"+i.name
                k0=k0+1;

    def delete_parent(self):
        bpy.ops.object.select_by_type(type='MESH')#选中所有mesh对象
        bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')#(type='CLEAR')#清空所有mesh的父级关系

    def delete_noMesh(self):#只保留mesh类型的对象
        self.delete_parent()
        bpy.ops.object.select_all(action='DESELECT')#取消选择
        for i in bpy.context.selectable_objects:
            if not i.type == 'MESH':
                i.select_set(True)
        bpy.ops.object.delete()
        for i in bpy.data.objects:#激活剩下的对象
            bpy.context.view_layer.objects.active=i;

    def download(self,path,type):#https://blog.csdn.net/boy_love_sky/article/details/107697343
        import re
        import os
        for i in bpy.data.objects:
            if i.type=="MESH":
                bpy.ops.object.select_all(action='DESELECT')#取消之前的选中
                tpath = path + i.name + "."+type
                bpy.ops.object.select_pattern(pattern = i.name)#根据模型名字选中模型
                if type=="fbx":#导出模型
                    bpy.ops.export_scene.fbx(filepath=tpath)
                if type=="glb":
                    bpy.ops.export_scene.gltf(filepath=tpath, use_selection=True)
        '''
        bpy.ops.object.select_by_type(extend=False, type='MESH')#只选中MESH
        ls = bpy.context.selected_objects#获取选中的模型
        for i in ls:
            bpy.ops.object.select_all(action='DESELECT')#取消之前的选中
            tpath = path + i.name + "."+type
            bpy.ops.object.select_pattern(pattern = i.name)#根据模型名字选中模型
            if type=="fbx":#导出模型
                bpy.ops.export_scene.fbx(filepath=tpath, use_selection=True)
            if type=="glb":
                bpy.ops.export_scene.gltf(filepath=tpath, use_selection=True)
        '''
            
        
    def load_fbx(self,path,filename):
        bpy.ops.import_scene.fbx(filepath=(path+"\\"+filename), directory=path,filter_glob=("*.fbx"))
        
    def load_all(self,path):
        self.load(path,"gltf")
        self.load(path,"glb")
        self.load(path,"fbx")
    def load(self,path,type):
        filters = [] # 过滤的fbx文件
        need_file_items = []
        need_file_names = []

        filterDict = {}
        for item in filters:
            filterDict[item] = True;

        import os
        file_lst = os.listdir(path)#获取文件目录

        for item in file_lst:
            fileName, fileExtension = os.path.splitext(item)#将文件名和后缀名分离
            if fileExtension == ("."+type) and (not item in filterDict):
                need_file_items.append(item)
                need_file_names.append(fileName)

        n = len(need_file_items)
        for i in range(n):
            item = need_file_items[i]
            itemName = need_file_names[i]
            ufilename = path + "\\" + item
            
            if type=="fbx":
                bpy.ops.import_scene.fbx(filepath=ufilename, directory=path,filter_glob=("*."+type))
            if type=="gltf":
                bpy.ops.import_scene.gltf(filepath=ufilename, filter_glob='*.glb;*.gltf')
            if type=="glb":
                bpy.ops.import_scene.gltf(filepath=ufilename, filter_glob='*.glb;*.gltf')
    def batch_test(self):#加载一组化身模型
        test=""
        path="E:\\myFile\\CASA2022\\code\\updateAvatarGeometry"#"E:\\myModel3D\\in"
        for myid in "abcdefghijklmn":
            bpy.ops.import_scene.gltf(filepath=path+"\\"+myid+".gltf", filter_glob='*.glb;*.gltf')
            for i in bpy.data.objects:#激活剩下的对象
                bpy.context.view_layer.objects.active=i;
            self.delete_parent()
            bpy.ops.object.select_all(action='DESELECT')#取消选择
            for i in bpy.context.selectable_objects:
                if (not i.type == 'MESH') and (not i.type == 'LIGHT'):
                    i.select_set(True)
            bpy.ops.object.delete()
            ###############
            for i in bpy.context.selectable_objects:
                if i.type == 'MESH' and len(i.name)>5: # The default object name is generally long
                    i.name =myid# 改名
        for i in bpy.context.selectable_objects:
            if i.type == 'LIGHT':
                i.name="test"  
                for j in dir(i):
                    test=test+"."+j
                i.name=test
            
# ModelProcessingTool().getLod(
#     "C:\\Users\\admin\\Desktop\\save\\",
#     "woman01",
#     20
# )
# ModelProcessingTool().getLod(
#     outpath,
#     20
# )
ModelProcessingTool()