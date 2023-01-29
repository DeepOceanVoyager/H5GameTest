/*
js是世界上最垃圾的语言！！！
没有之一！！！
canvas坐标轴：
0,0 1,0 2,0 x,y...
0,1 1,1 2,1
0,2 1,2 2,2
...
js数组坐标轴：
0,0 0,1 0,2 x,y...
1,0 1,1 1,2
2,0 2,1 2,2
...
*/
const c = document.getElementById("canvas");//找到 <canvas> 元素
const b = document.getElementById("refresh");
const s = document.getElementById("score");

const ctx = c.getContext("2d");
//getContext("2d") 对象是内建的 HTML5 对象，拥有多种绘制路径、矩形、圆形、字符以及添加图像的方法
const squareLength = 120; //单位方块的边长（像素）
const xCount = 5; //棋盘有多少列
const yCount = xCount; //棋盘有多少行
var score = 0; //游戏得分

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
  constructor(squares, direction, color) {
    this.squares = squares; //积木包含的单位方块数组（一块积木由一个或多个单位方块构成）
    this.direction = direction;
    this.color = color;
  }
} //积木类

var occupiedMap = []; //占位棋盘，用来标注棋盘任一个方块所属的积木
var occupiedSquareCount = 0; //场上被积木占据的方块数量

function Start() {
  BindCanvasClickEvent(c);
  BindButtonClickEvent(b);
  StartNewGame();
} //全局开始

function StartNewGame() {
  var direcMap = BuildDirectionMap(xCount, yCount);
  var blocks = BuildBlocks(direcMap);
  occupiedSquareCount = xCount * yCount;
  BuildoccupiedMap(blocks, xCount, yCount);
  DrawMap(blocks);
} //开始一局新游戏

function GameEnd() {
  StartNewGame();
} //游戏结束时的函数

function BuildoccupiedMap(blocks) {
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
  //console.log(occupiedMap);
} //构建占位棋盘

function BuildDirectionMap() {
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
  var curDirection;
  for (var i = 0; i < directMap.length; i++) {
    for (var j = 0; j < directMap[0].length; j++) {
      if (!directMap[i][j]) continue;
      //如果当前位置上的方块已经属于其他积木了，就跳过
      var curSquares = [];
      curSquares[0] = new square(j, i);
      curDirection = directMap[i][j];
      if (j < xCount - 1 && directMap[i][j + 1] == curDirection) {
        curSquares[1] = new square(j + 1, i);
        directMap[i][j + 1] = null;
        if (i < yCount - 1 && directMap[i + 1][j] == curDirection &&
          directMap[i + 1][j + 1] == curDirection) {
          curSquares[2] = new square(j, i + 1);
          curSquares[3] = new square(j + 1, i + 1);
          directMap[i + 1][j] = null;
          directMap[i + 1][j + 1] = null;
        }
      }
      else {
        if (i < yCount - 1 && directMap[i + 1][j] == curDirection) {
          curSquares[1] = new square(j, i + 1);
          directMap[i + 1][j] = null;
        }
      }
      var color = RandomRgbColor();
      //生成一个随机颜色（#FFFFFF这种Hex颜色）
      blocks[blockIndex] = new block(curSquares, curDirection, color);
      blockIndex++;
    }
  }
  //console.log(blocks);
  return blocks;
} //通过方向棋盘构建场上积木

function DrawMap(blocks) {
  for (var i = 0; i < blocks.length; i++) {
    DrawBlock(blocks[i], 60);
  }
} //绘制棋盘（所有积木）

function DrawBlock(block) {
  var minX = block.squares[0].x, minY = block.squares[0].y,
    maxX = block.squares[0].x, maxY = block.squares[0].y,
    xCount = 1, yCount = 1;
  for (var i = 1; i < block.squares.length; i++) {
    minX = block.squares[i].x < minX ? block.squares[i].x : minX;
    maxX = block.squares[i].x > maxX ? block.squares[i].x : maxX;
    minY = block.squares[i].y < minY ? block.squares[i].y : minY;
    maxY = block.squares[i].y > maxY ? block.squares[i].y : maxY;
  }
  xCount += maxX - minX;
  yCount += maxY - minY;
  var xLength = xCount * squareLength, yLength = yCount * squareLength,
    xPoint = minX * squareLength, yPoint = minY * squareLength;
  ctx.fillStyle = block.color;
  //ctx.fillStyle = "#FFFFFF";
  //ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
  //ctx.strokeStyle = "#000000";
  ctx.fillRect(xPoint, yPoint, xLength, yLength);
  //ctx.strokeRect(xPoint, yPoint, xLength, yLength);
  var fontLength = Math.round(squareLength / 2);
  DrawArrow(xPoint + xLength / 2, yPoint + yLength / 2, block.direction, fontLength);
} //绘制积木（注意，矩形的原点在左上角）

function DeleteBlock(block) {
  for (var i = 0; i < block.squares.length; i++) {
    occupiedMap[block.squares[i].x][block.squares[i].y] = null;
    occupiedSquareCount--;
    score++;
    UpdateScoreView(s, score);
    if (occupiedSquareCount < 1) {
      GameEnd();
    }
  }
} //删除积木

function ClearBlock(block) {
  var minX = block.squares[0].x, minY = block.squares[0].y,
    maxX = block.squares[0].x, maxY = block.squares[0].y,
    xCount = 1, yCount = 1;
  for (var i = 1; i < block.squares.length; i++) {
    minX = block.squares[i].x < minX ? block.squares[i].x : minX;
    maxX = block.squares[i].x > maxX ? block.squares[i].x : maxX;
    minY = block.squares[i].y < minY ? block.squares[i].y : minY;
    maxY = block.squares[i].y > maxY ? block.squares[i].y : maxY;
  }
  xCount += maxX - minX;
  yCount += maxY - minY;
  var xLength = xCount * squareLength, yLength = yCount * squareLength,
    xPoint = minX * squareLength, yPoint = minY * squareLength;
  ctx.clearRect(xPoint, yPoint, xLength, yLength);
} //清除积木图像

