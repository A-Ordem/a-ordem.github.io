const home = document.getElementById('home');
const selectFile = document.getElementById('select-file');

const startButton = document.getElementById('start-button');

startButton.addEventListener('click', () => {
    home.classList.add("hide");
    selectFile.classList.remove("hide");
})
