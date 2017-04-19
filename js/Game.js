//游戏类，中央控制类
var Game = Class.extend({
	//初始化
	init : function(canvasid){
		//画布
		this.canvas = document.getElementById(canvasid);
		//上下文
		this.ctx = this.canvas.getContext("2d");
		//资源对象，v是图片地址，就是R.txt中的对象
		this.RObj = null;
		//图片对象，v是图片对象
		this.R = {};
		//帧编号
		this.f = 0;
		//fps
		this.fps = 60;
        //有限状态机A.静稳状态 B.判断 C.爆破下落补充新的
        this.FSM = "B";
        //随机产生本次游戏使用的7个图片
        this.spriteStyles = _.sample(["i0", "i1", "i2", "i3", "i4", "i5", "i6", "i7", "i8", "i9", "i10", "i11", "i12", "i13", "i14"], 7);
        //预定事件
        this.registedIncidentArray = [];
		//加载资源
		this.loadResouces(function(){
			//加载资源完毕之后，开始游戏
			this.start();
		});
	},
	//加载资源
	loadResouces : function(callback){
		//备份
		var self = this;
		//提示用户
		self.ctx.font = "20px 微软雅黑";
		self.ctx.textAlign = "center";
		self.ctx.fillText("正在加载图片资源..." , self.canvas.width/2,150);
		
		//使用Ajax读取R.txt文件
		var xhr  = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4){
				//资源对象
				self.RObj = JSON.parse(xhr.responseText)
				//已经加载好的图片个数
				var count = 0;
				//图片总数就是对象键的个数
				var amount = _.size(self.RObj);
				//遍历这个对象，发出HTTP请求请求图片
				for(var k in self.RObj){
					self.R[k] = new Image();
					self.R[k].src = self.RObj[k];
					//监听
					self.R[k].onload = function(){
						//计数
						count++;
						//清屏，提示用户加载到几张了
						self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
						self.ctx.fillText("正在加载图片资源" + count + "/" + amount,self.canvas.width/2,150);
						//加载完毕的时候
						if(count == amount){
							callback.call(self);
						}
					}
				}
			}
		}
		xhr.open("get","R.txt",true);
		xhr.send(null);
	},
	//开始游戏
	start : function(){
		//调整字体
		this.ctx.textAlign = "left";
		this.ctx.font = "16px consolas";
		//记录开始游戏的T0
		this.T0 = Date.parse(new Date());
		//记录T0的帧号
		this.T0f = 0;
		//场景管理器，这是Game类唯一new出的东西
		this.scene = new Scene();
        //调用自己的默认场景
        this.scene.changeScene(1);
		//调用主循环
		this.mainloop();
	},
	//主循环函数
	mainloop : function(){
        var self = this;
        //帧编号改变
		this.f++;
        //看看这一帧有没有被预定事件
        _.each(this.registedIncidentArray,function(obj){
            if(obj.frameNumber == self.f){
                obj.fn.call(self);
                //删除这个注册
                self.registedIncidentArray = _.without(self.registedIncidentArray,obj);
            }
        });

        //清屏
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

		//渲染场景，至于场景怎么渲染Game类就不要管这么多了
		this.scene.render();

        //颜色
        this.ctx.fillStyle = "white";
		//打印帧编号
		this.ctx.fillText("帧编号FNO " + this.f , 10, 20);
		//当这一个帧的时刻与T0时刻差了1000毫秒，此时这个帧与T0之间的帧间隔数量，就是fps
		if(Date.parse(new Date()) - this.T0 >= 1000){
			//每秒流逝多少帧，就是当前的帧编号与T0的帧号差
			this.fps = this.f - this.T0f;
			//自己成为新的T0
			this.T0 = Date.parse(new Date());
			this.T0f = this.f;
		}
		//打印fps
		this.ctx.fillText("帧速率FPS " + this.fps , 10, 40);
        //打印有限状态机
		this.ctx.fillText("有限状态机FSM " + this.FSM , 10, 60);

        //TODO:为了方便我们调试，我们往表格中实时输出当前的矩阵
        for(var i = 0 ; i < 7 ; i++){
            for(var j = 0 ; j < 7 ; j++){
                document.getElementById("tiaoshi1").getElementsByTagName("tr")[i].getElementsByTagName("td")[j].innerHTML = this.map.code[i][j];
            }
        }

        //TODO:为了方便我们调试，我们往表格中实时输出临时矩阵
        for(var i = 0 ; i < 7 ; i++){
            for(var j = 0 ; j < 7 ; j++){
                if(this.map.tempCode[i][j] != undefined){
                    document.getElementById("tiaoshi3").getElementsByTagName("tr")[i].getElementsByTagName("td")[j].innerHTML = this.map.tempCode[i][j];
                }
            }
        }

		//自己调用自己，HTML5新定时器函数
		var self = this;
		window.requestAnimationFrame(function(){
			self.mainloop.call(self);
		});

        //window.setTimeout(function(){
        //        	self.mainloop.call(self);
        //        },200)
	},
    //预定事件
    registIncident : function(frameNumber , fn){
        this.registedIncidentArray.push({
            "frameNumber" : frameNumber,
            "fn" : fn
        });
    }
});
