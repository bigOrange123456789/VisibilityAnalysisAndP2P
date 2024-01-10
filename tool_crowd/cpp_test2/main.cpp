#include"iostream"
#include"hello.h"
using namespace std;
int func0(int a,int b){
    return a+b;
}
int main(void){
    cout<<"main:hello world!"<<endl;
    cout<<"func0(2,3)="<<func0(2,3)<<endl;
    say_hello();
    return 0;
}