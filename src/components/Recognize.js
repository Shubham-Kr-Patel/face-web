import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { loadModels } from "../utils/faceApi";

const Recognize = () => {
  const videoRef = useRef(null);
  const isSendingRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState("");
  const [livePreview, setLivePreview] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [initialLoading, setInitialLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [rotation, setRotation] = useState(0);

  const toggleCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    await startVideo(newMode);
  };

  useEffect(() => {
    const init = async () => {
      setInitialLoading(true);
      await loadModels();
      await startVideo("environment");
      setInitialLoading(false);
    };
    init();

    return () => stopCamera();
  }, []);
  useEffect(() => {
    let interval;

    if (initialLoading || detecting) {
      interval = setInterval(() => {
        setRotation(prev => (prev + 30) % 360);
      }, 50);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [initialLoading, detecting]);

  const startVideo = async (mode = facingMode) => {
    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setReady(true);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera error or permission denied");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
  };

  const recognizeFace = async () => {
    if (isSendingRef.current || detecting) return;

    if (!ready) {
      setResult("Camera not ready ❌");
      return;
    }

    isSendingRef.current = true;
    setDetecting(true);

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setResult("No face detected ❌");
        isSendingRef.current = false;
        return;
      }

      const embedding = Array.from(detection.descriptor);

      const faces = await faceapi.extractFaces(videoRef.current, [
        detection.detection,
      ]);

      if (faces.length > 0) {
        setLivePreview(faces[0].toDataURL("image/jpeg"));
      }

      // ✅ SAFE BRIDGE
      if (window.ReactNativeWebView?.postMessage) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "FACE_EMBEDDING",
            embedding,
            timestamp: Date.now(),
            source: "webview-faceapi"
          })
        );
      } else {
        console.log("Running in browser (no RN bridge)");
      }

      setResult("Face captured ✅");

    } catch (err) {
      console.error("Recognition error:", err);
      setResult("Error detecting face ❌");
    }
    setDetecting(false);
    // cooldown
    setTimeout(() => {
      isSendingRef.current = false;
    }, 3000);
  };

  return (
    <div style={styles.page}>
      {(initialLoading || detecting) && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          flexDirection: "column"
        }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "5px solid #fff",
            borderTop: "5px solid transparent",
            borderRadius: "50%",
            transform: `rotate(${rotation}deg)`
          }} />

          <p style={{ color: "#fff", marginTop: "10px" }}>
            {initialLoading ? "Starting Camera..." : "Detecting Face..."}
          </p>
        </div>
      )}
      <div style={styles.container}>

        {livePreview && (
          <div style={styles.previewBox}>
            <img src={livePreview} alt="Live Face" style={styles.previewImg} />
            <p style={styles.previewText}>Live Capture</p>
          </div>
        )}

        <button onClick={toggleCamera} style={styles.button}
          disabled={initialLoading || detecting}>
          Switch Camera
        </button>

        <div style={styles.videoWrapper}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width="400"
            height="300"
            style={styles.video}
          />
          <div style={styles.circleOverlay} />
        </div>

        <button onClick={recognizeFace} disabled={initialLoading || detecting}
          style={styles.button}>
          Recognize Face
        </button>

        <div style={styles.resultBox}>
          <h3 style={styles.resultText}>{result}</h3>
        </div>
      </div>
    </div>
  );
};

export default Recognize;

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "85vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#fff",
    fontFamily: "Arial",
    padding: "5px",
  },
  videoWrapper: {
    position: "relative",
    width: "400px",
    height: "500px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  },

  title: {
    fontSize: "24px",
    marginBottom: "20px",
    fontWeight: "600",
  },

  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    background: "#000",
  },

  circleOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "200px",
    height: "200px",
    border: "3px solid #22c55e",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 20px rgba(34,197,94,0.4)",
    pointerEvents: "none",
  },

  button: {
    padding: "12px 24px",
    fontSize: "16px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 6px 15px rgba(59,130,246,0.3)",
  },

  resultBox: {
    marginTop: "10px",
    padding: "10px 20px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "8px",
    backdropFilter: "blur(10px)",
  },

  resultText: {
    margin: 0,
  },

  previewBox: {
    position: "absolute",
    top: "20px",
    right: "20px",
    textAlign: "center",
  },

  previewImg: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "2px solid #3b82f6",
    objectFit: "cover",
  },

  previewText: {
    fontSize: "12px",
    marginTop: "5px",
    color: "#cbd5e1",
  },
};