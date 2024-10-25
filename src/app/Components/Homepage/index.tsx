'use client'
import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

const RecordPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [countdown, setCountdown] = useState(3);
  const wavesurferRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: wavesurferRef.current,
        waveColor: 'lightblue',
        progressColor: 'blue',
      });
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      const newAudioChunks = [...audioChunks, event.data];
      setAudioChunks(newAudioChunks);
      const audioURL = URL.createObjectURL(new Blob(newAudioChunks));
      wavesurfer.current?.load(audioURL);
    };

    recorder.onstart = () => {
      setIsRecording(true);
      setAudioChunks([]);
      wavesurfer.current?.clearWave();
      wavesurfer.current?.play();
    };

    recorder.onstop = () => {
      setIsRecording(false);
      wavesurfer.current?.stop();
    };

    setMediaRecorder(recorder);
    recorder.start();
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
  };

  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #2F4858 0%, #4B6F7D 100%)', color: 'white', textAlign: 'center', padding: '50px', minHeight: '100vh' }}>
      <div style={{ 
        width: '100px', 
        height: '100px', 
        borderRadius: '50%', 
        backgroundColor: '#B0BEC5', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: 'auto',
        transition: 'transform 0.3s',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
      }}>
        {isRecording ? (
          <span style={{ color: 'black', fontWeight: 'bold' }}>Recording...</span>
        ) : (
          <button 
            onClick={startCountdown} 
            style={{ 
              backgroundColor: 'white', 
              color: 'black', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '5px', 
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.2s' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0E0E0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Start
          </button>
        )}
      </div>
      {countdown > 0 && !isRecording && (
        <h2 style={{ fontSize: '48px', margin: '20px 0', animation: 'fade 1s' }}>
          {countdown}
        </h2>
      )}
      <div ref={wavesurferRef} style={{ width: '600px', height: '128px', margin: '20px auto' }} />
      {isRecording && (
        <button 
          onClick={stopRecording} 
          style={{ 
            backgroundColor: 'white', 
            color: 'black', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '5px', 
            cursor: 'pointer',
            transition: 'background-color 0.3s, transform 0.2s' 
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0E0E0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          Stop
        </button>
      )}
      <style jsx>{`
        @keyframes fade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default RecordPage;
