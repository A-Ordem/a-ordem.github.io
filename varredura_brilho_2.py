import cv2
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

def plot_dynamic_brightness_curve(image_path):
    # Carrega a imagem em cores
    image = cv2.imread(image_path)

    # Converte a imagem para o espaço de cores YUV
    yuv_image = cv2.cvtColor(image, cv2.COLOR_BGR2YUV)

    # Extrai a componente de luminância (Y)
    y_channel = yuv_image[:, :, 0]

    # Inicializa a figura com um subplot para a imagem
    fig, ax = plt.subplots(1, 1, figsize=(8, 6))

    # Configuração inicial do gráfico
    ax.set_title("Imagem com Curva de Brilho Dinâmica")
    im = ax.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB), aspect='auto')

    # Função de inicialização do gráfico
    def init():
        return im,

    # Função de atualização do gráfico
    def update(frame):
        if frame < y_channel.shape[1]:
            # Obtém a linha correspondente da imagem
            line = y_channel[:, frame]
            
            # Cria um gráfico de linha no mesmo subplot
            ax.plot(line, color='red', lw=2)
            
            # Atualiza a imagem com o gráfico de linha
            im.set_data(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        return im,

    # Criação da animação
    interval = 100  # 0,1 segundo
    frames = y_channel.shape[1]
    ani = FuncAnimation(fig, update, frames=frames, init_func=init, blit=True, repeat=False, interval=interval)

    # Exibe o gráfico
    plt.show()

# Substitua 'imagem.jpg' pelo caminho da sua imagem colorida
image_path = 'imgtest_low.png'
plot_dynamic_brightness_curve(image_path)
