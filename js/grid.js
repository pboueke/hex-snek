/*jslint sub:true*/
/*global oCanvas, SortedArray, PriorityQueue, console*/

/*
* Unidimensional Hexagonal Grid
* Author: Pedro H. Boueke <p h b o u e k e "at" p o l i . u f r j . b r>
* Last update: 27.10.15
*
* This is how the hexagonal grid is represented:
*
*            _d5 ________________ d0_
*           / \  \            /x/  / \            * It's formed by 6 regions
*          /   \  \   N(5)   /x/  /   \             and 6 diagonals which will
*         /     \  \        /x/  /     \            be constantly referred to
*        /       \  \      /x/  /       \           in the algorithms below.
*       /         \  \    /x/../         \
*      /   Nw(4)   \  \  /x/19/   Ne(0)   \       * Note the marked region
*     /             \  \/x/ 7/             \        between the N region and the
*    /_______________\/6  1\/_8_____________\       diagonal d0. It is
*  d4________________|5 0  2|_9_____________d1      characterized by an abrupt
*    \              / \4__3/\ 10           /        change in the indexes due to
*     \   Sw(3)    /   /..\11\    Se(1)   /         the counting system used.
*      \          /   /    \  \          /          Any element at d0 is the
*       \        /   /      \  \        /           first element of it's own
*        \      /   /        \  \      /            ring and also is a neighbor
*         \    /   /          \  \    /             of the last element of it's
*          \  /   /    S(2)    \  \  /              ring. This fact requires
*           \/   /______________\  \/               some extra attention.
*             d3                  d2
*/

function Hex(id) {
  //The base element of the grid
    "use strict";
    this.grid_index = id;
}

Hex.prototype.setIndex = function (id) {
    "use strict";
    this.grid_index = id;
};

Hex.prototype.getIndex = function () {
    "use strict";
    return this.grid_index;
};

Hex.prototype.getNumberOfRings = function (k) {
  /* Returns the number of rings required for k elements around the center one.
  *  This function resolves the equation 'n = (-3 + sqrt(9+12n))/6' */
    "use strict";
    var answer = 9 + 12 * k;
    answer = Math.sqrt(answer);
    answer = (answer - 3) / 6;
    return Math.ceil(answer);
};

Hex.prototype.getDiagonalElement = function (id, radius) {
  /* Returns the index from the element within the given diagonal and radius
  *  where id is the id of the diagonal (id = 0 -> NEd,..., i = 5 -> NWd) and
  *  radius is the radius of the wanted ring*/
    "use strict";
    //simplified sum expression + position in ring
    return (3 * Math.floor(Math.pow((radius - 1), 2) + (radius - 1)) + 1 + id * radius);
};

Hex.prototype.getNeighbors = function (id) {
    /* Returns an array with the indexes from the six neighbors around the hex
    *  with the specidfied id(n). */
    "use strict";
    var c1, c2, c3, c4,
        n = parseFloat(id),
        iterator = 0,
        position = -1,
        radius = this.getNumberOfRings(n),
        neighbors = [-1, -1, -1, -1, -1, -1],
        is_diagonal = false,
        aux_arr;
    if (n === 0) {
        neighbors = [1, 2, 3, 4, 5, 6];
        return neighbors;
    }
    if (n === 6) {
        neighbors = [0, 1, 5, 16, 17, 18];
        return neighbors;
    }
    aux_arr = this.getPositionAndDiagonal(n);
    is_diagonal = aux_arr[1];
    position = aux_arr[0];
    if (is_diagonal) {
        c1 = position;
        c2 = 7 - position; //(6 - position + 1)
        c3 = 6 - position;
        c4 = 5 - position; //(6 - position - 1)
        if (position === 0) { // Caused by NEd's abrupt change
            c2 -= 6 + 6 * (radius - 1);
            neighbors[1] = this.getDiagonalElement(5, radius) + (radius - 1);
            neighbors[3] = this.getDiagonalElement(5, radius + 1) + radius;
        } else {
            neighbors[1] = n - 1;
            neighbors[3] = n + 6 * (radius + 1) - c2;
        } // Caused by the first ring's abrupt change
        if (radius === 1) {
            neighbors[0] = 0;
        } else {
            neighbors[0] = n - 6 * (radius - 1) - c1;
        }
        neighbors[2] = n + 1;
        neighbors[4] = n + 6 * (radius + 1) - c3;
        neighbors[5] = n + 6 * (radius + 1) - c4;
        return neighbors;
        //neighbors[x], x={0:inf.neighbor; 1:ant.neighbor; 2:next.neighbor; 3,4,5:sup.n.}  (ordered with ascending index)
    }
    c1 = position + 1;
    c2 = position;
    c3 = 6 - position;
    c4 = 6 - position - 1;
    if ((position === 5) && (n === this.getDiagonalElement(5, radius) + (radius - 1))) {
        c2 += n + 6 * (radius - 1);
        neighbors[3] = this.getDiagonalElement(0, radius);
        neighbors[1] = this.getDiagonalElement(0, radius - 1);
    } else {
        neighbors[3] = n + 1;
        neighbors[1] = n - 6 * (radius - 1) - c2;
    }
    neighbors[2] = n - 1;
    neighbors[0] = n - 6 * (radius - 1) - c1;
    neighbors[4] = n + 6 * (radius + 1) - c3;
    neighbors[5] = n + 6 * (radius + 1) - c4;
    //neighbors[x], x={0,1:inf.neighbor; 2:ant.neighbor; 3:next.neighbor; 4,5:sup.n.}  (ordered with ascending index)
    return neighbors;
};

