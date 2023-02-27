function updateDistanceConstraintPosition(v1, v2, d, k) {

    let mag = modVec2(new Vec2(v1.p), new Vec2(v2.p));
    mag = max(Epsilon, mag)
    // if (mag >= 3*d)

    //     return false
    let s1 = 1.0 * (-v1.w) / (v1.w + v2.w) * (mag - d) / mag;
    let s2 = 1.0 * v2.w / (v1.w + v2.w) * (mag - d) / mag;
    v1.p[0] += s1 * (v1.p[0] - v2.p[0]) * k;
    v1.p[1] += s1 * (v1.p[1] - v2.p[1]) * k;
    v2.p[0] += s2 * (v1.p[0] - v2.p[0]) * k;
    v2.p[1] += s2 * (v1.p[1] - v2.p[1]) * k;

    return true
}
function updatePositionConstraintPosition(v, anchor, d, k) {

    //console.log(v.p, anchor, k)
    let mag = modVec2(new Vec2(v.p), anchor);
    mag = max(Epsilon, mag)
    //console.log(anchor)
    let s = (mag - d) / mag;
    v.p[0] -= s * (v.p[0] - anchor.val[0]) * k;
    v.p[1] -= s * (v.p[1] - anchor.val[1]) * k;
    return true

}

function colSphere(obs, vertex) {
    let center = new Vec2(obs.x)
    let pos = new Vec2(vertex.p)
    if (modVec2(center, pos) < obs.rad) {
        //console.log("col")
        //       
        let dir = normalizeVec2(subVec2(pos, center))
        //console.log(dir.size())
        let newPos = addVec2(center, mulSc(dir, obs.rad))
        let v = new Vec2(vertex.p)
        let diff = subVec2(newPos, v)
        //console.log(center.val,mouseX,mouseY)
        vertex.p = addVec2(v, mulSc(diff, 1)).val
    }
}

function colSelf(v1, v2) {
    let v1_ = new Vec2(v1.p)
    let v2_ = new Vec2(v2.p)

    if (modVec2(v1_, v2_) < 2 * dotRadius) {
        let dir = normalizeVec2(subVec2(v2_, v1_))
        let newPos = addVec2(v1_, mulSc(dir, 2 * dotRadius))
        let diff = mulSc(subVec2(newPos, v2_), 0.5)
        v1.p = addVec2(v1_, mulSc(diff, -0.5)).val
        v2.p = addVec2(v2_, mulSc(diff, 0.5)).val
    }
}

function colMovable(v1, v2) {
    let v1_ = new Vec2(v1.p)
    let v2_ = new Vec2(v2.p)
    let InvSumW = 1 / (v1.w + v2.w)

    if (modVec2(v1_, v2_) < v1.rad + v2.rad) {
        let dir = normalizeVec2(subVec2(v2_, v1_))
        let newPos = addVec2(v1_, mulSc(dir, v1.rad + v2.rad))
        let diff = mulSc(subVec2(newPos, v2_), 0.5)
        v1.p = addVec2(v1_, mulSc(diff, (-v1.w) * InvSumW)).val
        v2.p = addVec2(v2_, mulSc(diff, v2.w * InvSumW)).val
        //console.log(v2.p)
    }

}
function updateColConstraintPosition(vert, k, flags, deltaTime) {

    c++
    for (let i = 0; i < vert.length; i++) {
        // check ground

        // if (c%100 ==0 && i==verts.length-1){
        //   console.log(verts[i].p,ground.side(verts[i].p),verts[i].x,ground.side(verts[i].x))
        // }
        if (flags.get("Ground")) {
            const grounds = flags.get("Ground")
            grounds.forEach(ground => {
                //console.log(vert[i].v, ground.distance(vert[i].v))
                // if (ground.isCol(vert[i].p, vert[i].rad)) {

                //     //vert[i].prop.set("col_ground", true)
                // }
                // else {
                //     //console.log(ground.distance(vert[i].x))
                //     vert[i].prop.set("col_ground", false)
                // }

                if (ground.isCol(vert[i].p, vert[i].rad)) {
                    //vert[i].x = ground.closetPoint(vert[i].p, vert[i].rad)
                    if (flags.get("Ground_bounce") && vert[i].prop.get("col_ground") === false) {
                        if (new Vec2(vert[i].v).size() >= 4 * G * deltaTime) {
                            const reflect = ground.reflect(vert[i].v)
                            console.log("still bounce " + reflect.size() / G / deltaTime)
                            // compute in advance
                            vert[i].p = addVec2(new Vec2(vert[i].x), mulSc(reflect, 0.75 * deltaTime)).val
                        }

                    }
                    vert[i].prop.set("col_ground", true)
                    if (ground.isCol(vert[i].p, vert[i].rad)) {
                        vert[i].p = ground.closetPoint(vert[i].p, vert[i].rad)
                        //if (ground.isCol(vert[i].x, vert[i].p, vert[i].rad))


                    }
                }
                else {
                    vert[i].prop.set("col_ground", false)
                }
            })

        }


        if (flags.get("Obs")) {
            // col with obstruct
            colSphere(flags.get("Obs"), vert[i])
        }
        if (flags.get("Self")) {
            // self collision
            for (let j = i + 1; j < vert.length; j++) {
                colMovable(vert[i], vert[j]);
            }
        }
        if (flags.get("Env")) {
            colMovable(vert[i], flags.get("Env"));
        }

    }


    return true
}

