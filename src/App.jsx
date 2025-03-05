import "./App.css";
import AudioRecorder from "./components/AudioRecorder.jsx";
import AudioUploader from "./components/AudioUploader.jsx";

function App() {
  return (
    <>
      <h1 className="bg-gray-200 text-center pt-6 text-3xl font-bold">
        Speech-to-Text Transcription{" "}
      </h1>
      <div className="flex justify-center items-center h-screen bg-gray-200">
        <AudioUploader />
        <AudioRecorder />
      </div>
    </>
  );
}
export default App;
