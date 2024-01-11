#include"iostream"
#include"hello.h"
using namespace std;
class Box
{
   private:
      double length;   // 盒子的长度
      double breadth;  // 盒子的宽度
      double height;   // 盒子的高度
   public:
      double getVolume()
      {
         return length * breadth * height;
      }
      void set( double len, double bre, double hei ){
            length = len;
            breadth = bre;
            height = hei;
        }

};


int func0(int a,int b){
    return a+b;
}
int main(void){
    cout<<"main:hello world!"<<endl;
    cout<<"func0(2,3)="<<func0(2,3)<<endl;
    say_hello();


    Box box;    
    box.set(16.0, 2.0, 5.0);
    cout << "the volume of box=" << box.getVolume() <<endl;

    Box2 box2;    
    box2.set(10.0, 2.0, 2.0);
    cout << "the volume of box2=" << box2.getVolume() <<endl;
    box2.test();

    // Rectangle rectangle;
    // rectangle.set(2,5);
    // cout << "the area of rectangle is:" << rectangle.getArea() <<endl;

    return 0;
}