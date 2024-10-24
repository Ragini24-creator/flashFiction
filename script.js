"use strict";
// import * as axios from "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";

const storyContent = document.querySelector(".storyContent");
const storyInput = document.querySelector(".storyInput");
const submit = document.querySelector(".submit-button");

const socket = new WebSocket("ws://192.168.0.166:8000/ws");

socket.onopen = async function (event) {
  console.log("A new connection is formed");
  const res = await fetch(
    "http://192.168.0.166:8000/api/v1/users/active/count"
  );
  console.log(res);
  const data = await res.json(); // This will parse the JSON response
  console.log(data);
  const activeUsersCount = data.activeUsers; //
  document.getElementById("active_users").innerHTML = activeUsersCount;
};

socket.onmessage = function (event) {
  const stringMessage = JSON.parse(event.data);
  console.log("A new message received from server : ", stringMessage);
  document.querySelector(".storyContent").innerHTML = stringMessage;
};

socket.onerror = function (error) {
  console.log("Websocket Error", error);
};

socket.onclose = function (event) {
  console.log("Websocket connection closed!");
};

submit.addEventListener("click", function () {
  const message = storyInput.value;
  socket.send(message);
  storyInput.value = "";
});
