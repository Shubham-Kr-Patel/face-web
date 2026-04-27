import React, { useRef } from "react";
import Webcam from "react-webcam";
const [modelsLoaded, setModelsLoaded] = useState(false);
useEffect(() => {
  const load = async () => {
    await loadModels();
    setModelsLoaded(true);
  };
  load();
}, []);

const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
};

const Camera = ({ onCapture }) => {
    const webcamRef = useRef(null);

    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        onCapture(imageSrc);
    };

    return (
        <div style={{ textAlign: "center" }}>
            if (!modelsLoaded) return <h2>Loading Models...</h2>;
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
            />

            <br />
            <button onClick={() => {
                console.log("Button clicked");
                capture();
            }}>
                Capture
            </button>
        </div>
    );
};

export default Camera;