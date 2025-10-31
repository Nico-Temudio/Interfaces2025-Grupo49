class Tablero {
  constructor(ctx, width, height,theme) {
    this.ctx = ctx; this.width = width; this.height = height;
    this.celdas = []; 
    this.fichas = []; 
    this.cellSize = 0; // se calculará
    this.theme = theme;
    this.images = {};
    this.moves = 0;

    this.ROWS = 7; 
    this.COLS = 7;
    this.CELL_GAP = 0; // espacio entre casillas

    

    const IMAGES = {
      //fichas
      ficha1: "img/solitario/ficha.png",
      ficha2: "img/solitario/ficha2.jpg",
      ficha3: "img/solitario/ficha3.png",
      ficha4: "img/solitario/ficha4.png",

      // fondos
      fondo1: "img/solitario/fondo1.png",
      fondo2: "img/solitario/fondo2.png",
      fondo3: "img/solitario/fondo3.png",
      fondo4: "img/solitario/fondo4.png",
      fondo5: "img/solitario/fondo5.png",
      fondo6: "img/solitario/fondo6.png",
      fondo7: "img/solitario/fondo7.png",
      fondo8: "img/solitario/fondo8.png",

    };

    // Posiciones inválidas en esquinas (1 = no utilizable)
    this.boardType = 'classic';
    this.LAYOUTS = {
        'classic': [ // Tablero Inglés (33 fichas)
            [1,1,0,0,0,1,1],
            [1,1,0,0,0,1,1],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [1,1,0,0,0,1,1],
            [1,1,0,0,0,1,1]
        ],
        'europe': [ // Tablero Europeo (37 fichas)
            [1,1,0,0,0,1,1],
            [1,0,0,0,0,0,1],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [1,0,0,0,0,0,1],
            [1,1,0,0,0,1,1]
        ]
    };
    this._IMAGES = IMAGES;
    this.preloadImages();
    this._buildGrid();
  
  }

  /** Carga las imágenes (data URLs / rutas) en objetos Image. */
  preloadImages() {
    // ficha
    this.images.ficha1 = new Image();
    this.images.ficha1.src = this._IMAGES.ficha1;

    this.images.ficha2 = new Image();
    this.images.ficha2.src = this._IMAGES.ficha2;

    this.images.ficha3 = new Image();
    this.images.ficha3.src = this._IMAGES.ficha3;

    this.images.ficha4 = new Image();
    this.images.ficha4.src = this._IMAGES.ficha4;

    //fondos

    this.images.fondo1 = new Image();
    this.images.fondo1.src = this._IMAGES.fondo1;
    
    this.images.fondo2 = new Image(); 
    this.images.fondo2.src = this._IMAGES.fondo2;

    this.images.fondo3 = new Image();
    this.images.fondo3.src = this._IMAGES.fondo3;

    this.images.fondo4 = new Image();
    this.images.fondo4.src = this._IMAGES.fondo4;

    this.images.fondo5 = new Image();
    this.images.fondo5.src = this._IMAGES.fondo5;

    this.images.fondo6 = new Image();
    this.images.fondo6.src = this._IMAGES.fondo6;

    this.images.fondo7 = new Image();
    this.images.fondo7.src = this._IMAGES.fondo7;

    this.images.fondo8 = new Image();
    this.images.fondo8.src = this._IMAGES.fondo8;

  }

  /** Construye la disposición de celdas en el canvas y calcula tamaños. */
  _buildGrid() {
    const padX = 400; const padY = 115;
    const availableW = this.width - padX * 2;
    const availableH = this.height - padY * 2;

    const size = Math.min(
      (availableW - (this.COLS - 1) * this.CELL_GAP) / this.COLS,
      (availableH - (this.ROWS - 1) * this.CELL_GAP) / this.ROWS
    );
    this.cellSize = Math.floor(size);

    const boardW = this.COLS * this.cellSize + (this.COLS - 1) * this.CELL_GAP;
    const boardH = this.ROWS * this.cellSize + (this.ROWS - 1) * this.CELL_GAP;
    const startX = (this.width - boardW) / 2 + this.cellSize / 2;
    const startY = (this.height - boardH) / 2 + this.cellSize / 2;

    const layout = this.LAYOUTS[this.boardType] || this.LAYOUTS['classic']; // Usamos el layout seleccionado


    this.celdas = [];
    for (let r = 0; r < this.ROWS; r++) {
      const row = [];
      for (let c = 0; c < this.COLS; c++) {
        const x = startX + c * (this.cellSize + this.CELL_GAP);
        const y = startY + r * (this.cellSize + this.CELL_GAP);
        // 1 en la matriz significa INVALIDA, por lo que valid es false.
        const valid = !(layout[r] && layout[r][c]); 
        row.push(new Celda(r, c, x, y, this.cellSize, valid, this.ctx));
      }
      this.celdas.push(row);
    }
  }
  /** Inicializa las fichas en el tablero */
  initPieces(emptyCenter = true) {
    this.fichas = [];
    this.moves = 0;
    let idCounter = 0;
    const centerR = Math.floor(this.ROWS / 2);
    const centerC = Math.floor(this.COLS / 2);

    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const celda = this.celdas[r][c];
        if (!celda.valid) { celda.ficha = null; continue; }
        // por defecto llenar todas menos el centro
        if (emptyCenter && r === centerR && c === centerC) { celda.ficha = null; continue; }
        const img = this._getThemeImage();
        const ficha = new Ficha(celda, img, 'p' + (idCounter++), this.ctx);
        celda.ficha = ficha;
        this.fichas.push(ficha);
      }
    }
  }

  /* Cambia el tipo de tablero (classic/europe)*/
  setBoardType(type) {
    if (this.LAYOUTS[type]) {
      this.boardType = type;
      this._buildGrid();
      this.initPieces(true); // Reinicia las fichas
      return true;
    }
    return false;
  }

  /** Devuelve la Image correspondiente al tema actual. */
  _getThemeImage() {
    if(this.theme==='ficha1') return this.images.ficha1;
    if(this.theme==='ficha2') return this.images.ficha2;
    if(this.theme==='ficha3') return this.images.ficha3;
    if(this.theme==='ficha4') return this.images.ficha4;
    return this.images.ficha1;
  }
 _getThemeBackground() {
    // 1.Imagen basada en el tipo de tablero 
    if(this.boardType === 'classic') {
      if(this.theme==='ficha1') return this.images.fondo1;
      if(this.theme==='ficha2') return this.images.fondo2;
      if(this.theme==='ficha3') return this.images.fondo3;
      if(this.theme==='ficha4') return this.images.fondo4;
    }
    if(this.boardType === 'europe') {
      if(this.theme==='ficha1') return this.images.fondo6;
      if(this.theme==='ficha2') return this.images.fondo5;
      if(this.theme==='ficha3') return this.images.fondo7;
      if(this.theme==='ficha4') return this.images.fondo8;
    }
  }

  /** Dibuja el tablero completo: fondo, celdas y fichas. */
  draw() {
    // fondo temático
    this.ctx.save();

    const img = this._getThemeBackground(); 

    if (img && img.complete && img.naturalWidth !== 0) {
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const canvasW = this.width;
      const canvasH = this.height;

      // Calcular el escalado para "cover" (ajustar la imagen al menor de los tamaños del canvas
      // para que toda la imagen sea visible sin distorsión).
      let scale = Math.min(canvasW / imgW, canvasH / imgH);
      
      // Para CENTRAR SIN DISTORSIONAR y NO AGRANDAR MÁS DE LO NECESARIO
      let finalW = imgW;
      let finalH = imgH;

      // Si la imagen es más grande que el canvas en alguna dimensión, la escalamos
      if (imgW > canvasW || imgH > canvasH) {
         scale = Math.min(canvasW / imgW, canvasH / imgH);
         finalW = imgW * scale;
         finalH = imgH * scale;
      }
      
      const x = (canvasW - finalW) / 2;
      const y = (canvasH - finalH) / 2;

      // Dibujar la imagen centrada
      this.ctx.drawImage(img, x, y, finalW, finalH);
    }
    this.ctx.restore();

    // dibujar celdas
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const cell = this.celdas[r][c];
        cell.draw();
      }
    }

    // dibujar fichas que no están siendo arrastradas primero
    for (const f of this.fichas) {
      if (!f.isDragging) f.draw();
    }
    // luego las que están arrastrando (para que aparezcan arriba)
    for (const f of this.fichas) {
      if (f.isDragging) f.draw();
    }
  }

  /** Encuentra la celda bajo una coordenada x,y (devuelve null si ninguna válida). */
  cellAt(x, y) {
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const cell = this.celdas[r][c];
        if (!cell.valid) continue;
        const half = cell.size / 2;
        if (x >= cell.x - half && x <= cell.x + half && y >= cell.y - half && y <= cell.y + half) return cell;
      }
    }
    return null;
  }

  /** Comprueba si un movimiento de 'fromCelda' a 'toCelda' es válido según reglas (saltar ficha adyacente). */
  isValidMove(fromCelda, toCelda) {
    if (!fromCelda || !toCelda) return false;
    if (!fromCelda.ficha) return false;
    if (toCelda.ficha) return false; 
    if (!toCelda.valid) return false;

    // movimiento estrictamente horizontal o vertical de 2 celdas
    const dr = toCelda.r - fromCelda.r;
    const dc = toCelda.c - fromCelda.c;
    if (Math.abs(dr) === 2 && dc === 0) {
      const mid = this.celdas[fromCelda.r + dr / 2][fromCelda.c];
      return mid && mid.ficha;
    }
    if (Math.abs(dc) === 2 && dr === 0) {
      const mid = this.celdas[fromCelda.r][fromCelda.c + dc / 2];
      return mid && mid.ficha;
    }
    return false;
  }

  /** Realiza el movimiento si es válido: mueve la ficha, elimina la saltada y actualiza contadores. */
  performMove(fromCelda, toCelda) {
    if (!this.isValidMove(fromCelda, toCelda)) return false;
    const dr = toCelda.r - fromCelda.r;
    const dc = toCelda.c - fromCelda.c;
    const midR = fromCelda.r + (dr ? dr / 2 : 0);
    const midC = fromCelda.c + (dc ? dc / 2 : 0);
    const midCelda = this.celdas[midR][midC];

    // eliminar ficha del medio
    const removed = midCelda.ficha;
    if (removed) {
      this.fichas = this.fichas.filter(p => p !== removed);
      midCelda.ficha = null;
    }

    // mover ficha
    const ficha = fromCelda.ficha;
    fromCelda.ficha = null;
    toCelda.ficha = ficha;
    if (ficha) {
      ficha.celda = toCelda;
      ficha.offsetX = 0; ficha.offsetY = 0; ficha.isDragging = false;
    }

    this.moves++;
    return true;
  }

  /** Verifica si existe al menos un movimiento posible en todo el tablero. */
  hasAnyMoves() {
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const cell = this.celdas[r][c];
        if (!cell.valid || !cell.ficha) continue;
        const deltas = [[2,0],[-2,0],[0,2],[0,-2]];
        console.log( this.celdas[r][c],cell.ficha);
        for (const d of deltas) {
          const nr = r + d[0]; const nc = c + d[1];
          if (nr < 0 || nr >= this.ROWS || nc < 0 || nc >= this.COLS) continue;
          const target = this.celdas[nr][nc];
          if (this.isValidMove(cell, target)) return true;
        }
      }
    }
    return false;
  }

  /** Cambia el tema de imágenes y actualiza todas las fichas. */
  setTheme(name) {
    this.theme = name;
    const img = this._getThemeImage();
    for (const f of this.fichas) f.img = img;
  }

}
