######################################## Abrir Imagem #######################################################

from PIL import Image

im = Image.open('imgtest.png', 'r')
pix_val = list(im.getdata())
pix_val_flat = [x for sets in pix_val for x in sets]
#print(pix_val)    

######################################## Criar Musica #######################################################

from midiutil import MIDIFile
from mingus.core import chords

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

pixel_list = [pix_val[0],pix_val[1],pix_val[3]]
change = 100
for i in range(len(pix_val)):
    if (abs(pixel_list[-1][0]-pix_val[i][0])>change or abs(pixel_list[-1][1]-pix_val[i][1])>change or abs(pixel_list[-1][1]-pix_val[i][1])>change) and len(pixel_list)<30:
        pixel_list.append(pix_val[i])
print(pixel_list)

array_of_notes_r = []
array_of_notes_g = []
array_of_notes_b = []

for i in range(len(pixel_list)):
    R = pixel_list[i][0]
    G = pixel_list[i][1]
    B = pixel_list[i][2]
    #255 = 51*5
    MIn = 102
    Med = 153
    Max = 204
    if R < 102:
        array_of_notes_r.append(NOTES[0])
    if R < 153 and R > 102:
        array_of_notes_r.append(NOTES[1])
    if R < 204 and R > 153:
        array_of_notes_r.append(NOTES[2])
    if R > 204:
        array_of_notes_r.append(NOTES[3])
    
    if G < 102:
        array_of_notes_g.append(NOTES[4])
    if G < 153 and G > 102:
        array_of_notes_g.append(NOTES[5])
    if G < 204 and G > 153:
        array_of_notes_g.append(NOTES[6])
    if G > 204:
        array_of_notes_g.append(NOTES[7])
    
    if B < 102:
        array_of_notes_b.append(NOTES[8])
    if B < 153 and B > 102:
        array_of_notes_b.append(NOTES[9])
    if B < 204 and B > 153:
        array_of_notes_b.append(NOTES[10])
    if B > 204:
        array_of_notes_b.append(NOTES[11])

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
duration = 3  # In beats
tempo = 120  # In BPM
volume = 100  # 0-127, as per the MIDI standard

for i, pitch in enumerate(array_of_note_numbers_r):
    MyMIDI.addNote(track, channel, pitch, time + (i*4), duration, volume)

track = 1
channel = 1
time = 2  # In beats
duration = 5  # In beats
tempo = 120  # In BPM
volume = 100  # 0-127, as per the MIDI standard

for i, pitch in enumerate(array_of_note_numbers_g):
    MyMIDI.addNote(track, channel, pitch, time + (i*4), duration, volume)

track = 2
channel = 2
time = 3  # In beats
duration = 10  # In beats
tempo = 120  # In BPM
volume = 100  # 0-127, as per the MIDI standard

for i, pitch in enumerate(array_of_note_numbers_b):
    MyMIDI.addNote(track, channel, pitch, time + (i*4), duration, volume)

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