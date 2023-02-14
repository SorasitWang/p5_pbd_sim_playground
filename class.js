
class Obj {
    constructor(name) {
        this.name = name
    }
}

class Constraint {
    constructor(constraintType, updateFunc, stiffness) {
        this.ctype = constraintType;
        this.f = updateFunc;
        this.stiffness = stiffness;
        this.ava = true
    }

    project(verts, dynamicObj = {}, deltaTime = 0.03) {
        if (this.ava) {
            //console.log("pro")
            if (!this.f(verts, dynamicObj, deltaTime))
                this.ava = false
        }

    }

    clone() {
        return new Constraint(this.ctype, this.f);
    }
}

class Sphere extends Obj {
    constructor(name, x, rad, m = 10) {
        super(name)
        this.x = x
        this.rad = rad
        this.diameter = 2 * rad
        this.area = PI * rad * rad
        this.v = [0, 0]
        this.m = m
        this.w = 1 / m
        this.dense = m / this.area
        console.log(this.m, this.w)
    }

    reDense(dense) {
        this.m = dense * this.area
        this.dense = dense
        this.w = 1 / this.m
    }
}

class Vertex extends Sphere {
    constructor(name, x, v, m, f, rad = 5) {
        if (x.constructor.name == "Vec2")
            x = x.val
        //console.log(x)
        super(name, x, rad, m)
        this.v = v;
        this.f = f;
        this.p = [x[0], x[1]];
        this.prop = new Map()

    }

    setForce(f) {
        this.f = f;
    }
}

// Has bounce property 
class Ball extends Vertex {
    constructor(name, x, v, m, f, rad = 5, elasticity = 0.3) {
        super(name, x, v, m, f, rad)
        this.elasticity = elasticity
        this.colState = new Map()
    }

    colSome(objs) {
        this.colState = new Map()
        objs.forEach(obj => {
            this.colState.set(obj.name, true)
        });
    }
}



class Line extends Obj {
    constructor(name, start, end, outside) {
        console.log(outside)
        super(name)
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
        let sign = this.side(point) != this.outside ? -1 : 1
        return sign * abs(this.a * point[0] + this.b * point[1] + this.c) * this.distAB
    }

    isCol(pos, offset) {
        return this.distance(pos) < offset
    }
    side(c) {

        return (this.end[0] - this.start[0]) * (c[1] - this.start[1]) - (this.end[1] - this.start[1]) * (c[0] - this.start[0]) > 0

    }
    isInside(pos) {
        return this.side(pos) != this.outside
    }
    reflect(vector) {
        vector = normalizeVec2(new Vec2(vector))
        const normal = new Vec2(this.normal)
        //console.log(vector)
        return subVec2(vector, mulSc(this.normal, dotVec2(vector, new Vec2(this.normal)) * 2))
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
    constructor(name, start, end, outside, dense = 0.004) {
        super(name, start, end, outside)
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
        // opposite velocity can not more than current velocity (not make object move in opposite side) 
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


class Page {
    constructor(startTime = 0) {
        this.deltaTime = 0
        this.lastUpdateTime = startTime
    }

    draw() {
        throw new Error("draw() must be implemented")
    }

    setup() {
        throw new Error("draw() must be implemented")
    }

    mouseMoved(mouseX, mouseY) {
        console.log("mouseMoved() has not be implemented")
    }

    keyPressed(keyCode) {
        console.log("keyPressed() has not be implemented")
    }

    clearPage() {
        console.log("clearPage() has not be implemented")
    }
}