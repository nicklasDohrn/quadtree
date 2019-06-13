console.log("testing stuffs");
var first = true;
var mc = {};
var gridSize = 32;
mc.startX = -1;
mc.startY = -1;
var lines = [];

var click = function (e) {
    var x = e.pageX;
    var y = e.pageY;
    console.log("" + x + "x " + y + " y");
    if (first) {
        first = false;
        mc.startX = toGrid(x);
        mc.startY = toGrid(y);
    } else {
        distX = mc.startX - x;
        distY = mc.startY - y;
        var coeff = Math.abs(distX) / Math.abs(distY);
        console.log(coeff);
        if (coeff < 0.5) {
            distX = 0;
        } else if (coeff < 2) {
            distX = toGrid(Math.sign(distX) * parseInt(Math.abs(Math.max(distX, distY))));
            distY = Math.sign(distY) * Math.abs(distX);
        } else {
            distY = 0;
        }
        ulayer.beginPath();
        var l = new Line(mc.startX, mc.startY, mc.startX - distX, mc.startY - distY);
        tree.insertLine(l);
        ulayer.moveTo(l.x1, l.y1);
        ulayer.lineTo(l.x2, l.y2);
        ulayer.strokeStyle = "#00ff00";
        ulayer.lineWidth = 2;
        ulayer.stroke();
        mc.startX = l.x2;
        mc.startY = l.y2;
        draw();
    }
}

var toGrid = function (pos) {
    return parseInt(pos / (gridSize)) * gridSize;
}

var ctx, test, tree, back, ulayer;
var init = function () {
    input = document.getElementById("layer4");
    input.addEventListener("mousedown", click, false);
    test = document.getElementById("layer3");
    console.log(test);
    ctx = test.getContext("2d");
    ulayer = input.getContext("2d");
    test = document.getElementById("layer1");
    back = test.getContext("2d");
    tree = new QuadTree(0, 0, test.width, test.height);
}

var Line = function (x1, y1, x2, y2) {
    this.x1 = toGrid(x1);
    this.y1 = toGrid(y1);
    this.x2 = toGrid(x2);
    this.y2 = toGrid(y2);
}
var triangDir = [[1,0,0,1],[1,1,0,0],[0,0,1,1],[0,1,1,0]];
var balanceDir = [[2, 3], [0, 2], [0, 1], [1, 3]];
var convDir = [[-1, -1, 0, 1], [1, -1, 3, -1], [2, 3, -1, -1], [-1, 0, -1, 2]];
var convOutDir = [[2, 3, -1, -1], [-1, 0, -1, 2], [-1, -1, 0, 1], [1, -1, 3, -1]];

function intersects(line1, line2) {
    var a, b, c, d, p, q, r, s;
    a = line1.x1; b = line1.y1; c = line1.x2; d = line1.y2;
    p = line2.x1; q = line2.y1; r = line2.x2; s = line2.y2;
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 <= lambda && lambda <= 1) && (0 <= gamma && gamma <= 1);
    }
};
function pointInline(x, y, xS, yS, xE, yE) {
    if (x < xS || x > xE) return false;
    if (y < yS || y > yE) return false;
    return true;
}