Hex.prototype.getOrderedNeighbors = function (id) {
  "use strict"
  /* Returns the neighbors list ordered by position*/
  var aux_arr,
      n, //neighbors
      position,
      diagonal;
  if (id === 0) { return [1,2,3,4,5,6]; }
  if (id === 6) { return [18,1,0,5,16,17]; }
  aux_arr = this.getPositionAndDiagonal(id);
  diagonal = aux_arr[1];
  position = aux_arr[0];
  n = this.getNeighbors(id);
  //(easier way: shifting, similar to the region distance - look at the diagonal)
  //* caution needed at the breaking diagonal *
  if (diagonal) {
    switch (position) {
      case 0:
        return [n[4],n[5],n[2],n[0],n[1],n[3]]
      case 1:
        return [n[3],n[4],n[5],n[2],n[0],n[1]]
      case 2:
        return [n[1],n[3],n[4],n[5],n[2],n[0]]
      case 3:
        return [n[0],n[1],n[3],n[4],n[5],n[2]]
      case 4:
        return [n[2],n[0],n[1],n[3],n[4],n[5]]
      case 5:
        return [n[5],n[2],n[0],n[1],n[3],n[4]]
    }
  } else {
      switch (position) {
        case 0:
          return [n[4],n[5],n[3],n[1],n[0],n[2]]
        case 1:
          return [n[2],n[4],n[5],n[3],n[1],n[0]]
        case 2:
          return [n[0],n[2],n[4],n[5],n[3],n[1]]
        case 3:
          return [n[1],n[0],n[2],n[4],n[5],n[3]]
        case 4:
          return [n[3],n[1],n[0],n[2],n[4],n[5]]
        case 5:
          return [n[5],n[3],n[1],n[0],n[2],n[4]]
      }
  }
}

Hex.prototype.getPositionAndDiagonal = function (id) {
  "use strict";
  var radius = this.getNumberOfRings(id),
      iterator = 0,
      position= -1,
      diagonal = false;

  for (iterator = 0; iterator < 6; iterator += 1) {
      if (this.getDiagonalElement(iterator, radius) === id) {
          diagonal = true;
          position = iterator;
          break;
      }
  }
  if (!diagonal) {
      for (iterator = 0; iterator < 6; iterator += 1) {
          if (iterator === 5) {
              if (this.getDiagonalElement(iterator, radius) < id) {
                  position = iterator;
                  break;
              }
          }
          // Will look for n in each region. The iterator corresponds
          // to the id of the region (i = 0 -> NEr ..., i = 5 -> Nr).
          if ((this.getDiagonalElement(iterator, radius) < id) && (id < this.getDiagonalElement(iterator + 1, radius))) {
              position = iterator;
              break;
          }
      }
  }
  return [position, diagonal];
}

/* The following code is used for the creation of the grid, with its visual representation.
*  The function MasterHex is used as the one that will create it's graphic representation.
*  In this version we are using oCanvas (not ideal).
*/

function SimpleGrid() {
    "use strict";
    this.grid = [];
    this.selected_hex = 0;
}

