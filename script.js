// ===== consts =====
// colors
const COLOR_TILE_EMPTY = '#252525';
const COLOR_TILE_START = '#4B79D1';
const COLOR_TILE_GOAL = '#D63877';
const COLOR_TILE_OBSTACLE = '#545454';

// representation
const REP_EMPTY = 0;
const REP_START = 1;
const REP_GOAL = 2;
const REP_OBSTACLE = 3;

// display color map
const DISPLAY_MAP = {
    0: COLOR_TILE_EMPTY,
    1: COLOR_TILE_START,
    2: COLOR_TILE_GOAL,
    3: COLOR_TILE_OBSTACLE,
};

// dims
const GRID_DIM_HEIGHT = 25;
const GRID_DIM_WIDTH = 40;
const GRID_SQR_DIM = 23;
const GRID_SQR_GAP = 2;
const GRID_SQR_PADDING = 2;


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
    state[0][0] = REP_START;
    state[GRID_DIM_HEIGHT - 1][GRID_DIM_WIDTH - 1] = REP_GOAL;

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

// start path find algorithm
const start = () => {

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
    })

    // initalisation
    init();
}
