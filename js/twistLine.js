// twistLineStrongRandom.js

function createTwistingLine(canvas, positionCallback) {
  const ctx = canvas.getContext('2d');
  ctx.filter = 'blur(0.3px)';

  let width = canvas.width = canvas.clientWidth;
  let height = canvas.height = canvas.clientHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
  });

  const points = 1000;
  const speedFactor = 0.2;
  const rhythmAmplitude = 0.0;
  const gravityOffset = 0;
  const bendIntensity = 87;

  const twistParams = {
    freqA: 20 + Math.random() * 120,
    freqB: 10 + Math.random() * 80,
    amp: 0.4 + Math.random() * 2.0,
    shift: Math.random() * Math.PI * 2,
    basePush: 80 + Math.random() * 180,
    curlAmp: 60 + Math.random() * 120
  };

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
      const curlSwing = Math.sin(t * 80 + offset * 10) * curlEnd * twistParams.curlAmp;

      const lateralWave =
        Math.sin(t * twistParams.freqA + offset * 4 + twistParams.shift) +
        Math.sin(t * twistParams.freqB + offset * 2.5);

      const lateralSwing =
        (lateralWave * twistParams.basePush * pushTowardCenter + curlSwing) *
        twistParams.amp * centerFocus * knotFactor * breath * rhythm;

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
    const projected = rawLine.map(p => {
      const scale = 1 - p.z / 500;
      return {
        x: (p.x - width / 2) * scale + width / 2,
        y: p.y * scale
      };
    });

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

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.stroke();
    
    // 如果提供了位置回調函數，調用它並傳遞中間點的坐標
    if (typeof positionCallback === 'function') {
      const midPointIndex = Math.floor(projected.length / 2);
      if (projected[midPointIndex]) {
        positionCallback(projected[midPointIndex].x, projected[midPointIndex].y, midPointIndex);
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
  
  // 返回控制對象
  return {
    stop: () => {
      // 可以在這裡添加停止動畫的邏輯
    },
    getPoints: () => projected
  };
}