function MasterHex(sg, id, x_pos, y_pos, radius, type) {
    /* This is the function that gives each hexagon it's physical form.
    *  'sd' is a reference for the SimpleGrid
    *  'id' is it's grid index.
    *  'x_pos' and 'y_pos' are it`s coordinates on the canvas.
    *  'radius' it's size
    *  'type' it's an identificator for it's type, wich may mean color,
    *   traversability and so on.
    */
    "use strict";
    var kterator,
        current_selection = [],
        index = id;
    this.tp = type;
    this.grid_index = new Hex(id);
    if (config.show_numbers) {
      this.txt = canvas.display.text({
          x: x_pos,
          y: y_pos,
          origin: { x: "center", y: "center" },
          font: "bold" + (0.75 * radius).toString() + "px sans-serif",
          text: index,
          fill: "rgb(87, 85, 85)"
      });
    }
    this.hexagon = canvas.display.polygon({
        x: x_pos,
        y: y_pos,
        sides: 6,
        radius: radius,
        fill: global.hex_types[type]["main_color"], //standard_color
        rotation: 90
    })/*.bind("mouseenter touchenter", function () {
        var txt = "Entered: "+index
        var aux_arr = sg.grid[index].grid_index.getPositionAndDiagonal(index);
        txt += " | P: " + aux_arr[0];
        if (aux_arr[1]) { txt += "*";}
        txt += " | neighbor of  " + sg.grid[index].grid_index.getOrderedNeighbors(index)
        console.log(txt);
    });*/
    canvas.addChild(this.hexagon);
    if (config.show_numbers) {
      canvas.addChild(this.txt);
    }
}

SimpleGrid.prototype.changeType = function (arr, type) {
    "use strict";
    var iterator;
    for (iterator = 0; iterator < arr.length; iterator += 1) {
        this.grid[arr[iterator]].tp = type;
        this.grid[arr[iterator]].hexagon.fill = this.hex_type[type]["stdr.color"];
    }
    canvas.redraw();
};

SimpleGrid.prototype.createGrid = function (number_elements, spacing, element_size) {
    "use strict";
    var iterator,
        jterator,
        radius,
        position = -1,
        size = number_elements,
        x_dist = 1.75 * element_size + spacing * 0.5,
        y_dist = 2 * element_size * 0.75 + spacing * 0.5,
        is_diagonal = false,
        current_position = [canvas.width / 2, canvas.height / 2];
    //Each hex (MasterHex) position is the result of incrementing the previous position
    //based on the region of the current hex.
    this.grid[0] = new MasterHex(this, 0, current_position[0], current_position[1], element_size, "empty");
    current_position[0] += x_dist * 0.5;
    current_position[1] -= y_dist;
    this.grid[1] = new MasterHex(this, 1, current_position[0], current_position[1], element_size, "empty");
    current_position[0] += x_dist * 0.5;
    current_position[1] += y_dist;
    this.grid[2] = new MasterHex(this, 2, current_position[0], current_position[1], element_size, "empty");
    current_position[0] -= x_dist * 0.5;
    current_position[1] += y_dist;
    this.grid[3] = new MasterHex(this, 3, current_position[0], current_position[1], element_size, "empty");
    current_position[0] -= x_dist;
    this.grid[4] = new MasterHex(this, 4, current_position[0], current_position[1], element_size, "empty");
    current_position[0] -= x_dist * 0.5;
    current_position[1] -= y_dist;
    this.grid[5] = new MasterHex(this, 5, current_position[0], current_position[1], element_size, "empty");
    current_position[0] += x_dist * 0.5;
    current_position[1] -= y_dist;
    this.grid[6] = new MasterHex(this, 6, current_position[0], current_position[1], element_size, "empty");
    //First ring must be initialized
    for (iterator = 7; iterator < size; iterator += 1) {
        is_diagonal = false;
        position = -1;
        radius = this.grid[0].grid_index.getNumberOfRings(iterator);
        for (jterator = 0; jterator < 6; jterator += 1) {
            if (this.grid[0].grid_index.getDiagonalElement(jterator, radius) === iterator) {
                is_diagonal = true;
                position = jterator;
                break;
            }
        }
        if (!is_diagonal) {
            for (jterator = 0; jterator < 6; jterator += 1) {
                if (iterator === 5) {
                    if (this.grid[0].grid_index.getDiagonalElement(jterator, radius) < iterator) {
                        position = jterator;
                        break;
                    }
                } else {
                    if ((this.grid[0].grid_index.getDiagonalElement(jterator, radius) < iterator)
                            && (iterator < this.grid[0].grid_index.getDiagonalElement(jterator + 1, radius))) {
                        position = jterator;
                        break;
                    }
                }
            }
        }
        if (position === -1) {
            console.log("ERROR: position not found");
        }
        if (is_diagonal && position === 0) {
            current_position[0] += x_dist * 1.5;
            current_position[1] -= y_dist;
        } else if (!is_diagonal && position === 5) {
            current_position[0] += x_dist;
        } else if ((!is_diagonal && position === 0) || (is_diagonal && position === 1)) {
            current_position[0] += x_dist * 0.5;
            current_position[1] += y_dist;
        } else if ((!is_diagonal && position === 1) || (is_diagonal && position === 2)) {
            current_position[0] -= x_dist * 0.5;
            current_position[1] += y_dist;
        } else if ((!is_diagonal && position === 2) || (is_diagonal && position === 3)) {
            current_position[0] -= x_dist;
        } else if ((!is_diagonal && position === 3) || (is_diagonal && position === 4)) {
            current_position[0] -= x_dist * 0.5;
            current_position[1] -= y_dist;
        } else if ((!is_diagonal && position === 4) || (is_diagonal && position === 5)) {
            current_position[0] += x_dist * 0.5;
            current_position[1] -= y_dist;
        }
        this.grid[iterator] = new MasterHex(this, iterator, current_position[0], current_position[1], element_size, "empty");
    }
    canvas.redraw();
};

