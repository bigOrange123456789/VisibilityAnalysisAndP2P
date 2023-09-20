# from ViewpointList import ViewpointList
from Loader import Loader
class Main: #所有视点,每个视点的可见特征
    def __init__(self):
        id=0
        Loader("data/KaiLiNan_new",id).saveVVD()
        return              

if __name__ == "__main__":#用于测试
    Main()