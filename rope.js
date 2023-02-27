
class Rope extends Page {
    constructor(startTime) {
        super(startTime)
        this.constraints = [];
        this.edges = []; // only for visualize

        this.isInitialized = false;
        this.verts = [];
        this.anchorMouse = new Vec2([400, 600]);

        this.groundH = 300;
        this.ground = new Line("ground", [0, screenY - 500], [screenX, screenY - 200], [0, 0])
        this.pond = new Pond("pond", [0, screenY - 400], [screenX, screenY - 400], [0, 0], 0.01)
        this.ball = new Sphere("ball", [0, 0], 10)
        this.obs = new Sphere("obs", [500, 500], 30)
        this.state = 0;
    }
    initialize() {

        const distance = 10
        // rope
        for (let i = 0; i < N; i++) {
            this.verts.push(new Vertex(`v${i}`, [400, 400 + (-i * 10)], [0.0, 0.0], dotMass, [0.0, 0.0], dotRadius))
            if (i < N - 1)
                this.constraints.push(makeTwoVertexDistanceConstraint(this.verts, i, i + 1, distance, 0.99));
        }

        for (let i = 1; i < N - 1; i++) {
            this.constraints.push(makeBendingConsraints(i - 1, i, i + 1, 180, 0.1, distance));
        }
        this.constraints.push(makeMousePosConstraint(this.verts[0], 10, 1));
        const flag = new Map()
        flag.set("Self", true)
        flag.set("Obs", this.obs)
        flag.set("Ground", [this.ground])
        this.constraints.push(makeColConstraint(this.verts, 1, flag));
        this.setAnchor([400, 400])
        this.isInitialized = true;
    }


    setup() {
        createCanvas(screenX, screenY);
        frameRate(30)

        this.initialize();
    }

    calExternalForce() {
        let forces = [];
        // gravity
        let gForce = new Vec2([0, G * dotMass])
        // friction
        const ukGround = 2
        const usGround = 5;
        for (let i = 0; i < this.verts.length; i++) {
            forces.push(new Vec2([0, 0]))
            if (this.ground.isCol(this.verts[i].x, this.verts[i].rad)) {
                // static
                if (abs(this.verts[i].v[0]) < usGround)
                    this.verts[i].v[0] = 0
                // kinetic
                else
                    this.verts[i].v[0] -= this.verts[i].v[0] * ukGround * this.deltaTime * SCALE_TIME
            }
        }

        for (let i = 0; i < N; i++) {
            let tmp = new Vec2([0, 0])
            tmp.addVec2(this.pond.calBuoyantForce(this.verts[i]));
            tmp.addVec2(this.pond.calDragForce(this.verts[i], this.deltaTime * SCALE_TIME))
            forces[i].addVec2(tmp)
        }

        for (let i = 0; i < N; i++) {
            forces[i] = addVec2(forces[i], gForce)
            this.verts[i].setForce(forces[i].val);
        }

    }

    draw() {
        clear();
        textSize(20);
        this.deltaTime = millis() - this.lastUpdateTime;
        this.lastUpdateTime += deltaTime;

        this.calExternalForce();
        PBDUpdate(this.verts, this.constraints, this.deltaTime * SCALE_TIME, 100, { "anchorMouse": this.anchorMouse });

        stroke(200);

        for (let i = 0; i < N; i++) {
            fill(color(0, 0, 0));
            ellipse(this.verts[i].x[0], this.verts[i].x[1], dotRadius * 2, dotRadius * 2);
            if (i < N - 1)
                line(this.verts[i].x[0], this.verts[i].x[1], this.verts[i + 1].x[0], this.verts[i + 1].x[1]);
        }


        // ground
        stroke('brown');
        strokeWeight(4);
        line(this.ground.start[0], this.ground.start[1], this.ground.end[0], this.ground.end[1])

        // pond
        stroke('blue');
        strokeWeight(4);
        line(this.pond.start[0], this.pond.start[1], this.pond.end[0], this.pond.end[1])
        stroke('black');
        strokeWeight(1);
        ellipse(this.ball.x[0], this.ball.x[1], 2 * this.ball.rad, 2 * this.ball.rad)

        fill(color(255, 0, 0));
        ellipse(this.obs.x[0], this.obs.x[1], 2 * this.obs.rad, 2 * this.obs.rad)
        if (this.state == 1) {
            noFill()

            const intersectPoints = circleIntersectLine(this.obs, this.ground)

            if (intersectPoints.length == 2) {
                fill(color(1, 0, 0));
                ellipse(intersectPoints[0].val[0], intersectPoints[0].val[1], 5, 5)
                ellipse(intersectPoints[1].val[0], intersectPoints[1].val[1], 5, 5)
            }
        }

    }

    mouseMoved(mouseX, mouseY) {
        if (this.isInitialized) {
            if (this.state == 0)
                this.setAnchor([mouseX, mouseY])
            else if (this.state == 1) {
                this.moveSphere([mouseX, mouseY])
            }
        }
    }

    moveSphere(pos) {
        this.obs.x = pos
    }
    keyPressed(keyCode) {
        if (keyCode === ENTER) {
            this.state = (this.state + 1) % 2
        }
    }

    setAnchor(pos) {

        this.anchorMouse = new Vec2(pos)
        this.ball.x = this.anchorMouse.val

        this.verts[0].setForce([
            (1.0 * this.anchorMouse.val[0] - this.verts[0].x[0]) * 10.0,
            (1.0 * this.anchorMouse.val[1] - this.verts[0].x[1]) * 10.0
        ]);
    }
}