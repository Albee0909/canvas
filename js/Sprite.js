//精灵类
var Sprite = Class.extend({
	//构造函数
	init : function(type,row,col){
		//自己的类型，是一个数字0~6
		this.type = type;
		//自己的图片名字
		this.imageName = game.spriteStyles[this.type];
		//自己的图片对象
		this.image = game.R[this.imageName];
		//自己的行和列
		this.row = row;
		this.col = col;
		this.x = 22 + this.col * 45;
		this.y = 151 + this.row * 46;
		//自己是否正在爆炸
		this.isBomb = false;
		//爆炸的动画序列
		this.bombf = 0;
		//自己是否在隐藏。
		this.isHide = false;
		//自己是否处于运动中
		this.isAnimate = false;
		//增量
		this.dx = 1;
		this.dy = 1;
		//动画要求帧数
		this.durationFrames = 0;
		//动画进行到了多少帧
		this.animateF = 0;
	},
	//渲染它自己
	render : function(){
		//如果自己被隐藏，则不需要继续绘制东西
		if(this.isHide){
			return;
		}
		//判断自己是不是在运动
		if(this.isAnimate){

 			this.x+=this.dx;
			this.y+=this.dy;
			//动画帧编号加1
			this.animateF++;
			//如果动画已经进行了足够帧，此时就停止动画
			if(this.animateF == this.durationFrames){
				this.isAnimate = false;
			}
		}

		//根据自己是否在爆炸使用不同的图片
		if(this.isBomb){
			//爆炸中
			game.ctx.drawImage(game.R["bomb"],200 * this.bombf,0,200,200,this.x , this.y , 42 , 42);
			//每3帧改变一次爆炸画面，所以一共8个爆炸画面，共24帧
			if(game.f % 3 == 0){
				this.bombf++;
			}
			//爆炸动画一共7个画格格
			if(this.bombf > 7){
				this.isHide = true;
			}
		}else{
			//没有爆炸
			game.ctx.drawImage(this.image,this.x,this.y, 42 , 42);
		}
	},
	//爆炸
	bomb : function(){
		//函数节流，如果自己已经在爆炸，什么都不做
		if(this.isBomb){
			return;
		}
		this.isBomb = true;
		this.bombf = 0;
	},
	//运动，三个参数分别是目标行、目标列、多少帧
	moveTo : function(targetRow,targetCol,durationFrames){
		//改变自己的动画标记，改变标记之后，在下一帧render里面就能进入if(this.isAnimate)的分支
		this.isAnimate = true;
		//设置要求停止的帧数
		this.durationFrames = durationFrames;
		//帧编号复原
		this.animateF = 0;
		//详细计算dx和dy，首先计算差了多少x
		this.dx = (22 + targetCol * 45 - this.x) / durationFrames;
		this.dy = (151 + targetRow * 46 - this.y)/ durationFrames;
	}
});