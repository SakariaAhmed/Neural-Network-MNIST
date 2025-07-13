"use client";
import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function MNISTPredictor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loadingPredict, setLoadingPredict] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas with modern styling
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (e.pressure > 0) {
      if (!isDrawing) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
      }
      // Draw to the current point
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // Pen lifted: end the stroke
      if (isDrawing) {
        ctx.closePath();
        setIsDrawing(false);
      }
    }
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
  };

  const handlePredict = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoadingPredict(true);
    setPrediction(null);

    // Convert canvas into a PNG blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setLoadingPredict(false);
        return alert("Nothing drawn!");
      }

      const form = new FormData();
      form.append("file", blob, "digit.png");

      try {
        const res = await fetch("http://localhost:8000/predict", {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setPrediction(data.prediction);
      } catch (err) {
        console.error("Prediction error:", err);
        alert("Prediction failed");
      } finally {
        setLoadingPredict(false);
      }
    }, "image/png");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0">
        <CardHeader className="text-center pb-8 pt-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MNIST Digit Predictor
          </CardTitle>
          <p className="text-gray-500 mt-2">
            Draw a single digit and let AI predict it, with 90% accuracy
          </p>

        </CardHeader>
        <CardContent className="space-y-8 pb-8">
          
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className="draw-canvas rounded-2xl"
                onPointerMove={handlePointerMove}
                onPointerLeave={() => setIsDrawing(false)}
                onPointerCancel={() => setIsDrawing(false)}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={clearCanvas}
              className="px-8 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium bg-transparent"
            >
              Clear canvas
            </Button>
            <Button
              onClick={handlePredict}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              Predict
            </Button>
          </div>

          {prediction !== null && (
            <div className="text-center animate-in fade-in-50 duration-500">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-xl border border-blue-200">
                <span className="text-gray-600 font-medium">Prediction:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {prediction}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
