// const API_KEY = 'YOUR API KEY';

const chatInput = document.querySelector('#chat-input');
const sendButton = document.querySelector('#sent-btn');
const chatContainer = document.querySelector('.chat-container');
const themeButton = document.querySelector('#theme-btn');
const deleteButton = document.querySelector('#delete-btn');


let userText = null;
const initialHeight = chatInput.scrollHeight;

// 自動捲動畫面至最新訊息列
const scrollToNewChat = (targetY) => {
    // Note: 無法使用
    // chatContainer.scrollTo(0, chatContainer.scrollHeight)
    // setTimeout(() => chatContainer.scrollTo(0, chatContainer.scrollHeight), 500);

    // Note: OK
    window.scrollTo(0, targetY);
}

/**
 * 載入歷史對話紀錄
 */
const loadDataFromLocalstorage = () =>{
    const themeColor = localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `
                            <div class="default-text">
                                <h1>客製化 ChatGPT</h1>
                                <p>
                                    透過 OpenAI API 將你的網站與 ChatGPT 整合 <br>
                                    您的歷史訊息將會顯示於這裡。
                                </p>
                            </div>
                        `;

    chatContainer.innerHTML = localStorage.getItem('all-chats') || defaultText;
    // 自動捲動畫面至最新訊息列
    scrollToNewChat(chatContainer.scrollHeight);

}
loadDataFromLocalstorage();




const createElement = (html, className) => {
    // 建立新的 div --> 包括對話文字、class、html 內容
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;
}


const showTypingAnimation = () => {
    const html = `
                <div class="chat-content">
                    <div class="chat-details">
                        <img src="assets/images/chatbot.jpg" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>
                `;

    // 建立對話 div 並加上 outgoing class 
    const incomingChatDiv = createElement(html, "incoming");
    // 從 chat-container div 的子元素開始添加對話
    chatContainer.appendChild(incomingChatDiv);
    // 自動捲動畫面至最新訊息列
    scrollToNewChat(chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const getChatResponse = async (incomingChatDiv) => {
    //const API_URL = "https://api.openai.com/v1/chat/completions";
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const pElement = document.createElement("p");
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    'role': 'user',
                    "content": userText
                }
            ],
            max_tokens: 2048,
            temperature: 0.2,
            // top_n: 1,
            stop: null
        })
    }

    // 從 OpenAI 的 ChatGPT 取得回應
    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        console.log(response);
        pElement.textContent = response.choices[0].message.content;

    } catch (error) {
        console.log(error);
        pElement.classList.add("error");
        pElement.textContent = "Oops! 系統有問題! 請稍後再重新送出訊息。";
    }

    // 刪除正在輸入的動畫
    incomingChatDiv.querySelector(".typing-animation").remove();
    // 加入回復訊息
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    // 自動捲動畫面至最新訊息列
    scrollToNewChat(chatContainer.scrollHeight);
    // 儲存當前對話階段在瀏覽器中
    localStorage.setItem("all-chats", chatContainer.innerHTML);
}

const handleOutgoingChat = () =>{
    userText = chatInput.value.trim(); // 取得 chatInput 值並移除多餘的空白
    if(!userText) return; // 如果對話視窗沒有輸入資料時，直接結束

    // 訊息送出後清空輸入介面
    chatInput.value = "";
    chatInput.style.height = `${initialHeight}px`;

    const html = `
                <div class="chat-content">
                    <div class="chat-details">
                        <img src="assets/images/user.png" alt="user-img">
                        <p></p>
                    </div>
                </div>
                `;
    
    // 建立對話 div 並加上 outgoing class 
    const outgoingChatDiv = createElement(html, "outgoing");
    // 讓對話文字以純文字型態顯示
    outgoingChatDiv.querySelector('p').textContent = userText;
    document.querySelector(".default-text")?.remove();
    // 從 chat-container div 的子元素開始添加對話
    chatContainer.appendChild(outgoingChatDiv);
    // 自動捲動畫面至最新訊息列
    scrollToNewChat(chatContainer.scrollHeight);
    // 正在輸入的動畫
    setTimeout(showTypingAnimation, 500);
}


/**
 * UI Event
 */
themeButton.addEventListener("click", ()=>{
    // 使用 CSS 切換 Dark mode
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

sendButton.addEventListener("click", handleOutgoingChat);

deleteButton.addEventListener("click", ()=>{
    if(confirm("您確定要刪除歷史對話嗎?")){
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

// 自動調整對話輸入文字區塊大小
chatInput.addEventListener("input", () =>{
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Enter + Shift 送出訊息
chatInput.addEventListener("keydown", (e) =>{
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800){
        e.preventDefault();
        handleOutgoingChat();
    }
});



/**
 * UI Event: button on HTML
 */
const copyResponse = (copyBtn) => {
    // 複製回應訊息到剪貼簿
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    
    // Note: 新版瀏覽器會禁用剪貼簿
    // navigator.clipboard.writeText(responseTextElement.textContent);
    // Note: 改成用 execCommand 取代 (但是顯示已棄用方法)
    const range = document.createRange();
    range.selectNode(responseTextElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');

    // 移除反白
    selection.removeAllRanges();
    copyBtn.textContent = "已複製";
    setTimeout(() => copyBtn.textContent = "content_copy", 3000);
}
