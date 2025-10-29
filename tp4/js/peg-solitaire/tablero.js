class Tablero {
  /**
   * @param {CanvasRenderingContext2D} ctx - contexto 2D del canvas
   * @param {number} width - ancho del canvas
   * @param {number} height - alto del canvas
   */
  constructor(ctx, width, height,theme) {
    this.ctx = ctx; this.width = width; this.height = height;
    this.celdas = []; // matriz de Celda
    this.fichas = []; // lista de Ficha
    this.cellSize = 0; // se calculará
    this.theme = theme || 'classic';
    this.images = {}; // imágenes cargadas por tema
    this.moves = 0;

    this.ROWS = 7; // tablero tipo "English" 7x7 con esquinas inválidas
    this.COLS = 7;
    this.CELL_GAP = 0; // espacio entre casillas

    const IMAGES = {
      boardBg: "img/solitario/tablero.png",
      ficha1: "img/solitario/ficha.png",
      ficha2: "img/solitario/ficha2.jpg",
      ficha3: "img/solitario/ficha3.jpg",
      ficha4: "img/solitario/ficha4.png",
    };

    // Posiciones inválidas en esquinas (1 = no utilizable)
    this.INVALID = [
      [1,1,0,0,0,1,1],
      [1,1,0,0,0,1,1],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [1,1,0,0,0,1,1],
      [1,1,0,0,0,1,1]
    ];

    // preparar imagenes Image() desde dataURLs / rutas
    this._IMAGES = IMAGES;
    this.preloadImages();

    // construir geometría del tablero y celdas
    this._buildGrid();
  }

  /** Carga las imágenes (data URLs / rutas) en objetos Image. */
  preloadImages() {
    // background
    this.images.bg = new Image();
    this.images.bg.src = this._IMAGES.boardBg;
    // ficha
    this.images.ficha1 = new Image();
    this.images.ficha1.src = this._IMAGES.ficha1;

    this.images.ficha2 = new Image();
    this.images.ficha2.src = this._IMAGES.ficha2;

    this.images.ficha3 = new Image();
    this.images.ficha3.src = this._IMAGES.ficha3;

    this.images.ficha4 = new Image();
    this.images.ficha4.src = this._IMAGES.ficha4;

    // opcional: manejar onerror para debug
    this.images.ficha1.onerror = () => console.warn("No se pudo cargar img/solitario/ficha.png (revisa la ruta)");
  }

  /** Construye la disposición de celdas en el canvas y calcula tamaños. */
  _buildGrid() {
    // reservar márgenes
    const padX = 20; const padY = 60;
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

    this.celdas = [];
    for (let r = 0; r < this.ROWS; r++) {
      const row = [];
      for (let c = 0; c < this.COLS; c++) {
        const x = startX + c * (this.cellSize + this.CELL_GAP);
        const y = startY + r * (this.cellSize + this.CELL_GAP);
        const valid = (this.INVALID[r] && this.INVALID[r][c]) ? false : true;
        row.push(new Celda(r, c, x, y, this.cellSize, valid, this.ctx));
      }
      this.celdas.push(row);
    }
  }

  /** Inicializa las fichas en el tablero (posición inicial clásica: centro vacío). */
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

  /** Devuelve la Image correspondiente al tema actual. */
  _getThemeImage() {
    if(this.theme==='ficha1') return this.images.ficha1;
    if(this.theme==='ficha2') return this.images.ficha2;
    if(this.theme==='ficha3') return this.images.ficha3;
    if(this.theme==='ficha4') return this.images.ficha4;
    return this.images.ficha1;
  }

  /** Dibuja el tablero completo: fondo, celdas y fichas. */
  draw() {
    // fondo temático
    this.ctx.save();
    
    // Fallback: Rellenar el fondo del canvas con un color sólido
    this.ctx.fillStyle = '#4f7eddff';
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (this.images.bg && this.images.bg.complete && this.images.bg.naturalWidth !== 0) {
      const img = this.images.bg;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const canvasW = this.width;
      const canvasH = this.height;

      // Calcular el escalado para "cover" (ajustar la imagen al menor de los tamaños del canvas
      // para que toda la imagen sea visible sin distorsión).
      let scale = Math.min(canvasW / imgW, canvasH / imgH);
      
      // Si la imagen es más grande que el canvas, usa un escalado para contener
      // Si la imagen es más pequeña que el canvas, usa 1 para no agrandarla, o scale si quieres reescalar.
      // Para CENTRAR SIN DISTORSIONAR y NO AGRANDAR MÁS DE LO NECESARIO:
      // Si queremos la imagen en su tamaño original a menos que sea más grande que el canvas:
      
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
    if (toCelda.ficha) return false; // destino debe estar vacío

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
