import tkinter as tk
from PIL import Image, ImageTk, ImageDraw

def desenhar_grade(imagem, linhas, colunas):
    largura, altura = imagem.size
    desenho = ImageDraw.Draw(imagem)
    
    # Desenha linhas horizontais
    for i in range(1, linhas):
        y = (i / linhas) * altura
        desenho.line([(0, y), (largura, y)], fill="red", width=2)
    
    # Desenha linhas verticais
    for i in range(1, colunas):
        x = (i / colunas) * largura
        desenho.line([(x, 0), (x, altura)], fill="red", width=2)

def abrir_imagem_e_desenhar_grade(janela, arquivo_imagem, linhas, colunas, proporcao):
    imagem = Image.open(arquivo_imagem)
    largura_original, altura_original = imagem.size
    
    # Calcula as novas dimensões com base na proporção
    largura_nova = int(largura_original * proporcao)
    altura_nova = int(altura_original * proporcao)
    
    # Redimensiona a imagem para a nova proporção
    imagem = imagem.resize((largura_nova, altura_nova), Image.ANTIALIAS)
    
    desenhar_grade(imagem, linhas, colunas)
    imagem = ImageTk.PhotoImage(imagem)
    
    label = tk.Label(janela, image=imagem)
    label.imagem = imagem
    label.pack()

# Configurações
arquivo_imagem = "imgtest.png"
linhas = 10  # Defina o número de linhas da grade
colunas = 1  # Defina o número de colunas da grade
proporcao = 0.5  # Defina a proporção em relação à imagem original (0.5 = metade do tamanho original)

# Cria a janela
janela = tk.Tk()
janela.title("Imagem com Grade")

# Abre a imagem, redimensiona e desenha a grade
abrir_imagem_e_desenhar_grade(janela, arquivo_imagem, linhas, colunas, proporcao)

# Inicia o loop da interface gráfica
janela.mainloop()
