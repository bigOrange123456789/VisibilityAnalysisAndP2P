#include"iostream"
#include "method.h"
using namespace std;
void say_hello(){
    cout<<"say hello: world gakki  --hello.cpp"<<endl;
    method();
    cout<<"mymax(7,8)="<<mymax(7,8)<<endl;
}
// class Box2
// {
//    private:
//       double length;   // 盒子的长度
//       double breadth;  // 盒子的宽度
//       double height;   // 盒子的高度
//    public:
//       double getVolume()
//       {
//          return length * breadth * height;
//       }
//       void set( double len, double bre, double hei ){
//             length = len;
//             breadth = bre;
//             height = hei;
//         }

// };
// double Box2::getVolume(void)
// {
//     return length * breadth * height;
// }
// void Box2::set( double len, double bre, double hei )
// {
//     length = len;
//     breadth = bre;
//     height = hei;
// }