SimpleGrid.prototype.element = function () {
    //Store values from a given index
    "use strict";
    this.hex_op = new Hex(1);  //hex operator
    var is_diagonal = false,
        position = -1,
        radius = -1,
        angle = -1;
    this.getDiagonal = function () {
        return is_diagonal;
    };
    this.getRadius = function () {
        return radius;
    };
    this.getPosition = function () {
        return position;
    };
    this.getAngle = function () {
        return angle;
    };
    this.update = function (id) {
        var iterator;
        this.hex_op.grid_index = id;
        radius = this.hex_op.getNumberOfRings(id);
        //converts id to angle, where d0 = 0, d4 = 240, and so on.
        angle = id - this.hex_op.getDiagonalElement(0, this.hex_op.getNumberOfRings(id));
        angle = angle * (60.0 / this.hex_op.getNumberOfRings(id));
        for (iterator = 0; iterator < 6; iterator += 1) {
            if (this.hex_op.getDiagonalElement(iterator, radius) === id) {
                is_diagonal = true;
                position = iterator;
                break;
            }
        }
        if (!is_diagonal) {
            for (iterator = 0; iterator < 6; iterator += 1) {
                if (iterator === 5) {
                    if (this.hex_op.getDiagonalElement(iterator, radius) < id) {
                        position = iterator;
                        break;
                    }
                }
                if ((this.hex_op.getDiagonalElement(iterator, radius) < id) && (id < this.hex_op.getDiagonalElement(iterator + 1, radius))) {
                    position = iterator;
                    break;
                }
            }
        }
    };
};

SimpleGrid.prototype.ringDistance = function (a, b) {
  /* Returns the in ring distance between the two elements.
  *  Parameters a and b must be on the same ring.
  */
    "use strict";
    var hex_op = new Hex(1),
        radius = hex_op.getNumberOfRings(a);
    return Math.min(Math.abs(a - b),  Math.abs((6 * radius - Math.abs(a - b))));
};

SimpleGrid.prototype.angleDelta = function (a, b) {
  /* Rturns angular difference with a and b between 0 and 360 degrees.
  */
    "use strict";
    var r1 = a - b,
        r2 = b - a;
    if (r1 < 0) {
        r1 += 360;
    }
    if (r2 < 0) {
        r2 += 360;
    }
    return Math.min(r1, r2);
};

SimpleGrid.prototype.regionDistance = function (a, b, a_d, b_d) {
  /* Returns the region distance between the two elements.
  *  Parameters a_d and b_d are booleans that indicates whether or not a and b are diagonals.
  */
    "use strict";
    var d_vector,    //distances between regions  (see: http://imgur.com/05bwTRL)
        iterator;
    if (a_d && b_d) {  //a and b are diagonals
        d_vector = [0, 0, 1, 3, 1, 0];  //diagonal vs diagonal distance vector
    } else if (a_d && !b_d) { //a is diagonal
        d_vector = [0, 1, 2, 2, 1, 0];  //diagonal vs region distance vector
    } else if (!a_d && b_d) { //b is diagonal
        d_vector = [0, 0, 1, 2, 2, 1];  //region vs diagonal distance vector
    } else {  //none of them is a diagonal
        d_vector = [0, 1, 2, 3, 2, 1];  //region vs region distance vector
    }
    for (iterator = 0; iterator < a % 6; iterator += 1) { //parsing matrix
        d_vector.unshift(d_vector[5]);
        d_vector.pop();
    }
    return d_vector[b];
};

