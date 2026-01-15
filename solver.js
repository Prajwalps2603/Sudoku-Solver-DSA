// Main Sudoku Solver Class
class SudokuSolver {
    constructor() {
        this.grid = null;
        this.backtracks = 0;
        this.selectedCell = null;
        this.startTime = null;
        this.isSolving = false;
        this.solvingSpeed = 10; // ms delay for visualization
        
        this.initGrid();
        this.setupEventListeners();
        this.updateEmptyCells();
    }

    // Initialize the Sudoku grid
    initGrid() {
        const grid = document.getElementById("sudoku-grid");
        grid.innerHTML = '';
        
        for (let i = 0; i < 81; i++) {
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = "1";
            input.classList.add("cell");
            input.id = `cell-${i}`;
            
            // Calculate row and column for reference
            const row = Math.floor(i / 9);
            const col = i % 9;
            input.dataset.row = row;
            input.dataset.col = col;
            
            input.addEventListener("input", (e) => this.handleInput(e, i));
            input.addEventListener("focus", () => this.handleFocus(i));
            input.addEventListener("keydown", (e) => this.handleKeyDown(e, i));
            
            grid.appendChild(input);
        }
    }

    // Handle cell input
    handleInput(e, index) {
        if (!/^[1-9]$/.test(e.target.value)) {
            e.target.value = "";
            e.target.classList.remove("user-input", "error");
        } else {
            const value = parseInt(e.target.value);
            if (this.validateCellInput(index, value)) {
                e.target.classList.add("user-input");
                e.target.classList.remove("error");
                
                // Auto-advance to next cell
                setTimeout(() => {
                    if (index < 80) {
                        document.getElementById(`cell-${index + 1}`).focus();
                    }
                }, 50);
            } else {
                // Invalid input
                e.target.classList.add("error");
                setTimeout(() => {
                    e.target.value = "";
                    e.target.classList.remove("error");
                }, 800);
            }
        }
        this.updateEmptyCells();
    }

    // Handle cell focus
    handleFocus(index) {
        if (this.isSolving) return;
        
        if (this.selectedCell) {
            this.selectedCell.classList.remove("selected");
        }
        
        const cell = document.getElementById(`cell-${index}`);
        cell.classList.add("selected");
        this.selectedCell = cell;
        
        this.highlightRelatedCells(index);
    }

    // Handle keyboard navigation
    handleKeyDown(e, index) {
        let nextIndex = index;
        
        switch(e.key) {
            case 'ArrowRight':
                nextIndex = (index % 9 === 8) ? index : index + 1;
                break;
            case 'ArrowLeft':
                nextIndex = (index % 9 === 0) ? index : index - 1;
                break;
            case 'ArrowDown':
                nextIndex = (index + 9 > 80) ? index : index + 9;
                break;
            case 'ArrowUp':
                nextIndex = (index - 9 < 0) ? index : index - 9;
                break;
            case 'Backspace':
            case 'Delete':
                e.preventDefault();
                this.clearCell(index);
                break;
            case ' ':
                e.preventDefault();
                this.clearCell(index);
                break;
            default:
                if (e.key >= '1' && e.key <= '9') {
                    const value = parseInt(e.key);
                    if (this.validateCellInput(index, value)) {
                        const cell = document.getElementById(`cell-${index}`);
                        cell.value = e.key;
                        cell.classList.add("user-input");
                        cell.classList.remove("error");
                        this.updateEmptyCells();
                        
                        // Add animation
                        cell.classList.add("solved");
                        setTimeout(() => cell.classList.remove("solved"), 300);
                        
                        // Auto-advance
                        nextIndex = (index % 9 === 8) ? index : index + 1;
                    } else {
                        // Invalid input
                        const cell = document.getElementById(`cell-${index}`);
                        cell.classList.add("error");
                        setTimeout(() => cell.classList.remove("error"), 800);
                    }
                }
        }
        
        // Navigate if index changed
        if (nextIndex !== index && nextIndex >= 0 && nextIndex < 81) {
            e.preventDefault();
            document.getElementById(`cell-${nextIndex}`).focus();
        }
    }

