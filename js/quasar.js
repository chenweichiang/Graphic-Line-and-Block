document.addEventListener('DOMContentLoaded', () => {
    // OpenRouter API 密鑰
    const API_KEY = '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';
    
    // 獲取頁面元素
    const questionInput = document.getElementById('questionInput');
    const submitBtn = document.getElementById('submitBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultContent = document.getElementById('resultContent');
    
    // 初始化頁面互動
    function initializeUI() {
        // 提交按鈕點擊
        submitBtn.addEventListener('click', handleSubmit);
        
        // 按下 Enter 鍵也可提交（如果不是同時按 Shift）
        questionInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
            }
        });
    }
    
    // 處理表單提交
    async function handleSubmit() {
        // 獲取用戶問題
        const question = questionInput.value.trim();
        if (!question) {
            alert('請輸入問題！');
            return;
        }
        
        // 顯示加載指示器
        loadingIndicator.classList.remove('hidden');
        resultContent.innerText = '';
        submitBtn.disabled = true;
        
        try {
            // 發送請求到 AI
            const response = await sendToAI(question);
            
            // 顯示結果
            resultContent.innerText = response;
        } catch (error) {
            resultContent.innerText = `錯誤: ${error.message}`;
            console.error('API 請求錯誤:', error);
        } finally {
            // 隱藏加載指示器
            loadingIndicator.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
    
    // 發送請求到 AI 模型
    async function sendToAI(question) {
        try {
            // 構建 API 請求
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "HTTP-Referer": "https://example.com",
                    "X-Title": "AI Text Chat",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "openrouter/quasar-alpha",
                    "messages": [
                        {
                            "role": "user",
                            "content": question
                        }
                    ]
                })
            });
            
            // 檢查響應狀態
            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error Details:", errorData);
                throw new Error(errorData.error?.message || '請求失敗');
            }
            
            // 解析響應數據
            const data = await response.json();
            console.log("API Response:", data);
            
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                return `無法解析回應。請查看控制台以獲取完整回應。`;
            }
        } catch (error) {
            console.error("Full error:", error);
            throw error;
        }
    }
    
    // 初始化界面
    initializeUI();
});