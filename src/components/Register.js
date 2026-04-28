import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { loadModels } from "../utils/faceApi";

const Register = () => {
  const videoRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadModels().then(() => setLoaded(true));

    const data = JSON.parse(localStorage.getItem("user_face"));
    if (data?.image) setPreview(data.image);

    return () => stopCamera();
  }, []);

  // For Back Camera
  const [facingMode, setFacingMode] = useState("user");
  const startVideo = async (mode = facingMode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera not supported or permission denied");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const registerFace = async () => {
    const detection = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return alert("No face detected");

    const faces = await faceapi.extractFaces(videoRef.current, [
      detection.detection,
    ]);

    const image = faces[0].toDataURL("image/jpeg");

    const data = {
      descriptor: Array.from(detection.descriptor),
      image,
    };

    localStorage.setItem("user_face", JSON.stringify(data));
    setPreview(image);

    alert("Face Registered ✅");
  };

  if (!loaded)
    return (
      <div style={styles.loader}>
        <h2>Loading Models...</h2>
      </div>
    );

  return (
    <div style={styles.page}>

      <h2 style={styles.title}>Register Your Face</h2>

      <div style={styles.container}>
        {/* Switch Camera */}
        <button
          onClick={() => {
            stopCamera();
            const newMode = facingMode === "user" ? "environment" : "user";
            setFacingMode(newMode);
            startVideo(newMode);
          }}
          style={styles.button}
        >
          Switch Camera
        </button>
        {/* Preview Card */}
        {preview && (
          <div style={styles.previewBox}>
            <img src={preview} alt="preview" style={styles.previewImg} />
            <p style={styles.previewText}>Saved Face</p>
          </div>
        )}

        {/* Video Section */}
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

          <div style={styles.faceGuide} />
        </div>

        {/* Button */}

        <button onClick={startVideo} style={styles.button}>
          Start Camera
        </button>

        <button onClick={registerFace} style={styles.button}>
          Register Face
        </button>

      </div>
    </div>
  );
};

export default Register;

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    color: "#fff",
    padding: "20px",
    fontFamily: "Arial",
  },

  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "600",
  },

  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },

  videoWrapper: {
    position: "relative",
    width: "400px",
    height: "300px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  faceGuide: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "180px",
    height: "180px",
    border: "3px solid #22c55e",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 20px rgba(34,197,94,0.4)",
  },

  button: {
    padding: "12px 24px",
    fontSize: "16px",
    backgroundColor: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 6px 15px rgba(34,197,94,0.3)",
    transition: "0.2s",
  },

  previewBox: {
    position: "absolute",
    top: "20px",
    left: "20px",
    textAlign: "center",
  },

  previewImg: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "2px solid #22c55e",
    objectFit: "cover",
  },

  previewText: {
    fontSize: "12px",
    marginTop: "5px",
    color: "#cbd5e1",
  },

  loader: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "#fff",
  },
};