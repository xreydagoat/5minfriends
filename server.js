// GitHub Pages does NOT support server-side code.
// This is a client-only simulation of "5 Minute Friends"
// It uses local browser JavaScript only. No real-time matching.

// HTML structure expected:
// <div id="chat-log"></div>
// <input id="message-input" />
// <button id="send-button">Send</button>
// <div id="timer"></div>

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

  // Simulated reply
  setTimeout(() => {
    appendMessage("Friend", "I'm just a demo — not a real person.");
  }, 1000);

  messageInput.value = "";
};

window.onload = startTimer;
