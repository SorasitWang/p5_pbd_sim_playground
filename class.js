
class Constraint {
    constructor(constraintType, updateFunc, stiffness) {
        this.ctype = constraintType;
        this.f = updateFunc;
        this.stiffness = stiffness;
        this.ava = true
    }

    project(verts) {
        if (this.ava) {
            //console.log("pro")
            if (!this.f(verts))
                this.ava = false
        }

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
        if (x.constructor.name == "Vec2")
            x = x.val
        //console.log(x)
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
    constructor(start, end, outside, dense = 0.004) {
        super(start, end, outside)
        // https://www.thoughtco.com/table-of-densities-of-common-substances-603976
        this.dense = dense
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

    calDragForce(sphere, deltaTime) {
        const Cd = 0.47 //of sphere
        const lengthInside = calLengthInside(sphere, this)
        //console.log(lengthInside)
        const v = new Vec2(sphere.v)
        let force = mulSc(mulVec2(v, v), 0.5 * Cd * this.dense * lengthInside)
        // direction opposite with sphere.v
        //console.log(abs(sphere.v[0]), force.val[0] * deltaTime)
        // not velocity more than current velocity (not make object move in opposite side) 
        for (let i = 0; i < 2; i++) {
            if (sphere.w * force.val[i] * deltaTime > abs(sphere.v[i]))
                force.val[i] = abs(sphere.v[i]) / deltaTime * sphere.m
            force.val[i] *= -1 * Math.sign(sphere.v[i])
        }
        //force.val[1] = min(abs(sphere.v[1]), sphere.w * force.val[1] * deltaTime)
        return force;

    }


}

class Net {

    constructor(n, start, end) {
        this.particles = []
        this.pMass = 10;
        this.pRad = 2.5
        this.constraints = []
        const posStart = new Vec2([...start])
        const posEnd = new Vec2([...end])
        let dir = normalizeVec2(subVec2(posEnd, posStart))
        this.interval = subVec2(posStart, posEnd).size() / (n + 1)
        this.particles.push(new Vertex(posStart, [0, 0], this.pMass, [0, 0], this.pRad))
        for (let i = 1; i <= n; i++) {
            this.particles.push(new Vertex(addVec2(posStart, mulSc(dir, this.interval * i)), [0, 0], this.pMass, [0, 0], this.pRad))
        }
        this.particles.push(new Vertex(posEnd, [0, 0], this.pMass, [0, 0], this.pRad))
        this.posStart = new Vec2([...start])
        this.posEnd = new Vec2([...end])
    }

}