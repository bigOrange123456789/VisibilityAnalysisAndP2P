void say_hello();
#include "method.h"
class Box2
{
   private:
      double length;   // 盒子的长度
      double breadth;  // 盒子的宽度
      double height;   // 盒子的高度
   public:
    //   double getVolume();
    //   void set( double len, double bre, double hei );
      double getVolume()
      {
         return length * breadth * height;
      }
      void set( double len, double bre, double hei ){
            length = len;
            breadth = bre;
            height = hei;
      }
      void test()
      {
        Rectangle rectangle;
        rectangle.set(2,5);
        cout << "the area of rectangle is:" << rectangle.getArea() <<endl;
      }
};

