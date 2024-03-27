assets
      project1
      project2
      ...
dist
      assets
             project1
             project2
             ...
demo
      project1
             config
             server
             src
             1.light-weight.bat
             2.open-server.bat
             3.release.bat
      project2
      ...
lib
      light-weight
      crowd
-----------
5.（server相关代码在Linux操作系统下运行）将第3步中的场景图sceneGraph.json和boundingBox.json、boundingSphere.json放到"server/assets/"文件夹下，将json格式的occluder文件放到”assets/occluder”文件夹下。
6.修改端口号（"server/lib/server.h"第56行），编译指令g++ main.cpp -o main -lwfrest -lworkflow（需安装wfrest），启动main等待初始化。
【新建窗口】screen -S screenName
【配置路径】export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/home/ubuntu/export_lib/
【添加权限】chmod +x main4001-on
【启动后台】./main4001-on
【隐藏窗口】Ctrl+AD

7.【发布】编辑sceneGraphDemo服务器ip地址及端口号（"sceneGraphDemo\lib\SceneManager.js"下第46行），打开页面http://localhost:3000/?scene=文件名，根据结果调整服务器参数（"server/lib/scene_info.h"第12行W，W越大，拾取得越多）和初始视点（"sceneGraphDemo\src\viewer.js"第145行）
