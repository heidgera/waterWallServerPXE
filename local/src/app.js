'use strict';

obtain(['µ/server/socket.js', './src/drawGrid.js', './src/demoPattern.js'], ({ wss }, { Grid }, { pattern })=> {
  exports.app = {};

  var order = [];

  exports.app.start = ()=> {

    // object to hold shared data about each of the modules
    var mod = {
      valves: 24,             // each module has 24 valves
      PixelWidth: 1,          // variable to store the current pixel width
      PixelHeight: 50,        // variable to store the current pixel height
      number: 2,              // number of modules in total
      get cells() {
        // get the number of pixels on each module
        return this.valves / this.PixelWidth;
      },

      set pixelWidth(val) {
        // set the current pixel width on each module, and store locally.
        this.PixelWidth = val;
        wss.broadcast('pixelWidth', this.PixelWidth);
      },

      get pixelWidth() {
        // get the current pixel width.
        return this.PixelWidth;
      },

      set pixelHeight(val) {
        // set the current pixel height on each module, and store locally.
        this.PixelHeight = val;
        wss.broadcast('pixelHeight', this.PixelHeight);
      },

      get pixelHeight() {
        // return the current pixel height
        return this.PixelHeight;
      },
    };

    // create a grid with the as many cells across as the current module config
    var grid = Grid(mod.valves * mod.number / mod.pixelWidth, 48);

    // store the current number of modules
    var modules = mod.number;

    // when the 'send' button is clicked...
    µ('#send').addEventListener('click', ()=> {
      // set the pixelWidth to a single valve
      mod.pixelWidth = 1;

      // set the pixel height to 50 milliseconds
      mod.pixelHeight = 50;

      // send the drawn image to the clients
      for (let i = 0; i < order.length; i++) {
        wss.send(order[i].id, { drawRaster: { data: grid.getSubGrid(i * mod.cells, mod.cells), stamp: Date.now() + 100 } });
      }
    });

    // get a chunk of the demo grid
    var getDemoSubGrid = (start, num)=> pattern.map(row=>row.slice(start, start + num));

    // when the 'demo' button is clicked...
    µ('#demo').addEventListener('click', ()=> {
      // set the width of the pixels to 2 valves
      mod.pixelWidth = 2;

      // set the height of the pixels to 60 milliseconds
      mod.pixelHeight = 60;

      // send the demo image to the clients
      for (let i = 0; i < order.length; i++) {
        if (wss.orderedClients[i]) {
          wss.send(order[i].id, { drawRaster: { data: getDemoSubGrid(i * mod.cells, mod.cells), stamp: Date.now() + 100 } });
        }
      }
    });

    // handle the buttons to make things happen to the grid
    µ('#clear').addEventListener('click', grid.clearGrid);
    µ('#fill').addEventListener('click', grid.fillGrid);
    µ('#stripe').addEventListener('click', grid.stripeGrid);
    µ('#check').addEventListener('click', grid.checkGrid);

    var loopInt = null;

    // log the ip addresses of each of the client computers.
    wss.addListener('ip', ({ data, details })=> {console.log(`IP address of ${details.from.id} is ${ip}`);});

    // when a client sends it's serial number to the server...
    wss.addListener('uuid', ({ data, details })=> {
      // check to see if the serial number is already in 'order' array.
      var orderInd = order.findIndex(mod=>mod.uuid == data);

      // if it is not in the array
      if (!orderInd >= 0) {
        // save the current length of the array, and then push the serial num into array
        orderInd = order.length;
        order.push({ uuid: data, id: details.from.id });
      } else order[orderInd].id = details.from.id;

      console.log(`${data} is ${orderInd}`);
    });

    // if the 'loop to wall' button is pressed, set an interval to send the data to the valves
    µ('#loop').addEventListener('click', ()=> {
      clearInterval(loopInt);
      loopInt = setInterval(()=> {
        /*if (wss.orderedClients[0]) {
          wss.send(0, { drawRaster: { data: grid.getData(), stamp: Date.now() + 100 } });
        }*/
        for (var i = 0; i < order.length; i++) {
          wss.send(order[i].id, { pixelHeight: 50 });
          wss.send(order[i].id, { drawRaster: { data: grid.getSubGrid(((modules - 1) - i) * 12, 12), stamp: Date.now() + 100 } });
        }
      }, 12 * 50);
    });

    // if the stop button is clicked, clear the loop interval
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

    // when a client connnects, send it a default pixel height
    wss.onClientConnect = (ws)=> {

      ws.sendObject({ pixelHeight: mod.pixelHeight });
    };

  };

  provide(exports);
});
