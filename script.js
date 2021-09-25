// ===== classes =====
class Coord {

    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getX = () => this.x;
    getY = () => this.y;

    setX = x => this.x = x;
    setY = y => this.y = y;

    toString = () => `(${this.x}, ${this.y})`;

    equals = c => c.x === this.x && c.y === this.y;
}

class Pair {

    score;
    coord;

    constructor(score, coord) {
        this.score = score;
        this.coord = coord;
    }

    getScore = () => this.score;
    getCoord = () => this.coord;

    setScore = score => this.score = score;
    setCoord = coord => this.coord = coord;
}

class Cell {

    constructor() {
        this.f = -1;
        this.g = -1;
        this.h = -1;
        this.parent = new Coord(-1, -1);
    }

    getF = () => this.f;
    getG = () => this.g;
    getH = () => this.h;
    getParent = () => this.parent;

    setF = f => this.f = f;
    setG = g => this.g = g;
    setH = h => this.h = h;
    setParent = pair => this.parent = pair;
}

// ===== consts =====
// colors
const COLOR_TILE_EMPTY = '#252525';
const COLOR_TILE_START = '#4B79D1';
const COLOR_TILE_GOAL = '#D63877';
const COLOR_TILE_OBSTACLE = '#545454';
const COLOR_TILE_PATH = '#A163BA';

// representation
const REP_EMPTY = 0;
const REP_START = 1;
const REP_GOAL = 2;
const REP_OBSTACLE = 3;
const REP_PATH = 4;

// display color map
const DISPLAY_MAP = {
    0: COLOR_TILE_EMPTY,
    1: COLOR_TILE_START,
    2: COLOR_TILE_GOAL,
    3: COLOR_TILE_OBSTACLE,
    4: COLOR_TILE_PATH,
};

// dims
const GRID_DIM_HEIGHT = 25;
const GRID_DIM_WIDTH = 40;
const GRID_SQR_DIM = 23;
const GRID_SQR_GAP = 2;
const GRID_SQR_PADDING = 2;

// positions
const POS_START = new Coord(0, 0);
const POS_END = new Coord(GRID_DIM_WIDTH - 1, GRID_DIM_HEIGHT - 1);

// ===== vars =====
// drag trigger
let dragTrig = false;

// edit mode
let addMode = true;

// env
let state;

// doc vars
let canvas;
let ctx;

// ===== functions =====
// reset grid
const init = () => {
    // reset state
    state = [];
    for (let i = 0; i < GRID_DIM_HEIGHT; ++i)
        state.push(new Array(GRID_DIM_WIDTH).fill(REP_EMPTY));

    // set start and goal
    state[POS_START.getY()][POS_START.getX()] = REP_START;
    state[POS_END.getY()][POS_END.getX()] = REP_GOAL;

    // update
    updateCanvas();
}

// canvas on drag event
const canvasOnDrag = (mouseX, mouseY) => {
    // map to dim
    stateX = Math.floor((mouseX - 1) / (GRID_SQR_DIM + GRID_SQR_PADDING));
    stateY = Math.floor((mouseY - 1) / (GRID_SQR_DIM + GRID_SQR_PADDING));

    // dont allow overwite of start and goal
    if (
        (stateX == 0 && stateY == 0) ||
        (stateX == GRID_DIM_WIDTH - 1 && stateY == GRID_DIM_HEIGHT - 1)
    )
        return;

    // update
    state[stateY][stateX] = addMode ? REP_OBSTACLE : REP_EMPTY;

    updateCanvas();
}

// toggle canvas drag edit mode
const toggleEditMode = () => {
    // update var
    addMode = !addMode;

    // update button text
    let btnText = document.getElementById('editModeBtnText');
    btnText.innerHTML = addMode ? 'DELETE MODE' : 'ADD MODE';
}

// update canvas
const updateCanvas = () => {
    // clear 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw grid
    for (let row = 0; row < GRID_DIM_HEIGHT; ++row)
        for (let col = 0; col < GRID_DIM_WIDTH; ++col) {
            ctx.fillStyle = DISPLAY_MAP[state[row][col]];

            ctx.fillRect(
                col * (GRID_SQR_DIM + GRID_SQR_GAP) + GRID_SQR_PADDING,
                row * (GRID_SQR_DIM + GRID_SQR_GAP) + GRID_SQR_PADDING,
                GRID_SQR_DIM,
                GRID_SQR_DIM,
            );
        }
}


