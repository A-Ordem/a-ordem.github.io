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

    # Texto para exibir o valor médio de brilho
    text = ax1.text(0.5, 0.95, '', transform=ax1.transAxes, ha='center', fontsize=12, color='red')

    # Função de inicialização do gráfico
    def init():
        line.set_data([], [])
        line_position.set_ydata(0)
        text.set_text('')
        return line, im, line_position, text

    # Função de atualização do gráfico
    def update(frame):
        if frame < y_channel.shape[1]:
            line_data = y_channel[:, frame]
            line.set_data(np.arange(0, y_channel.shape[0]), line_data)
            line_position.set_ydata(frame)  # Atualiza a posição da linha vermelha
            
            # Calcula o valor médio de brilho da linha atual
            mean_brightness = np.mean(line_data)
            text.set_text(f'Valor Médio de Brilho: {mean_brightness:.2f}')
            
            ax1.relim()
            ax1.autoscale_view()
            
        return line, im, line_position, text

    # Criação da animação
    interval = 100  # 0,1 segundo
    frames = y_channel.shape[1]
    ani = FuncAnimation(fig, update, frames=frames, init_func=init, blit=True, repeat=False, interval=interval)

    # Exibe o gráfico
    plt.show()

# Substitua 'imagem.jpg' pelo caminho da sua imagem colorida
image_path = 'imgtest_low.png'
plot_dynamic_brightness_curve(image_path)