    // Validate cell input against Sudoku rules
    validateCellInput(index, value) {
        const board = this.getBoard();
        const row = Math.floor(index / 9);
        const col = index % 9;
        
        // Temporarily remove the value to check
        const temp = board[row][col];
        board[row][col] = 0;
        
        // Check if value is valid
        const isValid = this.isSafe(board, row, col, value);
        
        // Restore original value
        board[row][col] = temp;
        
        return isValid;
    }

    // Highlight related cells (row, column, 3x3 block)
    highlightRelatedCells(index) {
        // Remove previous highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('highlight-row', 'highlight-col', 'highlight-block');
        });
        
        const row = Math.floor(index / 9);
        const col = index % 9;
        
        // Highlight row
        for (let c = 0; c < 9; c++) {
            const cell = document.getElementById(`cell-${row * 9 + c}`);
            if (cell !== this.selectedCell) {
                cell.classList.add('highlight-row');
            }
        }
        
        // Highlight column
        for (let r = 0; r < 9; r++) {
            const cell = document.getElementById(`cell-${r * 9 + col}`);
            if (cell !== this.selectedCell) {
                cell.classList.add('highlight-col');
            }
        }
        
        // Highlight 3x3 block
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;
        
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const cell = document.getElementById(`cell-${(blockRow + r) * 9 + (blockCol + c)}`);
                if (cell !== this.selectedCell) {
                    cell.classList.add('highlight-block');
                }
            }
        }
    }

    // Get current board state from UI
    getBoard() {
        const cells = document.querySelectorAll(".cell");
        let board = Array(9).fill().map(() => Array(9).fill(0));
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let value = cells[i * 9 + j].value;
                board[i][j] = value === "" ? 0 : parseInt(value);
            }
        }
        return board;
    }

    // Update board UI
    setBoard(board) {
        const cells = document.querySelectorAll(".cell");
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = cells[i * 9 + j];
                const value = board[i][j];
                
                if (value !== 0 && cell.value === "") {
                    cell.value = value;
                    cell.classList.add("solved", "user-input");
                    
                    // Staggered animation
                    setTimeout(() => {
                        cell.classList.remove("solved");
                    }, 50 + (i * 10 + j * 5));
                }
            }
        }
        this.updateEmptyCells();
    }

    // Update empty cells counter
    updateEmptyCells() {
        const cells = document.querySelectorAll(".cell");
        let emptyCount = 0;
        cells.forEach(cell => {
            if (cell.value === "") emptyCount++;
        });
        document.getElementById("empty-cells").textContent = emptyCount;
    }

    // Clear specific cell
    clearCell(index) {
        if (this.isSolving) return;
        
        const cell = document.getElementById(`cell-${index}`);
        cell.value = "";
        cell.classList.remove("user-input", "error", "solved");
        this.updateEmptyCells();
        
        if (index === parseInt(this.selectedCell?.id.split('-')[1])) {
            this.highlightRelatedCells(index);
        }
    }

    // Clear entire grid
    clearGrid() {
        if (this.isSolving) return;
        
        document.querySelectorAll(".cell").forEach(cell => {
            cell.value = "";
            cell.classList.remove("user-input", "solved", "error");
        });
        
        this.updateEmptyCells();
        document.getElementById("backtracks").textContent = "0";
        document.getElementById("time-taken").textContent = "0";
        
        if (this.selectedCell) {
            this.selectedCell.focus();
        }
    }

    // Reset grid to initial state
    resetGrid() {
        this.clearGrid();
        document.getElementById("cell-0").focus();
    }

    // Input number from number pad
    inputNumber(num) {
        if (this.selectedCell && !this.isSolving) {
            const index = parseInt(this.selectedCell.id.split('-')[1]);
            
            if (this.validateCellInput(index, num)) {
                this.selectedCell.value = num;
                this.selectedCell.classList.add("user-input", "solved");
                this.selectedCell.classList.remove("error");
                
                setTimeout(() => {
                    this.selectedCell.classList.remove("solved");
                    // Move to next cell
                    if (index < 80) {
                        document.getElementById(`cell-${index + 1}`).focus();
                    }
                }, 200);
                
                this.updateEmptyCells();
            } else {
                this.selectedCell.classList.add("error");
                setTimeout(() => this.selectedCell.classList.remove("error"), 800);
            }
        }
    }

    // Clear current cell from number pad
    clearCurrentCell() {
        if (this.selectedCell && !this.isSolving) {
            const index = parseInt(this.selectedCell.id.split('-')[1]);
            this.clearCell(index);
        }
    }

    // Main solve function
    async solveSudoku() {
        if (this.isSolving) return;
        
        const board = this.getBoard();
        this.backtracks = 0;
        this.startTime = performance.now();
        this.isSolving = true;
        
        // Disable input during solving
        document.querySelectorAll('.cell, .action-btn, .num-btn').forEach(element => {
            element.style.pointerEvents = 'none';
            if (element.classList.contains('action-btn')) {
                element.style.opacity = '0.7';
            }
        });
        
        // Validate board first
        if (this.isValidBoard(board)) {
            if (await this.solve(board)) {
                const endTime = performance.now();
                document.getElementById("time-taken").textContent = Math.round(endTime - this.startTime);
                this.setBoard(board);
            } else {
                alert("No solution exists for this puzzle!");
            }
        } else {
            alert("Invalid Sudoku puzzle! Please check your numbers.");
        }
        
        // Re-enable input
        document.querySelectorAll('.cell, .action-btn, .num-btn').forEach(element => {
            element.style.pointerEvents = '';
            if (element.classList.contains('action-btn')) {
                element.style.opacity = '1';
            }
        });
        
        this.isSolving = false;
    }

    // Validate entire board
    isValidBoard(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] !== 0) {
                    const num = board[i][j];
                    board[i][j] = 0;
                    
                    if (!this.isSafe(board, i, j, num)) {
                        board[i][j] = num;
                        return false;
                    }
                    
                    board[i][j] = num;
                }
            }
        }
        return true;
    }

    /* =======================
       BACKTRACKING ALGORITHM
    ======================= */

    // Main backtracking solver with visualization
    async solve(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isSafe(board, row, col, num)) {
                            board[row][col] = num;
                            
                            // Visual update
                            const cellId = row * 9 + col;
                            const cell = document.getElementById(`cell-${cellId}`);
                            cell.value = num;
                            cell.classList.add("solved", "user-input");
                            await this.sleep(this.solvingSpeed);
                            
                            if (await this.solve(board)) return true;
                            
                            // Backtrack
                            board[row][col] = 0;
                            this.backtracks++;
                            document.getElementById("backtracks").textContent = this.backtracks;
                            cell.value = "";
                            cell.classList.remove("solved");
                            await this.sleep(this.solvingSpeed);
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Check if number is safe to place
    isSafe(board, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) return false;
        }

        // Check 3x3 box
        let startRow = row - row % 3;
        let startCol = col - col % 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num) return false;
            }
        }

        return true;
    }

    // Utility function for delay
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Setup event listeners
    setupEventListeners() {
        // Solve button
        document.getElementById('solve-btn').addEventListener('click', () => {
            this.solveSudoku();
        });
        
        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearGrid();
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGrid();
        });
        
        // Clear cell button
        document.getElementById('clear-cell-btn').addEventListener('click', () => {
            this.clearCurrentCell();
        });
        
        // Number pad buttons
        document.querySelectorAll('.num-btn[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                const number = parseInt(button.dataset.number);
                this.inputNumber(number);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to solve
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.solveSudoku();
            }
            // Ctrl/Cmd + R to reset
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.resetGrid();
            }
            // Ctrl/Cmd + C to clear
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                this.clearGrid();
            }
        });
    }
}

// Initialize the application whether loaded before or after DOMContentLoaded
function initializeSudokuApp() {
    const solver = new SudokuSolver();

    // Focus first cell
    setTimeout(() => {
        const first = document.getElementById('cell-0');
        if (first) first.focus();
    }, 100);

    // Add initial animations
    setTimeout(() => {
        document.querySelectorAll('.cell').forEach((cell, index) => {
            cell.style.animation = `slideIn 0.3s ease ${index * 0.01}s both`;
        });
    }, 200);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSudokuApp);
} else {
    // DOM is already ready (e.g., script injected after initial load)
    initializeSudokuApp();
}