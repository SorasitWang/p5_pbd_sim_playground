function triangleArea(A, B, C) {
    const a = subVec2(A, B).size()
    const b = subVec2(A, C).size()
    const c = subVec2(B, C).size()
    const s = (a + b + c) / 2

    return Math.sqrt(s * (s - a) * (s - b) * (s - c))
}

function circleIntersectLine(sphere, line) {
    const start = [line.start[0] - sphere.x[0], line.start[1] - sphere.x[1]]
    const end = [line.end[0] - sphere.x[0], line.end[1] - sphere.x[1]]
    const prop = line.computeProp(start, end, false)
    const centerVec2 = new Vec2(sphere.x)
    const a = prop.a, b = prop.b, c = prop.c

    const r = sphere.rad
    const x0 = -a * c / (a * a + b * b), y0 = -b * c / (a * a + b * b);

    if (c * c > r * r * (a * a + b * b) + EPS)
        return []
    else if (abs(c * c - r * r * (a * a + b * b)) < EPS) {
        return [addVec2(centerVec2, new Vec2([x0, y0]))]
    }
    else {
        const d = r * r - c * c / (a * a + b * b);
        const mult = sqrt(d / (a * a + b * b));
        let ax, ay, bx, by;
        ax = x0 + b * mult;
        bx = x0 - b * mult;
        ay = y0 - a * mult;
        by = y0 + a * mult;
        return [addVec2(centerVec2, new Vec2([ax, ay])), addVec2(centerVec2, new Vec2([bx, by]))]

    }
}

function calAreaCircleLine(sphere, line) {

    const intersectPoints = circleIntersectLine(sphere, line)
    if (intersectPoints.length < 2)
        return 0
    const theta = calCircleInterAngle(intersectPoints[0], intersectPoints[1], sphere.x)
    // find area by those points
    /*const v1 = subVec2(intersectPoints[0],new Vec2(sphere.x))
    const v2 = subVec2(intersectPoints[1],new Vec2(sphere.x))
    const theta = angleBetweenVec2(v1,v2)*/

    const radPow2 = sphere.rad * sphere.rad
    let segment = 0.5 * radPow2 * (theta - Math.sin(theta))
    // if center of obs is inside line, segment += half area
    if (line.isInside(sphere.x))
        segment = radPow2 * PI - segment
    return segment
}

function calCircleInterAngle(v1, v2, center) {
    if (typeof center != "Vec2")
        center = new Vec2(center)
    v1 = subVec2(v1, center)
    v2 = subVec2(v2, center)
    return angleBetweenVec2(v1, v2)
}

function calLengthInside(sphere, line) {
    const intersectPoints = circleIntersectLine(sphere, line)
    let re = 0
    if (intersectPoints.length == 2) {
        const theta = calCircleInterAngle(intersectPoints[0], intersectPoints[1], sphere.x)
        re = theta * sphere.rad
    }
    if (line.isInside(sphere.x))
        re = 2 * PI * sphere.rad - re
    return re
}

function clone(orig) {
    return Object.assign(Object.create(Object.getPrototypeOf(orig)), orig);
}

function roundAny(val, digit = 2) {
    const div = Math.pow(10, digit)
    if (typeof (val) === "object" && val.constructor.name == "Array") {
        const newArr = []
        val.forEach(e => {
            newArr.push(Math.round(e * div) / div)
        });
        return newArr
    }
    else if (typeof (val) === "number") {
        return Math.round(val * div) / div
    }
}