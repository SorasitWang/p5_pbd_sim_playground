const constraints = [];
const edges = []; // only visual

//const ball = new Ball(screenX/2,0);
let isInitialized = false;

let dragIndex = -1;
let lastUpdateTime;
const verts = [];
let anchorMouse = new Vec2([400, 600]);


const spring = new Net(4, [100, 100], [500, 100])
let state = 0;

function initialize() {
    // creates a vertex matrix
    const K = 1
    constraints.push(makePositionConstraint(spring.particles[0], new Vec2([100, 100]), 0, 1));
    for (let i = 0; i < spring.particles.length - 1; i++)
        constraints.push(makeTwoVertexDistanceConstraint(spring.particles, i, i + 1, spring.interval, K))
    constraints.push(new Constraint("position", () => updatePositionConstraintPosition(spring.particles[spring.particles.length - 1]
        , anchorMouse, 0, K), K));
}


function setup() {

    createCanvas(screenX, screenY);

    frameRate(30)
    lastUpdateTime = 0;
    initialize();


}

function calExternalForce() {



}

function draw() {
    clear();
    deltaTime = millis() - lastUpdateTime;
    // console.log(net.particles[0].x, net.particles[1].x, net.particles[2].x)
    lastUpdateTime += deltaTime;

    calExternalForce();

    PBDUpdate(spring.particles, constraints, deltaTime * SCALE_TIME, 10);


    stroke(200);

    for (let i = 0; i < spring.particles.length; i++) {
        fill(0, 0, 0)
        ellipse(spring.particles[i].x[0], spring.particles[i].x[1], 5, 5)
        if (i < spring.particles.length - 1)
            line(spring.particles[i].x[0], spring.particles[i].x[1], spring.particles[i + 1].x[0], spring.particles[i + 1].x[1]);
        //console.log(i, spring.particles[i].x)
    }

    //console.log(spring.particles[0].x)



}

function mouseMoved() {
    if (isInitialized) {
        setAnchor([mouseX, mouseY])
    }
}

function mouseClicked() {


}

function keyPressed() {
    if (keyCode === SHIFT) {
        console.log("shift")
        for (let i = 1; i < constraints.length; i++)
            constraints[i].ava = true

    }
    else if (keyCode === TAB) {
        for (let i = 1; i < constraints.length; i++)
            constraints[i].ava = false
        //spring.particles[0].x[0] -= 10
        spring.particles[spring.particles.length - 1].x[0] += 100
        console.log(spring.particles[spring.particles.length - 1].x)
    }

}


function setAnchor(pos) {

    anchorMouse = new Vec2(pos)
    ball.x = anchorMouse.val

    verts[0].setForce([
        (1.0 * anchorMouse.val[0] - verts[0].x[0]) * 10.0,
        (1.0 * anchorMouse.val[1] - verts[0].x[1]) * 10.0
    ]);
}