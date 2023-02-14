function calForce(verts, dt) {
    const invDtPow2 = 1 / (dt * dt)
    for (let i = 0; i < verts.length; i++) {
        for (let d = 0; d < verts[i].v.length; d++) {
            let a = 2 * ((verts[i].p[d] - verts[i].x[d]) - verts[i].v[d] * dt) * invDtPow2
            //verts[i].f[d] += verts[i].m * a
            //console.log(verts[i].f[d])
        }
    }
}
function applyForce(verts, dt) {
    for (let i = 0; i < verts.length; i++) {
        for (let d = 0; d < verts[i].v.length; d++) {
            verts[i].v[d] = verts[i].v[d] + dt * verts[i].w * verts[i].f[d];

        }
        //console.log(verts[i].v[1])
    }

}

function dampVelocity(verts) {
    for (let i = 0; i < verts.length; i++) {
        for (let d = 0; d < verts[i].v.length; d++) {
            verts[i].v[d] *= 0.98;
        }
    }
}

function makeProposedPositions(verts, dt) {
    for (let i = 0; i < verts.length; i++) {
        for (let d = 0; d < 2; d++) {
            verts[i].p[d] = verts[i].x[d] + dt * verts[i].v[d];

        }
        //console.log("makePropose", verts[i].p, verts[i].x[1], dt * verts[i].v[1], verts[i].f)
    }

}

function generateCollisionConstraints(verts) {
    return []; // not implemented
}

function projectConstraints(verts, constraints, nSteps, dynamicObj, deltaTime) {
    for (let step = 0; step < nSteps; step++) {
        //for(let i = 0; i < constraints.length; i++) {
        for (let i = constraints.length - 1; i >= 0; i--) {
            constraints[i].project(verts, dynamicObj, deltaTime);
        }
    }
}

function finalizeVertices(verts, dt) {

    for (let i = 0; i < verts.length; i++) {
        for (let d = 0; d < 2; d++) {
            verts[i].v[d] = (verts[i].p[d] - verts[i].x[d]) / dt;
            verts[i].x[d] = verts[i].p[d];

        }
    }
    // console.log(verts[0].v[1],dt * verts[0].w * verts[0].f[1])
}

function PBDUpdate(vertices, constraints, deltaTime, nSteps = 4, dynamicObj = {}) {
    //calForce(vertices, deltaTime)
    applyForce(vertices, deltaTime);
    dampVelocity(vertices);
    makeProposedPositions(vertices, deltaTime);
    collisionConstraints = generateCollisionConstraints(vertices);
    projectConstraints(vertices, constraints.concat(collisionConstraints), nSteps, dynamicObj, deltaTime);
    finalizeVertices(vertices, deltaTime);

}