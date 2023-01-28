/*
js是世界上最垃圾的语言！！！
没有之一！！！
canvas坐标轴：
0,0 1,0 2,0 ...
0,1 1,1 2,1
0,2 1,2 2,2
...
*/
var c = document.getElementById("canvas");
//找到 <canvas> 元素
var ctx = c.getContext("2d");
//getContext("2d") 对象是内建的 HTML5 对象，拥有多种绘制路径、矩形、圆形、字符以及添加图像的方法

window.onload = function () {
  Start();
} //网页加载完毕后调用函数

class square {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
} //单位方块类

const directionEnum = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  null: '.'
} //方向枚举，四个成员是方向

class block {
  constructor(squares, direction) {
    this.squares = squares; //积木包含的单位方块数组（一块积木由一个或多个单位方块构成）
    this.direction = direction;
  }
} //积木类

var occupiedMap = []; //占位棋盘，用来标注棋盘任一个方块所属的积木
var curBlocks = []; //场上当前积木数组
var occupiedSquareCount = 0; //场上被积木占据的方块数量

function Start() {
  BindCanvasClickEvent(c);
  StartNewGame();
} //全局开始

function StartNewGame() {
  var direcMap = BuildDirectionMap(10, 10);
  var blocks = BuildBlocks(direcMap);
  BuildoccupiedMap(blocks, 10, 10);
  DrawMap(blocks);
} //开始一局新游戏

function BuildoccupiedMap(blocks, xCount, yCount) {
  var arr = new Array(xCount); //表格的行数
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(yCount); //表格的列数
  } //初始化棋盘数组
  var curBlock; //当前遍历的积木
  var curSquare; //当前遍历的方块
  for (var i = 0; i < blocks.length; i++) {
    curBlock = blocks[i];
    for (var j = 0; j < curBlock.squares.length; j++) {
      curSquare = curBlock.squares[j];
      arr[curSquare.x][curSquare.y] = curBlock;
    }
  }
  occupiedMap = arr;
} //构建占位棋盘

function BuildDirectionMap(xCount, yCount) {
  var arr = new Array(xCount); //表格的行数
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(yCount); //表格的列数
  }
  var xIsConflict = new Array(yCount).fill(false); //任一行上是否出现了向右的方块
  var yIsConflict = new Array(xCount).fill(false); //任一列上是否出现了向下的方块
  var directionNum = 0; //代表方向的数字，1上，2下，3左，4右
  for (var i = 0; i < xCount; i++) {
    for (var j = 0; j < yCount; j++) {
      directionNum = Math.floor((Math.random() * 4) + 1); //生成1~4的随机整数（包括1和4）
      switch (directionNum) {
        case 1: //随机到了向上
          if (yIsConflict[j]) { //如果该列上之前有向下的方块，说明向上的通道被堵死
            if (xIsConflict[i]) {
              if (Math.floor((Math.random() * 2)) > 1) {
                arr[i][j] = directionEnum.down;
              }
              else {
                arr[i][j] = directionEnum.right;
              }
            }//如果向上和向左都被堵死，就随机选择向下还是向右
            else {
              arr[i][j] = directionEnum.left;
            }//如果向左没有堵死，就选择向左
          }
          else {
            arr[i][j] = directionEnum.up;
          }
          break;
        case 2: //随机到了向下
          arr[i][j] = directionEnum.down;
          yIsConflict[j] = true; //此列出现了向下的方块，此列接下来的向上通道被堵死
          break;
        case 3: //随机到了向左
          if (xIsConflict[i]) { //如果该列上之前有向右的方块，说明向左的通道被堵死
            if (yIsConflict[j]) {
              if (Math.floor((Math.random() * 2)) > 1) {
                arr[i][j] = directionEnum.down;
              }
              else {
                arr[i][j] = directionEnum.right;
              }
            }//如果向上和向左都被堵死，就随机选择向下还是向右
            else {
              arr[i][j] = directionEnum.up;
            }//如果向上没有堵死，就选择向上
          }
          else {
            arr[i][j] = directionEnum.left;
          }
          break;
        case 4: //随机到了向右
          arr[i][j] = directionEnum.right;
          xIsConflict[i] = true; //此列出现了向右的方块，此列接下来的向左通道被堵死
          break;
      }
    }
  }
  console.log(arr);
  return arr;
} //构建方向棋盘（从左上角开始构建）

