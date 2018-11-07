'use strict';

obtain(['./src/server/wsServer.js', './src/drawGrid.js', './src/demoPattern.js'], ({ wss }, { Grid }, { pattern })=> {
  exports.app = {};

  exports.app.start = ()=> {
    var mod = {
      valves: 24,
      PixelWidth: 1,
      PixelHeight: 50,
      number: 2,
      get cells() {
        return this.valves / this.PixelWidth;
      },

      set pixelWidth(val) {
        this.PixelWidth = val;
        for (var i = 0; i < this.number; i++) {
          if (wss.orderedClients[i]) {
            wss.send(i, { pixelWidth: this.PixelWidth });
          }
        }
      },

      get pixelWidth() {
        return this.PixelWidth;
      },

      set pixelHeight(val) {
        this.PixelHeight = val;
        for (var i = 0; i < this.number; i++) {
          if (wss.orderedClients[i]) {
            wss.send(i, { pixelHeight: this.PixelHeight });
          }
        }
      },

      get pixelHeight() {
        return this.PixelHeight;
      },
    };
    var grid = Grid(mod.valves * mod.number / mod.pixelWidth, 48);
    console.log('started');

    var modules = mod.number;

    µ('#send').addEventListener('click', ()=> {
      mod.pixelWidth = 1;
      mod.pixelHeight = 50;
      for (var i = 0; i < modules; i++) {
        if (wss.orderedClients[i]) {
          wss.send(i, { drawRaster: { data: grid.getSubGrid(i * mod.cells, mod.cells), stamp: Date.now() + 100 } });
        }
      }
    });

    var getDemoSubGrid = (start, num)=> pattern.map(row=>row.slice(start, start + num));

    µ('#demo').addEventListener('click', ()=> {
      mod.pixelWidth = 2;
      mod.pixelHeight = 60;
      for (var i = 0; i < modules; i++) {
        if (wss.orderedClients[i]) {
          wss.send(i, { drawRaster: { data: getDemoSubGrid(i * mod.cells, mod.cells), stamp: Date.now() + 100 } });
        }
      }
    });

    µ('#clear').addEventListener('click', grid.clearGrid);
    µ('#fill').addEventListener('click', grid.fillGrid);
    µ('#stripe').addEventListener('click', grid.stripeGrid);
    µ('#check').addEventListener('click', grid.checkGrid);

    var loopInt = null;

    wss.addListener('ip', (ip, data)=> {console.log(`IP address of ${data._id} is ${ip}`);});

    µ('#loop').addEventListener('click', ()=> {
      clearInterval(loopInt);
      loopInt = setInterval(()=> {
        /*if (wss.orderedClients[0]) {
          wss.send(0, { drawRaster: { data: grid.getData(), stamp: Date.now() + 100 } });
        }*/
        for (var i = 0; i < modules; i++) {
          if (wss.orderedClients[i]) {
            wss.send(i, { pixelHeight: 50 });
            wss.send(i, { drawRaster: { data: grid.getSubGrid(((modules - 1) - i) * 12, 12), stamp: Date.now() + 100 } });
          }
        }
      }, 12 * 50);
    });

    µ('#stop').addEventListener('click', ()=> {
      clearInterval(loopInt);
    });

    document.onkeyup = (e)=> {
      var electron = require('electron');
      if (e.which == 27) {
        electron.remote.process.exit();
      }
    };

    var count = pattern.length - 1;

    wss.onClientConnect = (ws)=> {
      ws.send(JSON.stringify({ pixelHeight: 50 }));
    };

  };

  provide(exports);
});
