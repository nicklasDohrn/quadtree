console.log("testing stuffs");

var test = document.getElementById("tree");
var ctx = test.getContext("2d");
var Point = function (x, y, name) {
	this.name = name;
	this.x = parseInt(x);
	this.y = parseInt(y);
	this.color = "black";
}

var QuadTree = function (x,y,xEnd,yEnd) {
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
			this.childs = [];
			for(var i = 0; i < 4; i++) {
				this.childs.push(new QuadTree(this.x + this.halfSize * (i % 2),
							  this.y + this.halfSize * (parseInt(i / 2) % 2),
							  this.x + this.halfSize + this.halfSize * (i % 2),
							  this.y + this.halfSize + (this.halfSize * (parseInt(i / 2) % 2))));
			}
			this.addPoint(p);
			this.addPoint(this.point);
			this.point = null;
		} else {
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
			this.childs[pos].parent = this;
			this.childs[pos].pos = pos;
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
		ctx.strokeRect(this.x,this.y,this.halfSize*2,this.halfSize*2);
		if (this.childs == null) return;
		for(var key in this.childs) {
			this.childs[key].drawSelf();
		}
	}

	this.getNext = function(pos,x,y, oldDist) {
		var dist = oldDist || test.width*2;
		var point = null;
		var p = null;
		for(var key in this.childs) {
			if(key != pos) {
				p = this.childs[key].point;
				if (p != null && Math.sqrt((x-p.x)**2+(y-p.y)**2) < dist) {
					dist = Math.sqrt((x-p.x)**2+(y-p.y)**2); 
					point = p;
					console.log(dist);
				} else if (this.childs[key].childs != null){
					p = this.childs[key].getNext(-1,x,y,oldDist);
					if (p != null && Math.sqrt((x-p.x)**2+(y-p.y)**2) < dist) {
						dist = Math.sqrt((x-p.x)**2+(y-p.y)**2); 
						point = p;
					}

				}
			}
		}
		if(dist < oldDist) {
			return point;
		} else if(this.parent != null){
			p = this.parent.getNext(this.pos,x,y);
			if (p != null && Math.sqrt((x-p.x)**2+(y-p.y)**2) < dist) {
				return point;
			}
		}
		return point;
	}

	this.balance = function() {
		
	}
}

var tree = new QuadTree(0,0,test.width, test.height);

var gauss = function() {
	return (Math.random() + Math.random() + Math.random() + Math.random())/4;
}

for(var i = 0; i < 400; i++) {
	tree.addPoint(new Point(gauss()*test.width,gauss()*test.height,"random"));
}

var tester = new Point(100,100,"testpoint");
tester.color = "red";
tree.addPoint(tester);
tester.parent.getNext(-1).color = "red";
var draw = function () {
	var points = tree.getPoints();
	for(var i = 0; i < points.length; i++) {
		ctx.beginPath();
		ctx.rect(points[i].x-2,points[i].y-2,5,5);
		ctx.fillStyle = points[i].color;
		if(points[i].color)
			console.log("color red found!");
		ctx.fill();
	}
	tree.drawSelf();
}
draw();
