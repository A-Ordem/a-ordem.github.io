////////////////////////////////////////////// UI ///////////////////////////////////////////////////
//const videoInput = document.getElementById('videoInput');
const musicPlayer = document.getElementById('musicPlayer');
const generateMusicButton = document.getElementById('generateMusic');
const imageCanvas = document.getElementById('imageCanvas');
const playButton = document.getElementById("playMusic");

////////////////////////////////////////////// Image Processing ///////////////////////////////////////////////////
let pixelData = null;
let memoryCard = [];
let filtrada = [];

const Qx = 7;
const Qy = 7;

function loadVideo() {
  console.log(framesList)

  for (let i = 0; i < framesList.length; i++) {
    const img = new Image();
    img.src = framesList[i];

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

generateMusicButton.addEventListener('click', function () {
  if (!memoryCard) {
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
      //const notas = [265, 250, 220, 200, 175, 165, 150, 130]
      const notas = ["C2", "B2", "A2", "G1", "F1", "E1", "D1", "C1"]
      //cd.push(notas[vertical] * oitava, lateral, vol)
      cd.push(notas[vertical], lateral, vol)
    }
    composicao.push(cd);
  }
  console.log(composicao)

});

////////////////////////////////////////////// Player ///////////////////////////////////////////////////
//let attackTime = 0;
//let releaseTime = 0;

// Expose attack time & release time
const sweepLength = 1;
function playSweep(frameS, time, freq, panVal, vol) {

  ///////
  //const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  //const now = Tone.now()
  //synth.triggerAttack("D4", now + frameS);
  //synth.triggerRelease(["D4", "F4", "A4", "C5", "E5"], now + frameS + 1);

  // move the input signal from right to left
  const panner = new Tone.Panner(panVal).toDestination();
  const gainNode = new Tone.Gain(vol).toDestination();
  //const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  //synth.triggerAttackRelease("E4", "1s");
  //synth.set("detune", -1200);
  //panner.pan.rampTo(-1, 0.5);

  let config = {
    type: "sine", // Tipo de onda (pode ser "sine", "sawtooth", "square", "triangle", etc.)
    frequency: freq, //"C4" Frequência da nota (por exemplo, "C4" para a nota Dó na oitava 4)
  }
  console.log(config)
  const osc = new Tone.Oscillator(config).connect(panner).connect(gainNode).connect(panner).start(frameS).stop(frameS + time);
  //const synth = new Tone.PolySynth().connect(panner).connect(gainNode).start(frameS).stop(frameS + time);

}

function playSweep2(frameS) {

  for (let i = 0; i < composicao[frameS].length; i += 3) {
    if (frmaeS == 0) {
      const panner = new Tone.Panner(0).toDestination();
      const gainNode = new Tone.Gain(0).toDestination();
      panner.pan.rampTo(composicao[frameS][i]);
      gainNode.pan.rampTo(composicao[frameS][i]);
      console.log("Inicio")
    } else if (frmaeS + 1 == composicao.length) {
      const panner = new Tone.Panner(composicao[frameS][i]).toDestination();
      const gainNode = new Tone.Gain(composicao[frameS][i]).toDestination();
      panner.pan.rampTo(0);
      gainNode.pan.rampTo(0);
      console.log("Fim")
    } else {
      const panner = new Tone.Panner(composicao[frameS][i]).toDestination();
      const gainNode = new Tone.Gain(composicao[frameS][i]).toDestination();
      panner.pan.rampTo(composicao[frameS + 1][i]);
      gainNode.pan.rampTo(composicao[frameS + 1][i]);
      console.log("Meio")
    }
  }
  let config = {
    type: "sine", // Tipo de onda (pode ser "sine", "sawtooth", "square", "triangle", etc.)
    frequency: freq, //"C4" Frequência da nota (por exemplo, "C4" para a nota Dó na oitava 4)
  }
  console.log(config)
  const osc = new Tone.Oscillator(config).connect(panner).connect(gainNode).connect(panner).start(frameS).stop(frameS + time);
}

////////////////////////////////////////////// Play Music ///////////////////////////////////////////////////
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
playButton.addEventListener('click', function () {
  let time = 1
  console.log("play")
  audioCtx.resume()
  for (let frameS = 0; frameS < composicao.length; frameS++) {
    console.log("Frame: ", frameS);
    for (let i = 0; i < composicao[frameS].length; i += 3) {
      //playSweep(frameS, time, composicao[frameS][i], composicao[frameS][i + 1], composicao[frameS][i + 2])
      console.log(frameS, time, composicao[frameS][i], composicao[frameS][i + 1], composicao[frameS][i + 2]);
    }
    setTimeout(function () {
      currentFrameIndex = frameS
      displayCurrentFrame()
      playSweep2(frameS)
    }, frameS * 1000);
  }
});