SimpleGrid.prototype.distanceEstimation = function (a, b) {
 /* The heuristic used in A* for estimating the distance between two elements of the grid.
  * It uses a complete and unblocked hexagonal grid as reference. Parameters 'a' and 'b'
  * are indexes from Hex elements in  a SimpleGrid.
  *
  * The algorithm consists of decreasing both elements radius until the region distance between
  * them is lesser or equal to 1 and then returning the vertical distance obtained from the radius
  * reduction added with in-ring distance between the reduced elements. This implementation differs
  * due to untested optimizations.
  */
    "use strict";
    var he = new this.element(),  //higher element
        le = new this.element(),  //lower element
        d = 0,                    //vertical distance between a and b
        rd,                       //distance between regions
        aux_he_neighbors = [-1, -1, -1, -1, -1, -1],
        aux_le_neighbors = [-1, -1, -1, -1, -1, -1],
        aux_he_angle,
        aux_le_angle,
        aux_he,
        aux_le,
        aux_angle,
        aux_counter,
        iterator;
    //exceptions
    if (a === b) {
        return 0;
    }
    if (a === 0) {
        return he.hex_op.getNumberOfRings(b);
    }
    if (b === 0) {
        return he.hex_op.getNumberOfRings(a);
    }
    //ordering
    if (he.hex_op.getNumberOfRings(a) < he.hex_op.getNumberOfRings(b)) {
        he.update(b);
        le.update(a);
    } else {
        he.update(a);
        le.update(b);
    }
    //in case a and b are in 'opposite' regions, returns returns the sum of their radius.
    rd = this.regionDistance(he.getPosition(), le.getPosition(), he.getDiagonal(), le.getDiagonal());
    if (rd === 3) {
        return he.getRadius() + le.getRadius();
    }
    //equalizes radius
    aux_he_angle = he.getAngle();
    while (he.getRadius() !== le.getRadius()) {
        aux_counter = 0;
        aux_he_neighbors = he.hex_op.getNeighbors(he.hex_op.grid_index);
        for (iterator = 0; iterator < 6; iterator += 1) {
            if (he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]) < he.getRadius()) {
                //converting index to degree
                aux_angle = aux_he_neighbors[iterator] - he.hex_op.getDiagonalElement(0, he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]));
                aux_angle = aux_angle * (60.0 / he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]));
                if (this.angleDelta(le.getAngle(), aux_angle) <= this.angleDelta(le.getAngle(), aux_he_angle) || (aux_counter === 1)) {
                    aux_he_angle = aux_angle;
                    aux_he = aux_he_neighbors[iterator];
                } else {
                    aux_counter += 1;
                }
            }
        }
        he.update(aux_he);
        d += 1;
    }
    //new found indexes are the same
    if (he.hex_op.grid_index ===  le.hex_op.grid_index) {
        return d;
    }
    rd = this.regionDistance(he.getPosition(), le.getPosition(), he.getDiagonal(), le.getDiagonal());
    //same as before where rd equals 3
    if (rd === 3) {
        return d + le.getRadius() + he.getRadius();
    }
    //in case a quadrilateral figure can be formed between them (rd<=1) the distance equals the
    //in-ring distance between he and le plus the vertical distance (d)
    if (rd <= 1) {
        return d + this.ringDistance(he.hex_op.grid_index, le.hex_op.grid_index);
    }
    //in this case we need to reduce the radius of both he and le untill rd <= 1
    //so that we can use the previous method
    if (rd === 2) {
        aux_he_angle = he.getAngle();
        aux_le_angle = le.getAngle();
        while (rd > 1) {
            //radius reduction, as seen before
            aux_he_neighbors = he.hex_op.getNeighbors(he.hex_op.grid_index);
            for (iterator = 0; iterator < 6; iterator += 1) {
                if (he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]) < he.getRadius()) {
                    aux_angle = aux_he_neighbors[iterator] - he.hex_op.getDiagonalElement(0, he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]));
                    aux_angle = aux_angle * (60.0 / he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]));
                    if (this.angleDelta(le.getAngle(), aux_angle) <= this.angleDelta(le.getAngle(), aux_he_angle)) {
                        aux_he_angle = aux_angle;
                        aux_he = aux_he_neighbors[iterator];
                    }
                }
            }
            he.update(aux_he);
            aux_le_neighbors = le.hex_op.getNeighbors(le.hex_op.grid_index);
            for (iterator = 0; iterator < 6; iterator += 1) {
                if (le.hex_op.getNumberOfRings(aux_le_neighbors[iterator]) < le.getRadius()) {
                    aux_angle = aux_le_neighbors[iterator] - le.hex_op.getDiagonalElement(0, le.hex_op.getNumberOfRings(aux_le_neighbors[iterator]));
                    aux_angle = aux_angle * (60.0 / le.hex_op.getNumberOfRings(aux_le_neighbors[iterator]));
                    if (this.angleDelta(he.getAngle(), aux_angle) <= this.angleDelta(he.getAngle(), aux_le_angle)) {
                        aux_le_angle = aux_angle;
                        aux_le = aux_le_neighbors[iterator];
                    }
                }
            }
            le.update(aux_le);
            //both he and le changed to their neighbors closest to each other in the inferior ring
            d += 2;
            rd = this.regionDistance(he.getPosition(), le.getPosition(), he.getDiagonal(), le.getDiagonal());
        }
        return d + this.ringDistance(he.hex_op.grid_index, le.hex_op.grid_index);
    }
};

