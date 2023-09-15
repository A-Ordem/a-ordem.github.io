
document.querySelector('#myCanvas').addEventListener('click', async () => {
	await Tone.start();
    
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();

    let now = Tone.now()

    for(let note of notes) synth.triggerAttackRelease(note[0], note[1], now + note[2]);
    animateLine();
})

let imgInput = document.getElementById('imageInput');
imgInput.addEventListener('change', function(e) {
    if (e.target.files) {
        let imageFile = e.target.files[0]; //here we get the image file
        var reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = function (e) {
            var myImage = new Image(); // Creates image object
            myImage.src = e.target.result; // Assigns converted image to image object
            myImage.onload = function(ev) {
                canvas.width = myImage.width; // Assigns image's width to canvas
                canvas.height = myImage.height; // Assigns image's height to canvas
                ctx.drawImage(myImage, 0, 0); // Draws the image on canvas
                
                imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                processImage(imgData);
            }
        }
    }
});

function drawRectOnCanvas(x,y,width,heigth) {
    ctx.fillStyle = "rgba(255, 0, 255, 0.5)";
    ctx.fillRect(x,y,width,heigth);
}

function getMaxBrigthnessInColumn(width, height, pixels, x_column, column_width) {
    const sequence = []
    for(let y = 0; y < height; y++) {
        let max = 0;
        for(let dx = 0; dx < column_width; dx++) {
            let x = x_column + dx;
            let R = pixels[(y*width + x)*4 + 0];
            let G = pixels[(y*width + x)*4 + 1];
            let B = pixels[(y*width + x)*4 + 2];
            let brigthness = 0.2126*R + 0.7152*G + 0.0722*B;
            max = brigthness > max ? brigthness : max;
        }
        sequence.push(max);
    }
    return sequence;
}

function getAvarageBrigthnessInColumn(width, height, pixels, x_column, column_width) {
    const sequence = []
    for(let y = 0; y < height; y++) {
        let sum = 0;
        for(let dx = 0; dx < column_width; dx++) {
            let x = x_column + dx;
            let R = pixels[(y*width + x)*4 + 0];
            let G = pixels[(y*width + x)*4 + 1];
            let B = pixels[(y*width + x)*4 + 2];
            let brigthness = 0.2126*R + 0.7152*G + 0.0722*B;
            sum += brigthness;
        }
        sequence.push(sum / column_width);
    }
    return sequence;
}

function findSectionsAboveTreshold(sequence, treshold) {
    let i = 0;
    sections = [];
    while(i < sequence.length) {
        if(sequence[i] > treshold) {
            let start = i;
            let duration = 0;
            while(i < sequence.length && sequence[i] > treshold) {
                duration++;
                i++;
            }
            sections.push([start, duration]);
        }
        i++;
    }
    return sections;
}

function getNotesFromSections(current_note, sections, timePerPixel) {
    const note = Tone.Frequency(current_note, "midi").toNote();
    const notes = [];
    for(let section of sections) {
        notes.push([note, section[1] * timePerPixel, section[0] * timePerPixel]);
    }
    return notes;
}

function processImage(imgData) {
    const width = imgData.width;
    const height = imgData.height;
    const pixels = imgData.data;

    const lowest_note = 36;
    const highest_note = 36+36;
    const N_notes = highest_note - lowest_note + 1;
    const column_width = width / N_notes;

    const treshold = 255/2;

    const entireDuration = 30; // segundos
    const timePerPixel = entireDuration / height;

    for(let current_note = lowest_note; current_note <= highest_note; current_note++) {
        let x_column = Math.floor((current_note - lowest_note) * column_width);
        //const sequence = getMaxBrigthnessInColumn(width, height, pixels, x_column, Math.floor(column_width));
        const sequence = getAvarageBrigthnessInColumn(width, height, pixels, x_column, Math.floor(column_width));
        const sections = findSectionsAboveTreshold(sequence,treshold);
        for(let section of sections) {
            drawRectOnCanvas(x_column,section[0],column_width, section[1]);
        }
        notes.push(...getNotesFromSections(current_note, sections, timePerPixel));
    }

    console.log("notes calculated");
    console.log(notes);


    // save state to offscreen canvas to use in animation
    offScreenCanvas.width = canvas.width;
    offScreenCanvas.height = canvas.height;
    offScreenCtx.drawImage(canvas, 0, 0);
}

function animateLine() {
    timestamp = Tone.now();
    animationDuration = 30;

    if (!startTime) {
        startTime = timestamp;
    }

    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / animationDuration, 1); // Ensure progress is capped at 1

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the initial state from the off-screen canvas
    ctx.drawImage(offScreenCanvas, 0, 0);

    // Calculate Y position of the line based on progress
    const y = canvas.height * progress;

    // Draw the moving line
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.strokeStyle = 'red'; // Change line color if needed
    ctx.lineWidth = 2; // Change line width if needed
    ctx.stroke();

    if (progress < 1) {
        requestAnimationFrame(animateLine);
    }
}

const notes = [];

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const offScreenCanvas = document.createElement('canvas');
const offScreenCtx = offScreenCanvas.getContext('2d');

let startTime;

