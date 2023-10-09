const home = document.getElementById('home');
const selectFile = document.getElementById('select-file');
const presentation = document.getElementById('presentation');

const startButton = document.getElementById('start-button');
const launchButton = document.getElementById('clickHandler');

startButton.addEventListener('click', () => {
    home.classList.add("hide");
    selectFile.classList.remove("hide");
})

launchButton.addEventListener('click', () => {
    selectFile.classList.add("hide");
    presentation.classList.remove("hide");
    
    generateMusic();
    playVideo();
    playMusic();
})