var QuadTree = function (x, y, xEnd, yEnd) {
    this.fill = false;
    this.triang = false;
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.xEnd = parseInt(xEnd);
    this.yEnd = parseInt(yEnd);
    this.parent = null;
    this.pos = -1;
    this.halfSize = parseInt((this.xEnd - this.x) / 2);
    this.childs = null;

    this.insertLine = function (line) {
        if (this.xEnd - this.x <= gridSize) {
            if (
                intersects(line, new Line(this.x, this.y, this.xEnd, this.y)) &&
                intersects(line, new Line(this.x, this.y, this.x, this.yEnd)) &&
                intersects(line, new Line(this.x, this.yEnd, this.xEnd, this.yEnd)) &&
                intersects(line, new Line(this.xEnd, this.y, this.xEnd, this.yEnd))) {
                this.triang = true;
            }
            return;

        }
        if (this.childs != null) {
            for (var key in this.childs) {
                this.childs[key].insertLine(line);
            }
        }
        else if (pointInline(line.x1, line.y1, this.x, this.y, this.xEnd, this.yEnd) ||
            pointInline(line.x2, line.y2, this.x, this.y, this.xEnd, this.yEnd) ||
            intersects(line, new Line(this.x, this.y, this.xEnd, this.y)) ||
            intersects(line, new Line(this.x, this.y, this.x, this.yEnd)) ||
            intersects(line, new Line(this.x, this.yEnd, this.xEnd, this.yEnd)) ||
            intersects(line, new Line(this.xEnd, this.y, this.xEnd, this.yEnd))) {
            this.split(line);
        }
    }

    this.split = function (line) {
        this.addChilds();
        for (var key in this.childs) {
            this.childs[key].insertLine(line);
        }
    }



    this.addChilds = function () {
        this.childs = [];
        for (var i = 0; i < 4; i++) {
            this.childs.push(new QuadTree(this.x + this.halfSize * (i % 2),
                this.y + this.halfSize * (parseInt(i / 2) % 2),
                this.x + this.halfSize + this.halfSize * (i % 2),
                this.y + this.halfSize + (this.halfSize * (parseInt(i / 2) % 2))));
            this.childs[i].parent = this;
            this.childs[i].pos = i;
        }
    }

    this.drawSelf = function (onlyParents) {
        if(this.childs == null && !this.triang && onlyParents) return;
        if (this.fill) {
            back.beginPath();
            back.rect(this.x, this.y, this.halfSize * 2, this.halfSize * 2);
            //back.fillStyle = "#00ffaa";
            //back.fill();
            ctx.strokeRect(this.x, this.y, this.halfSize * 2, this.halfSize * 2);
            
        }
        else {
            ctx.strokeRect(this.x, this.y, this.halfSize * 2, this.halfSize * 2);
        }
        for (var key in this.childs) {
            this.childs[key].drawSelf(onlyParents);
        }
    }

    this.triangulate = function () {
        this.drawSelf(true);
        if (this.triang) {
            return;
        }
        else if (this.childs == null) {
            ctx.beginPath();
            var l = [];
            if(this.pos == 0 || this.pos == 3) 
                l.push(new Line(this.x, this.y, this.xEnd, this.yEnd));
            else
                l.push(new Line(this.x, this.yEnd, this.xEnd, this.y));
           for(var i = 0; i < 4; i++) {
                if(triangDir[this.pos][i] == 0) continue;
                if(this.getNeighbour(i) != null && this.getNeighbour(i).childs != null ) {
                    if(i % 2 == 0){
                        l.push(new Line(this.x,this.y,this.x,this.yEnd));    
                        l.push(new Line(this.xEnd,this.y,this.xEnd,this.yEnd));    
                    } else {
                        l.push(new Line(this.x,this.y,this.xEnd,this.y));    
                        l.push(new Line(this.x,this.yEnd,this.xEnd,this.yEnd));    
                    }
                }
            }
            for(var key in l) {
                ctx.moveTo(l[key].x1, l[key].y1);
                ctx.lineTo(l[key].x2, l[key].y2);
                ctx.strokeStyle = "#004466";
                ctx.lineWidth = 2;
            }
            ctx.stroke(); 
        }
        else
            for (var key in this.childs) {
                this.childs[key].triangulate();
            }
    }

    this.getNeighbour = function (dir) {
        if (this.parent == null) return null;
        else if (convDir[dir][this.pos] != -1)
            return this.parent.childs[convDir[dir][this.pos]];
        else {
            var out = this.parent.getNeighbour(dir);
            if (out == null || out.childs == null) {
                return out;
            } else {
                return out.childs[convOutDir[dir][this.pos]];
            }
        }
    }

    this.getChilds = function (list) {
        if (this.childs == null)
            list.push(this);
        else {
            for (var key in this.childs) {
                this.childs[key].getChilds(list);
            }
        }
    }

    this.balance = function () {

        var list = [];
        var count = 0;
        this.getChilds(list);
        var current = null;
        var neighbour = null;
        var childs = [];
        for (var j = 0; j < list.length; j++) {
            current = list[j];
            if (current.childs != null) continue;
            for (var i = 0; i < 4; i++) {
                neighbour = current.getNeighbour(i);
                if (neighbour != null && neighbour.childs != null) {
                    childs[0] = neighbour.childs[balanceDir[i][0]];
                    childs[1] = neighbour.childs[balanceDir[i][1]];
                    if (childs[0].childs != null || childs[1].childs != null) {
                        count++;
                        current.fill = true;
                        current.addChilds();
                        current.getChilds(list);
                        for (var k = 0; k < 4; k++) {
                            var surround = current.getNeighbour(k);
                            if (surround != null && surround.childs == null)
                                list.push(surround);
                        }
                        break;
                    }
                }
            }
        }
        return count;
    }
}


var draw = function () {
    tree.drawSelf(true);
}
