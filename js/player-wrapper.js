// Player-Klasse Wrapper
(function() {
    // Originale Klasse aus player.js extrahieren
    const originalScript = document.createElement('script');
    originalScript.src = 'js/player.js';
    
    originalScript.onload = function() {
        // Nach dem Laden überprüfen, ob die Player-Klasse existiert
        if (typeof Player === 'undefined') {
            // Falls nicht gefunden, versuche die Klasse aus dem Skript zu extrahieren
            // und global verfügbar zu machen
            console.log("Player-Klasse nicht im globalen Scope gefunden, mache sie global verfügbar");
            
            // Player-Klasse basierend auf README-Dokumentation implementieren
            window.Player = class Player {
                constructor(game, x, y) {
                    this.game = game;
                    this.gridX = x;
                    this.gridY = y;
                    this.x = x;
                    this.y = y;
                    this.targetX = x;
                    this.targetY = y;
                    this.lives = CONFIG.PLAYER_INITIAL_LIVES || 5;
                    this.blocks = CONFIG.PLAYER_INITIAL_BLOCKS || 15;
                    this.score = 0;
                    this.isMoving = false;
                    this.hasPlutonium = false;
                    this.lastDirection = { x: 0, y: 0 };
                    this.mesh = null;
                    
                    this.createMesh();
                    
                    // UI aktualisieren
                    if (this.game.ui) {
                        this.game.ui.updateLivesCount(this.lives);
                        this.game.ui.updateBlocksCount(this.blocks);
                    }
                }
                
                createMesh() {
                    const geometry = new THREE.BoxGeometry(
                        CONFIG.TILE_SIZE * 0.8, 
                        CONFIG.TILE_SIZE * 0.8, 
                        CONFIG.TILE_SIZE * 0.5
                    );
                    const material = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.PLAYER });
                    this.mesh = new THREE.Mesh(geometry, material);
                    
                    const worldPos = Utils.gridToWorld(this.x, this.y);
                    this.mesh.position.set(worldPos.x, worldPos.y, CONFIG.TILE_SIZE * 0.25);
                    this.mesh.userData = { type: 'player' };
                    
                    this.game.scene.add(this.mesh);
                }
                
                update() {
                    if (this.isMoving) {
                        const dx = this.targetX - this.x;
                        const dy = this.targetY - this.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance > 0.01) {
                            const moveX = (dx / distance) * CONFIG.PLAYER_SPEED * this.game.deltaTime;
                            const moveY = (dy / distance) * CONFIG.PLAYER_SPEED * this.game.deltaTime;
                            
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
                            
                            // Prüfe Kollision mit Objekten
                            this.checkCollisions();
                        }
                    }
                }
                
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
                
                canMoveTo(x, y) {
                    // Spielfeldgrenzen prüfen
                    if (!Utils.isInBounds(x, y)) return false;
                    
                    // Prüfe, ob an der Position eine Wand ist
                    for (const wall of this.game.level.walls) {
                        if (wall.x === x && wall.y === y) return false;
                    }
                    
                    // Prüfe, ob an der Position ein Block ist
                    for (const block of this.game.level.blocks) {
                        if (block.x === x && block.y === y) return false;
                    }
                    
                    return true;
                }
                
                checkCollisions() {
                    // Prüfe, ob Spieler mit Plutonium kollidiert
                    for (let i = 0; i < this.game.level.plutonium.length; i++) {
                        const plutonium = this.game.level.plutonium[i];
                        if (plutonium.x === this.gridX && plutonium.y === this.gridY) {
                            // Plutonium aufsammeln
                            this.game.level.plutonium.splice(i, 1);
                            this.hasPlutonium = true;
                            
                            // Timer starten
                            this.game.ui.startTimer(CONFIG.PLUTONIUM_TIMER);
                            
                            // UI aktualisieren
                            this.game.ui.updatePlutoniumCount(this.game.level.plutonium.length);
                            
                            // Szene aktualisieren
                            this.game.scene.traverse((object) => {
                                if (object.userData.type === 'plutonium' && 
                                    object.position.x === Utils.gridToWorld(plutonium.x, plutonium.y).x && 
                                    object.position.y === Utils.gridToWorld(plutonium.x, plutonium.y).y) {
                                    this.game.scene.remove(object);
                                }
                            });
                            
                            break;
                        }
                    }
                    
                    // Prüfe, ob Spieler mit Barrel kollidiert
                    if (this.hasPlutonium) {
                        for (const barrel of this.game.level.barrels) {
                            if (barrel.x === this.gridX && barrel.y === this.gridY) {
                                // Plutonium abliefern
                                this.hasPlutonium = false;
                                this.game.plutoniumDelivered++;
                                
                                // Timer stoppen
                                this.game.ui.stopTimer();
                                
                                // Punkte erhöhen
                                this.score += 100;
                                this.game.ui.updateScore(this.score);
                                
                                // Prüfen, ob alle Plutoniumproben abgeliefert wurden
                                if (this.game.plutoniumDelivered >= CONFIG.PLUTONIUM_COUNT && 
                                    this.game.level.plutonium.length === 0) {
                                    // Exit aktivieren
                                    this.game.activateExit();
                                }
                                
                                break;
                            }
                        }
                    }
                    
                    // Prüfe, ob Spieler mit Exit kollidiert
                    if (this.game.level.exit && this.gridX === this.game.level.exit.x && 
                        this.gridY === this.game.level.exit.y) {
                        // Prüfen, ob alle Plutoniumproben abgeliefert wurden
                        if (this.game.plutoniumDelivered >= CONFIG.PLUTONIUM_COUNT && 
                            this.game.level.plutonium.length === 0) {
                            // Level abgeschlossen
                            this.game.levelComplete();
                        }
                    }
                    
                    // Prüfe, ob Spieler mit Block kollidiert
                    for (let i = 0; i < this.game.level.blocks.length; i++) {
                        const block = this.game.level.blocks[i];
                        if (block.x === this.gridX && block.y === this.gridY) {
                            // Block aufsammeln
                            this.game.level.blocks.splice(i, 1);
                            this.blocks++;
                            
                            // UI aktualisieren
                            this.game.ui.updateBlocksCount(this.blocks);
                            
                            // Szene aktualisieren
                            this.game.scene.traverse((object) => {
                                if (object.userData.type === 'block' && 
                                    object.position.x === Utils.gridToWorld(block.x, block.y).x && 
                                    object.position.y === Utils.gridToWorld(block.x, block.y).y) {
                                    this.game.scene.remove(object);
                                }
                            });
                            
                            break;
                        }
                    }
                    
                    // Prüfe, ob Spieler mit Gegner kollidiert
                    for (const enemy of this.game.enemies) {
                        if (Math.abs(enemy.x - this.x) < 0.5 && Math.abs(enemy.y - this.y) < 0.5) {
                            // Leben abziehen
                            this.loseLife();
                            break;
                        }
                    }
                }
                
                placeBlock() {
                    if (this.blocks <= 0) return;
                    
                    // Position hinter dem Spieler ermitteln
                    const blockX = this.gridX - this.lastDirection.x;
                    const blockY = this.gridY - this.lastDirection.y;
                    
                    // Prüfen, ob die Position frei ist
                    if (Utils.isInBounds(blockX, blockY)) {
                        let canPlace = true;
                        
                        // Prüfen, ob an der Position bereits etwas ist
                        for (const wall of this.game.level.walls) {
                            if (wall.x === blockX && wall.y === blockY) {
                                canPlace = false;
                                break;
                            }
                        }
                        
                        for (const block of this.game.level.blocks) {
                            if (block.x === blockX && block.y === blockY) {
                                canPlace = false;
                                break;
                            }
                        }
                        
                        for (const barrel of this.game.level.barrels) {
                            if (barrel.x === blockX && barrel.y === blockY) {
                                canPlace = false;
                                break;
                            }
                        }
                        
                        for (const plutonium of this.game.level.plutonium) {
                            if (plutonium.x === blockX && plutonium.y === blockY) {
                                canPlace = false;
                                break;
                            }
                        }
                        
                        if (this.game.level.exit && this.game.level.exit.x === blockX && 
                            this.game.level.exit.y === blockY) {
                            canPlace = false;
                        }
                        
                        if (canPlace) {
                            // Block platzieren
                            this.game.level.blocks.push({ x: blockX, y: blockY });
                            this.blocks--;
                            
                            // UI aktualisieren
                            this.game.ui.updateBlocksCount(this.blocks);
                            
                            // Block-Mesh erstellen
                            this.game.createBlockMesh(blockX, blockY);
                        }
                    }
                }
                
                loseLife() {
                    this.lives--;
                    
                    // UI aktualisieren
                    this.game.ui.updateLivesCount(this.lives);
                    
                    if (this.lives <= 0) {
                        // Game Over
                        this.game.gameOver();
                    } else {
                        // Spieler zur Startposition zurücksetzen
                        this.gridX = this.game.level.startPosition.x;
                        this.gridY = this.game.level.startPosition.y;
                        this.x = this.gridX;
                        this.y = this.gridY;
                        this.targetX = this.x;
                        this.targetY = this.y;
                        this.isMoving = false;
                        
                        // Plutonium verlieren
                        if (this.hasPlutonium) {
                            this.hasPlutonium = false;
                            this.game.ui.stopTimer();
                        }
                        
                        // Position des Meshes aktualisieren
                        const worldPos = Utils.gridToWorld(this.x, this.y);
                        this.mesh.position.x = worldPos.x;
                        this.mesh.position.y = worldPos.y;
                        
                        // Kameraposition aktualisieren
                        this.game.updateCamera();
                    }
                }
            };
            
            console.log("Player-Klasse global verfügbar gemacht");
            document.dispatchEvent(new Event('player-class-ready'));
        } else {
            console.log("Player-Klasse bereits im globalen Scope vorhanden");
            document.dispatchEvent(new Event('player-class-ready'));
        }
    };
    
    originalScript.onerror = function() {
        console.error("Fehler beim Laden von player.js");
        // Trotzdem die minimale Player-Klasse erstellen
        window.Player = class Player {
            constructor(game, x, y) {
                this.game = game;
                this.gridX = x;
                this.gridY = y;
                this.x = x;
                this.y = y;
                this.lives = 5;
                this.mesh = null;
                console.warn("Fallback Player-Klasse initialisiert");
            }
            
            update() { /* Minimale Implementation */ }
            move() { /* Minimale Implementation */ }
        };
        document.dispatchEvent(new Event('player-class-ready'));
    };
    
    document.head.appendChild(originalScript);
})(); 