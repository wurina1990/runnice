(function (w) {

    //获得某元素的某属性
    w.getStyle = function getStyle(obj, str) {
        return window.getComputedStyle ? getComputedStyle(obj, null)[str] : obj.currentStyle[str];
    };

    //某元素的某属性以某速度到达某指定位置
    w.move = function move(obj, attr, target, speed, callback) {
        clearInterval(obj.timer);
        var oldValue = parseInt(getStyle(obj, attr));
        speed = target > oldValue ? speed : -speed;

        obj.timer = setInterval(function() {

            var oldValue = parseInt(getStyle(obj, attr))

            var newValue = oldValue + speed;

            if((speed < 0 && newValue < target) || (speed > 0 && newValue > target)) {
                newValue = target;
            }
            obj.style[attr] = newValue + "px";

            if(newValue == target) {
                clearInterval(obj.timer);
                if(callback) {
                    callback();
                }
            }
        }, 30);
    };

    //添加classname
    w.addClass = function addClass(obj, cn) {

        if(!hasClass(obj, cn)) {
            obj.className += " " + cn;
        }

    };

    //判断是否拥有某classname
    w.hasClass = function hasClass(obj, cn) {
        var cnReg = new RegExp("\\b" + cn + "\\b");
        return cnReg.test(obj.className);
    };

    //删除classname
    w.removeClass = function removeClass(obj, cn) {
        var cnReg = new RegExp("\\b" + cn + "\\b");
        obj.className = obj.className.replace(cnReg, "");

    };

    //点击添加再次点击删除classname
    w.toggleClass = function toggleClass(obj, cn) {
        if(hasClass(obj, cn)) {
            removeClass(obj, cn);
        } else {
            addClass(obj, cn);
        }
    };

    //通过classname获取元素
    w.getElesByClass = function getElesByClass(className) {
        var arr = [];
        var allEle = document.all;
        var reg = new RegExp("\\b" + className + "\\b");
        for(var i = 0; i < allEle.length; i++) {
            if(reg.test(allEle[i].className)) {
                arr.push(allEle[i]);
            }
        }
        return arr;
    };

    //实现某元素的transform改变
    w.css=function (obj,name,value){

        if(!obj.transform){
            obj.transform={};
        }

        if(arguments.length>2){
            var result = "";
            obj.transform[name]=value;
            for(item in obj.transform){
                switch (item){
                    case "rotate":
                    case "skewX":
                    case "skewY":
                    case "skew":
                        result +=item+"("+obj.transform[item]+"deg) ";
                        break;

                    case "translateX":
                    case "translateY":
                    case "translateZ":
                    case "translate":
                        result +=item+"("+obj.transform[item]+"px) ";
                        break;

                    case "scale":
                    case "scaleX":
                    case "scaleY":
                        result +=item+"("+obj.transform[item]+") ";
                        break;
                }

            }
            obj.style.WebkitTransform=obj.style.transform=result;

        }else if(arguments.length==2){
            value = obj.transform[name];

            if(typeof value == "undefined"){
                if(name=="scale"||name=="scaleX"||name=="scaleY"){
                    return 1;
                }else{
                    return 0;
                }
            }

            return value;
        }
    };

    //带快速滑屏的竖向滑屏（即点即停,带滚动条,防抖动， 移动端事件）
    w.drag=function (wrap,index,callBack){
        var child = wrap.children[index];
        css(child,"translateZ",0.01);
        var minY = wrap.clientHeight - child.offsetHeight;

        var start={};
        var elementY = 0;

        var ratio = 1;
        var lastPoint =0;
        var lastTime = 0;
        var timeV = 1;
        var pointV =0;
        var Tween = {
            easeOut: function(t,b,c,d,s){
                if (s == undefined) s = 1.70158;
                return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
            },

            Linear: function(t,b,c,d){ return c*t/d + b; }
        };


        var isY = true;
        var isFirst=true;


        wrap.addEventListener("touchstart",function(ev){
            pointV =0;
            timeV = 1;
            child.style.transition="none";

            var touch = ev.changedTouches[0];
            start = {clientX:touch.clientX,clientY:touch.clientY};
            elementY = css(child,"translateY");

            lastPoint = start.clientY;
            lastTime = new Date().getTime();
            clearInterval(wrap.clear);
            if(callBack&&callBack["start"]){
                callBack["start"]();
            }

            isY = true;
            isFirst=true;
        })

        wrap.addEventListener("touchmove",function(ev){
            minY = wrap.clientHeight - child.offsetHeight;
            if(!isY){
                return;
            }
            var touch = ev.changedTouches[0];
            var now = touch;
            var disX = now.clientX-start.clientX;
            var disY = now.clientY-start.clientY;

            if(isFirst){
                isFirst=false;
                if(Math.abs(disX)>Math.abs(disY)){
                    isY=false;
                    return;
                }
            }

            var translateY=elementY+disY;

            if(translateY>0){
                ratio = document.documentElement.clientHeight/((document.documentElement.clientHeight+translateY)*1.8);
                translateY=translateY*ratio;
            }else if(translateY<minY){
                var over = minY - translateY;
                ratio = document.documentElement.clientHeight/((document.documentElement.clientHeight+over)*1.8);
                translateY=minY-(over*ratio);
            }

            var nowTime = new Date().getTime();
            var nowPoint = now.clientY;;
            pointV = nowPoint - lastPoint;
            timeV = nowTime - lastTime;
            lastPoint = nowPoint;
            lastTime = nowTime;

            css(child,"translateY",translateY);

            if(callBack&&callBack["move"]){
                callBack["move"]();
            }
        })

        wrap.addEventListener("touchend",function(){
            var speed = pointV/timeV;
            var addY = speed*200;
            var target= css(child,"translateY")+addY;
            var type="Linear";
            var time =0;
            time = Math.abs(speed)*0.3;
            time =time<0.3?0.3:time;

            if(target>0){
                target=0;
                type="easeOut";
            }else if(target<minY){
                target = minY;
                type="easeOut";
            }

            move(target,time,type);
        });

        function move (target,time,type){
            var t=0;
            var b=css(child,"translateY");
            var c=target-b;
            var d=time/0.01;

            clearInterval(wrap.clear);
            wrap.clear=setInterval(function(){
                t++;
                if(t>d){
                    clearInterval(wrap.clear);

                    if(callBack&&callBack["end"]){
                        callBack["end"]();
                    }
                }else{
                    var dis = Tween[type](t,b,c,d);
                    css(child,"translateY",dis);
                    if(callBack&&callBack["move"]){
                        callBack["move"]();
                    }
                }
            },10);
        }
    };

    //实现360度旋转 图片名称需按要旋转的顺序按阿拉伯数字排列（从0开始）
    w.rotate = function rotate(oImg,imgParent,iImgCount) {
        //oImg为放置图片位置的ID imgParent为图片父元素  iImgCount为图片数量
        var SCALE=10;
        var aImg=[];
        var iLoaded=0;
        var iNow=0;
        var i=0;
        //加载所有资源
        for(i=0;i<iImgCount;i++)
        {
            (function (i){
                var oNewImg=new Image();
                oNewImg.onload=function ()
                {
                    oNewImg.onload=null;

                    var oImg=document.createElement('img');
                    oImg.src=this.src;
                    oImg.style.display='none';
                    document.body.appendChild(oImg);
                    aImg[i]=oImg;

                    if(++iLoaded==iImgCount)onLoad();
                };
                oNewImg.src='img/miaov ('+i+').jpg';
            })(i);
        }

        //效果
        function onLoad()
        {
            for(i=0;i<iImgCount;i++)if(!aImg[i])alert('资源加载失败，请刷新重试');
            var lastImg=null;

            imgParent.removeChild(oImg);
            var body=document.body;
            oImg=null;
            var timer=null;
            var num=iNow;
            var speed=0;

            aImg[0].style.display='block';
            lastImg=aImg[0];

            document.onmousedown=function (ev)
            {
                var oEvent=ev||event;
                var startX=oEvent.clientX;
                var lastX=startX;

                if(body.setCapture)
                {
                    body.onmousemove=onMove;
                    body.onmouseup=onUp;

                    body.setCapture();
                }
                else
                {
                    document.onmousemove=onMove;
                    document.onmouseup=onUp;
                }

                function onMove(ev)
                {
                    var oEvent=ev||event;
                    var i=-(oEvent.clientX-startX)/SCALE;

                    num=(iNow+i+Math.abs(Math.floor(i/iImgCount))*iImgCount)%iImgCount;

                    if(lastImg!=aImg[parseInt(num)])
                    {
                        lastImg.style.display='none';
                        aImg[parseInt(num)].style.display='block';
                        lastImg=aImg[parseInt(num)];
                    }

                    speed=-(oEvent.clientX-lastX)/SCALE;
                    lastX=oEvent.clientX;

                    return false;
                }

                function onUp()
                {
                    this.onmousemove=null;
                    this.onmouseup=null;

                    if(body.releaseCapture)body.releaseCapture();

                    iNow=num;

                    startMove();
                }

                stopMove();

                return false;
            };

            function startMove()
            {
                timer=setInterval(function (){
                    iNow=(iNow+speed+Math.abs(Math.floor(i/iImgCount))*iImgCount)%iImgCount;
                    lastImg.style.display='none';
                    aImg[parseInt(iNow)].style.display='block';
                    lastImg=aImg[parseInt(iNow)];

                    speed*=0.884;

                    if(Math.abs(speed)<=1)
                    {
                        clearInterval(timer);
                        speed=0;
                    }
                }, 30);
            }

            function stopMove()
            {
                clearInterval(timer);
            }
        }
    };

    //实现事件中（如点击事件）某一元素背景颜色与其他颜色不同
    w.showColor=function (num,array,colorA,colorB) {
        //num 为数组中要改变颜色的元素的下标  array为要发生改变颜色事件的数组
        //colorA为数组中所有元素的背景颜色  colorB为num的背景颜色
        index = num;
        for(var j = 0; j < array.length; j++){
            array[j].style.background = colorA;
        }
        array[index].style.background = colorB;
        //父节点根据个人结构需要
        // array[index].parentNode.style.background = colorB;
    };

    //实现事件中（如点击事件）某一元素的transform与其他元素不同
    w.showTransform = function (num,array,transformA,transformB) {
        //num为要改变transform的数组中元素的下标 array为要改变transform的数组
        // transformA为所有元素的transform  transformB为num元素的transform
        index = num;
        for (var z = 0; z < array.length; z++){
            array[z].style.transform = transformA;
            array[z].style.transition = '';

        }
        array[index].style.transition = '1s';
        array[index].style.transform = transformB;


    };

    //实现3D球面标签云效果 oDivId,aAcn传入时需要传字符串
    w.threeCloud = function (oDiv,oDivId,aA,aAcname,color) {
        //oDiv 为要变动的父元素 oDivId为父元素id aA为要变动的数组 aAcn为变动的子元素classname color为显示字体的颜色

        var styleNode = document.createElement("style");
        styleNode.innerHTML= "#"+oDivId+" {position:relative; width:450px; height:450px; margin: 20px auto 0; display:inline-block}";
        styleNode.innerHTML+= "#"+oDivId+" ."+aAcname+" {position:absolute; top:0px; left:0px; display:inline-block;font-family: Microsoft YaHei; color:"+color+"; font-weight:bold; text-decoration:none; padding: 3px 6px; }";
        document.head.appendChild(styleNode);
        



        var radius = 120;
        var dtr = Math.PI/180;
        var d=300;

        var mcList = [];
        var active = false;
        var lasta = 1;
        var lastb = 1;
        var distr = true;
        var tspeed=10;
        var size=250;

        var mouseX=0;
        var mouseY=0;

        var howElliptical=1;


        var i=0;
        var oTag=null;

        for(i=0;i<aA.length;i++)
        {
            oTag={};

            oTag.offsetWidth=aA[i].offsetWidth;
            oTag.offsetHeight=aA[i].offsetHeight;

            mcList.push(oTag);
        }

        sineCosine( 0,0,0 );

        positionAll();

        oDiv.onmouseover=function ()
        {
            active=true;
        };

        oDiv.onmouseout=function ()
        {
            active=false;
        };

        oDiv.onmousemove=function (ev)
        {
            var oEvent=window.event || ev;

            mouseX=oEvent.clientX-(oDiv.offsetLeft+oDiv.offsetWidth/2);
            mouseY=oEvent.clientY-(oDiv.offsetTop+oDiv.offsetHeight/2);

            mouseX/=5;
            mouseY/=5;
        };

        setInterval(update, 30);


        function update()
        {
            var a;
            var b;

            if(active)
            {
                a = (-Math.min( Math.max( -mouseY, -size ), size ) / radius ) * tspeed;
                b = (Math.min( Math.max( -mouseX, -size ), size ) / radius ) * tspeed;
            }
            else
            {
                a = lasta * 0.98;
                b = lastb * 0.98;
            }

            lasta=a;
            lastb=b;

            if(Math.abs(a)<=0.01 && Math.abs(b)<=0.01)
            {
                return;
            }

            var c=0;
            sineCosine(a,b,c);
            for(var j=0;j<mcList.length;j++)
            {
                var rx1=mcList[j].cx;
                var ry1=mcList[j].cy*ca+mcList[j].cz*(-sa);
                var rz1=mcList[j].cy*sa+mcList[j].cz*ca;

                var rx2=rx1*cb+rz1*sb;
                var ry2=ry1;
                var rz2=rx1*(-sb)+rz1*cb;

                var rx3=rx2*cc+ry2*(-sc);
                var ry3=rx2*sc+ry2*cc;
                var rz3=rz2;

                mcList[j].cx=rx3;
                mcList[j].cy=ry3;
                mcList[j].cz=rz3;

                per=d/(d+rz3);

                mcList[j].x=(howElliptical*rx3*per)-(howElliptical*2);
                mcList[j].y=ry3*per;
                mcList[j].scale=per;
                mcList[j].alpha=per;

                mcList[j].alpha=(mcList[j].alpha-0.6)*(10/6);
            }

            doPosition();
            depthSort();
        }

        function depthSort()
        {
            var i=0;
            var aTmp=[];

            for(i=0;i<aA.length;i++)
            {
                aTmp.push(aA[i]);
            }

            aTmp.sort
            (
                function (vItem1, vItem2)
                {
                    if(vItem1.cz>vItem2.cz)
                    {
                        return -1;
                    }
                    else if(vItem1.cz<vItem2.cz)
                    {
                        return 1;
                    }
                    else
                    {
                        return 0;
                    }
                }
            );

            for(i=0;i<aTmp.length;i++)
            {
                aTmp[i].style.zIndex=i;
            }
        }

        function positionAll()
        {
            var phi=0;
            var theta=0;
            var max=mcList.length;
            var i=0;

            var aTmp=[];
            var oFragment=document.createDocumentFragment();

            for(i=0;i<aA.length;i++)
            {
                aTmp.push(aA[i]);
            }

            aTmp.sort
            (
                function ()
                {
                    return Math.random()<0.5?1:-1;
                }
            );

            for(i=0;i<aTmp.length;i++)
            {
                oFragment.appendChild(aTmp[i]);
            }

            oDiv.appendChild(oFragment);

            for( var i=1; i<max+1; i++){
                if( distr )
                {
                    phi = Math.acos(-1+(2*i-1)/max);
                    theta = Math.sqrt(max*Math.PI)*phi;
                }
                else
                {
                    phi = Math.random()*(Math.PI);
                    theta = Math.random()*(2*Math.PI);
                }

                mcList[i-1].cx = radius * Math.cos(theta)*Math.sin(phi);
                mcList[i-1].cy = radius * Math.sin(theta)*Math.sin(phi);
                mcList[i-1].cz = radius * Math.cos(phi);

                aA[i-1].style.left=mcList[i-1].cx+oDiv.offsetWidth/2-mcList[i-1].offsetWidth/2+'px';
                aA[i-1].style.top=mcList[i-1].cy+oDiv.offsetHeight/2-mcList[i-1].offsetHeight/2+'px';
            }
        }

        function doPosition()
        {
            var l=oDiv.offsetWidth/2;
            var t=oDiv.offsetHeight/2;
            for(var i=0;i<mcList.length;i++)
            {
                aA[i].style.left=mcList[i].cx+l-mcList[i].offsetWidth/2+'px';
                aA[i].style.top=mcList[i].cy+t-mcList[i].offsetHeight/2+'px';

                aA[i].style.fontSize=Math.ceil(12*mcList[i].scale/2)+8+'px';

                aA[i].style.filter="alpha(opacity="+100*mcList[i].alpha+")";
                aA[i].style.opacity=mcList[i].alpha;
            }
        }

        function sineCosine( a, b, c)
        {
            sa = Math.sin(a * dtr);
            ca = Math.cos(a * dtr);
            sb = Math.sin(b * dtr);
            cb = Math.cos(b * dtr);
            sc = Math.sin(c * dtr);
            cc = Math.cos(c * dtr);
        }
    };
    
    //整个页面添加画布实现鼠标移动吸引多个小点
    w.mouseCount  = function (color,opacity,zIndex,count) {
        //color 是小点点的颜色 opacity是透明度  zIndex是层级优先级 count是小点点的数量
        !function() {
            function o(w, v, i) {
                return w.getAttribute(v) || i
            }
            function j(i) {
                return document.getElementsByTagName(i)
            }
            function l() {
                var i = j("script"),
                    w = i.length,
                    v = i[w - 1];
                return {
                    l: w,
                    z: o(v, "zIndex", zIndex),
                    o: o(v, "opacity", opacity),
                    c: o(v, "color", color),
                    n: o(v, "count", count)
                }
            }
            function k() {
                r = u.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth, n = u.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
            }
            function b() {
                e.clearRect(0, 0, r, n);
                var w = [f].concat(t);
                var x, v, A, B, z, y;
                t.forEach(function(i) {
                    i.x += i.xa, i.y += i.ya, i.xa *= i.x > r || i.x < 0 ? -1 : 1, i.ya *= i.y > n || i.y < 0 ? -1 : 1, e.fillRect(i.x - 0.5, i.y - 0.5, 1, 1);
                    for (v = 0; v < w.length; v++) {
                        x = w[v];
                        if (i !== x && null !== x.x && null !== x.y) {
                            B = i.x - x.x, z = i.y - x.y, y = B * B + z * z;
                            y < x.max && (x === f && y >= x.max / 2 && (i.x -= 0.03 * B, i.y -= 0.03 * z), A = (x.max - y) / x.max, e.beginPath(), e.lineWidth = A / 2, e.strokeStyle = "rgba(" + s.c + "," + (A + 0.2) + ")", e.moveTo(i.x, i.y), e.lineTo(x.x, x.y), e.stroke())
                        }
                    }
                    w.splice(w.indexOf(i), 1)
                }), m(b)
            }
            var u = document.createElement("canvas"),
                s = l(),
                c = "c_n" + s.l,
                e = u.getContext("2d"),
                r, n, m = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
                    function(i) {
                        window.setTimeout(i, 1000 / 45)
                    }, a = Math.random, f = {
                    x: null,
                    y: null,
                    max: 20000
                };
            u.id = c;
            u.style.cssText = "position:fixed;top:0;left:0;z-index:" + s.z + ";opacity:" + s.o;
            j("body")[0].appendChild(u);
            k(), window.onresize = k;
            window.onmousemove = function(i) {
                i = i || window.event, f.x = i.clientX, f.y = i.clientY
            }, window.onmouseout = function() {
                f.x = null, f.y = null
            };
            for (var t = [], p = 0; s.n > p; p++) {
                var h = a() * r,
                    g = a() * n,
                    q = 2 * a() - 1,
                    d = 2 * a() - 1;
                t.push({
                    x: h,
                    y: g,
                    xa: q,
                    ya: d,
                    max: 6000
                })
            }
            setTimeout(function() {
                b()
            }, 100)
        }();
    };
    
    //以某个图片为背景实现下雨带波纹特效
    w.rain = function (image,id,canvasId,weight,speed) {
        //img 是被下雨的背景图片 id为最外层容器的id  canvasId为定义好的画布的id   weight雨滴的大小
        // speed为下雨的速度为毫秒，1000为一秒一个雨滴的意思，越少越快
        var floor = Math.floor;//向下取整
        var canvas;//画布
        var context;//画布上下文
        var width;//背景图片、画布宽
        var height;//背景图片、画布宽
        var size;//像素点个数、width*height
        var nextPoint = [];//下一振幅
        var prePoint = [];//上一振幅
        var tempPoint = [];//临时存储
        var imgData;//背景图片数据
        var speed = speed ;//下雨大小，没写就是一秒钟一个雨滴
        var weight = weight;//雨滴的大小
        /**
         description:开始启动程序
         **/
//                    function start() {
//                        initImage("background.jpg");
//                    }
        /**
         author:qingfeilee
         date:2012-03-24
         description:初始化图片信息
         **/
        function initImage(src) {
            var img = new Image();
            img.src = src;
            img.onload = function() {
                init(img);
            };
        }
//                    initImage("background.jpg");
        initImage(image);
        /**
         description:初始化系统函数
         **/
        function init(img){
            initSize(img);
            initPoint();
            initCanvas();
            loadImage(img);
        }
        /**
         author:qingfeilee
         date:2012-03-24
         description:绘制图片函数
         **/
        function loadImage(img){
            context.drawImage(img, 0, 0);
            imgData = context.getImageData(0, 0, width, height);
            setInterval(spread, 1000/60);
            setInterval(rain, speed);
        }
        /**
         author:qingfeilee
         date:2012-03-24
         description:初始化画布信息
         **/
        function initCanvas(){
            canvas = document.getElementById(canvasId);
            context =canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            canvas.onclick = function(e) {
                setDropPoint(floor(e.clientX-(document.body.clientWidth  - width)/2), floor(e.clientY - (document.body.clientHeight  - height) / 2), 15000);
            }
        }
        /**
         author:qingfeilee
         date:2012-03-24
         description:设置画布宽高及画布像素数
         **/
        function initSize(img){
            width = img.width;
            height = img.height;
            document.getElementById(id).style.width = width+"px";
            document.getElementById(id).style.height = height+"px";
            size = width*height;
        }
        /**
         author:qingfeilee
         date:2012-03-24
         description:初始化存储图像前一个和后一个点的数组
         **/
        function initPoint(){
            for (var i = 0; i < size; i++) {
                nextPoint.push(0);
                prePoint.push(0);
            }
        }
        /**
         description:一石激起千层浪，设置波动点及注入的能量
         其中x表示物体进入水面的X坐标，Y表示物体进入水面的Y坐标，power表示物体的能量大小
         **/
        function setDropPoint(x, y, power) {
            if (x < 2 || x > width - 2 || y < 1 || y > height - 2) return;
            var i = x + y * width;
            nextPoint[i] += power;
            nextPoint[i - 1] -= power;
        }
        /**
         description:核心算法，处理像素的波动效果
         PS:该算法非原创，借鉴网络上多个版本算法综合
         **/
        function spread() {
            var img = context.getImageData(0, 0, width, height),
                data = img.data;
            //平均一下各个点的能量
            for (var i = width + 1; i < size - width - 1; i += 2) {
                for (var x = 1; x < width - 1; x++, i++) {
                    nextPoint[i] = (nextPoint[i] + nextPoint[i + 1] + nextPoint[i - 1] + nextPoint[i - width] + nextPoint[i + width]) / 5;
                }
            }
            //渲染除了第一行、最后一行、第一列、最后一列外的所有点
            for (var i = width + 1; i < size - width - 1; i += 2) {
                for (var x = 1; x < width - 1; x++, i++) {
                    //水波振幅线性公式参考的是网络上的一些研究文献得出的
                    prePoint[i] = (nextPoint[i - 1] + nextPoint[i + 1] + nextPoint[i + width] + nextPoint[i - width])/2 - prePoint[i];
                    var ti = i + floor((prePoint[i - 2] - prePoint[i]) * 0.08) + floor((prePoint[i - width] - prePoint[i]) * 0.08) * width;
                    ti = ti < 0 ? 0 : ti > size ? size: ti;
                    var light = prePoint[i] * 2.0 - prePoint[i - 2] * 0.6;
                    light = light < -10 ? -10 : light > 100 ? 100 : light;
                    //之所以是i*4是因为canvas获取的data数据每四个值表示一个像素包括分别是红/绿/蓝/透明,要想了解更多关于canvas的请参看我的另一篇blog：http://blog.csdn.net/qingfeilee/article/details/7233683
                    data[i * 4] = imgData.data[ti * 4] + light;
                    data[i * 4 + 1] = imgData.data[ti * 4 + 1] + light;
                    data[i * 4 + 2] = imgData.data[ti * 4 + 2] + light;
                    //波能渐渐衰减
                    prePoint[i] -= prePoint[i]>>5;
                }
            }
            tempPoint = nextPoint;
            nextPoint = prePoint;
            prePoint = tempPoint;
            context.putImageData(img, 0, 0);
        }
        
        function rain(){
            setDropPoint(floor(Math.random()*width), floor(Math.random()*height), floor(Math.random()*weight));
        }
        function setWeight(weight){
            this.weight = weight;
        }
    };
  
    
})(window);
