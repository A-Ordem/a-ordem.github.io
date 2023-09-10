import mido
import subprocess
from pydub import AudioSegment

# Verifique se o FluidSynth está instalado e defina o caminho para o soundfont
fluidsynth_path = 'fluidsynth'
soundfont_path = 'EarthBound__Unused_Instruments_.sf2'  # Substitua pelo caminho do seu soundfont

# Arquivo de entrada MIDI e saída MP3
midi_file = 'pure-edm-fire-bass.mid'
output_mp3_file = 'output.mp3'

# Sintetizar o arquivo MIDI em áudio usando o FluidSynth
fluidsynth_command = [fluidsynth_path, '-i', soundfont_path, midi_file, '-F', 'temp.wav']
subprocess.run(fluidsynth_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# Converter o arquivo WAV em MP3 usando pydub
audio = AudioSegment.from_wav('temp.wav')
audio.export(output_mp3_file, format='mp3')

# Remover o arquivo temporário WAV
subprocess.run(['rm', 'temp.wav'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

print(f'Conversão concluída! O arquivo MP3 foi salvo em "{output_mp3_file}"')
