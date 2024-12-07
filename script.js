const video = document.querySelector("video")
const allFilters = document.querySelectorAll(".filter");
const recordBtnCont = document.querySelector(".record-btn-cont")
const recordBtn = document.querySelector(".record-btn")
const captureBtnCont = document.querySelector(".capture-btn-cont")
const captureBtn = document.querySelector(".capture-btn")
const filterLayer = document.querySelector(".filter-layer");

let recordFlag = false;
let captureFlag = false;

let recorder;
let chunks = []; // media data

let transparentColor = "rgba(0, 0, 0, 0)";

const constraints = {
  video: true,
  audio: true
}

navigator.mediaDevices.getUserMedia(constraints)
.then((stream) => {
  video.srcObject = stream
  recorder = new MediaRecorder(stream, { mimeType: 'video/mp4' } );

  recorder.onstart = (e) => {
    chunks = []
  }

  recorder.ondataavailable = (e) => {
    chunks.push(e.data)
  }

  recorder.onstop = (e) => {
    const blob = new Blob(chunks, { type: "video/mp4" });

    if(db){
      let dbTransaction = db.transaction("video", "readwrite");
      const videoStore = dbTransaction.objectStore("video");
      let videoEntry = {
        id: `vid-${crypto.randomUUID().split("-").join("")}`,
        blobData: blob
      }
      videoStore.add(videoEntry);
    }
  }
})

recordBtnCont.addEventListener("click", (e) => {
  if(!recorder) return

  recordFlag = !recordFlag;

  if(recordFlag){
    // start recording
    recorder.start()
    startTimer()
    recordBtn.classList.add("scale-record")
  }
  else{
    // stop recording
    recorder.stop()
    stopTimer()
    recordBtn.classList.remove("scale-record")
  }
})

let timerID;
const timer = document.querySelector(".timer")
let counter = 0;


function startTimer(){

  timer.style.display = "block";

  function displayTimer(){
    counter++;

    let totalSeconds = counter;
    const hours = Math.floor(counter / 3600);
    totalSeconds = counter % 3600;

    const minutes = Math.floor(totalSeconds / 60);

    totalSeconds = totalSeconds % 60;
    const seconds = totalSeconds

    const time = ("0" + hours).slice(-2) + ":" + ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2)
    timer.innerText = time
  }

  timerID = setInterval(displayTimer, 1000)
}

function stopTimer(){
  clearInterval(timerID);
  timer.innerText = "00:00:00"
  timer.style.display = "none"
  counter = 0;
}

captureBtnCont.addEventListener("click", (e) => {
  captureBtn.classList.add("scale-capture");

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const tool = canvas.getContext("2d");
  tool.drawImage(video, 0, 0, canvas.width, canvas.height);

  // filtering
  tool.fillStyle = transparentColor;
  tool.fillRect(0, 0, canvas.width, canvas.height);

  const imageURL = canvas.toDataURL("image/jpeg", 0.9);

  if(db){
    const dbTransaction = db.transaction("image", "readwrite");
    const imageStore = dbTransaction.objectStore("image");

    const imageEntry = {
      id: `img-${crypto.randomUUID().split("-").join("")}`,
      url: imageURL
    }
    imageStore.add(imageEntry);
  }

  setTimeout(() => {
    captureBtn.classList.remove("scale-capture");
  }, 500);
})


allFilters.forEach(filter => {
  filter.addEventListener("click", (e) => {
    transparentColor = getComputedStyle(filter).getPropertyValue("background-color");
    filterLayer.style.backgroundColor = transparentColor;
  })
})