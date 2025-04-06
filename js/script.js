// script.js 文件
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 已載入完成'); // 調試用

    // 全局變量用於存儲線條上的參考點坐標
    let currentLinePoint = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // 初始化扭曲線條
    const lineCanvas = document.getElementById('line-canvas');
    if (lineCanvas) {
        console.log('找到線條畫布元素'); // 調試用
        
        // 確保 canvas 尺寸正確設置
        lineCanvas.width = window.innerWidth;
        lineCanvas.height = window.innerHeight;
        
        // 在調整窗口大小時重新設置 canvas 尺寸
        window.addEventListener('resize', () => {
            lineCanvas.width = window.innerWidth;
            lineCanvas.height = window.innerHeight;
        });
        
        // 初始化變量以存儲線條實例
        let lineInstance;
        
        // 初始化扭曲線條，並傳入回調函數來接收線條位置
        try {
            // 創建線條並接收線條上的點位置
            lineInstance = createTwistingLine(lineCanvas, (pointX, pointY, index) => {
                // 保存當前追蹤點的位置
                currentLinePoint.x = pointX;
                currentLinePoint.y = pointY;
                
                // 如果立方體已經創建，則直接使用真實的線條點坐標更新其位置
                if (typeof updateCubePosition === 'function') {
                    updateCubePosition(pointX, pointY);
                }
            });
            
            console.log('線條已創建並啟動'); // 調試用
        } catch (error) {
            console.error('創建線條時出錯:', error);
        }
    } else {
        console.error('找不到線條畫布元素!');
    }
    
    // 獲取容器元素
    const container = document.getElementById('cube-container');
    if (!container) {
        console.error('找不到立方體容器元素!');
        return;
    }
    
    // 使用更簡單的方法創建立方體
    function createSimpleCube() {
        // 清空現有內容
        container.innerHTML = '';
        
        // 立方體大小 - 使用小尺寸以便更好地"粘"在線上
        const size = 8; 
        container.style.width = `${size}px`;
        container.style.height = `${size}px`;
        
        // 確保立方體容器能正確顯示
        container.style.position = 'absolute';
        container.style.transformStyle = 'preserve-3d';
        container.style.zIndex = '1000';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.style.display = 'block';
        
        // 創建立方體各面
        const faces = [
            { transform: `translateZ(${size/2}px)`, className: 'front', color: 'rgba(255, 0, 0, 0.9)' },
            { transform: `translateZ(-${size/2}px) rotateY(180deg)`, className: 'back', color: 'rgba(0, 255, 0, 0.9)' },
            { transform: `rotateX(90deg) translateZ(${size/2}px)`, className: 'top', color: 'rgba(0, 0, 255, 0.9)' },
            { transform: `rotateX(-90deg) translateZ(${size/2}px)`, className: 'bottom', color: 'rgba(255, 255, 0, 0.9)' },
            { transform: `rotateY(-90deg) translateZ(${size/2}px)`, className: 'left', color: 'rgba(255, 0, 255, 0.9)' },
            { transform: `rotateY(90deg) translateZ(${size/2}px)`, className: 'right', color: 'rgba(0, 255, 255, 0.9)' }
        ];
        
        // 添加每個面
        faces.forEach(face => {
            const element = document.createElement('div');
            element.className = `face ${face.className}`;
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.transform = face.transform;
            element.style.backgroundColor = face.color; // 設置顏色，增強可見度
            container.appendChild(element);
        });
        
        return container;
    }
    
    // 創建立方體
    const cube = createSimpleCube();
    console.log('立方體已創建'); // 調試用
    
    // 函數：更新立方體位置
    window.updateCubePosition = function(x, y) {
        // 直接設置立方體位置為線條上當前追蹤的點
        if (!container) return;
        
        container.style.left = `${x}px`;
        container.style.top = `${y}px`;
        container.style.transform = 'translate(-50%, -50%)';
    };
});