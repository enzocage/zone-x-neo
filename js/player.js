/**
 * Zone X - Spieler
 */
class Player {
    constructor(game, x, y) {
        this.game = game;
        this.gridX = x;
        this.gridY = y;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.width = 0.8;
        this.height = 0.8;
        this.speed = CONFIG.PLAYER_SPEED;
        this.lives = CONFIG.PLAYER_INITIAL_LIVES;
        this.blocks = CONFIG.PLAYER_INITIAL_BLOCKS;
        this.score = 0;
        this.isMoving = false;
        this.lastDirection = { x: 0, y: 0 };
        this.hasPlutonium = false;
        this.plutoniumTimer = null;
        this.plutoniumTimerValue = CONFIG.PLUTONIUM_TIMER;
        this.mesh = null;
        
        this.createMesh();
    }
    
    /**
     * Erstellt das 3D-Mesh für den Spieler
     */
    createMesh() {
        const geometry = new THREE.BoxGeometry(
            CONFIG.TILE_SIZE * this.width, 
            CONFIG.TILE_SIZE * this.height, 
            CONFIG.TILE_SIZE * 0.5
        );
        const material = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.PLAYER });
        this.mesh = new THREE.Mesh(geometry, material);
        
        const worldPos = Utils.gridToWorld(this.x, this.y);
        this.mesh.position.set(worldPos.x, worldPos.y, CONFIG.TILE_SIZE * 0.25);
        this.mesh.userData = { type: 'player' };
        
        this.game.scene.add(this.mesh);
    }
    
    /**
     * Aktualisiert die Position des Spielers
     */
    update() {
        if (this.isMoving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0.01) {
                const moveX = (dx / distance) * this.speed * this.game.deltaTime;
                const moveY = (dy / distance) * this.speed * this.game.deltaTime;
                
                // Beschränke die Bewegung auf die Zielposition
                this.x += Math.abs(moveX) > Math.abs(dx) ? dx : moveX;
                this.y += Math.abs(moveY) > Math.abs(dy) ? dy : moveY;
                
                // Position des Meshes aktualisieren
                const worldPos = Utils.gridToWorld(this.x, this.y);
                this.mesh.position.x = worldPos.x;
                this.mesh.position.y = worldPos.y;
                
                // Kameraposition aktualisieren
                this.game.updateCamera();
            } else {
                // Bewegung abgeschlossen
                this.x = this.targetX;
                this.y = this.targetY;
                this.gridX = Math.round(this.x);
                this.gridY = Math.round(this.y);
                this.isMoving = false;
                
                // Prüfen, ob der Spieler auf einem Spielelement steht
                this.checkCollisions();
            }
        }
    }
    
    /**
     * Bewegt den Spieler in eine Richtung
     * @param {number} dx X-Richtung (-1, 0, 1)
     * @param {number} dy Y-Richtung (-1, 0, 1)
     */
    move(dx, dy) {
        if (this.isMoving) return;
        
        this.lastDirection = { x: dx, y: dy };
        
        const targetX = this.gridX + dx;
        const targetY = this.gridY + dy;
        
        // Prüfen, ob die Zielposition frei ist
        if (this.canMoveTo(targetX, targetY)) {
            this.targetX = targetX;
            this.targetY = targetY;
            this.isMoving = true;
        }
    }
    
    /**
     * Prüft, ob der Spieler zu einer Position bewegen kann
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     * @returns {boolean} true, wenn die Position frei ist
     */
    canMoveTo(x, y) {
        // Prüfen, ob die Position innerhalb des Spielfelds liegt
        if (!Utils.isInBounds(x, y)) return false;
        
        // Prüfen, ob eine Wand an der Position ist
        if (this.game.level.isWall(x, y)) return false;
        
        // Prüfen, ob ein Block an der Position ist
        if (this.game.level.isBlock(x, y)) return false;
        
        // Prüfen, ob eine Tonne an der Position ist
        if (this.game.level.isBarrel(x, y)) return false;
        
        return true;
    }
    
    /**
     * Prüft Kollisionen mit Spielelementen
     */
    checkCollisions() {
        const x = this.gridX;
        const y = this.gridY;
        
        // Kollision mit Gegner
        if (this.game.level.isEnemy(x, y)) {
            this.loseLife();
            return;
        }
        
        // Kollision mit Plutonium
        if (this.game.level.isPlutonium(x, y)) {
            this.collectPlutonium(x, y);
            return;
        }
        
        // Kollision mit Block
        if (this.game.level.isBlock(x, y)) {
            this.collectBlock(x, y);
            return;
        }
        
        // Kollision mit Tonne (wenn Plutonium vorhanden)
        if (this.game.level.isBarrel(x, y) && this.hasPlutonium) {
            this.deliverPlutonium();
            return;
        }
        
        // Kollision mit Exit (wenn alle Plutonium abgeliefert)
        if (this.game.level.isExit(x, y) && this.game.plutoniumDelivered === CONFIG.PLUTONIUM_COUNT) {
            this.game.level.nextLevel();
            return;
        }
    }
    
    /**
     * Sammelt Plutonium
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     */
    collectPlutonium(x, y) {
        if (this.hasPlutonium) return;
        
        this.hasPlutonium = true;
        this.game.level.removePlutonium(x, y);
        this.game.ui.updatePlutoniumCount(this.game.level.plutonium.length);
        
        // Timer starten
        this.startPlutoniumTimer();
    }
    
    /**
     * Startet den Plutonium-Timer
     */
    startPlutoniumTimer() {
        this.plutoniumTimerValue = CONFIG.PLUTONIUM_TIMER;
        this.game.ui.showTimer();
        this.game.ui.updateTimer(this.plutoniumTimerValue);
        
        // Timer-Intervall starten
        this.plutoniumTimer = setInterval(() => {
            this.plutoniumTimerValue--;
            this.game.ui.updateTimer(this.plutoniumTimerValue);
            
            if (this.plutoniumTimerValue <= 0) {
                this.stopPlutoniumTimer();
                this.loseLife();
                this.hasPlutonium = false;
            }
        }, 1000);
    }
    
    /**
     * Stoppt den Plutonium-Timer
     */
    stopPlutoniumTimer() {
        if (this.plutoniumTimer) {
            clearInterval(this.plutoniumTimer);
            this.plutoniumTimer = null;
        }
        this.game.ui.hideTimer();
    }
    
    /**
     * Liefert Plutonium in einer Tonne ab
     */
    deliverPlutonium() {
        this.hasPlutonium = false;
        this.stopPlutoniumTimer();
        this.score += 100;
        this.game.plutoniumDelivered++;
        this.game.ui.updateScore(this.score);
        
        // Prüfen, ob alle Plutoniumproben abgeliefert wurden
        if (this.game.plutoniumDelivered === CONFIG.PLUTONIUM_COUNT) {
            this.game.activateExit();
        }
    }
    
    /**
     * Sammelt einen Block
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     */
    collectBlock(x, y) {
        this.blocks++;
        this.game.level.removeBlock(x, y);
        this.game.ui.updateBlocksCount(this.blocks);
    }
    
    /**
     * Platziert einen Block hinter dem Spieler
     */
    placeBlock() {
        if (this.blocks <= 0) return;
        
        // Position hinter dem Spieler ermitteln
        const behindX = this.gridX - this.lastDirection.x;
        const behindY = this.gridY - this.lastDirection.y;
        
        // Prüfen, ob die Position frei ist
        if (Utils.isInBounds(behindX, behindY) && 
            this.game.level.grid[behindY][behindX] === 'empty') {
            
            if (this.game.level.addBlock(behindX, behindY)) {
                this.blocks--;
                this.game.ui.updateBlocksCount(this.blocks);
                this.game.createBlockMesh(behindX, behindY);
            }
        }
    }
    
    /**
     * Verliert ein Leben
     */
    loseLife() {
        this.lives--;
        this.game.ui.updateLivesCount(this.lives);
        
        if (this.lives <= 0) {
            this.game.gameOver();
        } else {
            this.resetPosition();
        }
    }
    
    /**
     * Setzt die Position des Spielers zurück
     */
    resetPosition() {
        this.gridX = this.game.level.startPosition.x;
        this.gridY = this.game.level.startPosition.y;
        this.x = this.gridX;
        this.y = this.gridY;
        this.targetX = this.x;
        this.targetY = this.y;
        
        const worldPos = Utils.gridToWorld(this.x, this.y);
        this.mesh.position.x = worldPos.x;
        this.mesh.position.y = worldPos.y;
        
        this.hasPlutonium = false;
        this.stopPlutoniumTimer();
        this.isMoving = false;
        
        this.game.updateCamera();
    }
} 