function updateEnvColConstraintPosition(allVerts, k, obj) {
    //console.log(allVerts)
    for (let i = 0; i < allVerts.length; i++) {
        for (let j = 0; j < allVerts[i].length; j++) {
            colMovable(obj, allVerts[i][j]);
        }
    }
    return true
}

let c = 0
function updateBendingConstraintPosition1(v1, v2, v3, angle, stiffness, dd) {
    let v1_ = new Vec2(v1.p);
    let v2_ = new Vec2(v2.p);
    let v3_ = new Vec2(v3.p);
    angle = radians(angle)
    let allLength = 1 / (v1_.size() * v1_.size() + v2_.size() * v2_.size() + v3_.size() * v3_.size())
    let allW = 1 / (v1.w + v2.w + v3.w)
    // let n1 = normalizeVec2(crossVec2(v1_,v2_))
    // let n2 = normalizeVec2(crossVec2(v1_,v3_))
    // let d = dotVec2(n1,n2)
    let n1 = normalVec2(v1_, v2_)
    let n2 = normalVec2(v1_, v3_)
    let d = dotVec2(n1, n2)
    if (d < 1 + 0.00001 && d >= 1) d = 1
    let s1 = -3 * v1.w * allW * Math.sqrt(1 - d * d) * (Math.acos(d) - angle) * stiffness * allLength
    let s2 = -3 * v2.w * allW * Math.sqrt(1 - d * d) * (Math.acos(d) - angle) * stiffness * allLength
    let s3 = -3 * v3.w * allW * Math.sqrt(1 - d * d) * (Math.acos(d) - angle) * stiffness * allLength

    //if (d < 1) console.log(d)
    v1.p = addVec2(mulSc(v1_, s1), v1_).val
    v2.p = addVec2(mulSc(v2_, s2), v2_).val
    v3.p = addVec2(mulSc(v3_, s3), v3_).val
    return true
}

function updateBendingConstraintPosition(v1, v2, v3, angle, stiffness, dd) {

    let v1_ = new Vec2(v1.p)
    let v2_ = new Vec2(v2.p)
    let v3_ = new Vec2(v3.p)
    // find shouldV3
    let slope = normalizeVec2(subVec2(v2_, v1_)).val
    let dir = new Vec2([-slope[1], slope[0]])
    if (slope[0] < 0)
        dir = new Vec2([slope[1], -slope[0]])
    let shouldV3 = addVec2(v2_, dir)
    //let center = mulSc(addVec2(addVec2(v1_, v2_), shouldV3), 0.3333333)
    let v1Changed = mulSc(v1_, 0.25)
    let v2Changed = mulSc(v2_, 0.25)
    let v3Changed = mulSc(v3_, 0.5)

    let center = mulSc(addVec2(addVec2(v1_, v2_), v3_), 0.3333333)
    // center = addVec2(addVec2(v1Changed, v2Changed), v3Changed)
    let dirCenter = subVec2(v3_, center)

    let distCenter = dirCenter.size()
    let diff = 1 - (dd / distCenter)
    let ww = 1 / (v1.m + v1.m + v1.m)
    let mass = v1.m
    let dirForce = mulSc(dirCenter, diff)
    let fa = mulSc(dirForce, stiffness * (2 * mass * ww));
    //if (c++%500 ==0)
    //console.log(fa)
    v1.p = addVec2(fa, v1_).val;

    let fb = mulSc(dirForce, stiffness * (2 * mass * ww));
    v2.p = addVec2(fb, v2_).val;

    let fc = mulSc(dirForce, -stiffness * (4 * mass * ww));
    v3.p = addVec2(fc, v3_).val;
    return true
}

function makeTwoVertexDistanceConstraint(vert, v1, v2, d, stiffness) {
    return new Constraint(
        "distance",
        (verts) => updateDistanceConstraintPosition(vert[v1], vert[v2], d, stiffness),
        stiffness);
}

function makePositionConstraint(v, anchor, d, stiffness) {
    return new Constraint(
        "position",
        (verts) => updatePositionConstraintPosition(v, anchor, d, stiffness),
        stiffness);
}

function makeMousePosConstraint(v, d, stiffness) {
    return new Constraint(
        "position",
        (verts, dynamicObj) => updatePositionConstraintPosition(v, dynamicObj["anchorMouse"], d, stiffness),
        stiffness);
}
function makeColConstraint(vert, stiffness, flags) {
    return new Constraint(
        "ground",
        (verts, dynamicObj, deltaTime) => updateColConstraintPosition(vert, stiffness, flags, deltaTime),
        stiffness);
}

function makeEnvColConstraint(envs, obj, stiffness) {
    return new Constraint(
        "position",
        (verts) => updateEnvColConstraintPosition(envs, stiffness, obj),
        stiffness);
}


function makeBendingConsraints(v1, v2, v3, angle, stiffness, d) {
    return new Constraint(
        "bending",
        (verts) => updateBendingConstraintPosition(verts[v1], verts[v2], verts[v3], angle, stiffness, d),
        stiffness);
}
