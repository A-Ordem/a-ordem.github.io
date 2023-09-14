import numpy as np
import sounddevice as sd
import matplotlib.pyplot as plt

# Set the sampling frequency and duration
sampling_frequency = 44100  # Hz
duration = 10  # seconds

# Generate a time array
t = np.linspace(0, duration, int(sampling_frequency * duration), False)

# Generate a sine wave at 440 Hz (A4 note)
frequency = 200  # Hz
amplitude = 0.5

# Play the sine wave
# Play the added waves or the sequence

# Testing added waves
sine_wave = amplitude * np.sin(2 * np.pi * frequency * t)
sine_wave += amplitude * np.sin(2 * np.pi * (frequency + 5) * t)
sine_wave += amplitude * np.sin(2 * np.pi * (frequency + 10) * t)

sd.play(sine_wave, sampling_frequency)
sd.wait()  # Wait until the sound is done playing



# Testing frequencies in sequence
frequency = [440, 493.88, 523.25, 587.33, 659.26, 698.46, 783.99]
#for i in range(len(frequency)):
#    sine_wave = amplitude * np.sin(2 * np.pi * frequency[i] * t)
#    sd.play(sine_wave, sampling_frequency)
#    sd.wait()  # Wait until the sound is done playing



# Plot the graph of the Sound Wave 

plt.plot(sine_wave)

# Add labels and title
plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.title('Sample Line Plot')

# Show the plot
plt.show()