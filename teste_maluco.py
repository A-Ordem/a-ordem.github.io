import cv2
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from pydub import AudioSegment
from pydub.playback import play
import threading

def plot_dynamic_brightness_curve_with_audio(image_path):
    # Carrega a imagem em cores
    image = cv2.imread(image_path)

    # Converte a imagem para o espaço de cores YUV
    yuv_image = cv2.cvtColor(image, cv2.COLOR_BGR2YUV)

    # Extrai a componente de luminância (Y)
    y_channel = yuv_image[:, :, 0]

    # Mapeie os valores de brilho para frequências (exemplo simples)
    min_frequency = 200  # Frequência mínima em Hz
    max_frequency = 1000  # Frequência máxima em Hz
    frequency_range = max_frequency - min_frequency

    def map_brightness_to_frequency(brightness_value):
        return min_frequency + (brightness_value / 255.0) * frequency_range

    # Crie uma lista de notas sonoras com base na curva de brilho
    audio_notes = [map_brightness_to_frequency(b) for b in y_channel[0]]

    # Crie um sinal de áudio
    sample_rate = 44100  # Taxa de amostragem em Hz
    duration = .1  # Duração de cada nota em segundos
    audio = AudioSegment.silent(duration * 1000)  # Crie um segmento de áudio vazio

    for note_frequency in audio_notes:
        t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
        note_audio = np.sin(2 * np.pi * note_frequency * t)
        
        # Converter o tipo de dados para int16 (2 bytes)
        note_audio = (note_audio * 32767).astype(np.int16)  # Converter para 16 bits
        
        audio += AudioSegment(
            note_audio.tobytes(),
            frame_rate=sample_rate,
            sample_width=note_audio.dtype.itemsize,
            channels=1,
        )

    # Inicializa a figura com dois subplots ao lado
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    plt.subplots_adjust(wspace=0.3)  # Espaçamento entre os subplots

    # Configuração inicial dos gráficos
    ax1.set_title("Curva de Brilho Dinâmica (Vertical)")
    ax1.set_xlabel("Comprimento Vertical")
    ax1.set_ylabel("Brilho")
    line, = ax1.plot([], [], lw=2)

    ax2.set_title("Imagem")
    im = ax2.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB), aspect='auto', animated=True)
    line_position = ax2.axhline(y=0, color='red', lw=2)  # Linha horizontal inicial

    # Função de inicialização do gráfico
    def init():
        line.set_data([], [])
        line_position.set_ydata(0)
        return line, im, line_position

    # Função de atualização do gráfico
    def update(frame):
        if frame < len(y_channel[0]):
            line.set_data(np.arange(0, y_channel.shape[0]), y_channel[:, frame])
            line_position.set_ydata(frame)  # Atualiza a posição da linha vermelha
            ax1.relim()
            ax1.autoscale_view()
        return line, im, line_position

    # Criação da animação
    interval = 100 
    frames = len(y_channel[0])
    ani = FuncAnimation(fig, update, frames=frames, init_func=init, blit=True, repeat=False, interval=interval)

    # Reproduza o áudio em uma thread separada
    audio_thread = threading.Thread(target=play, args=(audio,))
    audio_thread.start()

    # Exibe o gráfico e aguarda até que a animação e o áudio terminem
    plt.show()

# Substitua 'circulo.png' pelo caminho da sua imagem colorida
image_path = 'imgtest_low.png'
plot_dynamic_brightness_curve_with_audio(image_path)