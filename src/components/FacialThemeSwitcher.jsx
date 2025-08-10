import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "face-api.js";

export default function FacialThemeSwitcher() {
  const videoRef = useRef(null);
  const [mood, setMood] = useState("neutral");

  const moodThemes = {
    happy: "bg-yellow-200 text-yellow-900",
    sad: "bg-blue-200 text-blue-900",
    angry: "bg-red-200 text-red-900",
    surprised: "bg-purple-200 text-purple-900",
    neutral: "bg-gray-200 text-gray-900"
  };

  useEffect(() => {
    async function init() {
      await tf.setBackend("webgl");
      await tf.ready();

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models")
      ]);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    }

    init();
  }, []);

  const onPlay = async () => {
    if (!videoRef.current) return;
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detection?.expressions) {
      const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
      const topMood = sorted[0][0];
      setMood(topMood);
    }

    requestAnimationFrame(onPlay);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${moodThemes[mood]}`}>
      <video
        ref={videoRef}
        autoPlay
        muted
        onPlay={onPlay}
        className="rounded-lg shadow-lg"
        width="320"
        height="240"
      />
      <p className="mt-4 text-lg font-bold">Detected mood: {mood}</p>
    </div>
  );
}
