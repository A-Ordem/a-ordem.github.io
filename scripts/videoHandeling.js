const presentationScreen = document.getElementById("presentation");

document.getElementById("videoInput").addEventListener("change", handleVideoSelect);
let framesList = [];
let currentFrameIndex = 0;

let videoElement, videoShow;

function handleVideoSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const videoURL = URL.createObjectURL(file);
        videoElement = document.createElement("video");
        videoElement.src = videoURL;
        videoElement.onloadeddata = function () {
            extractFrames(videoElement);
        };
        
        videoShow = document.createElement("video");
        videoShow.src = videoURL;
        presentationScreen.appendChild(videoShow);
    }
}

function extractFrames(video) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    video.onseeked = function () {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameDataURL = canvas.toDataURL("image/jpeg");
        framesList.push(frameDataURL); // Store frame data URL in the framesList array
        const frameImage = document.createElement("img");
        frameImage.src = frameDataURL;
        //framesDiv.appendChild(frameImage);

        // You can continue extracting frames by incrementing video.currentTime
        if (video.currentTime < video.duration) {
            video.currentTime += 1; // Extracts frame every second, adjust as needed
        }
    };

    // Start extracting frames from the beginning of the video
    video.currentTime = 0;
    
    setTimeout(function () {
        loadVideo();
      }, video.duration*1000/6); // 1000 milissegundos = 1 segundos
}
    /*
document.getElementById("prevButton").addEventListener("click", function () {
    if (currentFrameIndex > 0) {
        currentFrameIndex--;
        displayCurrentFrame();
    }
});

document.getElementById("nextButton").addEventListener("click", function () {
    if (currentFrameIndex < framesList.length - 1) {
        currentFrameIndex++;
        displayCurrentFrame();
    }
});*/

function playVideo() {
    videoShow.play();
}

function displayCurrentFrame() {
    const framesDiv = document.getElementById("frames");
    framesDiv.innerHTML = ""; // Clear previous frame
    const frameImage = document.createElement("img");
    frameImage.src = framesList[currentFrameIndex];
    framesDiv.appendChild(frameImage);
    console.log("Current Frame Index:", currentFrameIndex);
}