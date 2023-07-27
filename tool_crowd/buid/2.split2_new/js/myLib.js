var h1Top=500
function h1(str,size){
    var oText=document.createElement('h1');
    oText.innerHTML=str;
    oText.style.cssText=
        //'color:skyblue;'+
        //'color:'+color+';'+//文字颜色
        //'background:#aff;'+//背景颜色
        'font-size:'+size+'px;'+//文字大小
        //'width:60px;height:40px;'+//文本大小
        'font-weight:normal;'+
        //+'padding-top:50px;'//距离上一个对象的距离
        'position:fixed;'+//到窗体的位置
        'left:'+0+'px;'+//到部件左边距离
        'top:'+h1Top+'px;'; //到部件右边 距离
        h1Top+=(size*2)
        document.body.appendChild(oText);
    return oText;
}
function so(o1,o2) {
    o2.position.set(o1.position.x, o1.position.y, o1.position.z)
    o2.scale.set(o1.scale.x, o1.scale.y, o1.scale.z)
    o2.rotation.set(o1.rotation.x, o1.rotation.y, o1.rotation.z)
}