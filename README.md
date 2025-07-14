# Neural-Network-MNIST

## MNIST Digit Predictor

En webapplikasjon som lar deg tegne et håndskrevet tall i nettleseren, sender tegningen til en Python-server (FastAPI), og returnerer prediksjonen fra en CNN-modell trent på MNIST-datasettet.

## Funksjoner

* Tegneflate i nettleseren med HTML5 Canvas
* Bildeforbehandling (resizing, gråtone, binarisering, skjelettisering)
* Convolutional Neural Network (CNN) i TensorFlow/Keras for håndskriftgjenkjenning
* REST API med FastAPI
* Frontend i Next.js/TypeScript med shadcn/ui-komponenter

## Teknologistack

* **Frontend**: Next.js, React, TypeScript, shadcn/ui, Canvas API
* **Backend**: Python, FastAPI, Uvicorn, Pillow, scikit-image, TensorFlow/Keras, NumPy

## Komme i gang

### Forutsetninger

* Node.js (>=18)
* Python (>=3.12)

### Kjør lokalt

1. **Backend**

   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn server:app --reload --port 8000
   ```
2. **Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Åpne `http://localhost:3000` i nettleseren.

## Bruk

* Tegn et tall på lerretet.
* Trykk **Predict**.
* Se hvilket tall modellen gjetter.

## Prosjektstruktur

```
├── backend/
│   ├─ requirements.txt
│   └─ server.py
└── frontend/
    ├─ package.json
    └─ pages/
        └─ index.tsx
```

## Bidra

Enhver form for tilbakemelding eller forbedring er velkommen! Trekkforespørsler (PR) aksepteres gjerne.
