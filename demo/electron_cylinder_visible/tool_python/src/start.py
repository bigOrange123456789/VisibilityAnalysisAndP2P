from Main import Main
if __name__ == "__main__":#用于测试
    import sys
    if len(sys.argv)<2:
        print("ERR:请指定config.json的路径")
        exit(0)
    path=sys.argv[1]
    config=Main.loadJson(path)
    Main(config)