// instigate our audio context
//let audioCtx;
const audioCtx = new AudioContext();

// load some sound
const audioElement = document.querySelector("audio");
let track;

const playButton = document.querySelector(".tape-controls-play");

// play pause audio
playButton.addEventListener(
  "click",
  () => {
    if (!audioCtx) {
      init();
    }

    // check if context is in suspended state (autoplay policy)
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    if (playButton.dataset.playing === "false") {


      // if track is playing pause it
    } else if (playButton.dataset.playing === "true") {
      //audioElement.pause();
      playButton.dataset.playing = "false";
    }

    // Toggle the state between play and not playing
    let state =
      playButton.getAttribute("aria-checked") === "true" ? true : false;
    playButton.setAttribute("aria-checked", state ? "false" : "true");
  },
  false
);

// If track ends
audioElement.addEventListener(
  "ended",
  () => {
    playButton.dataset.playing = "false";
    playButton.setAttribute("aria-checked", "false");
  },
  false
);

// Selecione o elemento de entrada de arquivo
const imageInput = document.getElementById('imageInput');
const musicPlayer = document.getElementById('musicPlayer');
const generateMusicButton = document.getElementById('generateMusic');
const imageCanvas = document.getElementById('imageCanvas');
let pixelData = null;

let memoryCard = []

imageInput.addEventListener('change', function () {
  const file = imageInput.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = function () {
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;
        const ctx = imageCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        pixelData = ctx.getImageData(0, 0, img.width, img.height).data;
        generateMusicButton.disabled = false;

        // Tamanho do quadrado de pixels (largura e altura)
        const altura = Math.floor(img.height / 7);
        const largura = Math.floor(img.width / 7);

        // Coordenadas do canto superior esquerdo do quadrado
        let startX = 0;
        let startY = 0;

        for (let i = 0; i < 49; i++) {
          startX = (i % 7) * largura;
          startY = Math.floor(i / 7) * altura;

          // Variáveis para calcular a soma dos valores de pixel
          let somaR = 0;
          let somaG = 0;
          let somaB = 0;
          for (let y = startY; y < startY + altura; y++) {
            for (let x = startX; x < startX + largura; x++) {
              const index = (y * img.width + x) * 4;
              somaR += pixelData[index];
              somaG += pixelData[index + 1];
              somaB += pixelData[index + 2];
            }
          }

          const numPixels = altura * largura;
          const mediaR = Math.floor(somaR / numPixels);
          const mediaG = Math.floor(somaG / numPixels);
          const mediaB = Math.floor(somaB / numPixels);
          /*
          console.log(i);
          console.log("R: ");
          console.log(mediaR);
          console.log("G: ");
          console.log(mediaG);
          console.log("B: ");
          console.log(mediaB);
          console.log(" ");
          */
          memoryCard.push(Math.floor((mediaR + mediaG + mediaB) / 3))
          memoryCard.push(i)
        };
        console.log(memoryCard);
      };
    };
    reader.readAsDataURL(file);
  }
});

generateMusicButton.addEventListener('click', function () {
  if (!memoryCard) {
    alert('Please select an image first.');
    return;
  }

  let media = 0
  for (let i = 0; i < 98; i += 2) {
    media += memoryCard[i]
  }
  let filtro = (media/49)*2
  console.log(filtro)

  let filtrada = []
  for (let i = 0; i < 98; i += 2) {
    if (memoryCard[i] > filtro) {//&& filtrada.length < 7
      filtrada.push(memoryCard[i])
      filtrada.push(memoryCard[i+1])
    }
  }
  // Generate music from pixelData
  console.log(filtrada)
  const musica = generateMusicFromPixelData(filtrada);
});

function generateMusicFromPixelData(pontos) {

  //audioElement.play();
  playButton.dataset.playing = "true";

  ////////////////////////////////////////////////////////// Perigo ///////////////////////////////////////

  let attackTime = 0.5;
  let releaseTime = 0.5;

  let wave = new PeriodicWave(audioCtx, {
    real: wavetable.real,
    imag: wavetable.imag,
  });

  // Expose attack time & release time
  const sweepLength = 1;
  function playSweep(time, freq, panVal) {

    const osc = new OscillatorNode(audioCtx, {
      frequency: freq,
      type: "custom",
      periodicWave: wave,
    });

    // Create the node that controls the volume.
    const gainNode = new GainNode(audioCtx);
    gainNode.gain.value = 0.5;//0 - 2

    // Create the node that controls the panning
    const panner = new StereoPannerNode(audioCtx, { pan: 0 });
    panner.pan.value = panVal; //-1 - 1

    osc.connect(gainNode).connect(panner).connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + sweepLength);
  }

  ////////////////////////////////////////////////////////// Tocando ///////////////////////////////////////////////////
  let time = 2
  /*
  wave = new PeriodicWave(audioCtx, {
    real: wavetable.real,
    imag: wavetable.imag,
  });
  playSweep(time, 300, -1);

  wave = new PeriodicWave(audioCtx, {
    real: wavetableP.real,
    imag: wavetableP.imag,
  });
  playSweep(time, 1000, 1);
  */
  
  for (let i = 0; i < pontos.length; i += 2) {
    let lateral = ((i+1 % 7)-4)/4
    let oitava = 3
    let vertical = Math.floor(i/7)*oitava
    const notas = [130, 150, 165, 175, 200, 221, 230]
    playSweep(time, notas[vertical], lateral);
  }

}