const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;

// Toggle between video area and chat on smaller screens
backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

const user = prompt("Enter your name") || "Anonymous";

const peer = new Peer({
  host: "your-heroku-app-name.herokuapp.com", // Replace with your Heroku app name
  port: 443,
  path: "/peerjs",
  secure: true,
  config: {
    iceServers: [
      { url: "stun:stun01.sipphone.com" },
      { url: "stun:stun.ekiga.net" },
      { url: "stun:stunserver.org" },
      { url: "stun:stun.softjoys.com" },
      { url: "stun:stun.voiparound.com" },
      { url: "stun:stun.voipbuster.com" },
      { url: "stun:stun.voipstunt.com" },
      { url: "stun:stun.voxgratia.org" },
      { url: "stun:stun.xten.com" },
      {
        url: "turn:192.158.29.39:3478?transport=udp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808",
      },
      {
        url: "turn:192.158.29.39:3478?transport=tcp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808",
      },
    ],
  },
  debug: 3,
});

let myVideoStream;

navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // Answer incoming calls
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // When a new user connects, call them
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  })
  .catch((err) => {
    console.error("Failed to get local stream:", err);
    alert("Please allow camera and microphone access.");
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
}

// Chat functionality
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", () => {
  if (text.value.trim().length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.trim().length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

// Button references
const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const fullscreenButton = document.querySelector("#fullscreenButton");
const endCallButton = document.querySelector("#endCallButton");

// Mute/unmute
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    muteButton.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.add("background__red");
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    muteButton.innerHTML = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.remove("background__red");
  }
});

// Play/stop video
stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    stopVideo.innerHTML = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.add("background__red");
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    stopVideo.innerHTML = `<i class="fas fa-video"></i>`;
    stopVideo.classList.remove("background__red");
  }
});

// Invite link
inviteButton.addEventListener("click", () => {
  prompt(
    "Copy this link and share it with anyone you want to meet:",
    window.location.href
  );
});

// Fullscreen toggle
fullscreenButton.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreenButton.innerHTML = `<i class="fas fa-compress"></i>`;
  } else {
    document.exitFullscreen();
    fullscreenButton.innerHTML = `<i class="fas fa-expand"></i>`;
  }
});

// End call (stop all local tracks and redirect to home)
endCallButton.addEventListener("click", () => {
  myVideoStream.getTracks().forEach((track) => track.stop());
  window.location.href = "/";
});

// Display incoming chat messages
socket.on("createMessage", (message, userName) => {
  messages.innerHTML += `
    <div class="message">
      <b><i class="fas fa-user-circle"></i> <span>${userName === user ? "Me" : userName}</span> </b>
      <span>${message}</span>
    </div>
  `;
});
