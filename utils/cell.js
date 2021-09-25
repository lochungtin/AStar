const Pair = require("./pair");

class Cell {
    f = -1;
    g = -1;
    h = -1;
    parent = Pair(-1, -1);

    Cell() { }

    getF = () => this.f;
    getG = () => this.g;
    getH = () => this.h;
    getParent = () => this.parent;

    setF = f => this.f = f;
    setG = g => this.g = g;
    setH = h => this.h = h;
    setParent = pair => this.parent = pair;
}

module.exports = Cell;
