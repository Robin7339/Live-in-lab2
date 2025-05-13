import pygame
import os
from gtts import gTTS
pygame.init()
screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
WIDTH, HEIGHT = screen.get_size()
pygame.display.set_caption("Alphabet Learning Game")
pygame.mixer.init()
background = pygame.image.load("background.jpg")
background = pygame.transform.scale(background, (WIDTH, HEIGHT))
def get_optimal_font_size():
    return int(HEIGHT * 0.6)
alphabets = [chr(i) for i in range(65, 91)] 
current_index = 0
def play_audio(text):
    audio_file = f"{text}.mp3"

    if not os.path.exists(audio_file): 
        tts = gTTS(text=text, lang="en")
        tts.save(audio_file)

    pygame.mixer.music.load(audio_file)
    pygame.mixer.music.play()

def display_letter(letter):
    font_size = get_optimal_font_size()
    font = pygame.font.Font(None, font_size)
    
    screen.blit(background, (0, 0))  
    text = font.render(letter, True, (255, 0, 0)) 
    text_rect = text.get_rect(center=(WIDTH // 2, HEIGHT // 2))
    screen.blit(text, text_rect)
    pygame.display.flip()


running = True

while running:
    current_letter = alphabets[current_index]
    display_letter(current_letter)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:  
                play_audio(current_letter)

            elif event.key == pygame.K_RIGHT:  
                if current_index < len(alphabets) - 1:
                    current_index += 1
                else:
                    play_audio("Great job! You have completed the alphabet!")
                    current_index = 0  

            elif event.key == pygame.K_ESCAPE:  
                running = False

pygame.quit()