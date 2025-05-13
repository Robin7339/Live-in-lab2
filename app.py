from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/drag-and-drop')
def drag_and_drop():
    return render_template('drag_and_drop.html')

@app.route('/puzzle-game')
def puzzle_game():
    return render_template('puzzle.html')

if __name__ == '__main__':
    app.run(debug=True)
