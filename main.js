class Broad extends Phaser.GameObjects.Container {
    static candySize = 115; // Chuyển candySize thành thuộc tính static

    constructor(config) {
        super(config.scene, config.x, config.y);
        config.scene.add.existing(this);
        this.arrBroad = config.initBoard;
        this.gridSize = { y: this.arrBroad.length, x: this.arrBroad[0].length };
        // this.candies = [...this.arrBroad];
        // this.overlays = [...this.arrBroad];
        // Deep copy bằng JSON
        this.candies = JSON.parse(JSON.stringify(this.arrBroad));
        this.overlays = JSON.parse(JSON.stringify(this.arrBroad));
        this.selectedCandy = null;
        this.selectedCandy2 = null
        this.score = 0;
        this.candyScale = 0.7;
        this.candySize = Broad.candySize * this.candyScale;
        this.smoot = 400;
        this.numRow = 1
        this.particleEmitter = null
        this.filterPicArray = []

        this.isMyTurn = true;
        this.isAnimation = false;
        this.news = new Set()
        this.boom = new Set()

        this.arrBroad.forEach((itemRow, row) => {
            itemRow.forEach((type, col) => {
                const candy = this.scene.add
                    .sprite(col * this.candySize, row * this.candySize, 'candies', type)
                    .setOrigin(0)
                    .setScale(this.candyScale)
                    .setInteractive()
                    .setDepth(0)
                candy.candyType = type;
                candy.row = row; candy.col = col;
                candy.filter = false
                candy.statee = 'exploded'

                const filter = this.scene.add
                    .sprite(col * this.candySize, row * this.candySize, 'none', 0)
                    .setOrigin(0)
                    .setScale(this.candyScale)
                    .disableInteractive()
                    .setDepth(1);
                filter.row = row; filter.col = col;
                
                this.overlays[row][col] = filter;
                this.candies[row][col] = candy;
                
                this.add([candy, filter]);
            });
        });
        window.auto = false;
        this.setSize(this.candySize * this.gridSize.x, this.candySize * this.gridSize.y);
        this.setPosition(config.x - this.width / 2, config.y - this.height / 2 - 50);
        this.scene.input.on('gameobjectdown', this.onCandyClicked, this);

        this.candyActive = this.scene.add.graphics();

        this.candyActive.lineStyle(5, 0xff0000);
        this.candyActive.strokeRect(0, 0, this.candySize, this.candySize);
        this.candyActive.setVisible(false);
        this.candyActive.setDepth(999);
        const color = this.scene.sys.game.config.backgroundColor;

        const backgroundColorInt = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

        this.veli = this.scene.add
            // .rectangle(0, 0, this.gridSize.x * this.candySize, this.candySize * this.numRow, backgroundColorInt)
            .rectangle(0, 0, this.gridSize.x * this.candySize, this.candySize,  0x0000ff)
            .setOrigin(0);
        
        
      
        


        // Thiết lập ParticleEmitter
        this.particleEmitter = this.scene.add.particles('particle').createEmitter({
            speed: { min: 30, max: this.candySize +40 }, // Tốc độ particle trong phạm vi nhỏ
            scale: { start: 1, end: 0 },  // Phóng to rồi thu nhỏ
            alpha: { start: 1, end: 0 },  // Particle từ rõ đến mờ dần
            lifespan: 300, // Thời gian sống của mỗi particle
            quantity: 5, // Số lượng particle phát tán mỗi lần
            angle: { min: 0, max: 360 }, // Phát tán ra từ mọi hướng xung quanh
            gravityY: 0,  // Không có lực hấp dẫn theo chiều dọc
            maxVelocityX: this.candySize +40, // Giới hạn tốc độ của particle theo chiều ngang
            maxVelocityY: this.candySize +40, // Giới hạn tốc độ của particle theo chiều dọc
            on: false,  // Ban đầu không phát tán
        });
        this.add([this.veli, this.candyActive]);
         // Lắng nghe sự kiện nhấn phím
         document.addEventListener('keydown', (event) => {
            if (event.key === 'b') { // Kiểm tra nếu phím nhấn là 'b'
                // Gọi tween
               this.haha()
            }
        });
        

        // this.overlays[5][4].setTexture('filters', 2)
        this.overlays[4][5].setTexture('filters', 2)
        this.candies[4][5].filter = this.overlays[4][5].frame.name
        // this.candies[4][2].destroy()
        // this.candies[4][2] = null
        // this.candies[5][2].destroy()
        // this.candies[5][2] = null
        // this.overlays[3][7].setTexture('filters', 2)
        // this.overlays[5][4].setTexture('filters', 2)
       
        // setTimeout(()=>{this.refillCandies()},2000)
        // console.log(this.candies[8][3].x, this.candies[8][3].y)
        this.checkMatches();
    }
    haha() {
        // console.log(this.candies[4][5])
        // this.candies[4][5].destroy()
        console.log(this.candies[4][5].filter== 2)

        // this.scene.tweens.add({
        //     targets: this.candies[4][5],
        //     alpha: 0, // Làm mờ dần
        //     yoyo: true, // Quay ngược lại
        //     repeat: 4, // Lặp lại 4 lần (2 giây = 500ms * 4)
        //     duration: 150, // Thời gian mỗi lần chớp (250ms)
        //     onComplete: () => {
        //         this.candies[4][5].alpha = 1;
        //     },
        // });
        // this.scene.tweens.add({
        //     targets: this.overlays[4][5],
        //     alpha: 0, // Làm mờ dần
        //     yoyo: true, // Quay ngược lại
        //     repeat: 4, // Lặp lại 4 lần (2 giây = 500ms * 4)
        //     duration: 150, // Thời gian mỗi lần chớp (250ms)
        //     onComplete: () => {
        //         this.overlays[4][5].alpha = 1;
        //     },
        // });
    }
    createExplosion(x, y) {
        this.particleEmitter.explode(30, x +this.x + this.candySize /2, y + this.y + this.candySize /2); 
    }
    onCandyClicked(pointer, candy) {
        if (!this.isAnimation && candy.row >= this.numRow && this.isMyTurn) {
            if (!this.selectedCandy) {
                this.selectedCandy = candy;
                this.candyActive.setPosition(candy.x, candy.y);
                this.candyActive.setVisible(true);
            } else if (this.selectedCandy == candy) {
                this.selectedCandy = null;
                this.candyActive.setVisible(false);
            } else {
                if (this.handleCheckNear(this.selectedCandy, candy)) {
                    // this.isMyTurn = false;
                    this.isMyTurn = true;
                    this.selectedCandy2 = candy
                    this.swapCandies(this.selectedCandy, this.selectedCandy2);
                    // this.selectedCandy = null;
                }
            }
        }
    }
    candyExplosion(array) {
        var arr = array; this.boom = new Set()
        arr.forEach(i=>{
            var r = i.row
            var c = i.col
            console.log(r, c)
            switch (i.filter) {
                case 1:
                    console.log(11111)
                    var range = [-2, -1, 1, 2];
                    range.forEach(dr => {
                        var nr = r + dr
                        if (nr >= 0 && nr < this.gridSize.y) {
                            var candy = this.candies[nr][c]
                            if (candy.filter) {this.boom.add(candy)}
                            else {this.news.add(candy)}
                        }
                    });
                    break;
                case 2:
                    console.log(22222)
                    var range = [-2, -1, 1, 2];
    
                    range.forEach(dc => {
                        var nc = c + dc;
                        if (nc >= 0 && nc < this.gridSize.x) {
                            var candy = this.candies[r][nc]
                            if (candy.filter) {this.boom.add(candy)}
                            else {this.news.add(candy)}
                        }
                    });
                    break;
                case 3:
                    console.log(33333)
                    var directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
                    directions.forEach(([dr, dc]) => {
                        var nr = r + dr, nc = c + dc;
                        if (nr>=0&&nr < this.gridSize.y && nc>=0 &&nc< this.gridSize.x){
                            var candy = this.candies[nr][nc]
                            if (candy.filter) {this.boom.add(candy)}
                            else {this.news.add(candy)}
                        }
                    });
                    break;
                // default:
            }
              
        })
        this.boom = [...this.boom]
        this.news = [...this.news]
        console.log(this.boom, this.news)
    }
    handleCheckNear(select, select2) {
        const dx = Math.abs(select.x - select2.x);
        const dy = Math.abs(select.y - select2.y);

        const isAdjacent = (dx === this.candySize && dy === 0) || (dy === this.candySize && dx === 0);

        return isAdjacent;
    }
    reloadCandy() {
        this.candies.forEach((match) => {
            match.forEach((candy) => {
                if (candy.row >= this.numRow) {
                    this.candies[candy.row][candy.col] = null;
                    this.overlays[candy.row][candy.col].setTexture('none')
                    candy.destroy();
                }
            });
        });
        this.refillCandies();
    }
    findMatches() {
        const grid = this.candies;
        const matches = [];
        const numRows = grid.length;
        const numCols = grid[0].length;
        var candyExplosionArr = new Set()
    for (let r = 0; r < numRows; r++) {meme(numCols, grid[r])} // Kiểm tra hàng
    for (let c = 0; c < numCols; c++) {meme(numRows, grid.map(row => row[c]))} // Kiểm tra cột

    // Hàm chung để kiểm tra hàng hoặc cột
    function meme(length, line) {
        let candy1 = line[0], array = [candy1];
        for (let i = 1; i < length; i++) {
            let candy2 = line[i];
            if (candy1.candyType == candy2.candyType) {
                array.push(candy2); 
            } else {
                if (array.length >= 3) {
                    matches.push(array)
                    array.forEach(i=>{ i.filter? candyExplosionArr.add(i):0 })
                }
                candy1 = candy2; array = [candy1];
            }
        }
        if (array.length >= 3)  {
            matches.push(array)
            array.forEach(i=>{ i.filter? candyExplosionArr.add(i):0 })
        }
    }

    // --------------------------------
    // Phần II: các viên cờ giao nhau thì sẽ tạo thành ô 3x. nổ 4 viên chéo kề cạnh nó
        if (matches.length > 0) {
            this.checkBoom(matches);

            if (candyExplosionArr.size > 0) {
                candyExplosionArr = [...candyExplosionArr]
                this.candyExplosion(candyExplosionArr)
                return matches.concat(this.news)
            }
        }
        return matches;
    }
    checkBoom(matches) {
        const prepareBoom = (row, col, filter) => { // Arrow function để giữ ngữ cảnh this
            const type = this.candies[row][col].candyType
            // const filterX = filter === 1 ? 'Doc' : type === 2 ? 'Ngang' : '3x3';
            this.filterPicArray.push({ filter: filter, row: row, col: col, type: type})
        }
        // các viên cờ giao nhau thì sẽ tạo thành ô 3x. nổ 4 viên chéo kề cạnh nó
        let intersectionCandy = new Set()
        // 3x:     
        for (let i = 0; i < matches.length; i++) {
            for (let j = i + 1; j < matches.length; j++) {
                matches[i].forEach(obj1 => {
                    if (matches[j].some(obj2 =>
                        obj2.col === obj1.col && obj2.row === obj1.row
                    )) {
                        intersectionCandy.add(obj1); // Đẩy đối tượng trùng vào mảng
                    } 
                });
            }
        }
        let intersectionArray = [...intersectionCandy] 
        intersectionArray.forEach(tile => prepareBoom(tile.row, tile.col, 3));

        // --------------------------------------
        // Phần III: xem tạo đc bao nhiêu viên 4x
        var array4x = []
        array4x = matches.filter(array => array.length >= 4);
        array4x.forEach(array => {
            let duplicate = array.some(candy => intersectionArray.includes(candy));
            if (!duplicate) { // trùng thì bỏ
                // sẽ tạo ra viên 4x ở nơi mình vừa ghép
                let checkTiles = [this.selectedCandy, this.selectedCandy2]
                    .filter(tile => array.includes(tile));
                let tileToChange = checkTiles.length > 0 ? checkTiles[0]
                    : array[Math.floor(Math.random() * array.length)];
                // số truyền vào=       1:dọc, 2: ngang, 3: 3x
                var a = array[0].row, b = array[1].row
                prepareBoom(tileToChange.row, tileToChange.col, a == b ? 1 : 2)
            }
        });
    }
    filterOverlay() {
        this.filterPicArray.forEach(i=>{
            const type = i.type, row = i.row, col = i.col, filter = i.filter
            const candy = this.scene.add
                    .sprite(col * this.candySize, row * this.candySize, 'candies', type)
                    .setOrigin(0)
                    .setScale(this.candyScale)
                    .setInteractive()
                    .setDepth(0)


            candy.candyType = type; candy.row = row; candy.col = col;

            this.candies[row][col] = candy;
            candy.filter = filter
            candy.state = 'exploded'
            this.overlays[row][col].setTexture('filters', filter)


            // const filterX = this.scene.add
            // .sprite(col * this.candySize, row * this.candySize, 'filters', filter)
            // .setOrigin(0)
            // .setScale(this.candyScale)
            // .disableInteractive()
            // .setDepth(1);
            // filterX.row = row; filterX.col = col;
            // this.overlays[row][col] = filterX;
        
            // this.addAt(filterX, 0);
            this.addAt(candy, 0);
        })
        this.filterPicArray = []
    }
    checkMatches() {
        let matches = this.findMatches();
        this.news = new Set()
        if (matches.length > 0) {
            this.handleMatches(matches);
        } else {
            let foundCanyMatch = this.canSwapAndMatch();

            while (foundCanyMatch.length == 0) {
                if (foundCanyMatch.length == 0) {
                    this.reloadCandy();
                    foundCanyMatch = this.canSwapAndMatch();
                }
            }
            if (!this.isAnimation && !this.isMyTurn) {
                console.log('Máy 1');

                const swap = foundCanyMatch[foundCanyMatch.length - 1];
                setTimeout(() => {
                    this.swapCandies(swap[0], swap[1]);
                    this.isMyTurn = true;
                }, 1000);
            }

            if (!this.isAnimation && this.isMyTurn && window.auto) {
                console.log('Máy 2');

                const swap = foundCanyMatch[foundCanyMatch.length - 1];
                setTimeout(() => {
                    this.swapCandies(swap[0], swap[1]);
                    this.isMyTurn = false;
                }, 1000);
            }
        }
    }
    handleMatches(matches) {
        matches.forEach((match) => {
            if (Array.isArray(match)) {
                match.forEach((candy) => {
                    this.createExplosion(candy.x, candy.y)
                    candy.destroy();
                    this.overlays[candy.row][candy.col].setTexture('none')
                    this.candies[candy.row][candy.col] = null;
                });
            } else {
                this.createExplosion(match.x, match.y)
                match.destroy();
                this.overlays[match.row][match.col].setTexture('none')
                this.candies[match.row][match.col] = null;
            }
        });
        if (this.boom.length > 0) {
            var matches = this.boom
            this.candyExplosion(this.boom)
            matches.concat(this.news)
            this.handleMatches(matches)
        } 
        else {
            setTimeout(() => {
                if (this.filterPicArray.length > 0) this.filterOverlay()
                this.refillCandies()  // Gọi hàm refill sau 300ms
            }, 300);
        }
    }
    canSwapAndMatch() {
        const grid = this.candies;
        const numRows = grid.length;
        const numCols = grid[0].length;
        const possibleSwaps = [];
       
        // Hàm kiểm tra nhóm match trong lưới sau khi đổi chỗ
        const checkMatch = (row, col) => {
            const currentType = grid[row][col].candyType;
            // Kiểm tra hàng ngang
            let countHorizontal = 1;
            let startCol = col;
            let endCol = col;

            for (let i = col - 1; i >= 0 && grid[row][i].candyType === currentType; i--) {
                countHorizontal++;
                startCol = i;
            }
            for (let i = col + 1; i < numCols && grid[row][i].candyType === currentType; i++) {
                countHorizontal++;
                endCol = i;
            }

            // Kiểm tra cột dọc
            let countVertical = 1;
            let startRow = row;
            let endRow = row;

            for (let i = row - 1; i >= this.numRow && grid[i][col].candyType === currentType; i--) {
                countVertical++;
                startRow = i;
            }
            for (let i = row + 1; i < numRows && grid[i][col].candyType === currentType; i++) {
                countVertical++;
                endRow = i;
            }

            // Chỉ trả về true nếu nhóm match nằm từ hàng 5 trở đi
            return (countHorizontal >= 3 && startCol >= 0) || (countVertical >= 3 && startRow >= 5);
        };

        // Thử đổi các cặp khối liền kề
        for (let row = this.numRow; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                // Đổi chỗ với khối bên phải
                if (col < numCols - 1) {
                    [grid[row][col], grid[row][col + 1]] = [grid[row][col + 1], grid[row][col]];

                    if (checkMatch(row, col) || checkMatch(row, col + 1)) {
                        possibleSwaps.push([
                            { row: row, col: col },
                            { row: row, col: col + 1 },
                        ]);
                    }

                    // Đổi lại chỗ sau khi kiểm tra
                    [grid[row][col], grid[row][col + 1]] = [grid[row][col + 1], grid[row][col]];
                }

                // Đổi chỗ với khối phía dưới
                if (row < numRows - 1) {
                    [grid[row][col], grid[row + 1][col]] = [grid[row + 1][col], grid[row][col]];

                    if (checkMatch(row, col) || checkMatch(row + 1, col)) {
                        possibleSwaps.push([
                            { row: row, col: col },
                            { row: row + 1, col: col },
                        ]);
                    }

                    // Đổi lại chỗ sau khi kiểm tra
                    [grid[row][col], grid[row + 1][col]] = [grid[row + 1][col], grid[row][col]];
                }
            }
        }

        return possibleSwaps;
    }
   

    swapCandies(posC1, posC2, one = false) {
      
        const candy1 = this.candies[posC1.row][posC1.col];
        const candy2 = this.candies[posC2.row][posC2.col];
        // đổi filter
        const filter1 = this.overlays[posC1.row][posC1.col]
        const filter2 = this.overlays[posC2.row][posC2.col]
        const tempNameFilter1 = filter1.texture.key
        const tempNameFilter2 = filter2.texture.key
        if (tempNameFilter1 == "filters" || tempNameFilter2 == "filters") {
            // Lấy frame
            // console.log('start')
            // console.log(filter1.texture.key, filter1.row, filter1.col, filter1.x, filter1.y, 'before', 
                // filter2.texture.key, filter2.row, filter2.col, filter2.x, filter2.y)
            const tempFrame1 = filter1.frame.name == '__BASE' ? 0: filter1.frame.name
            const tempFrame2 = filter2.frame.name == '__BASE' ? 0: filter2.frame.name
            // Cập nhật row và col trước tiên
            const tempRow = filter1.row, tempCol = filter1.col; 
            filter1.row = filter2.row; filter1.col = filter2.col; 
            filter2.row = tempRow; filter2.col = tempCol
           
            // filter1.setTexture(tempNameFilter2, tempFrame2)
            // filter2.setTexture(tempNameFilter1, tempFrame1)

            // Cập nhật thứ tự trong lưới
            let temp = this.overlays[filter1.row][filter1.col];
            this.overlays[filter1.row][filter1.col] = this.overlays[filter2.row][filter2.col];
            this.overlays[filter2.row][filter2.col] = temp;
            // console.log(filter1.texture.key, filter1.row, filter1.col, filter1.x, filter1.y, 
                // 'after', filter2.texture.key, filter2.row, filter2.col, filter2.x, filter2.y)
            
            this.scene.tweens.add({
                targets: filter1,
                x: filter1.col * this.candySize,
                y: filter1.row * this.candySize,
                duration: this.smoot / 2,
            });
    
            this.scene.tweens.add({
                targets: filter2,
                x: filter2.col * this.candySize,
                y: filter2.row * this.candySize,
                duration: this.smoot / 2,
            });
        }
        

        // Đổi vị trí
        const tempRow = candy1.row, tempCol = candy1.col; 
        candy1.row = candy2.row; candy1.col = candy2.col; 
        candy2.row = tempRow; candy2.col = tempCol

       

        // Cập nhật vị trí trên màn hình
        let temp = this.candies[filter1.row][filter1.col];
this.candies[filter1.row][filter1.col] = this.candies[filter2.row][filter2.col];
this.candies[filter2.row][filter2.col] = temp;
        // console.log(filter1.texture.key, filter2.texture.key)
        // ----------------

        this.scene.tweens.add({
            targets: candy1,
            x: candy1.col * this.candySize,
            y: candy1.row * this.candySize,
            duration: this.smoot / 2,
            onComplete: () => {
                this.isAnimation = false;
                this.candyActive.setVisible(false);
                const found = this.findMatches();
                this.news = new Set()
                if (found.length == 0 && !one) {
                    this.swapCandies(candy2, candy1, true);
                    this.isMyTurn = true;
                    return;
                }
                
                // console.log(filter1.texture.key, filter1.row, filter1.col, filter2.texture.key)
                this.selectedCandy =null; this.selectedCandy2 = null
            // console.log('end')

                this.checkMatches();
            },
            onStart: () => {
                this.isAnimation = true;
            },
        });

        this.scene.tweens.add({
            targets: candy2,
            x: candy2.col * this.candySize,
            y: candy2.row * this.candySize,
            duration: this.smoot / 2,
        });

    }

    refillCandies() {
        for (let col = 0; col < this.gridSize.x; col++) {
            let emptySpaces = 0;
            for (let row = this.gridSize.y - 1; row >= 0; row--) {
                if (this.candies[row][col] === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    this.candies[row + emptySpaces][col] = this.candies[row][col];
                    this.candies[row + emptySpaces][col].row = row + emptySpaces;
                    this.candies[row][col] = null; 

                    const filter1 = this.overlays[row][col]
                    const filter2 = this.overlays[row + emptySpaces][col]
                    // if (col == 2 && row == 3) {
                    //     console.log('start')
                    //     console.log(`trên row: ${filter1.row}: ${filter1.col}`)
                    //     console.log(`dưới: ${filter2.row}: ${filter2.col}`)
                    //     console.log(`filter: ${filter1.texture.key}: ${filter2.texture.key}`)
                    // }
                    const tempRow = filter1.row, tempCol = filter1.col; 
                    filter1.row = filter2.row; filter1.col = filter2.col; 
                    filter2.row = tempRow; filter2.col = tempCol
                    // ---------------
                      // Cập nhật row và col trước tiên
                    let temp = this.overlays[filter1.row][filter1.col];
                    this.overlays[filter1.row][filter1.col] = this.overlays[filter2.row][filter2.col];
                    this.overlays[filter2.row][filter2.col] = temp;
                    // if (col == 2 && row == 3) {
                    //     console.log('end',)
                    //     console.log(`trên row: ${filter1.row}: ${filter1.col}`)
                    //     console.log(`dưới: ${filter2.row}: ${filter2.col}`)
                    //     console.log(`filter: ${filter1.texture.key}: ${filter2.texture.key}`)
                    // }

                    this.scene.tweens.add({
                        targets: this.candies[row + emptySpaces][col],
                        y: (row + emptySpaces) * this.candySize,
                        duration: this.smoot,
                    });
                    this.scene.tweens.add({
                        targets: this.overlays[row][col],
                        y: (row) * this.candySize,
                        duration: this.smoot,
                    });
                    this.scene.tweens.add({
                        targets: this.overlays[row + emptySpaces][col],
                        y: (row + emptySpaces) * this.candySize,
                        duration: this.smoot,
                    });
                }
            }
            for (let row = 0; row < emptySpaces; row++) {
                const type = Phaser.Math.Between(0, 5);
                const candy = this.scene.add
                    .sprite(col * this.candySize, row * this.candySize, 'candies', type)
                    .setOrigin(0)
                    .setScale(this.candyScale)
                    .setInteractive()
                    .setDepth(0)

                candy.candyType = type;
                candy.row = row;
                candy.col = col;
                candy.filter = false
                candy.state = 'exploded'
                this.candies[row][col] = candy;

                // const filter = this.scene.add
                //     .sprite(col * this.candySize, row * this.candySize, 'none', 0)
                //     .setOrigin(0)
                //     .setScale(this.candyScale)
                //     .disableInteractive()
                //     .setDepth(1);
                // filter.row = row; filter.col = col;
                // this.overlays[row][col] = filter;
                
                // -------------------
                this.scene.tweens.add({
                    targets: candy,
                    y: candy.row * this.candySize,
                    duration: this.smoot,
                    onStart: () => {
                        this.isAnimation = true;
                    },
                    onComplete: () => {
                        this.isAnimation = false;
                    },
                });
                this.addAt(candy, 0);
                // this.addAt(filter, 0);
            }
        }
        this.scene.time.delayedCall(500, this.checkMatches, [], this);
    }
    static preload(scene) {
        scene.load.spritesheet('candies', 'img/ches.png', {
            frameWidth: Broad.candySize,
            frameHeight: Broad.candySize,
        });
        scene.load.spritesheet('filters', 'img/filter.png', {
            frameWidth: Broad.candySize,
            frameHeight: Broad.candySize,
        });
        scene.load.image('particle', 'img/a.png');
        scene.load.image('none', 'img/none.png');
    }



    
}




//Scene
class MenuScene extends Phaser.Scene {
    static broad 
    constructor() {
        super('MenuScene');
    }

    preload() {
        Broad.preload(this);
    }

    create() {
        this.arrCandy = [];
        const rows = 11;
        const cols = 8;

        // Tạo mảng ngẫu nhiên
        for (let i = 0; i < rows; i++) {
            this.arrCandy[i] = [];
            for (let j = 0; j < cols; j++) {
                this.arrCandy[i][j] = Phaser.Math.Between(0, 5);
            }
        }

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        MenuScene.broad = new Broad({ scene: this, x: centerX, y: centerY, initBoard: this.arrCandy });
    }

    update(time) {}
}




const config = {
    type: Phaser.AUTO,
    width: 720,
    height: 1280,
    parent: 'app',
    backgroundColor: 'red',
    // backgroundColor: '#1a1a1a',
    //backgroundColor: '#f3f3f3',
    dom: { createContainer: true },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        default: 'matter',
        matter: {
            gravity: { y: 0 },
            enableSleep: true,
            debug: true,
        },
        arcade: {
            gravity: { y: 1 },
            enableSleep: true,
            debug: false,
        },
    },
    scene: MenuScene,
};

const game = new Phaser.Game(config);