function DrawArrow(x, y, direction, fontLength) {
  ctx.fillStyle = "#000000";
  ctx.font = fontLength.toString() + "px Arial";
  ctx.fillText(direction, x - fontLength / 2, y + fontLength / 2);
} //绘制箭头（注意，文字的原点在左下角）

function BlockCanMove(block) {
  if (!block) return false;
  var curSquare;
  for (var i = 0; i < block.squares.length; i++) {
    curSquare = block.squares[i];
    if (block.direction == directionEnum.up) {
      if (curSquare.y > 0 &&
        occupiedMap[curSquare.x][curSquare.y - 1] &&
        occupiedMap[curSquare.x][curSquare.y - 1] != block) {
        return false;
      } //如果此方块的移动方向上邻接一个方块，且邻接方块不属于此积木，说明此积木不可移动
    }
    else if (block.direction == directionEnum.down) {
      if (curSquare.y + 1 < yCount &&
        occupiedMap[curSquare.x][curSquare.y + 1] &&
        occupiedMap[curSquare.x][curSquare.y + 1] != block) {
        return false;
      }
    }
    else if (block.direction == directionEnum.left) {
      if (curSquare.x > 0 &&
        occupiedMap[curSquare.x - 1][curSquare.y] &&
        occupiedMap[curSquare.x - 1][curSquare.y] != block) {
        return false;
      }
    }
    else if (block.direction == directionEnum.right) {
      if (curSquare.x + 1 < xCount &&
        occupiedMap[curSquare.x + 1][curSquare.y] &&
        occupiedMap[curSquare.x + 1][curSquare.y] != block) {
        return false;
      }
    }
  }
  return true;
} //判断积木是否可以移动

function MoveBlock(block) {
  ClearBlock(block);
  var curSquare;
  var lastSquares = [];
  var nowSquares = [];
  for (var i = 0; i < block.squares.length; i++) {
    curSquare = block.squares[i];
    lastSquares[i] = { x: curSquare.x, y: curSquare.y };
    if (block.direction == directionEnum.up) {
      if (curSquare.y == 0) {
        DeleteBlock(block);
        return;
      }//如果当前方块已经到顶，说明移动后将移出棋盘，则直接删除方块
      nowSquares[i] = { x: curSquare.x, y: curSquare.y - 1 };
    }
    else if (block.direction == directionEnum.down) {
      if (curSquare.y == yCount - 1) {
        DeleteBlock(block);
        return;
      }
      nowSquares[i] = { x: curSquare.x, y: curSquare.y + 1 };
    }
    else if (block.direction == directionEnum.left) {
      if (curSquare.x == 0) {
        DeleteBlock(block);
        return;
      }
      nowSquares[i] = { x: curSquare.x - 1, y: curSquare.y };
    }
    else if (block.direction == directionEnum.right) {
      if (curSquare.x == xCount - 1) {
        DeleteBlock(block);
        return;
      }
      nowSquares[i] = { x: curSquare.x + 1, y: curSquare.y };
    }
  }//分别将积木内的每一个方块的坐标改成移动后的，同时判断此积木是否能直接移除
  for (var i = 0; i < lastSquares.length; i++) {
    occupiedMap[lastSquares[i].x][lastSquares[i].y] = null;
  }//将占位棋盘中积木原先的地方置空
  for (var i = 0; i < block.squares.length; i++) {
    occupiedMap[nowSquares[i].x][nowSquares[i].y] = block;
  }//将占位棋盘中积木新的位置上写入此积木
  block.squares = nowSquares;//将有了新的位置的方块组赋给此积木
  DrawBlock(block);
} //移动积木

function BindCanvasClickEvent(canvas) {
  canvas.addEventListener('click', function (e) {
    pos = GetEventPosition(e); //点击的坐标
    curBlock = GetBlockByPosition(pos.x, pos.y, 60);
    canMove = BlockCanMove(curBlock, xCount, yCount);
    console.log(canMove);
    console.log(occupiedMap);
    if (canMove) {
      MoveBlock(curBlock, xCount, yCount, 60);
    }
  })
} //为canvas绑定点击事件

function BindButtonClickEvent(button) {
  button.addEventListener('click', function (e) {
    StartNewGame();
  })
} //为刷新按钮绑定事件

function UpdateScoreView(scoreView, newScore) {
  scoreView.innerHTML = newScore.toString();
} //更新分数显示

function GetBlockByPosition(xPos, yPos) {
  return occupiedMap[Math.floor(xPos / squareLength)][Math.floor(yPos / squareLength)];
} //通过坐标获取积木

function GetEventPosition(ev) {
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

function RandomRgbColor() {
  let arr = [];
  for (var i = 0; i < 3; i++) {
    // 暖色
    //arr.push(Math.floor(Math.random() * 128 + 64));
    // 亮色
    arr.push(Math.floor(Math.random() * 128 + 128));
  }
  let [r, g, b] = arr;
  // rgb颜色
  // var color=`rgb(${r},${g},${b})`;
  // 16进制颜色
  var color = `#${r.toString(16).length > 1 ? r.toString(16) : '0' + r.toString(16)}${g.toString(16).length > 1 ? g.toString(16) : '0' + g.toString(16)}${b.toString(16).length > 1 ? b.toString(16) : '0' + b.toString(16)}`;
  return color;
}//随机生成RGB颜色（亮色）