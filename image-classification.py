from flask import Flask, request, jsonify, render_template
from PIL import Image
import io
import torch
import torchvision.transforms as transforms
from torchvision import models
import requests

app = Flask(__name__)

# Load ResNet model
model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
model.eval()

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# Load ImageNet labels
LABELS_URL = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
labels = requests.get(LABELS_URL).text.splitlines()

# Simplify labels
def get_common_name(label):1
    categories = {
        "animal": ["dog", "cat", "wolf", "lion", "tiger", "elephant", "bear"],
        "bird": ["sparrow", "eagle", "pigeon", "parrot", "woodpecker", "flamingo"]
    }
    for common, keywords in categories.items():
        if any(keyword in label.lower() for keyword in keywords):
            return common
    return "other"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    image = Image.open(io.BytesIO(file.read())).convert("RGB")
    image_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(image_tensor)
        _, predicted = outputs.max(1)

    label = labels[predicted.item()]
    common_label = get_common_name(label)

    return jsonify({
        'predicted_label': label,
        'category': common_label
    })

if __name__ == '__main__':
    app.run(debug=True)
