////////////////////////////////////////////// UI ///////////////////////////////////////////////////
const imageInput = document.getElementById('imageInput');
const musicPlayer = document.getElementById('musicPlayer');
const generateMusicButton = document.getElementById('generateMusic');
const imageCanvas = document.getElementById('imageCanvas');
const playButton = document.querySelector(".tape-controls-play");

////////////////////////////////////////////// Image Processing ///////////////////////////////////////////////////
const audioCtx = new AudioContext();
let pixelData = null;
let memoryCard = [];
let filtrada = [];

const Qx = 7;
const Qy = 7;

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
        const altura = Math.floor(img.height / Qy);
        const largura = Math.floor(img.width / Qx);

        // Coordenadas do canto superior esquerdo do quadrado
        let startX = 0;
        let startY = 0;

        for (let i = 0; i < 49; i++) {
          startX = (i % Qx) * largura;
          startY = Math.floor(i / Qx) * altura;

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

          memoryCard.push(Math.floor((mediaR + mediaG + mediaB) / 3))
          memoryCard.push(i)
        };
        console.log(memoryCard);
      };
    };
    reader.readAsDataURL(file);
  }
});

////////////////////////////////////////////// Image Converter ///////////////////////////////////////////////////
generateMusicButton.addEventListener('click', function () {
  if (!memoryCard) {
    alert('Please select an image first.');
    return;
  }

  let media = 0
  for (let i = 0; i < 2*Qx*Qy; i += 2) {
    media += memoryCard[i]
  }
  media /= (Qx*Qy)
  console.log(media)
  let filtro = 0
  for (let i = 0; i < 2*Qx*Qy; i += 2) {
    filtro += Math.pow((media-memoryCard[i]), 2);
  }
  filtro = Math.sqrt(filtro)
  filtro /= (Qx*Qy);
  console.log(filtro)
  filtro = 2*filtro + media
  console.log(filtro)

  while (filtrada < 2*2) {
    for (let i = 0; i < 2*Qx*Qy; i += 2) {
      if (memoryCard[i] > filtro) {
        filtrada.push(memoryCard[i])
        filtrada.push(memoryCard[i + 1])
      }
    }
    filtro--;
    console.log(filtro)
  }
  console.log(filtrada)
});

////////////////////////////////////////////// Player ///////////////////////////////////////////////////
let attackTime = 0.5;
let releaseTime = 0.5;

let wave = new PeriodicWave(audioCtx, {
  real: wavetable.real,
  imag: wavetable.imag,
});

// Expose attack time & release time
const sweepLength = 1;
function playSweep(time, freq, panVal, vol) {

  const osc = new OscillatorNode(audioCtx, {
    frequency: freq,
    type: "custom",
    periodicWave: wave,
  });

  // Create the node that controls the volume.
  const gainNode = new GainNode(audioCtx);
  gainNode.gain.value = vol

  // Create the node that controls the panning
  const panner = new StereoPannerNode(audioCtx, { pan: 0 });
  panner.pan.value = panVal; //-1 - 1

  osc.connect(gainNode).connect(panner).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + sweepLength);
}

////////////////////////////////////////////// Play Music ///////////////////////////////////////////////////
playButton.addEventListener(
  "click",
  () => {
    let time = 2
    for (let i = 0; i < filtrada.length; i += 2) {
      let lateral = (((filtrada[i + 1]) % Qx) - 3) / 3
      let oitava = 1
      let vertical = Math.floor(filtrada[i + 1] / Qx)
      let vol = (0.5 * filtrada[i]) / Math.max(...filtrada)
      const notas = [265, 250, 220, 200, 175, 165, 150, 130]
      playSweep(time, notas[vertical] * oitava, lateral, vol);
    }
  },
);