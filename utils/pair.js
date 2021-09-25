class Pair {

    x;
    y;

    Pair(x, y) {
        this.x = x;
        this.y = y;
    }

    getX = () => this.x;
    getY = () => this.y;

    setX = x => this.x = x;
    setY = y => this.y = y;

    toString = () => `(${x}, ${y})`;
}

module.exports = Pair;
