const galleryCont = document.querySelector(".gallery-cont");

setTimeout(() => {
  if(db){
    // video retrieval
  
    const dbTransaction = db.transaction("video", "readonly");
    const videoStore = dbTransaction.objectStore("video");
    const videoRequest = videoStore.getAll();

    videoRequest.onsuccess = (e) => {
      let videoResult = videoRequest.result;

      videoResult.forEach(videoObj => {
        const mediaCont = document.createElement("div");
        mediaCont.setAttribute("class", "media-cont");
        mediaCont.setAttribute("id", videoObj.id);

        let videoURL = URL.createObjectURL(videoObj.blobData);

        mediaCont.innerHTML = `
          <div class="media">
          <video src="${videoURL}" autoplay loop></video>
          </div>
          <button class="delete action-btn">DELETE</button>
          <button class="download action-btn">DOWNLOAD</button>
      `
      galleryCont.appendChild(mediaCont);

      const deleteBtn = mediaCont.querySelector(".delete");
      const downloadBtn = mediaCont.querySelector(".download");

      deleteBtn.addEventListener("click", deleteMedia);
      downloadBtn.addEventListener("click", downloadMedia);

      })
    }

    // image retrieval
    const dbImageTransaction = db.transaction("image", "readonly");
    const imageStore = dbImageTransaction.objectStore("image");
    const imageRequest = imageStore.getAll();

    imageRequest.onsuccess = (e) => {
      const imageResult = imageRequest.result;

      imageResult.forEach(imageObj => {
        const mediaCont = document.createElement("div");
        mediaCont.setAttribute("class", "media-cont");
        mediaCont.setAttribute("id", imageObj.id);

        mediaCont.innerHTML = `
        <div class="media">
        <img src="${imageObj.url}"></img>
        </div>
        <button class="delete action-btn">DELETE</button>
        <button class="download action-btn">DOWNLOAD</button>
    `
      galleryCont.appendChild(mediaCont);

      const deleteBtn = mediaCont.querySelector(".delete");
      const downloadBtn = mediaCont.querySelector(".download");

      deleteBtn.addEventListener("click", deleteMedia);
      downloadBtn.addEventListener("click", downloadMedia);

      })
    }
  }
}, 100)

function deleteMedia(e){
  const id = e.target.parentElement.getAttribute("id");

  // remove from DB
  if(id.startsWith("img")){
    const dbTransaction = db.transaction("image", "readwrite");
    const imageStore = dbTransaction.objectStore("image");
    imageStore.delete(id);
  }

  else{
    const dbTransaction = db.transaction("video", "readwrite");
    const videoStore = dbTransaction.objectStore("video");
    videoStore.delete(id);
  }

  // remove from UI
  e.target.parentElement.remove();
}

function downloadMedia(e){
  const id = e.target.parentElement.getAttribute("id");

  if(id.startsWith("img")){
    const dbTransaction = db.transaction("image", "readonly");
    const imageStore = dbTransaction.objectStore("image");
    const imageRequest = imageStore.get(id);

    imageRequest.onsuccess = (e) => {
      const imageResult = imageRequest.result;
      const imageURL = imageResult.url;

      const a = document.createElement("a");
      a.href = imageURL;
      a.download = "image.jpg";
      a.click();
    }
  }

  else{
    const dbTransaction = db.transaction("video", "readonly");
    const videoStore = dbTransaction.objectStore("video");
    const videoRequest = videoStore.get(id);

    videoRequest.onsuccess = (e) => {
      const videoResult = videoRequest.result;
      const blob = videoResult.blobData;
      const videoURL = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = videoURL;
      a.download = "video.mp4";
      a.click();
    }
  }
}