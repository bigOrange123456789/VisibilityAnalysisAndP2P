set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/output/library)#设置输出路径
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/output/runtime)#${CMAKE_BINARY_DIR}=build根路径

# # 设置变量，下面的代码都可以用到
# set(GOOGLE_PROTOBUF_DIR ${PROJECT_SOURCE_DIR}/protobuf)
# set(PROTO_PB_DIR ${PROJECT_SOURCE_DIR}/proto_pb2)
# set(PROTO_BUF_DIR ${PROJECT_SOURCE_DIR}/proto_buf)
# # 规定.h头文件路径
# include_directories(
#     ${PROJECT_SOURCE_DIR}
#     ${PROTO_PB_DIR} 
#     ${PROTO_BUF_DIR}
# )


cmake_minimum_required(VERSION 3.17)#cmake的版本

project(DingProject VERSION 1.0.0)  #项目名称以及项目版本
set(LIB_NAME say_hello)
add_library(#(将.cpp/.c/.cc文件)生成.a静态库 --静态库会被打包到exe文件中,而动态库不会
    ${LIB_NAME}#告诉cmake 添加了一个library是hello
    hello.h
    hello.cpp
    method.h
    method.cpp
)#Linux：so、a，Windows：dll、lib
set(EXE_NAME cpp-compiler)
add_executable(  
    ${EXE_NAME} 
    main.cpp 
)#可执行程序的入口  #(可执行文件名称 文件)#生成可执行文件
target_link_libraries(#生成vcxproj文件 #动/静态库都可以
    ${EXE_NAME} 
    PRIVATE ${LIB_NAME}
)# (对add_library或add_executable生成的文件)进行链接操作