//场景管理器
var Scene = Class.extend({
	init : function(){
		//场景编号0开始画面，1游戏画面，2Gameover
		this.scenenumber = 0;
	},
	//换为某一个场景，进入某一个场景的瞬间应该做什么事情，要写在这个函数里面
	changeScene : function(number){
        //改变自己的场景编号
		this.scenenumber = number;
		//根据场景的不同来决定做什么事情
		switch(this.scenenumber){
			case 0:
				break;
            case 1:
                //游戏核心场景，进入这个场景的时候就要实例化一个Map类
                game.map = new Map();
                //绑定监听
                game.canvas.onmousedown = function(event){
                    //验证是不是A状态
                    if(game.FSM != "A") return;
                    //点击的元素
                    var col1 = parseInt((event.offsetX - 22) / 45);
                    var row1 = parseInt((event.offsetY - 151) / 45);
                    //移动鼠标的时候
                    game.canvas.onmousemove = function(event){
                        var col2 = parseInt((event.offsetX - 22) / 45);
                        var row2 = parseInt((event.offsetY - 151) / 45);
                        //如果用户按住鼠标拖拽到了相邻的精灵上
                        if(col1 == col2 && row1 != row2 || row1 == row2 && col1 != col2){
                            console.log("从",row1,col1,"到",row2,col2);
                            //剥夺监听
                            game.canvas.onmousemove = null;
                            //调用函数
                            game.map.change(row1,col1,row2,col2);
                        }
                    }
                }


                var row1,row2,col1,col2;
                var lock = false;
                game.canvas.addEventListener("touchstart",function(event) {
                    event.preventDefault();
                    var finger = event.touches[0];
                    //验证是不是A状态
                    if(game.FSM != "A") return;
                    //点击的元素
                    col1 = parseInt((finger.clientX - 22) / 45);
                    row1 = parseInt((finger.clientY - 151) / 45);

                    lock = true;
                });

                game.canvas.addEventListener("touchmove",function(event) {
                    if(!lock) return;

                    event.preventDefault();
                    var finger = event.touches[0];
                    //验证是不是A状态
                    if(game.FSM != "A") return;
                    col2 = parseInt((finger.clientX - 22) / 45);
                    row2 = parseInt((finger.clientY - 151) / 45);
                    //如果用户按住鼠标拖拽到了相邻的精灵上
                    if(col1 == col2 && row1 != row2 || row1 == row2 && col1 != col2){
                        console.log("从",row1,col1,"到",row2,col2);
                        //调用函数
                        game.map.change(row1,col1,row2,col2);

                        lock = false;
                    }
                });

				break;
			case 2:
				break;
		}
	},
	//渲染，这个函数被主循环每帧调用
	render : function(){
		//根据场景的不同来决定做什么事情
		switch(this.scenenumber){
			case 0:
				break;
            case 1:
				//游戏核心场景
				//渲染背景
				game.ctx.drawImage(game.R["bg2"],0,0,game.canvas.width,game.canvas.height);
                //渲染地图
                game.map.render();
				//根据状态机做一些事情
                if(game.FSM == "A"){

                }else if(game.FSM == "B"){
                    // 命令地图进行消除检查
                    var result = game.map.check();
                    //如果消除，请去C状态
                    if(result.length != 0){
                        game.FSM = "C";
                    }else{
                        game.FSM = "A";
                    }
                }else if(game.FSM == "C"){
                    //命令地图进行爆炸
                    game.map.bomb();
                    //爆破动画进行24帧结束之后，我们注册一个事件，进行下落动画和补充新的动画
                    game.registIncident(game.f + 24 , function(){
                        game.map.dropdown();
                        game.map.supplyment();
                    });
                    game.registIncident(game.f + 32,function(){
                        //让game类的矩阵变为临时矩阵，注意是副本，所以我们一个一个遍历
                        for(var i = 0 ; i < 7 ; i++){
                            for(var j = 0 ; j < 7 ; j++){
                                game.map.code[i][j] = game.map.tempCode[i][j];
                            }
                        }

                        //重新new出所有元素
                        game.map.setSpritesByCode();
                        //清空小数组
                        game.map.supplySprite = [];
                        //连续消除！
                        game.FSM = "B";
                    });
                    game.FSM = "ANIMATION PLAY";
                }

				break;
			case 2:
				break;
		}
	}
});