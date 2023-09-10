######################################## Abrir Imagem #######################################################

from PIL import Image

im = Image.open('imgtest.png', 'r')
pix_val = list(im.getdata())
pix_val_flat = [x for sets in pix_val for x in sets]
#print(pix_val)    

######################################## Criar Musica #######################################################

from midiutil import MIDIFile
from mingus.core import chords
import math

NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
OCTAVES = list(range(11))
NOTES_IN_OCTAVE = len(NOTES)

def swap_accidentals(note):
    if note == 'Db':
        return 'C#'
    if note == 'D#':
        return 'Eb'
    if note == 'E#':
        return 'F'
    if note == 'Gb':
        return 'F#'
    if note == 'G#':
        return 'Ab'
    if note == 'A#':
        return 'Bb'
    if note == 'B#':
        return 'C'

    return note


def note_to_number(note: str, octave: int) -> int:
    note = swap_accidentals(note)
    assert note in NOTES, errors['notes']
    assert octave in OCTAVES, errors['notes']

    note = NOTES.index(note)
    note += (NOTES_IN_OCTAVE * octave)

    assert 0 <= note <= 127, errors['notes']

    return note

variavelDoMorais = 8
width = im.size[0]
heigth = im.size[1]
lineHeigth = math.floor(heigth/variavelDoMorais)

linha = []

for x in range(width):
    sumR = 0
    sumG = 0
    sumB = 0
    for y in range(lineHeigth):
        index = x+y*width
        sumR += pix_val[index][0]
        sumG += pix_val[index][1]
        sumB += pix_val[index][2]
    sumR = math.floor(sumR/lineHeigth)
    sumG = math.floor(sumG/lineHeigth)
    sumB = math.floor(sumB/lineHeigth)
    linha.append((sumR,sumG,sumB))

pix_val = linha

pixel_list = [pix_val[0]]
durations = []
change = 50
duration = 0
for i in range(len(pix_val)):
    duration += 1

    if (abs(pixel_list[-1][0]-pix_val[i][0])>change or abs(pixel_list[-1][1]-pix_val[i][1])>change or abs(pixel_list[-1][2]-pix_val[i][2])>change):
        durations.append(duration)
        duration = 0
        if len(pixel_list) > 4:
            break
        else:
            pixel_list.append(pix_val[i])

print(pixel_list)
print(durations)

array_of_notes_r = []
array_of_notes_g = []
array_of_notes_b = []

for i in range(len(pixel_list)):
    R = pixel_list[i][0]
    G = pixel_list[i][1]
    B = pixel_list[i][2]
    
    array_of_notes_r.append(NOTES[math.floor(12*R/256)])
    array_of_notes_g.append(NOTES[math.floor(12*G/256)])
    array_of_notes_b.append(NOTES[math.floor(12*B/256)])

print(array_of_notes_r)
print(array_of_notes_g)
print(array_of_notes_b)

array_of_note_numbers_r = []
for note in array_of_notes_r:
    OCTAVE = 3
    array_of_note_numbers_r.append(note_to_number(note, OCTAVE))
array_of_note_numbers_g = []
for note in array_of_notes_g:
    OCTAVE = 3
    array_of_note_numbers_g.append(note_to_number(note, OCTAVE))
array_of_note_numbers_b = []
for note in array_of_notes_b:
    OCTAVE = 3
    array_of_note_numbers_b.append(note_to_number(note, OCTAVE))

MyMIDI = MIDIFile(3)  # One track, defaults to format 1 (tempo track is created
# automatically)
track = 0
channel = 0
time = 0  # In beats
duration = 10  # In beats
tempo = 120  # In BPM
volume = 100  # 0-127, as per the MIDI standard
MyMIDI.addTempo(track, time, tempo)

MyMIDI.addProgramChange(0, 0, 0, 91)
MyMIDI.addProgramChange(0, 1, 0, 100)
MyMIDI.addProgramChange(0, 2, 0, 79)

track = 0
channel = 0
time = 0  # In beats
volume = 100  # 0-127, as per the MIDI standard

for i, pitch in enumerate(array_of_note_numbers_r):
    duration = round(durations[i]/100) + 1
    MyMIDI.addNote(track, channel, pitch, time, duration, volume)
    time += duration

track = 1
channel = 1
time = 0  # In beats
duration = 5  # In beats
volume = 100  # 0-127, as per the MIDI standard

for i, pitch in enumerate(array_of_note_numbers_g):
    duration = round(durations[i]/100) + 1
    MyMIDI.addNote(track, channel, pitch, time, duration, volume)
    time += duration

track = 2
channel = 2
time = 0  # In beats
duration = 10  # In beats
volume = 100  # 0-127, as per the MIDI standard

for i, pitch in enumerate(array_of_note_numbers_b):
    duration = round(durations[i]/100) + 1
    MyMIDI.addNote(track, channel, pitch, time, duration, volume)
    time += duration

with open("pure-edm-fire-bass.mid", "wb") as output_file:
    MyMIDI.writeFile(output_file)

######################################## Tocar #######################################################

import pygame

def play_music(midi_filename):
  '''Stream music_file in a blocking manner'''
  clock = pygame.time.Clock()
  pygame.mixer.music.load(midi_filename)
  pygame.mixer.music.play()
  while pygame.mixer.music.get_busy():
    clock.tick(30) # check if playback has finished

midi_filename = 'pure-edm-fire-bass.mid'

# mixer config
freq = 44100  # audio CD quality
bitsize = -16   # unsigned 16 bit
channels = 2  # 1 is mono, 2 is stereo
buffer = 1024   # number of samples
pygame.mixer.init(freq, bitsize, channels, buffer)

# optional volume 0 to 1.0
pygame.mixer.music.set_volume(0.8)

# listen for interruptions
try:
  # use the midi file you just saved
  play_music(midi_filename)

except KeyboardInterrupt:
  # if user hits Ctrl/C then exit
  # (works only in console mode)
  pygame.mixer.music.fadeout(1000)
  pygame.mixer.music.stop()
  raise SystemExit
