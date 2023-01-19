const socket = io("http://localhost:4000");
const container = document.getElementById("message");
const form = document.getElementById("send-message");
const messageInput = document.getElementById("message-input");
const append = (message, position) => {
  const div = document.createElement("div");

  // console.log(div);

  if (position === "left") {
    // let htmlfirst = `<div class="d-flex justify-content-between">
    //               <p class="small mb-1">Timona Siera</p>
    //               <p class="small mb-1 text-muted">23 Jan 2:00 pm</p>
    //             </div>`;
    let htmlsecond = `
                <div class="d-flex flex-row justify-content-start">
                  <svg xmlns="http://www.w3.org/2000/svg" style="width: 35px; height: 100%; margin: 0;" fill="currentColor" class="bi bi-messenger" viewBox="0 0 16 16">
                    <path
                      d="M0 7.76C0 3.301 3.493 0 8 0s8 3.301 8 7.76-3.493 7.76-8 7.76c-.81 0-1.586-.107-2.316-.307a.639.639 0 0 0-.427.03l-1.588.702a.64.64 0 0 1-.898-.566l-.044-1.423a.639.639 0 0 0-.215-.456C.956 12.108 0 10.092 0 7.76zm5.546-1.459-2.35 3.728c-.225.358.214.761.551.506l2.525-1.916a.48.48 0 0 1 .578-.002l1.869 1.402a1.2 1.2 0 0 0 1.735-.32l2.35-3.728c.226-.358-.214-.761-.551-.506L9.728 7.381a.48.48 0 0 1-.578.002L7.281 5.98a1.2 1.2 0 0 0-1.735.32z"
                    />
                  </svg>
                  <div>
                    <p class="small p-2 ms-3 mb-3 rounded-3" style="background-color: #f5f6f7">${message}</p>
                  </div>
                </div>`;

    div.classList.add("d-flex");
    div.classList.add("flex-row");
    div.classList.add("justify-content-start");

    div.innerHTML = htmlsecond;
  } else if (position === "right") {
    let htmlfirst = `<div class="d-flex justify-content-between">
                  <p class="small mb-1 text-muted">23 Jan 2:05 pm</p>
                  <p class="small mb-1">Johny Bullock</p>
                </div>`;

    let htmlsecond = `
                  <div>
                    <p class="small p-2 me-3 mb-3 text-white rounded-3 bg-warning">${message}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" style="width: 35px; height: 100%; margin: 0;" fill="currentColor" class="bi bi-messenger" viewBox="0 0 16 16">
                    <path
                      d="M0 7.76C0 3.301 3.493 0 8 0s8 3.301 8 7.76-3.493 7.76-8 7.76c-.81 0-1.586-.107-2.316-.307a.639.639 0 0 0-.427.03l-1.588.702a.64.64 0 0 1-.898-.566l-.044-1.423a.639.639 0 0 0-.215-.456C.956 12.108 0 10.092 0 7.76zm5.546-1.459-2.35 3.728c-.225.358.214.761.551.506l2.525-1.916a.48.48 0 0 1 .578-.002l1.869 1.402a1.2 1.2 0 0 0 1.735-.32l2.35-3.728c.226-.358-.214-.761-.551-.506L9.728 7.381a.48.48 0 0 1-.578.002L7.281 5.98a1.2 1.2 0 0 0-1.735.32z"
                    />
                  </svg>`;
    div.classList.add("d-flex");
    div.classList.add("flex-row");
    div.classList.add("justify-content-end");
    div.classList.add("mb-4");
    div.classList.add("pt-1");
    div.innerHTML = htmlsecond;
  }
  container.append(div);
};

const name = prompt("Enter your name to join : ");
const email = prompt("Enter your email : ");
const obj = {
  name,
  email,
};

if (name && email) {
  socket.emit("new-user-join", obj);

  const userName = document.getElementById("user-name");
  userName.innerText = `Chat Application ${name.toUpperCase()}`;
}

socket.on("user-joined", (userName) => {
  append(`${userName} has join the chat`, "left");
  rearrange();
});

socket.on("oldMessages", (oldMessage) => {
  console.log(oldMessage);
  oldMessage.forEach((message) => {
    if (message.user.email === email) {
      append(`${message.user.username} : ${message.message}`, "right");
    } else {
      append(`${message.user.username} : ${message.message}`, "left");
    }
  });

  rearrange();
});

socket.on("receive", (data) => {
  append(`${data.name} : ${data.message}`, "left");
  rearrange();
});

socket.on("left", (data) => {
  console.log(data.data.name);
  append(`${data.data.name} has left the chat`, "left");
  rearrange();
});

const sendMessage = (event) => {
  event.preventDefault();
  const message = messageInput.value;
  append(`You : ${message}`, "right");
  socket.emit("send", message);
  messageInput.value = "";
  rearrange();
};

form.addEventListener("submit", sendMessage);

// const messages = document.getElementById("messages");

// function appendMessage() {
//   const message = document.getElementsByClassName("message")[0];
//   const newMessage = message.cloneNode(true);
//   messages.appendChild(newMessage);
// }

function rearrange() {
  // Prior to getting your messages.
  let shouldScroll = container.scrollTop + container.clientHeight === container.scrollHeight;
  /*
   * Get your messages, we'll just simulate it by appending a new one syncronously.
   */
  // After getting your messages.
  if (!shouldScroll) {
    scrollToBottom();
  }
}

function scrollToBottom() {
  container.scrollTop = container.scrollHeight;
}

scrollToBottom();
