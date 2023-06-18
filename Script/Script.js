class SnakeGame {
    constructor() {
        //Установка размеров поля, создание змейки, яблока, очков, рекорда и кнопки перезапуска игры
      this.boardSize = 10;
      this.snake = new Snake();
      this.apple = new Apple();
      this.score = 0;
      this.record = localStorage.getItem('record') || 0; //Получаем рекордный счет из локального хранилища
      this.gameBoard = document.getElementById('game-board');
      this.scoreElement = document.getElementById('score');
      this.recordElement = document.getElementById('record');
      this.restartButton = document.getElementById('restart-button');
      this.intervalId = null;

    //Рендеринг игрового поля, змейки, яблока счета и рекорда
      this.renderBoard();
      this.renderSnake();
      this.renderApple();
      this.renderScore();
      this.renderRecord();

    //Обработчик событий при нажатии кнопки перезапуска игры
      this.restartButton.addEventListener('click', () => { 
        this.restartGame();
      });

    //Обработчик события нажатия клавиш на клавиатуре
      document.addEventListener('keydown', (event) => {
        this.handleKeyPress(event);
      });
  
      this.startGame();
    }

    //Рендеринг игрового поля
    renderBoard() {
      for (let row = 0; row < this.boardSize; row++) {
        for (let col = 0; col < this.boardSize; col++) {
          const cell = document.createElement('div');
          cell.dataset.row = row;
          cell.dataset.col = col;
          this.gameBoard.appendChild(cell);
        }
      }
    }
  
    //Рендеринг змейки
    renderSnake() {
      const snakeBody = this.snake.getBody();
      snakeBody.forEach((segment) => {
        const { row, col } = segment;
        const cell = this.getCellElement(row, col);
        cell.classList.add('snake');
      });
    }
  
    //Рендеринг яблока
    renderApple() {
      const { row, col } = this.apple.getPosition();
      const cell = this.getCellElement(row, col);
      cell.classList.add('apple');
    }
  
    //Рендеринг счета
    renderScore() {
      this.scoreElement.textContent = `Score: ${this.score}`;
    }
  
    //Рендеринг рекорда
    renderRecord() {
      this.recordElement.textContent = `Record: ${this.record}`;
    }
  
    //Очистка игрового поля
    clearBoard() {
      const cells = document.querySelectorAll('#game-board div');
      cells.forEach((cell) => {
        cell.className = '';
      });
    }
  
    //Обновление игрового поля (очистка, рендеринг змейки, яблока и счета)
    updateBoard() {
      this.clearBoard();
      this.renderSnake();
      this.renderApple();
      this.renderScore();
    }
  
    //Получение элемента ячейки по указанным координатам
    getCellElement(row, col) {
      return document.querySelector(`#game-board div[data-row="${row}"][data-col="${col}"]`);
    }
  
    // Запуск игры (старт интервала игрового цикла)
    startGame() {
      this.intervalId = setInterval(() => {
        this.snake.move();
        this.checkCollision();
        this.updateBoard();
      }, 500);
    }
  
    //Конец игры
    gameOver() {
      clearInterval(this.intervalId); //Остановка игрового цикла
      if (this.score > this.record) { 
        this.record = this.score;
        localStorage.setItem('record', this.record);
      }
      this.renderRecord();
      this.restartButton.style.display = 'block';
    }
  
    //Перезапуск игры (сброс данных, рендеринг змейки, яблока, счета, скрытие кнопки перезапуска)
    restartGame() {
      this.score = 0;
      this.snake.reset();
      this.clearBoard();
      this.renderSnake();
      this.apple.generateNewPosition(this.snake.getBody());
      this.renderApple();
      this.renderScore();
      this.restartButton.style.display = 'none';
      this.startGame();
    }
  
    //Обработчик нажатия клавиш 
    handleKeyPress(event) {
      const key = event.key;

      //Установка нового направления в зависимости от нажатой клавиши 
      if (key === 'ArrowUp' && this.snake.getDirection() !== 'down') {
        this.snake.setDirection('up');
      } else if (key === 'ArrowDown' && this.snake.getDirection() !== 'up') {
        this.snake.setDirection('down');
      } else if (key === 'ArrowLeft' && this.snake.getDirection() !== 'right') {
        this.snake.setDirection('left');
      } else if (key === 'ArrowRight' && this.snake.getDirection() !== 'left') {
        this.snake.setDirection('right');
      }
    }
  
    //Проверка столкновений 
    checkCollision() {
      const head = this.snake.getHead();
      const { row, col } = head;
  
      //Проверка столкновения с границами игрового поля
      if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
        this.gameOver();
        return;
      }
  
      //Проверка столкновеняи змейки самой с собой 
      if (this.snake.isBodySegment(row, col)) {
        this.gameOver();
        return;
      }
  
      //Проверка столкновения с яблоком
      if (this.apple.getPosition().row === row && this.apple.getPosition().col === col) {
        this.snake.grow();
        this.score++;
        this.apple.generateNewPosition(this.snake.getBody());
      }
    }
}
  
//Создание игры
class Snake {
    constructor() {
      this.body = [ //изначальное положение змейки и направление движения
        { row: 5, col: 5 },
        { row: 5, col: 6 },
      ];
      this.direction = 'right';
    }
  
    //Возвращение тела, головы и направления змейки
    getBody() {
      return this.body;
    }
  
    getHead() {
      return this.body[this.body.length - 1];
    }
  
    getDirection() {
      return this.direction;
    }
  
    //Установка нового направления
    setDirection(newDirection) {
      this.direction = newDirection;
    }

    //Перемещение змейки на 1 клетку
    move() {
      const head = this.getHead();
      let newRow = head.row;
      let newCol = head.col;
  
      if (this.direction === 'up') {
        newRow--;
      } else if (this.direction === 'down') {
        newRow++;
      } else if (this.direction === 'left') {
        newCol--;
      } else if (this.direction === 'right') {
        newCol++;
      }
  
      //Удаление хвоста и добавление новой головы
      this.body.shift();
      this.body.push({ row: newRow, col: newCol });
    }
  
    //Увеличение головы змейки и сохранение хвоста
    grow() {
      const tail = this.body[0];
      const newTail = { row: tail.row, col: tail.col };
      this.body.unshift(newTail);
    }
  
    //Проверка указаной части змейки 
    isBodySegment(row, col) {
      for (let i = 0; i < this.body.length - 1; i++) {
        if (this.body[i].row === row && this.body[i].col === col) {
          return true;
        }
      }
      return false;
    }
  
    //Сброс змейки в начальное положение
    reset() {
      this.body = [
        { row: 5, col: 5 },
        { row: 5, col: 6 },
      ];
      this.direction = 'right';
    }
}
  
class Apple {
    constructor() {
      this.position = { row: 2, col: 3 };
    }
  
    getPosition() {
      return this.position;
    }
  
    //Генерирование новой позиции яблока с учетом положения змейки
    generateNewPosition(snakeBody) {
      let row, col;
      do {
        row = Math.floor(Math.random() * 10);
        col = Math.floor(Math.random() * 10);
      } while (this.isSnakeSegment(row, col, snakeBody));
  
      this.position = { row, col }; //установка новой позиции
    }
  
    isSnakeSegment(row, col, snakeBody) {
      for (let segment of snakeBody) {
        if (segment.row === row && segment.col === col) {
          return true;
        }
      }
      return false;
    }
}
  
new SnakeGame();
  