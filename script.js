document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const gridSizeInput = document.getElementById('grid-size');
    const generateGridButton = document.getElementById('generate-grid');
    const bgColorInput = document.getElementById('bg-color');
    const cellColorInput = document.getElementById('cell-color');
    const highlightColorInput = document.getElementById('highlight-color');
    const moveUpButton = document.getElementById('move-up');
    const moveDownButton = document.getElementById('move-down');
    const moveLeftButton = document.getElementById('move-left');
    const moveRightButton = document.getElementById('move-right');
    const timerDisplay = document.getElementById('timer');
    const errorCountDisplay = document.getElementById('error-count');
    const rankingsList = document.getElementById('rankings-list');
    const startHint = document.getElementById('start-hint');

    let gridSize = parseInt(gridSizeInput.value);
    let numbers = [];
    let currentNumber = 1;
    let startTime = null;
    let timerInterval = null;
    let errorCount = 0;
    let rankings = JSON.parse(localStorage.getItem('rankings')) || [];
    let isTimerStarted = false; // 标记计时器是否已启动

    function generateGrid() {
        gridContainer.innerHTML = '';
        gridSize = parseInt(gridSizeInput.value); // 获取用户输入的网格大小
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
        gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 60px)`;

        numbers = Array.from({ length: gridSize * gridSize }, (_, i) => i + 1);
        numbers.sort(() => Math.random() - 0.5);

        numbers.forEach((number, index) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = number;
            cell.style.backgroundColor = cellColorInput.value;
            cell.addEventListener('click', () => handleCellClick(number));
            gridContainer.appendChild(cell);
        });

        currentNumber = 1;
        errorCount = 0;
        errorCountDisplay.textContent = errorCount;
        isTimerStarted = false; // 重置计时器状态
        startHint.style.display = 'block'; // 显示提示信息
        timerDisplay.textContent = '00:00:000'; // 重置计时器显示
    }

    function handleCellClick(number) {
        if (!isTimerStarted && number === 1) {
            startTimer(); // 按下数字 1 开始计时
            isTimerStarted = true;
            startHint.style.display = 'none'; // 隐藏提示信息
        }

        if (number === currentNumber) {
            const cell = gridContainer.querySelector(`.cell:nth-child(${numbers.indexOf(number) + 1})`);
            cell.style.backgroundColor = highlightColorInput.value;
            currentNumber++;

            // 如果按下最大数字，结束计时并记录时间
            if (number === gridSize * gridSize) {
                stopTimer();
                const time = timerDisplay.textContent;
                rankings.push(time);
                rankings.sort((a, b) => {
                    const [aMin, aSec, aMs] = a.split(':').map(Number);
                    const [bMin, bSec, bMs] = b.split(':').map(Number);
                    return (aMin * 60 + aSec) * 1000 + aMs - ((bMin * 60 + bSec) * 1000 + bMs);
                });
                localStorage.setItem('rankings', JSON.stringify(rankings));
                updateRankings();
                resetTimer(); // 计时器归零
            }
        } else {
            errorCount++;
            errorCountDisplay.textContent = errorCount;
        }
    }

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 10);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function resetTimer() {
        stopTimer();
        timerDisplay.textContent = '00:00:000'; // 计时器归零
    }

    function updateTimer() {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const milliseconds = elapsed % 1000;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
    }

    function updateRankings() {
        rankingsList.innerHTML = '';
        rankings.forEach((time, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${time}`;
            rankingsList.appendChild(li);
        });
    }

    generateGridButton.addEventListener('click', generateGrid);
    bgColorInput.addEventListener('input', () => {
        document.body.style.backgroundColor = bgColorInput.value;
    });
    cellColorInput.addEventListener('input', () => {
        gridContainer.querySelectorAll('.cell').forEach(cell => {
            cell.style.backgroundColor = cellColorInput.value;
        });
    });
    highlightColorInput.addEventListener('input', () => {
        // No immediate effect, but will be used when cells are clicked
    });

    generateGrid();
    updateRankings();
});