SimpleGrid.prototype.compareArrays = function (arr, sarr) {
    /* returns true if both arrays are equal.
    *  (using external sorted-arrays.js)
    *  arr is a SortedArray objects and sarr is an array
    */
    "use strict";
    var iterator;
    if (arr.array.length !== sarr.length) {
        return false;
    }
    for (iterator = 0; iterator < arr.array.length; iterator += 1) {
        if (arr.array[iterator] !== sarr[iterator]) {
            return false;
        }
    }
    return true;

};

SimpleGrid.prototype.subtractArrays = function (ans, arr1, arr2) {
    /* sets ans with arr1 - arr2
    *  (using external sorted-arrays.js)
    *  ans and arr1 are SortedArray objects, arr2 is an array
    */
    "use strict";
    var iterator;
    ans.array = arr1.array;
    for (iterator = 0; iterator < arr2.length; iterator += 1) {
        ans.remove(arr2[iterator]);
    }
    return ans;

};

SimpleGrid.prototype.aStar = function (start, goal) {
    /*Returns the path between a and b using A*
    * Requires external sorted-arrays.js
    * a and b are indexes
    * As seen in http://www.redblobgames.com/pathfinding/a-star/introduction.html
    */
    "use strict";
    var hex_op = new Hex(1),
        frontier = new PriorityQueue(function (el1, el2) {
            return el2.priority - el1.priority;
        }),
        came_from = {},
        cost_so_far = {},
        ans = [],
        current,
        neighbors,
        new_cost,
        next,
        priority,
        aux_keys = [],
        iterator,
        debug = 0;
    frontier.enq({priority : 0, index : start});
    came_from[start] = 0;
    cost_so_far[start] = 0;
    while (!frontier.isEmpty()) {
        if (debug === 100) {
            break;
        }
        debug += 1;
        //console.log(frontier);
        current = frontier.deq().index;
        if (current === goal) {
            break;
        }
        neighbors = hex_op.getNeighbors(current);
        aux_keys = Object.keys(cost_so_far);
        //console.log("KEYS>", aux_keys);
        for (iterator = 0; iterator < 6; iterator += 1) {
            try {
                next = neighbors[iterator];
                new_cost = cost_so_far[current] + (this.hex_type[this.grid[next].tp]["weight"]);
                if ((!(aux_keys.indexOf(next.toString()) !== -1) || (new_cost < cost_so_far[next])) && (this.hex_type[this.grid[next].tp]["traversability"])) {
                    cost_so_far[next] = new_cost;
                    priority = new_cost + this.distanceEstimation(goal, next);
                    frontier.enq({priority : priority, index : next});
                    came_from[next] = current;

                }
            } catch (ignore) {
            }
        }
    }
    next = goal;
    iterator = 0;
    while (next !== start) {
        ans[iterator] = next;
        next = came_from[next];
        iterator += 1;
    }
    return ans;
};

function changeHexType(g, id, new_type, color) {
  "use strict";
  g.grid[id].tp = new_type;
  if (color) {
    g.grid[id].hexagon.fill =  "#"+color;
  }
  else if (global.hex_types[new_type]["main_color"]) {
    g.grid[id].hexagon.fill = global.hex_types[new_type]["main_color"];
  }
}
