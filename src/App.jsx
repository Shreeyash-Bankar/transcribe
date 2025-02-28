
import './App.css'
import AudioRecorder from './components/AudioRecorder.jsx'
import AudioUploader from './components/AudioUploader.jsx'

function App() {

  return(
  
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <AudioUploader/>
      <AudioRecorder/>
    </div>
  )
}
export default App
