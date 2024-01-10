//method.h
#include<iostream>
using namespace std;
int mymax(int x,int y);//在头文件中声明函数
void method();

// 基类
class Shape 
{
   public:
      void setWidth(int w)
      {
         width = w;
      }
      void setHeight(int h)
      {
         height = h;
      }
      void set(int w,int h)
      {
        width = w;
        height = h;
      }
   protected:
      int width;
      int height;
};
 
// 派生类
class Rectangle: public Shape
{
   public:
      int getArea()
      { 
         return (width * height); 
      }
};
