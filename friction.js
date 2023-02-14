// you can try it out on https://editor.p5js.org/


function isColGround(p, offset, epsilon = 1e-4) {
    // if proposed postion and current postion are on the opposite side
    // and current pos is near surface

    return ground.distance(p) < offset + epsilon
    //return pos[1]+2.5+offset >= screenY-groundH
}



// --------------- application --------------- //


const constraints = [];
const edges = []; // only visual

//const ball = new Ball(screenX/2,0);
let isInitialized = false;

let dragIndex = -1;
let lastUpdateTime;
const verts = [];
let anchorMouse = new Vec2([400, 600]);

const ground = new Line("ground", [0, screenY - 300], [screenX, screenY - 300], [0, 0])
const ball = new Ball("ball", [100, screenY - 350], [100, 100], 20, [0, 0])
let state = 0;

function initialize() {
    // creates a vertex matrix
    const D = 10.0;
    const NStep = 100;
    const K = 1;

    setAnchor([400, 400])
    const colFlags = new Map()
    colFlags.set("Ground", true)
    colFlags.set("Ground_bounce", true)
    ball.prop.set("col_ground", false)
    constraints.push(makeColConstraint([ball], 1, colFlags));
    isInitialized = true;
}


function setup() {

    createCanvas(screenX, screenY);

    frameRate(30)
    lastUpdateTime = 0;
    initialize();
    dragIndex = verts.length - 1; //Math.floor(verts.length / 2);

}

function calExternalForce() {
    // a = f/m , f*w

    // gravity

    let gForce = new Vec2([0, G * ball.m])
    let force = gForce;
    // friction

    const ukGround = 0.25
    const usGround = 5;
    const colAny = []
    let colGround = isColGround(ball.x, ball.rad)
    if (colGround)
        ball.colSome(colAny)
    // bounce
    if (!ball.colState.get("ground") && colGround) {
        // add reflect force
        const prevV = new Vec2(ball.v)
        const magnitude = prevV.size()
        const newV = mulSc(normalizeVec2(mulSc(ground.reflect(new Vec2(ball.v)), 1)), magnitude)
        //force = mulSc(subVec2(newV, prevV), 2 * ball.m / deltaTime)
        console.log(newV.val, prevV.val, force)
        //console.log(ball.v, mulSc(normalizeVec2(mulSc(ground.reflect(new Vec2(ball.v)), 1)), magnitude).val)

        //ball.v = mulSc(normalizeVec2(mulSc(ground.reflect(new Vec2(ball.v)), 1)), magnitude).val

    }

    // if (colGround) {
    //     colAny.push(ground)
    //     if (abs(ball.v[0]) < usGround) {
    //         //console.log("Stop")
    //         ball.v[0] = 0
    //     }
    //     else
    //         // not quiet realistic
    //         ball.v[0] -= ball.v[0] * ukGround * deltaTime * SCALE_TIME
    // }

    ball.colSome(colAny)
    ball.setForce(force.val)
}

function draw() {
    clear();
    textSize(20);
    text(`Velocity : ${ball.v}`, 100, 100)
    deltaTime = millis() - lastUpdateTime;
    // console.log(net.particles[0].x, net.particles[1].x, net.particles[2].x)
    lastUpdateTime += deltaTime;

    calExternalForce();
    PBDUpdate([ball], constraints, deltaTime * SCALE_TIME, 10);
    //console.log(ball.v)
    //PBDUpdate([sphere_].concat(net.particles), net.constraints, deltaTime * SCALE_TIME, 300);
    //PBDUpdate(, envConstraints, deltaTime * SCALE_TIME, 100);


    stroke(200);


    fill(color(0, 0, 0));
    ellipse(ball.x[0], ball.x[1], ball.diameter, ball.diameter);
    //console.log(ball.x)


    // ground
    line(ground.start[0], ground.start[1], ground.end[0], ground.end[1])

}

function mouseMoved() {

}

function mouseClicked() {


}

function keyPressed() {


}


function setAnchor(pos) {


}