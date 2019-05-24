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
		this.childs.push(new Quadtree(this.x + 
	    }
	}
    }
}


for(var i = 0; i < 100; i++) {
    points.push(new Point(parseInt(Math.random()*canvas.width),parseInt(Math.random()*canvas.width)));
}
points.push(new Point(3,3));
points.push(new Point(3,3));
draw();


