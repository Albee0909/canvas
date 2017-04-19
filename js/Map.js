//地图类
var Map = Class.extend({
    //初始化
    init: function () {
        //自己的矩阵
        this.code = [
            [_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6)],
            [_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6)],
            [_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6)],
            [_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6)],
            [_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6)],
            [_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6)],
            [_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6),_.random(0,6)],
            []
        ];
        //自己真正的精灵
        this.sprites = [[], [], [], [], [], [], []];
        //补充的新的精灵
        this.supplySprite = [];
        //调用函数，让自己真正的精灵根据自己的矩阵来创建
        this.setSpritesByCode();
        //临时矩阵，初始值为自己的code的副本
        this.tempCode = [[],[],[],[],[],[],[],[]];
        for(var i = 0 ; i < 7 ; i++){
            for(var j = 0 ; j < 7 ; j++){
                this.tempCode[i][j] = this.code[i][j];
            }
        }

    },
    //根据code矩阵来实例化精灵
    setSpritesByCode: function () {
        //清除所有矩阵
        this.sprites = [[], [], [], [], [], [], []];

        for (var i = 0; i < 7; i++) {
            for (var j = 0; j < 7; j++) {
                this.sprites[i][j] = new Sprite(this.code[i][j], i, j);
            }
        }
    },
    //渲染所有元素
    render: function () {
        //渲染所有精灵
        for (var i = 0; i < 7; i++) {
            for (var j = 0; j < 7; j++) {
                this.sprites[i][j].render();
            }
        }
        //渲染所有要补充的精灵
        for(var i = 0 ; i < this.supplySprite.length ; i++){
            this.supplySprite[i].render();
        }
    },
    //检查能否消除，返回的是一个数组，数组的项都是JSON： {"row":3,"col":6}
    //check函数仅仅返回JSON数组，而不会做任何事情，比如不会让元素爆炸、也不会让元素下落！
    //check函数可以接受一个二维矩阵参数，也就是说它不仅仅能够check自己的code矩阵
    //还能够check自己的tempCode
    check : function (matrix) {
        if(!matrix){
            matrix = this.code;
        }
        //结果数组
        var result1 = [];  //存放横向检查的结果
        var result2 = [];  //存放纵向检查的结果
        //横着检查7行
        for (var row = 0; row < 7; row++) {
            //检查第0行，双指针法
            var i = 0;
            var j = 1;
            while (i < 7) {
                if (matrix[row][i] != matrix[row][j]) {
                    if (j - i >= 3) {
                        for (var a = i; a < j; a++) {
                            //放入结果数组
                            result1.push({"row": row, "col": a});
                        }
                    }
                    i = j;
                    j++;
                } else {
                    //i不动，j右移
                    j++;
                }
            }
        }


        //纵着检查7列
        for (var col = 0; col < 7; col++) {
            //检查第0行，双指针法
            var i = 0;
            var j = 1;
            while (i < 7) {
                if (matrix[i][col] != matrix[j][col]) {
                    //检查两个指针是否距离3
                    if (j - i >= 3) {
                        //两个指针之间的元素放入数组
                        for (var a = i; a < j; a++) {
                            //放入结果数组，放入时候遍历之前的所有结果，要确保现在要放入的这个元素不和之前的重复
                            for(var m = 0 ; m < result1.length ; m++){
                                if(result1[m].row == a && result1[m].col == col){
                                    //如果重复了，我们就break内层for循环。
                                    break;
                                }
                            }
                            //验证都不等，
                            if(m == result1.length){
                                result2.push({"row":a,"col":col})

                            }
                        }
                    }
                    i = j;
                    j++;
                } else {
                    //i不动，j右移
                    j++;
                }
            }
        }

        return result1.concat(result2);
    },
    //爆炸所有能够爆炸的元素，里面会自己调用一次check方法，会利用check的结果。
    //此时会改变code矩阵，让已经爆炸的元素的code矩阵写X
    bomb : function(){
        var self = this;
        //状态为C表示要进行爆破动画、下落动画了
        var result = this.check();
        //命令这些能够被消除的元素进行爆破动画
        _.each(result,function(JSONObj){
            self.sprites[JSONObj.row][JSONObj.col].bomb();
            //改变code矩阵
            self.code[JSONObj.row][JSONObj.col] = "■";
        });
    },
    //下落，里面会自己调用一次check方法，会利用check的结果，让没有爆破的元素下落
    //下落用moveTo实现，难点就是下落多少行？moveTo的目标是什么？
    dropdown : function(){
        var result = this.check();
        this.dropdownTarget = [[],[],[],[],[],[],[]];

        //把每个元素要下落的行数计算出来
        for(var row = 0 ; row < 7 ; row++){
            for(var col = 0 ; col < 7 ; col++){
                //每遍历一个小精灵，都要重新遍历结果矩阵，看看列号和它一样，行号大于它的元素有几个。
                var count = 0;
                _.each(result,function(obj){
                    if(obj.col == col && obj.row > row){
                        count++;
                    }
                });
                //设置爆破矩阵
                this.dropdownTarget[row][col] = count;
                //显示出来
                document.getElementById("tiaoshi2").getElementsByTagName("tr")[row].getElementsByTagName("td")[col].innerHTML = count;
                //命令元素下落，这是元素下落的核心语句，多美啊！！
                this.sprites[row][col].moveTo(row + count,col,6);
            }
        }

    },
    //补充新元素
    supplyment : function(){
        //清空自己的临时矩阵
        this.tempCode = [[],[],[],[],[],[],[],[]];

        //【紧凑】现有code矩阵，紧凑为一个新的临时矩阵
        for(var row = 0 ; row < 7 ; row++){
            for(var col = 0 ; col < 7 ; col++){
                //如果当前矩阵这个地方不是■，就是说不是空，那么根据下落行数进行移动
                if(this.code[row][col] != "■"){
                    //下落行数
                    var xialuohangshu = this.dropdownTarget[row][col];
                    //移动
                    this.tempCode[row + xialuohangshu][col] = this.code[row][col];
                }
            }
        }

        //【补充新的，遍历每一个小格，看看每个列空多少】
        for(var col = 0 ; col < 7 ; col++){
            for(var row = 0 ; row < 7 ; row++){
                //如果这个格格空了
                if(this.tempCode[row][col] == undefined){
                    //新创建一个对象，这个元素的初始位置是屏幕外面，所以我们写-5
                    //随机选择一个类型
                    var t = _.random(0,6);
                    var ooo = new Sprite(t,-5,col);
                    //我们命令这个元素进行运动，运动到他的真实位置去。
                    ooo.moveTo(row,col,8)
                    //把这个ooo放入数组，只有放入数组才能被渲染
                    this.supplySprite.push(ooo);
                    //把新添加这个元素写入tempcode中
                    this.tempCode[row][col] = t;
                }
            }
        }
    },
    //交换两个元素的位置，这个函数负责实现动画，然后
    change : function(row1,col1,row2,col2){
        //执行交换动画
        this.sprites[row1][col1].moveTo(row2,col2,6);
        this.sprites[row2][col2].moveTo(row1,col1,6);

        //在临时矩阵中交换两个元素的位置
        var temp = this.tempCode[row1][col1];
        this.tempCode[row1][col1] = this.tempCode[row2][col2];
        this.tempCode[row2][col2] = temp;

        //check一下临时矩阵
        var result = this.check(this.tempCode);
        console.log(result.length);

        //如果不能进行交换
        if(result.length == 0){
            //6帧之后再动画回来
            var self = this;
            game.registIncident(game.f + 6,function(){
                self.sprites[row1][col1].moveTo(row1,col1,6);
                self.sprites[row2][col2].moveTo(row2,col2,6);

                //临时矩阵要换回来
                var temp = self.tempCode[row1][col1];
                self.tempCode[row1][col1] = self.tempCode[row2][col2];
                self.tempCode[row2][col2] = temp;
            });
        }else{
            var self = this;
            game.registIncident(game.f + 6,function() {
                //如果能交换，到底要做什么！！
                //要把临时矩阵再次复制给code
                for (var i = 0; i < 7; i++) {
                    for (var j = 0; j < 7; j++) {
                        self.code[i][j] = self.tempCode[i][j];
                    }
                }
                //重新根据当前的矩阵来设置元素
                var temp = self.sprites[row1][col1];
                self.sprites[row1][col1] = self.sprites[row2][col2];
                self.sprites[row2][col2] = temp;
                //改变状态机
                game.FSM = "B";
            });
        }
    }
});