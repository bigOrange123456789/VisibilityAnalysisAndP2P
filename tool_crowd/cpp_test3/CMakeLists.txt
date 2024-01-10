set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
cmake_minimum_required(VERSION 3.17)#这个用来表示cmake的版本
project(DingProject VERSION 1.0.0)  #这里表示项目名称以及项目版本
#告诉cmake 添加了一个library是hello
#之后使用target_link_libraries把say_hello和cpp-compiler连接起来
add_library(
    say_hello
    hello.h
    hello.cpp
    method.h
    method.cpp
)
add_executable(cpp-compiler main.cpp)#可执行程序的入口
target_link_libraries(cpp-compiler PRIVATE say_hello)