function BuildBlocks(directMap) {
  var blocks = [];
  var blockIndex = 0;
  for (var i = 0; i < directMap.length; i++) {
    for (var j = 0; j < directMap[0].length; j++) {
      blocks[blockIndex] = new block([new square(j, i)], directMap[i][j]);
      blockIndex++;
    }
  }
  //console.log(blocks);i
  return blocks;
} //通过方向棋盘构建场上积木

function DrawMap(blocks) {
  for (var i = 0; i < blocks.length; i++) {
    DrawBlock(blocks[i], 60);
  }
} //绘制棋盘（所有积木）

function DrawBlock(block, length) {
  var minX = block.squares[0].x, minY = block.squares[0].y,
    xCount = 1, yCount = 1;
  for (var i = 1; i < block.squares.length; i++) {
    if (block.squares[i].x <= minX) {
      minX = block.squares[i].x;
    }
    else {
      xCount++;
    }
    if (block.squares[i].y <= minY) {
      minY = block.squares[i].y;
    }
    else {
      yCount++;
    }
  }
  var xLength = xCount * length, yLength = yCount * length,
    xPoint = minX * length, yPoint = minY * length;
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000";
  ctx.fillRect(xPoint, yPoint, xLength, yLength);
  ctx.strokeRect(xPoint, yPoint, xLength, yLength);
  var fontLength = Math.round(length / 2);
  DrawArrow(xPoint + xLength / 2, yPoint + yLength / 2, block.direction, fontLength);
} //绘制积木（注意，矩形的原点在左上角）

function ClearBlock(block, length) {
  var minX = block.squares[0].x, minY = block.squares[0].y,
    xCount = 1, yCount = 1;
  for (var i = 1; i < block.squares.length; i++) {
    if (block.squares[i].x <= minX) {
      minX = block.squares[i].x;
    }
    else {
      xCount++;
    }
    if (block.squares[i].y <= minY) {
      minY = block.squares[i].y;
    }
    else {
      yCount++;
    }
  }
  var xLength = xCount * length, yLength = yCount * length,
    xPoint = minX * length, yPoint = minY * length;
  ctx.clearRect(xPoint, yPoint, xLength, yLength);
} //清除积木图像

function DrawArrow(x, y, direction, length) {
  ctx.fillStyle = "#000000";
  ctx.font = length.toString() + "px Arial";
  ctx.fillText(direction, x - length / 2, y + length / 2);
} //绘制箭头（注意，文字的原点在左下角）

function BlockCanMove(block, xCount, yCount) {
  var curSquare;
  for (var i = 0; i < block.squares.length; i++) {
    curSquare = block.squares[i];
    if (block.direction == directionEnum.up) {
    }
    else if (block.direction == directionEnum.down) {
    }
    else if (block.direction == directionEnum.left) {
    }
    else if (block.direction == directionEnum.right) {
    }
  }
  return true;
} //判断积木是否可以移动

function BindCanvasClickEvent(canvas) {
  canvas.addEventListener('click', function (e) {
    pos = getEventPosition(e); //点击的坐标
    ClearBlock(GetBlockByPosition(pos.x, pos.y, 60), 60);
  })
} //为canvas绑定点击事件

function GetBlockByPosition(xPos, yPos, length) {
  return occupiedMap[Math.floor(xPos / length)][Math.floor(yPos / length)];
} //通过坐标获取积木

function getEventPosition(ev) {
  var x, y;
  if (ev.layerX || ev.layerX == 0) {
    x = ev.layerX;
    y = ev.layerY;
  } else if (ev.offsetX || ev.offsetX == 0) { // Opera
    x = ev.offsetX;
    y = ev.offsetY;
  }
  return { x: x, y: y };
} //获取点击canvas时的坐标
  //注：使用这个函数，需要给Canvas元素的position设为absolute。
  //要判断事件对象发生的位置，事件对象ev的layerX和layerY属性表示Canvas内部坐标系中的坐标