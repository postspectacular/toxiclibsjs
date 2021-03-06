/**
 		T O X I C L I B S . JS  - 0.01
		a port of toxiclibs for Java / Processing written by Karsten Schmidt
		
		License				: GNU Lesser General Public version 2.1
		Developer			: Kyle Phillips: http://haptic-data.com
		Java Version		: http://toxiclibs.org
*/

toxi.Line2D = function( a, b) {
  this.a = a;
  this.b = b;
}


toxi.Line2D.prototype = {
    /**
     * Computes the closest point on this line to the point given.
     * 
     * @param p
     *            point to check against
     * @return closest point on the line
     */
    closestPointTo: function(p) {
        var v = this.b.sub(this.a);
        var t = p.sub(this.a).dot(v) / v.magSquared();
        // Check to see if t is beyond the extents of the line segment
        if (t < 0.0) {
            return this.a.copy();
        } else if (t > 1.0) {
            return this.b.copy();
        }
        // Return the point between 'a' and 'b'
        return this.a.add(v.scaleSelf(t));
    },

    copy: function() {
        return new toxi.Line2D(this.a.copy(), this.b.copy());
    },

   equals: function(obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof toxi.Line2D)) {
            return false;
        }
        var l = obj;
        return (this.a.equals(l.a) || this.a.equals(l.b))
                && (this.b.equals(l.b) || this.b.equals(l.a));
    },

    getDirection: function() {
        return this.b.sub(this.a).normalize();
    },

    getLength: function() {
        return this.a.distanceTo(this.b);
    },

    getLengthSquared: function() {
        return this.a.distanceToSquared(this.b);
    },

    getMidPoint: function() {
        return this.a.add(this.b).scaleSelf(0.5);
    },

    getNormal: function() {
        return this.b.sub(this.a).perpendicular();
    },

    getTheta: function() {
        return this.a.angleBetween(this.b, true);
    },

    hasEndPoint: function(p) {
        return this.a.equals(p) || this.b.equals(p);
    },


    /**
     * Computes intersection between this and the given line. The returned value
     * is a {@link LineIntersection} instance and contains both the type of
     * intersection as well as the intersection point (if existing).
     * 
     * Based on: http://local.wasp.uwa.edu.au/~pbourke/geometry/lineline2d/
     * 
     * @param l
     *            line to intersect with
     * @return intersection result
     */
    intersectLine: function(l) {
        var isec = null;
        var denom =
                (l.b.y - l.a.y) * (this.b.x - this.a.x) - (l.b.x - l.a.x) * (this.b.y - this.a.y);

        var na =
                (l.b.x - l.a.x) * (this.a.y - l.a.y) - (l.b.y - l.a.y)
                        * (this.a.x - l.a.x);
        var nb = (this.b.x - this.a.x) * (this.a.y - l.a.y) - (this.b.y - this.a.y) * (this.a.x - l.a.x);

        if (denom != 0.0) {
            var ua = na / denom;
            var ub = nb / denom;
            if (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0) {
                isec =
                        new toxi.Line2D.LineIntersection(toxi.Line2D.LineIntersection.Type.INTERSECTING,
                                this.a.interpolateTo(this.b, ua));
            } else {
                isec = new toxi.Line2D.LineIntersection(toxi.Line2D.LineIntersection.Type.NON_INTERSECTING, null);
            }
        } else {
            if (na == 0.0 && nb == 0.0) {
                isec = new toxi.Line2D.LineIntersection(toxi.Line2D.LineIntersection.Type.COINCIDENT, null);
            } else {
                isec = new toxi.Line2D.LineIntersection(toxi.Line2D.LineIntersection.Type.COINCIDENT, null);
            }
        }
        return isec;
    },

    offsetAndGrowBy: function(offset,scale, ref) {
        var m = this.getMidPoint();
        var d = this.getDirection();
        var n = d.getPerpendicular();
        if (ref != null && m.sub(ref).dot(n) < 0) {
            n.invert();
        }
        n.normalizeTo(offset);
        this.a.addSelf(n);
        this.b.addSelf(n);
        d.scaleSelf(scale);
        this.a.subSelf(d);
        this.b.addSelf(d);
        return this;
    },

    scale: function(scale) {
        var delta = (1 - scale) * 0.5;
        var newA = a.interpolateTo(this.b, delta);
        this.b.interpolateToSelf(this.a, delta);
        this.a.set(newA);
        return this;
    },

    set: function(a, b) {
        this.a = a;
        this.b = b;
        return this;
    },

    splitIntoSegments: function(segments,stepLength,addFirst) {
        return toxi.Line2D.splitIntoSegments(this.a, this.b, stepLength, segments, addFirst);
    },

    toRay2D: function() {
        return new toxi.Ray2D(this.a.copy(), this.b.sub(this.a).normalize());
    }
};



/**
 * Splits the line between A and B into segments of the given length,
 * starting at point A. The tweened points are added to the given result
 * list. The last point added is B itself and hence it is likely that the
 * last segment has a shorter length than the step length requested. The
 * first point (A) can be omitted and not be added to the list if so
 * desired.
 * 
 * @param a
 *            start point
 * @param b
 *            end point (always added to results)
 * @param stepLength
 *            desired distance between points
 * @param segments
 *            existing array list for results (or a new list, if null)
 * @param addFirst
 *            false, if A is NOT to be added to results
 * @return list of result vectors
 */
toxi.Line2D.splitIntoSegments = function(a, b, stepLength, segments, addFirst) {
    if (segments == null) {
        segments = [];
    }
    if (addFirst) {
        segments.push(a.copy());
    }
    var dist = a.distanceTo(b);
    if (dist > stepLength) {
        var pos = a.copy();
        var step = b.sub(a).limit(stepLength);
        while (dist > stepLength) {
            pos.addSelf(step);
            segments.push(pos.copy());
            dist -= stepLength;
        }
    }
    segments.push(b.copy());
    return segments;
}


toxi.Line2D.LineIntersection = function(type, pos)
{
	this.type = type;
	this.pos = pos;
}

toxi.Line2D.LineIntersection.prototype = {
	getPos: function(){
		return this.pos.copy();
	},
	
	getType: function(){
		return this.type;
	},
	
	toString: function(){
		return "type: "+this.type+ " pos: "+this.pos;
	}	
};

toxi.Line2D.LineIntersection.Type = { COINCIDENT: 0, PARALLEL: 1, NON_INTERSECTING: 2, INTERSECTING: 3};
