document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('imageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const generateMusicButton = document.getElementById('generateMusic');
    const musicPlayer = document.getElementById('musicPlayer');
    let pixelData = null;

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
                };
            };
            reader.readAsDataURL(file);
        }
    });

    generateMusicButton.addEventListener('click', function () {
        if (!pixelData) {
            alert('Please select an image first.');
            return;
        }

        // Generate music from pixelData
        const midiData = generateMusicFromPixelData(pixelData);

        // Create a Blob with the MIDI data
        const blob = new Blob([midiData], { type: 'audio/midi' });

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Set the audio player's source to the MIDI URL
        musicPlayer.src = url;
        musicPlayer.style.display = 'block';
        musicPlayer.play();
    });

    function generateMusicFromPixelData(pixelData) {
        //console.log("Isso será exibido no console do navegador.");
        

        const synth = new Tone.PolySynth(Tone.Synth).toDestination();
        const now = Tone.now()
        synth.triggerAttack("D4", now);
        synth.triggerAttack("F4", now + 0.5);
        synth.triggerAttack("A4", now + 1);
        synth.triggerAttack("C5", now + 1.5);
        synth.triggerAttack("E5", now + 2);
        synth.triggerRelease(["D4", "F4", "A4", "C5", "E5"], now + 4);
        
        
        const recorder = new Tone.Recorder();
        const synth = new Tone.Synth().connect(recorder);
        // start recording
        recorder.start();
        // generate a few notes
        //synth.triggerAttackRelease("C3", 0.5);
        // wait for the notes to end and stop the recording
        setTimeout(async () => {
            // the recorded audio is returned as a blob
            const recording = await recorder.stop();
            // download the recording by creating an anchor element and blob url
            const url = URL.createObjectURL(recording);
            const anchor = document.createElement("a");
            anchor.download = "recording.webm";
            anchor.href = url;
            anchor.click();
        }, 4000);
        
        // Example:
        //const midiData = now;
        return midiData;
    }

    

    
    
    
});
