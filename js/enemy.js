/**
 * Zone X - Gegner
 */
class Enemy {
    constructor(game, x, y, direction) {
        this.game = game;
        this.gridX = x;
        this.gridY = y;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = CONFIG.ENEMY_SPEED;
        this.width = 0.8;
        this.height = 0.8;
        this.mesh = null;
        
        this.createMesh();
    }
    
    /**
     * Erstellt das 3D-Mesh für den Gegner
     */
    createMesh() {
        const geometry = new THREE.BoxGeometry(
            CONFIG.TILE_SIZE * this.width, 
            CONFIG.TILE_SIZE * this.height, 
            CONFIG.TILE_SIZE * 0.5
        );
        const material = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.ENEMY });
        this.mesh = new THREE.Mesh(geometry, material);
        
        const worldPos = Utils.gridToWorld(this.x, this.y);
        this.mesh.position.set(worldPos.x, worldPos.y, CONFIG.TILE_SIZE * 0.25);
        this.mesh.userData = { type: 'enemy' };
        
        this.game.scene.add(this.mesh);
    }
    
    /**
     * Aktualisiert die Position des Gegners
     */
    update() {
        // Berechne die nächste Position
        const nextX = this.x + this.direction.x * this.speed * this.game.deltaTime;
        const nextY = this.y + this.direction.y * this.speed * this.game.deltaTime;
        
        // Runde für die Grid-Position
        const nextGridX = Math.round(nextX);
        const nextGridY = Math.round(nextY);
        
        // Prüfe auf Kollisionen
        if (this.willCollide(nextGridX, nextGridY)) {
            // Ändere die Richtung, wenn eine Kollision stattfinden würde
            this.changeDirection();
        } else {
            // Aktualisiere die Position
            this.x = nextX;
            this.y = nextY;
            this.gridX = nextGridX;
            this.gridY = nextGridY;
            
            // Aktualisiere die Position des Meshes
            const worldPos = Utils.gridToWorld(this.x, this.y);
            this.mesh.position.x = worldPos.x;
            this.mesh.position.y = worldPos.y;
            
            // Prüfe auf Kollision mit dem Spieler
            this.checkPlayerCollision();
        }
    }
    
    /**
     * Prüft, ob der Gegner mit einem Hindernis kollidieren würde
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     * @returns {boolean} true, wenn eine Kollision stattfinden würde
     */
    willCollide(x, y) {
        // Wenn der Gegner sich nicht in eine bestimmte Richtung bewegt hat, prüfe nur die aktuelle Position
        if (x === this.gridX && y === this.gridY) {
            return false;
        }
        
        // Prüfe, ob die nächste Position innerhalb des Spielfelds liegt
        if (!Utils.isInBounds(x, y)) {
            return true;
        }
        
        // Prüfe auf Kollision mit Wänden
        if (this.game.level.isWall(x, y)) {
            return true;
        }
        
        // Prüfe auf Kollision mit Tonnen
        if (this.game.level.isBarrel(x, y)) {
            return true;
        }
        
        // Prüfe auf Kollision mit Blöcken
        if (this.game.level.isBlock(x, y)) {
            return true;
        }
        
        // Prüfe auf Kollision mit anderen Gegnern
        for (const enemy of this.game.enemies) {
            if (enemy !== this && enemy.gridX === x && enemy.gridY === y) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Ändert die Bewegungsrichtung des Gegners zufällig
     */
    changeDirection() {
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        
        // Filtere die aktuelle Richtung heraus
        const filteredDirections = directions.filter(dir => 
            !(dir.x === this.direction.x && dir.y === this.direction.y) &&
            !(dir.x === -this.direction.x && dir.y === -this.direction.y)
        );
        
        // Wähle eine zufällige Richtung aus den verbleibenden
        const randomDir = filteredDirections[Math.floor(Math.random() * filteredDirections.length)];
        
        // Setze die neue Richtung
        this.direction = randomDir || { x: 1, y: 0 }; // Fallback auf Rechts, falls keine Richtung verfügbar
    }
    
    /**
     * Prüft, ob der Gegner mit dem Spieler kollidiert
     */
    checkPlayerCollision() {
        const player = this.game.player;
        
        // Wenn der Spieler und der Gegner auf der gleichen Grid-Position sind
        if (Math.round(player.x) === this.gridX && Math.round(player.y) === this.gridY) {
            player.loseLife();
        }
    }
} 