toxi.Polygon2D = function(){
	this.vertices = [];
	if(arguments.length > 1){ //comma-separated Vec2D's were passed in
		var l = arguments.length;
		for(var i=0;i<l;i++){
			this.add(arguments[i].copy());
		}
	} else if(arguments.length == 1){
		var arg = arguments[0];
		if(arg instanceof Array){ // if it was an array of points
			var l = arg.length;
			for(var i=0;i<l;i++){
				this.add(arg[i].copy());
			}
		}
	} //otherwise no args were passed, and thats ok

}


toxi.Polygon2D.prototype = {

	add: function(p){
		if(!(this.vertices.indexOf(p) >= 0)){
			this.vertices.push(p);
		}
	},
	
	containsPoint: function(p){
		var num = this.vertices.length;
		var i,j = num-1;
		var oddNodes = false;
		var px = p.x;
		var py = p.y;
		for(i=0;i<num;i++){
			var vi = this.vertices[i];
			var vj = this.vertices[j];
			if (vi.y < py && vj.y >= py || vj.y < py && vi.y >= py) {
				if (vi.x + (py - vi.y) / (vj.y - vi.y) * (vj.x - vi.x) < px) {
					oddNodes = !oddNodes;
				}
			}
			j = i;
		}
		return oddNodes;
	},
	
	containsPoly: function(poly) {
        for (var i=0,num=poly.vertices.length; i<num; i++) {
            if (!this.containsPoint(poly.vertices[i])) {
                return false;
            }
        }
        return true;
    },
    
	flipVertexOrder: function(){
		this.vertices.reverse();
		return this;
	},
	
	getArea: function(){
		var area = 0;
		var numPoints = this.vertices.length;
		for(var i=0;i<numPoints;i++){
			var a = this.vertices[i];
			var b = this.vertices[(i+1) % numPoints];
			area += a.x * b.y;
			area -= a.y * b.x;
		}
		area *= 0.5;
		return area;
	},
	
	getCentroid: function(){
		var res = new toxi.Vec2D();
		var numPoints = this.vertices.length;
		for(var i=0;i<numPoints;i++){
			var a = this.vertices[i];
			var b = this.vertices[(i+1) %numPoints];
			var factor = a.x * b.y - b.x * a.y;
			res.x += (a.x + b.x) * factor;
			res.y += (a.y + b.y) * factor;
		}
		return res.scale(1 / (this.getArea() * 6));
	},
	
	getCircumference: function(){
		var circ = 0;
		for(var i=0;num=this.vertices.length,i<num;i++){
			circ += this.vertices[i].distanceTo(this.vertices[(i+1)%num]);
		}
		return circ;
	},
	
	getEdges: function() {
        var num = this.vertices.length;
        var edges = new Array(num);
        for (var i = 0; i < num; i++) {
            edges[i]=new toxi.Line2D(this.vertices[i], this.vertices[(i + 1) % num]);
        }
        return edges;
    },
    
	getNumPoints: function(){
		return this.vertices.length;
	},
	
	isClockwise: function(){
		if(this.vertices.length > 2){
			return toxi.Triangle2D.isClockwise(this.vertices[0],this.vertices[1],this.vertices[2]);
		}
		return false;
	},
	
	intersectsPoly: function(poly) {
        if (!this.containsPoly(poly)) {
        	var edges=this.getEdges();
        	var pedges=poly.getEdges();
            for(var i=0, n=edges.length; i < n; i++) {
                for(var j=0, m = pedges.length, e = edges[i]; j < m; j++) {
                    if (e.intersectLine(pedges[j]).getType() == toxi.Line2D.LineIntersection.Type.INTERSECTING) {
                        return true;
                    }
                }
            }
            return false;
        } else {
            return true;
        }
    },
    
    rotate: function(theta) {
    	for (var i=0, num=this.vertices.length; i < num; i++) {
            this.vertices[i].rotate(theta);
        }
    },
    
    scale: function() {
    	var x,y;
    	if (arguments.length==1) {
    		var arg = arguments[0];
			if(arg instanceof toxi.Vec2D){
				x=arg.x;
				y=arg.y;
			} else {
				// uniform scale
				x=arg;
				y=arg;
			}
    	} else if (arguments.length==2) {
    		x=arguments[0];
    		y=arguments[1];
    	} else {
    		throw "Invalid argument(s) passed.";
    	}
        for (var i=0, num=this.vertices.length; i < num; i++) {
            this.vertices[i].scaleSelf(x, y);
        }
        return this;
    },
    
    translate: function() {
    	var x,y;
    	if (arguments.length==1 && arguments[0] instanceof toxi.Vec2D){
			x=arg.x;
			y=arg.y;
    	} else if (arguments.length==2) {
    		x=arguments[0];
    		y=arguments[1];
    	} else {
    		throw "Invalid argument(s) passed.";
    	}
        for (var i=0, num=this.vertices.length; i < num; i++) {
            this.vertices[i].addSelf(x, y);
        }
        return this;
    },
    
	smooth: function(amount, baseWeight){
		var centroid = this.getCentroid();
		var num = this.vertices.length;
		var filtered = [];
		for(var i=0,j=num-1,k=1;i<num;i++){
			var a = this.vertices[i];
			var dir = this.vertices[j].sub(a).addSelf(this.vertices[k].sub(a))
				.addSelf(a.sub(centroid).scaleSelf(baseWeight));
			filtered.push(a.add(dir.scaleSelf(amount)));
			j++;
			if(j == num){
				j=0;
			}
			k++;
			if(k == num){
				k=0;
			}
		}
		this.vertices = filtered;
		return this;
	},
	
	toString: function(){
		var s = "";
		for(var i=0;i<this.vertices.length;i++){
			s += this.vertices[i];
			if(i<this.vertices.length-1){
				s+= ", ";
			}
		}
		return s;
	}
	
};