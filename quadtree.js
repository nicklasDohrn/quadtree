console.log("testing stuffs");

var test = document.getElementById("g-layer");
var ctx = test.getContext("2d");
var test = document.getElementById("b-layer");
var back = test.getContext("2d");
var Point = function (x, y, name) {
	this.name = name;
	this.x = parseInt(x);
	this.y = parseInt(y);
	this.color = "black";
}

var balanceDir = [[2,3],[0,2],[0,1],[1,3]];
var convDir = [[-1,-1,0,1],[1,-1,3,-1],[2,3,-1,-1],[-1,0,-1,2]];
var convOutDir = [[2,3,-1,-1],[-1,0,-1,2],[-1,-1,0,1],[1,-1,3,-1]];

var QuadTree = function (x,y,xEnd,yEnd) {
	this.fill = false;
	this.x = parseInt(x);
	this.y = parseInt(y);
	this.xEnd = parseInt(xEnd);
	this.yEnd = parseInt(yEnd);
	this.parent = null;
	this.pos = -1;
	this.halfSize = parseInt((this.xEnd - this.x) / 2);
	this.childs = null;
	this.point = null;
	this.addPoint = function(p) {
		if (this.point == null && this.childs == null || Math.abs(this.x - this.xEnd) <= 4) {
			this.point = p;
			this.point.parent = this;
		} else if (this.childs == null) {
			this.addChilds();
			this.insertPoint(this.point);
			this.point = null;
			this.insertPoint(p);
		} else {
			this.insertPoint(p);
		}
	}

	this.insertPoint = function(p) {
		var pos = -1;
		if(p.y < this.y + this.halfSize) {
			if (p.x < this.x + this.halfSize)
				pos = 0;
			else
				pos = 1;
		} else {
			if (p.x < this.x + this.halfSize)
				pos = 2;
			else
				pos = 3;
		}
		this.childs[pos].addPoint(p);
	}

	this.addChilds = function () {
		this.childs = [];
		for(var i = 0; i < 4; i++) {
			this.childs.push(new QuadTree(this.x + this.halfSize * (i % 2),
						  this.y + this.halfSize * (parseInt(i / 2) % 2),
						  this.x + this.halfSize + this.halfSize * (i % 2),
						  this.y + this.halfSize + (this.halfSize * (parseInt(i / 2) % 2))));
			this.childs[i].parent = this;
			this.childs[i].pos = i;
		}
	}

	this.getPoints = function () {
		if (this.childs == null && this.point != null)
			return this.point;
		else if (this.childs != null) {
			var ret = [];
			for(var key in this.childs) {
				ret = ret.concat(this.childs[key].getPoints());
			}
			return ret;
		} else 
			return [];
	}

	this.drawSelf = function() {
		if (this.fill) {
			back.beginPath();
			back.rect(this.x,this.y,this.halfSize*2,this.halfSize*2);
			back.fillStyle = "red";
			back.fill();
		}
		else
			ctx.strokeRect(this.x,this.y,this.halfSize*2,this.halfSize*2);
		if (this.childs == null) return;
		for(var key in this.childs) {
			this.childs[key].drawSelf();
		}
	}

	this.getNeighbour = function (dir) {
		if (this.parent == null) return null;
		else if (convDir[dir][this.pos] != -1)
			return this.parent.childs[convDir[dir][this.pos]];
		else
		{
			var out =  this.parent.getNeighbour(dir);
			if (out == null || out.childs == null) {
				return out;
			} else {
				return out.childs[convOutDir[dir][this.pos]];
			}
		}
	}

	this.getChilds = function(list) {
		list.push(this);
		if(this.childs != null) {
			for (var key in this.childs) {
				this.childs[key].getChilds(list);
			}
		}
	}

	this.balance = function (rec) {

		var list = [];
		var count = 0;
		this.getChilds(list);
		var current = null;
		var neighbour = null;
		var childs = [];
		for(var key in list) {
			current = list[key];
			if(current.childs != null) continue;
			for(var i = 0; i < 4; i++) {
				neighbour = current.getNeighbour(i);
				if(neighbour != null && neighbour.childs != null){
					childs[0] = neighbour.childs[balanceDir[i][0]];
					childs[1] = neighbour.childs[balanceDir[i][1]];
					if(childs[0].childs != null || childs[1].childs != null) {
						count++;
						current.fill = true;
						if(current.point != null){
							current.addChilds();
							this.insertPoint(current.point);
							this.point = null;
						} else
							current.addChilds();
						break;
					}
				}
			}
		}
		if(rec) return count;
		var recCount = 0;
		do {
			recCount = this.balance(true);

			count += recCount;
		} while (recCount >= 1)
		return count;
	}
}

var tree = new QuadTree(0,0,test.width, test.height);

var gauss = function() {
	return (Math.random() + Math.random() + Math.random() + Math.random())/4;
}

for(var i = 0; i < 400; i++) {
	tree.addPoint(new Point(gauss()*test.width,gauss()*test.height,"random"));
}



var tester = new Point(200,300,"testpoint");
tester.color = "red";
//tree.addPoint(tester);
var childs = [];
tree.getChilds(childs)
console.log(childs);
var draw = function () {
	var points = tree.getPoints();
	for(var i = 0; i < points.length; i++) {
		ctx.beginPath();
		ctx.rect(points[i].x-2,points[i].y-2,5,5);
		ctx.fillStyle = points[i].color;
		if(points[i].color == "red")
			console.log("color red found!");
		ctx.fill();
	}
	tree.drawSelf();
}
draw();
