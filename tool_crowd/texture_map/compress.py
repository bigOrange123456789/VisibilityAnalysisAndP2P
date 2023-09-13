from PIL import Image
pathin="F:\gitHubRepositories/VisibilityAnalysisAndP2P/dist/assets/space8Zip/textureOrigin"
pathout="F:\gitHubRepositories/VisibilityAnalysisAndP2P/dist/assets/space8Zip/textureCompress"
def compress(name):
    

    # 打开要压缩的图片
    input_image =  pathin +"/"+name#"input.jpg"
    output_image = pathout+"/"+name#"output.jpg"

    # 打开图像文件
    img = Image.open(input_image)

    # 设置目标分辨率
    new_width = 1  # 新的宽度
    new_height = 1  # 新的高度

    # 使用thumbnail()方法来缩小图像，保持纵横比
    # img.thumbnail((new_width, new_height))
    # 使用resize()方法来拉伸图像
    img = img.resize((new_width, new_height))

    # 保存压缩后的图像
    img.save(output_image)

    # 关闭图像文件
    img.close()
import os
def start():
    for root, dirs, files in os.walk(pathin):
        for name in files:
            compress(name)#print(name)
start()