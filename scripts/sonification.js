////////////////////////////////////////////// UI ///////////////////////////////////////////////////
//const videoInput = document.getElementById('videoInput');
const musicPlayer = document.getElementById('musicPlayer');
const imageCanvas = document.getElementById('imageCanvas');

////////////////////////////////////////////// Image Processing ///////////////////////////////////////////////////
let pixelData = null;
let memoryCard = [];
let filtrada = [];

const Qx = 7;
const Qy = 7;

function loadVideo() {
  console.log(framesList)

  for (let i = 0; i < framesList.length; i++) {
    const reader = new FileReader();
    const img = new Image();
    img.src = framesList[i];

    img.onload = function () {
      imageCanvas.width = img.width;
      imageCanvas.height = img.height;

      const ctx = imageCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      pixelData = ctx.getImageData(0, 0, img.width, img.height).data;

      // Tamanho do quadrado de pixels (largura e altura)
      const altura = Math.floor(img.height / Qy);
      const largura = Math.floor(img.width / Qx);

      // Coordenadas do canto superior esquerdo do quadrado
      let startX = 0;
      let startY = 0;

      let hd = []
      for (let i = 0; i < Qx * Qy; i++) {
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

        hd.push(Math.floor((mediaR + mediaG + mediaB) / 3))
        hd.push(i)
      };
      memoryCard.push(hd)
    }
  }
  console.log(memoryCard);
};

////////////////////////////////////////////// Image Converter ///////////////////////////////////////////////////
let composicao = []

function generateMusic() {
  if (memoryCard.length == 0) {
    alert('Please select an image first.');
    return;
  }

  for (let frameS = 0; frameS < framesList.length; frameS++) {
    let media = 0
    for (let i = 0; i < 2 * Qx * Qy; i += 2) {
      media += memoryCard[frameS][i]
    }
    media /= (Qx * Qy)
    console.log(media)
    let filtro = 0
    for (let i = 0; i < 2 * Qx * Qy; i += 2) {
      filtro += Math.pow((media - memoryCard[frameS][i]), 2);
    }
    filtro = Math.sqrt(filtro)
    console.log(filtro)
    filtro /= (Qx * Qy);
    console.log(filtro)
    filtro = 4 * filtro + media
    console.log(filtro)

    filtrada = []
    while (filtrada.length < 2 * 2) {
      for (let i = 0; i < 2 * Qx * Qy; i += 2) {
        if (memoryCard[frameS][i] > filtro) {
          filtrada.push(memoryCard[frameS][i])
          filtrada.push(memoryCard[frameS][i + 1])
        }
      }
      filtro--;
    }
    console.log(filtrada)

    let cd = [];
    for (let i = 0; i < filtrada.length; i += 2) {
      let lateral = (((filtrada[i + 1]) % Qx) - 3) / 3
      //let oitava = .5
      let vertical = Math.floor(filtrada[i + 1] / Qx)
      let vol = (0.2 * filtrada[i]) / Math.max(...filtrada)
      //const notas = ["C2", "B2", "A2", "G1", "F1", "E1", "D1", "C1"]
      const notas = ["C3", "B3", "A3", "G2", "F2", "E2", "D2", "C2"]
      //cd.push(notas[vertical] * oitava, lateral, vol)
      cd.push(notas[vertical], lateral, vol)
    }
    composicao.push(cd);
  }
  console.log(composicao)

};

////////////////////////////////////////////// Player ///////////////////////////////////////////////////

// Expose attack time & release time
const sweepLength = 1;
function playSweep4(frameS, time) {

  // Crie um PolySynth com as opções desejadas
  const polySynth = new Tone.PolySynth().toDestination();

  // Crie um Panner (Panoramizador)
  const panner = new Tone.Panner(0).toDestination(); // Inicialmente, o panoramizador é configurado para o centro (0).
  const gain = new Tone.Gain(1).toDestination();
  // Conecte o PolySynth ao Panner
  polySynth.connect(panner);
  polySynth.connect(gain);

  // Defina as opções de síntese que você deseja para as notas
  const synthOptions = {
    oscillator: {
      type: "sine", // Tipo de forma de onda (pode ser "sine", "sawtooth", "square", "triangle", etc.)
    },
    envelope: {
      attack: 0.1, // Duração do ataque em segundos
      decay: 0.2, // Duração do decay em segundos
      sustain: 0.5, // Nível de sustain (de 0 a 1)
      release: 0.5, // Duração do release em segundos
    },
  };

  // Configure as opções de síntese para o PolySynth
  polySynth.set(synthOptions);

  // Toque várias notas ao mesmo tempo com panoramização
  let notas = [];
  let panPositions = [];
  let volume = [];
  // Toque várias notas ao mesmo tempo
  for (let i = 0; i < composicao[frameS].length; i += 3) {
    notas.push(composicao[frameS][i])
    panPositions.push(composicao[frameS][i + 1])
    volume.push(composicao[frameS][i + 2])
  }

  notas.forEach((nota, index) => {
    polySynth.triggerAttackRelease(nota, 1);
    panner.pan.value = panPositions[index]; // Ajusta a panoramização para a nota atual
    gain.gain.value = volume[index]; // Ajusta a panoramização para a nota atual
  });
}

////////////////////////////////////////////// Play Music ///////////////////////////////////////////////////

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
function playMusic() {
  let time = 1
  console.log("play")
  audioCtx.resume()
  for (let frameS = 0; frameS < composicao.length; frameS++) {
    console.log("Frame: ", frameS);
    setTimeout(function () {
      currentFrameIndex = frameS;
      for (let i = 0; i < composicao[frameS].length; i += 3) {
        console.log(frameS, time, composicao[frameS][i], composicao[frameS][i + 1], composicao[frameS][i + 2]);
      }
      playSweep4(frameS, time)
    }, frameS * 1000);
  }
};
