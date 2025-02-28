import { useState } from "react";
import axios from "axios";
import { FaMicrophone, FaStop } from "react-icons/fa";

const AudioRecorder = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState("");

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      setAudioBlob(blob);

      const formData = new FormData();
      formData.append("audio", blob, "recording.wav");

      try {
        const uploadResponse = await axios.post(
          "http://localhost:5000/upload/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const fileUrl = uploadResponse.data.file_url;

        const transcribeResponse = await axios.post(
          "http://localhost:5000/transcription/transcribe",
          {
            audio_url: fileUrl,
          }
        );

        setTranscription(transcribeResponse.data.transcription);
      } catch (error) {
        console.error("Error uploading/transcribing:", error);
      }
    };

    setMediaRecorder(recorder);
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-h-max w-full max-w-md mx-auto text-center border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">🎤 Record & Transcribe</h2>

      <button
        onClick={recording ? stopRecording : startRecording}
        className={`flex items-center justify-center align-self: center; px-6 py-3 rounded-lg text-white font-semibold transition duration-300 ${
          recording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {recording ? (
          <FaStop className="mr-2" />
        ) : (
          <FaMicrophone className="mr-2" />
        )}
        {recording ? "Stop Recording" : "Start Recording"}
      </button>

      {audioBlob && (
        <audio
          controls
          src={URL.createObjectURL(audioBlob)}
          className="mt-4 w-full rounded-lg shadow"
        ></audio>
      )}

      {transcription && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow text-left">
          <h3 className="text-lg font-semibold">📝 Transcription:</h3>
          <p className="text-gray-700">{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
