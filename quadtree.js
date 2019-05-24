var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var points = [];
var rectangles = [];
var draw = function () {
    for (var key in points) {
	point = points[key];
	console.log("drawing");
	console.log(point.x);
	ctx.fillRect(point.x,point.y,1,1);
	ctx.stroke();

    }

}

var Point = function (x,y) {
    this.x = x;
    this.y = y;
}

var Quadtree = function (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.childs = null;
    this.point = null;
    this.addPoint = function (point) {
	if(this.point == null)
	    this.point = point;
	else if(this.childs == null) {
	    for(var i = 0; i < 4; i++) {
		this.childs = [];
		this.childs.push(new Quadtree(this.x + (this.width / 2 * (i % 2)),
					      this.y + (this.height / 2 *((i/2)%2)),
					      this.width - (this.width / 2 * ((i+1) % 2)),
					      this.height - (this.height / 2 * (((i/2) + 1) %2))));
		}
		this.addPoint(point);
		this.addPoint(this.point);
	}
	else {
	    if (point.y < this.height / 2){
		if (point.x < this.width)
		    this.childs[0].addPoint(point);
		else
		    this.childs[1].addPoint(point);
	    } else {
		if(point.x < this.width)
		    this.childs[2].addPoint(point);
		else
		    this.childs[3].addPoint(point);
	    }
	}
    }
}


var tree = new Quadtree(0,0,canvas.width,canvas.height);
tree.addPoint(new Point(25,25));
tree.addPoint(new Point(300,25));
tree.addPoint(new Point(475,25));

for(var i = 0; i < 100; i++) {
    points.push(new Point(parseInt(Math.random()*canvas.width),parseInt(Math.random()*canvas.width)));
}
draw();