// ===== A STAR ALGORITHM =====
// make neighbours
const getNeighbours = pair => {
    let rt = [];

    for (let i = 0; i < 4; ++i) {
        let manipTerm = (1 - 2 * (i % 2));
        let trigTerm = Math.floor(i / 2);

        rt.push(new Coord(
            pair.getX() + trigTerm * manipTerm,
            pair.getY() + (1 - trigTerm) * manipTerm,
        ));
    }

    return rt;
}

// is valid cell
const isValid = pair => pair.getX() >= 0 && pair.getY() >= 0 && pair.getX() < GRID_DIM_WIDTH && pair.getY() < GRID_DIM_HEIGHT;

// heuristic function h(s)
const heuristic = (pos) => Math.sqrt(
    Math.pow(
        POS_END.getX() - pos.getX(),
        2,
    ) +
    Math.pow(
        POS_END.getY() - pos.getY(),
        2,
    )
);

// maintain open list order (can't be asked to implement a priority queue)
const sortOpenList = list => list.sort((a, b) => a.getScore() - b.getScore());

// reconstruct path
const reconstruct = detailList => {
    let path = [];

    let x = POS_END.getX();
    let y = POS_END.getY();
    let parent = POS_END;
    while (!parent.equals(detailList[y][x].getParent())) {
        path.push(parent);

        parent = detailList[y][x].getParent()
        x = parent.getX();
        y = parent.getY();
    }

    return path;
}

// start pathfind
const start = () => {
    console.log('start');

    // create closed list
    let closedList = [];
    for (let i = 0; i < GRID_DIM_HEIGHT; ++i)
        closedList.push(new Array(GRID_DIM_WIDTH).fill(false));

    // create details list
    let detailsList = [];
    for (let i = 0; i < GRID_DIM_HEIGHT; ++i) {
        let row = []
        for (let j = 0; j < GRID_DIM_WIDTH; ++j)
            row.push(new Cell());

        detailsList.push(row);
    }

    // initialist params of starting node
    let curX = POS_START.getX();
    let curY = POS_START.getY();
    detailsList[curY][curX].setF(0);
    detailsList[curY][curX].setG(0);
    detailsList[curY][curX].setH(0);
    detailsList[curY][curX].setParent(new Coord(curX, curY));

    // create open list
    let openList = [];

    // put start in open list
    openList.push(new Pair(0, POS_START));

    // start pathfinding
    while (openList.length > 0) {
        let top = openList[0];
        let topCoord = top.getCoord();
        let x = topCoord.getX();
        let y = topCoord.getY();

        // remove top position from open list
        openList.splice(0, 1);
        closedList[y][x] = true;

        // get, filter, and process neighbours
        neighbours = getNeighbours(topCoord)
            .filter(isValid)
            .filter(neighbour => {
                let x = neighbour.getX();
                let y = neighbour.getY();
                return !closedList[y][x] && state[y][x] !== REP_OBSTACLE;
            });

        for (let i = 0; i < neighbours.length; ++i) {
            let neighbour = neighbours[i];

            if (neighbour.equals(POS_END)) {
                detailsList[neighbour.getY()][neighbour.getX()].setParent(topCoord);
                let path = reconstruct(detailsList);

                path.forEach(coord => {
                    state[coord.getY()][coord.getX()] = REP_PATH;
                    updateCanvas();
                });

                return;
            }
            else {
                let neighbourDetails = detailsList[neighbour.getY()][neighbour.getX()];
                let g = detailsList[y][x].getG() + 1;
                let h = heuristic(neighbour)
                let score = g + h;

                if (neighbourDetails.getF() === -1 || neighbourDetails.getF() > score) {
                    // put successor into open list
                    openList.push(new Pair(score, neighbour));
                    sortOpenList(openList);

                    // update details of cell
                    neighbourDetails.setF(score);
                    neighbourDetails.setG(g);
                    neighbourDetails.setH(h);
                    neighbourDetails.setParent(topCoord);
                }
            }
        }
    }
}

// ===== ON LOAD =====
// window on load initialization
window.onload = () => {
    // get doc vars
    canvas = document.getElementById('main');
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', () => dragTrig = true);
    canvas.addEventListener('mouseup', () => dragTrig = false);
    canvas.addEventListener('mousemove', event => {
        if (dragTrig)
            canvasOnDrag(event.offsetX, event.offsetY);
    });

    // initalisation
    init();
}
