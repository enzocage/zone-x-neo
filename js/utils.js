/**
 * Zone X - Hilfsfunktionen
 */
const Utils = {
    /**
     * Konvertiert Grid-Koordinaten in Weltkoordinaten
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     * @returns {Object} Weltkoordinaten {x, y}
     */
    gridToWorld: function(x, y) {
        return {
            x: (x - CONFIG.GRID_WIDTH / 2) * CONFIG.TILE_SIZE,
            y: (CONFIG.GRID_HEIGHT / 2 - y) * CONFIG.TILE_SIZE
        };
    },
    
    /**
     * Konvertiert Weltkoordinaten in Grid-Koordinaten
     * @param {number} x X-Koordinate in der Welt
     * @param {number} y Y-Koordinate in der Welt
     * @returns {Object} Grid-Koordinaten {x, y}
     */
    worldToGrid: function(x, y) {
        return {
            x: Math.floor(x / CONFIG.TILE_SIZE + CONFIG.GRID_WIDTH / 2),
            y: Math.floor(CONFIG.GRID_HEIGHT / 2 - y / CONFIG.TILE_SIZE)
        };
    },
    
    /**
     * Prüft, ob Koordinaten innerhalb des Spielfelds liegen
     * @param {number} x X-Koordinate im Grid
     * @param {number} y Y-Koordinate im Grid
     * @returns {boolean} true, wenn innerhalb des Spielfelds
     */
    isInBounds: function(x, y) {
        return x >= 0 && x < CONFIG.GRID_WIDTH && y >= 0 && y < CONFIG.GRID_HEIGHT;
    },
    
    /**
     * Generiert eine zufällige ganze Zahl zwischen min und max (inklusive)
     * @param {number} min Minimaler Wert
     * @param {number} max Maximaler Wert
     * @returns {number} Zufällige ganze Zahl
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Lädt eine CSV-Datei und gibt ihren Inhalt zurück
     * @param {string} url URL der CSV-Datei
     * @returns {Promise<Array>} Promise mit dem CSV-Inhalt als Array
     */
    loadCSV: function(url) {
        return new Promise((resolve, reject) => {
            console.log('Versuche zu laden:', url);
            
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        console.error('HTTP Fehlerstatus:', response.status, response.statusText);
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(csv => {
                    if (!csv || csv.trim() === '') {
                        console.error('CSV-Inhalt ist leer');
                        throw new Error('CSV-Inhalt ist leer');
                    }
                    
                    console.log('CSV geladen, Anzahl Zeichen:', csv.length);
                    
                    const rows = csv.split('\n');
                    console.log('Anzahl Zeilen:', rows.length);
                    
                    const grid = [];
                    
                    for (let y = 0; y < rows.length; y++) {
                        if (rows[y].trim() === '') {
                            console.log('Überspringe leere Zeile', y);
                            continue;
                        }
                        
                        const cells = rows[y].split(',');
                        console.log(`Zeile ${y}: ${cells.length} Zellen`);
                        grid.push(cells);
                    }
                    
                    if (grid.length === 0) {
                        console.error('Grid ist leer nach dem Parsen');
                        throw new Error('Grid ist leer nach dem Parsen');
                    }
                    
                    resolve(grid);
                })
                .catch(error => {
                    console.error('Fehler beim Laden der CSV-Datei:', error);
                    reject(error);
                });
        });
    }
}; 