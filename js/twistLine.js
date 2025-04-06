// twistLine.js

// 改為全局函數，而不是導出模組
function createTwistingLine(canvas, positionCallback) {
  const ctx = canvas.getContext('2d');
  ctx.filter = 'blur(0.3px)';

  let width = canvas.width = canvas.clientWidth || window.innerWidth;
  let height = canvas.height = canvas.clientHeight || window.innerHeight;

  function resize() {
    width = canvas.width = canvas.clientWidth || window.innerWidth;
    height = canvas.height = canvas.clientHeight || window.innerHeight;
  }
  window.addEventListener('resize', resize);

  const points = 1000;
  const speedFactor = 0.2;
  const rhythmAmplitude = 0.0;
  const gravityOffset = 0;
  const bendIntensity = 87;

  // 線條上的當前位置索引，用於控制立方體沿著線條移動
  let currentPointIndex = 0; // 從左邊開始
  // 移動速度：慢一點更容易看到效果
  let movementSpeed = 0.5;
  // 移動方向：1 表示向右，-1 表示向左
  let movementDirection = 1;

  // 保存最新生成的線條
  let currentLine = [];
  let currentProjectedLine = [];

  function generate3DLine(offset, breath) {
    const line = [];
    const centerY = height / 2 + gravityOffset;
    const centerZ = 0;

    for (let i = -150; i <= points + 150; i++) {
      const t = i / (points - 1);

      const knotFactor = Math.sin(t * 100) * Math.cos(t * 20);
      const rhythm = 1 + rhythmAmplitude * Math.sin(offset * 0.5);

      const leftPull = Math.exp(-Math.pow((t - 0.2) * 6, 2));
      const rightPull = Math.exp(-Math.pow((t - 0.8) * 6, 2));
      const centerFocus = Math.exp(-Math.pow((t - 0.5) * 4, 2));
      const pushTowardCenter = (leftPull - rightPull) * Math.cos(offset * 2);

      const curlEnd = Math.exp(-Math.pow((t - 1.0) * 8, 2));
      const curlSwing = Math.sin(t * 80 + offset * 10) * curlEnd * 100;

      const lateralWave = Math.sin(t * 50 + offset * 4) + Math.sin(t * 25 + offset * 2.5);
      const lateralSwing = (lateralWave * 140 * pushTowardCenter + curlSwing) * centerFocus * knotFactor * breath * rhythm;

      const x = t * width + lateralSwing;

      const twist = Math.sin(t * 30 + offset * 2) * bendIntensity * 0.3;
      const crossing = Math.sin(t * 60 + offset * 2.5) * 60 * Math.cos(t * 25 + offset * 3);

      let y = centerY + twist;
      let z = centerZ + crossing;

      if (line.length > 0) {
        const prev = line[line.length - 1];
        y = (y + prev.y * 2) / 3;
        z = (z + prev.z * 2) / 3;
      }

      line.push({ x, y, z });
    }
    return line;
  }

  function catmullRomToBezier(points) {
    const result = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1 < 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 > points.length - 1 ? points.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 8;
      const cp1y = p1.y + (p2.y - p0.y) / 8;

      const cp2x = p2.x - (p3.x - p1.x) / 8;
      const cp2y = p2.y - (p3.y - p1.y) / 8;

      result.push({
        p1,
        cp1: { x: cp1x, y: cp1y },
        cp2: { x: cp2x, y: cp2y },
        p2
      });
    }
    return result;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const time = performance.now() * 0.001 * speedFactor;
    const breath = 0.8 + 0.2 * Math.sin(time * 2);

    const rawLine = generate3DLine(time, breath);
    // 保存當前生成的線條
    currentLine = rawLine;
    
    const projected = rawLine.map(p => {
      const scale = 1 - p.z / 500;
      return {
        x: (p.x - width / 2) * scale + width / 2,
        y: p.y * scale
      };
    });
    
    // 保存投影後的線條
    currentProjectedLine = projected;

    // 更新立方體位置索引
    currentPointIndex += movementSpeed * movementDirection;
    
    // 檢查邊界，從左到右，然後重置到左側
    if (currentPointIndex >= points + 50) {
      // 到達右邊界時，重置到左邊界
      currentPointIndex = 0;
    }
    
    // 限制索引範圍，防止越界
    const safeIndex = Math.max(0, Math.min(Math.floor(currentPointIndex), projected.length - 1));

    // 如果傳入了回調函數，則將當前索引點的坐標傳回
    if (typeof positionCallback === 'function' && projected.length > safeIndex) {
      const trackPoint = projected[safeIndex];
      if (trackPoint && typeof trackPoint.x === 'number' && typeof trackPoint.y === 'number') {
        positionCallback(trackPoint.x, trackPoint.y, safeIndex);
      }
    }

    // 繪製線條
    const curves = catmullRomToBezier(projected);

    ctx.beginPath();
    ctx.moveTo(projected[0].x, projected[0].y);
    for (const segment of curves) {
      ctx.bezierCurveTo(
        segment.cp1.x, segment.cp1.y,
        segment.cp2.x, segment.cp2.y,
        segment.p2.x, segment.p2.y
      );
    }

    // 將線條寬度修改為 0.5px，使其更明顯
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    requestAnimationFrame(draw);
  }

  // 立即啟動動畫
  draw();
  
  // 返回一個控制物件，可以用來停止或重啟動畫，以及獲取線條數據
  return {
    start: draw,
    isActive: true,
    // 獲取當前的線條點
    getLinePoints: function() {
      return currentLine;
    },
    // 獲取當前的投影線條點
    getProjectedLinePoints: function() {
      return currentProjectedLine;
    },
    // 獲取當前使用的點索引
    getCurrentIndex: function() {
      return currentPointIndex;
    },
    // 設置移動方向
    setDirection: function(direction) {
      if (direction === 'left') {
        movementDirection = -1;
      } else if (direction === 'right') {
        movementDirection = 1;
      }
    },
    // 設置移動速度
    setSpeed: function(speed) {
      if (typeof speed === 'number' && speed > 0) {
        movementSpeed = speed;
      }
    }
  };
}