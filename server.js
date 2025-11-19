// GitHub Pages does NOT support server-side code.
// So instead, this example mimics a server-less environment
// using only browser-side JavaScript and a pseudo-match system.

// This version removes WebSocket logic and replaces it with local simulation.
// It does NOT match real users, but mimics 5-minute interaction

// Put this code in your index.html inside a <script> tag or separate .js file

let chatLog = document.getElementById("chat-log");
let messageInput = document.getElementById("message-input");
let sendButton = document.getElementById("send-button");
let timerDisplay = document.getElementById("timer");

let startTime = 5 * 60; // 5 minutes in seconds
let currentTime = startTime;
let timer;

function startTimer() {
  timer = setInterval(() => {
    currentTime--;
    let minutes = Math.floor(currentTime / 60);
    let seconds = currentTime % 60;
    timerDisplay.innerText = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    if (currentTime <= 0) {
      clearInterval(timer);
      endChat();
    }
  }, 1000);
}

function endChat() {
  sendButton.disabled = true;
  messageInput.disabled = true;
  appendMessage("System", "Time's up! Thanks for chatting.");
}

function appendMessage(sender, message) {
  const div = document.createElement("div");
  div.textContent = `${sender}: ${message}`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

sendButton.onclick = () => {
  const message = messageInput.value.trim();
  if (!message) return;
  appendMessage("You", message);

  // Simulated response from bot
  setTimeout(() => {
    appendMessage("Friend", "I'm just a demo — no server connection here.");
  }, 1000);

  messageInput.value = "";
};

window.onload = startTimer;
