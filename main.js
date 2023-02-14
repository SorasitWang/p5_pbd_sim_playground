const pageMap = [
    (startTime) => { return new FreeFall(startTime) },
    (startTime) => { return new Rope(startTime) }
]
let pageIdx = 1
let current = pageMap[pageIdx]()

function setup() {
    current.setup()
}

function draw() {
    current.draw()
}

function mouseMoved() {
    current.mouseMoved(mouseX, mouseY)
}

function keyPressed() {
    if (keyCode === TAB) {
        changePage()
    }
    current.keyPressed(keyCode)
}

function changePage() {
    pageIdx = (pageIdx + 1) % pageMap.length
    current.clearPage()
    current = pageMap[pageIdx](millis())
    current.setup()
}