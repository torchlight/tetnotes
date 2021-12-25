/*
Copyright 2021, 'wirelyre'


This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

class MinoBoard extends HTMLElement {

    static colors = {
        'background': '#F3F3ED',
        'shadow': '#E7E7E2',
        'regular': {
            'G': '#686868',
            'X': '#686868',
            'I': '#41AFDE',
            'J': '#1883BF',
            'L': '#EF9536',
            'O': '#F7D33E',
            'S': '#66C65C',
            'T': '#B451AC',
            'Z': '#EF624D',
        },
        'top': {
            'G': '#949494',
            'X': '#949494',
            'I': '#43D3FF',
            'J': '#1BA6F9',
            'L': '#FFBF60',
            'O': '#FFF952',
            'S': '#88EE86',
            'T': '#E56ADD',
            'Z': '#FF9484',
        },
    };

    static boardRegex = /^[\sGXIJLOSTZ_]*$/;
    static minoRegex = /[GXIJLOSTZ_]/g;
    static whitespace = /^\s*$/;

    constructor(field) {
        super();

        if (field) {
            this.setup(field);
        } else {
            document.addEventListener('DOMContentLoaded',
                (_event) => this.setup(this.textContent));
        }
    }

    setup(field) {
        this.innerHTML = '';

        if (!MinoBoard.boardRegex.test(field)) {
            const unknown = field.match(/[^\sGXIJLOSTZ_]/)[0];
            this.innerText = 'Cannot draw field. Unknown character: ' + unknown;
            return;
        }

        this.field = [];

        for (const line of field.split('\n')) {
            if (MinoBoard.whitespace.test(line)) {
                continue;
            }

            let row = '';

            for (const mino of line.matchAll(MinoBoard.minoRegex)) {
                row += mino[0];

                if (row.length == 10) {
                    this.field.push(row);
                    row = '';
                }
            }

            if (row.length % 10 != 0) {
                row = row.padEnd(10, '_');
                this.field.push(row);
            }
        }

        this.setAttribute('data-field', this.field.join('|'));

        const verticalPadding = 1;
        const width = 200;
        const height = 20 * (this.field.length + verticalPadding);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        this.appendChild(svg);

        const getMino = (field, row, col) => field[row]?.charAt(col);

        function* minos(field) {
            for (let row = 0; row < field.length; row++) {
                for (let col = 0; col < 10; col++) {
                    const mino = getMino(field, row, col);

                    if (mino != '_') {
                        yield [row, col, mino];
                    }
                }
            }
        }

        function rect(x, y, width, height, fill) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', width);
            rect.setAttribute('height', height);
            rect.setAttribute('fill', fill);
            return rect;
        }

        function minoPoly(x, y, width, height, fill, extendRight, extendDown) {
            const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            poly.setAttribute('fill', fill);
            const coordinates = [
                `${x},${y + height}`,
                `${x},${y}`,
                `${x + width},${y}`,
            ];
            if (extendRight) {coordinates.push(`${x + width * 1.5},${y + height * 0.5}`);}
            coordinates.push(`${x+width},${y+height}`);
            if (extendDown) {coordinates.push(`${x + width * 0.5},${y + height * 1.5}`);}
            poly.setAttribute('points', coordinates.join(' '));
            return poly;
        }

        svg.appendChild(rect(0, 0, '100%', '100%', MinoBoard.colors['background']));

        for (const [row, col, mino] of minos(this.field)) {
            const color = MinoBoard.colors['top'][mino];
            const extendRight = col === 9 || this.field[row][col+1] !== '_';
            const extendDown = row === this.field.length - 1 || this.field[row+1][col] !== '_';

            svg.appendChild(minoPoly(20 * col + 5, 20 * (row + verticalPadding) + 7, 20, 20,
                MinoBoard.colors['shadow'], extendRight, extendDown));

            svg.appendChild(minoPoly(20 * col, 20 * (row + verticalPadding) - 4, 20, 4,
                color, extendRight, extendDown));
        }

        for (const [row, col, mino] of minos(this.field)) {
            const color = MinoBoard.colors['regular'][mino];
            const extendRight = col === 9 || this.field[row][col+1] !== '_';
            const extendDown = row === this.field.length - 1 || this.field[row+1][col] !== '_';
            svg.appendChild(minoPoly(20 * col, 20 * (row + verticalPadding), 20, 20,
                color, extendRight, extendDown));
        }
    }

}

customElements.define('mino-board', MinoBoard);
