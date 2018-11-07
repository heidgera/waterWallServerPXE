obtain([], ()=> {
  exports.Grid = (wid = 24, hgt = 12)=> {
    var grid = µ('#gridHolder', document);

    var mouseState = false;
    var toggleState = false;

    grid.wid = wid;
    grid.hgt = hgt;

    grid.cells = [];
    for (var i = 0; i < hgt; i++) {
      grid.cells[i] = [];
      let row = µ('+div', grid);
      row.className = 'row';
      for (var j = 0; j < wid; j++) {
        grid.cells[i][j] = µ('+div', row);
        let cell = grid.cells[i][j];
        cell.className = 'cell';
        cell.addEventListener('mousedown', (e)=> {
          mouseState = true;
          if (!cell.hasAttribute('light')) {
            cell.setAttribute('light', '');
            toggleState = true;
          } else {
            cell.removeAttribute('light');
            toggleState = false;
          }
        });

        cell.addEventListener('mouseover', ()=> {
          if (mouseState) {
            if (!toggleState) cell.removeAttribute('light');
            else cell.setAttribute('light', '');
          }

        });

      }
    }

    window.addEventListener('mouseup', ()=> {
      mouseState = false;
    });

    grid.getData = ()=> grid.cells.map(row=>row.map(cell=>(cell.hasAttribute('light') ? 1 : 0)));

    grid.getSubGrid = (start, num)=> grid.getData().map(row=>row.slice(start, start + num));

    grid.clearGrid = ()=> {
      grid.cells.forEach(function (row, ind, arr) {
        row.forEach(function (cell, ind, arr) {
          cell.removeAttribute('light');
        });
      });
    };

    grid.fillGrid = ()=> {
      grid.cells.forEach(function (row, ind, arr) {
        row.forEach(function (cell, ind, arr) {
          cell.setAttribute('light', '');
        });
      });
    };

    grid.stripeGrid = ()=> {
      grid.cells.forEach(function (row, rind, rarr) {
        row.forEach(function (cell, cind, carr) {
          if (Math.floor(((cind + rind) % 6) / 4)) cell.setAttribute('light', '');
          else cell.removeAttribute('light');
        });
      });
    };

    var XOR = (X, Y)=>(X ? !Y : Y);

    grid.checkGrid = ()=> {
      grid.cells.forEach(function (row, rind, rarr) {
        row.forEach(function (cell, cind, carr) {
          if (XOR(Math.floor(((cind) % 16) / 8), Math.floor(((rind) % 16) / 8)))
            cell.setAttribute('light', '');
          else cell.removeAttribute('light');
        });
      });
    };

    return grid;
  };

});
