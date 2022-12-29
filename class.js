
class Constraint {
    constructor(constraintType, updateFunc, stiffness) {
        this.ctype = constraintType;
        this.f = updateFunc;
        this.stiffness = stiffness;
        this.ava = true
    }

    project(verts) {
        if (this.ava)
            if (!this.f(verts))
                this.ava = false

    }

    clone() {
        return new Constraint(this.ctype, this.f);
    }
}

class Sphere {
    constructor(x, rad, m = 10) {
        this.x = x
        this.rad = rad
        this.area = PI * rad * rad
        this.v = [0, 0]
        this.m = m
        this.w = 1 / m
        this.dense = m / this.area
        console.log(this.m, this.w)
    }
}

class Vertex extends Sphere {
    constructor(x, v, m, f, rad = 5) {
        super(x, rad, m)
        this.v = v;
        this.f = f;
        this.p = [x[0], x[1]];
    }

    setForce(f) {
        this.f = f;
    }
}



class Line {
    constructor(start, end, outside) {
        this.start = start
        this.end = end
        this.vec = normalizeVec2(new Vec2([end[1] - start[1], end[0] - start[0]]))
        this.invVecLS = 1 / dotVec2(this.vec, this.vec)

        this.computeProp(start, end)


        this.distAB = 1 / (Math.sqrt(this.a * this.a + this.b * this.b))

        this.outside = this.side(outside)

        this.normal = normalizeVec2(new Vec2([-(end[1] - start[1]), (end[0] - start[0])]))
        let tmp = addVec2(new Vec2(start), this.normal)

        if (this.side(tmp.val) != this.outside) {
            this.normal = mulSc(this.normal, -1)
        }
        tmp = addVec2(new Vec2(start), this.normal)


    }

    distance(point) {
        //console.log(point)
        let sign = ground.side(point) != ground.outside ? -1 : 1
        return sign * abs(this.a * point[0] + this.b * point[1] + this.c) * this.distAB
    }

    side(c) {

        return (this.end[0] - this.start[0]) * (c[1] - this.start[1]) - (this.end[1] - this.start[1]) * (c[0] - this.start[0]) > 0

    }
    isInside(pos) {
        return this.side(pos) != this.outside
    }

    //https://stackoverflow.com/a/22097446
    // project(p){
    //   let v = new Vec2(p)
    //   return mulSc(this.vec, dotVec2(v,this.vec) * this.invVecLS).val
    // }

    closetPoint(p, offset = 0) {
        let dx = this.end[0] - this.start[0]
        let dy = this.end[1] - this.start[1]
        let det = dx * dx + dy * dy
        let a = (dy * (p[1] - this.start[1]) + dx * (p[0] - this.start[0])) / det
        let pointOn = new Vec2([this.start[0] + a * dx, this.start[1] + a * dy])

        // add offset in normal direction
        return addVec2(pointOn, mulSc(this.normal, offset)).val
    }

    computeProp(start, end, setValue = true) {
        const m = (start[1] - end[1]) / (start[0] - end[0])
        const a = start[1] - end[1]
        const b = end[0] - start[0]
        const c = (start[0] - end[0]) * start[1] + (end[1] - start[1]) * start[0]
        if (setValue) {
            this.m = m
            this.a = a
            this.b = b
            this.c = c
        }
        return { m: m, a: a, b: b, c: c }
    }


}

class Pond extends Line {
    constructor(start, end, outside, p) {
        super(start, end, outside)
        // https://www.thoughtco.com/table-of-densities-of-common-substances-603976
        this.dense = 0.004
    }

    calBuoyantForce(sphere) {
        // cal volume(area) of object that sinking

        let a = calAreaCircleLine(sphere, this)
        // if entire sphere is inside, v will be 0 but should be all volume
        if (a == 0 && this.isInside(sphere.x))
            a = sphere.area
        //console.log([0,-this.dense*G*a])
        return new Vec2([0, -this.dense * G * a])
    }

    calDragForce(sphere) {
        const Cd = 0.47 //of sphere
        const lengthInside = calLengthInside(sphere, this)
        //console.log(lengthInside)
        const v = new Vec2(sphere.v)
        let force = mulSc(mulVec2(v, v), 0.5 * Cd * this.dense * lengthInside)
        // direction opposite with sphere.v
        force.val[0] *= -1 * Math.sign(sphere.v[0])
        force.val[1] *= -1 * Math.sign(sphere.v[1])
        return force;

    }



}