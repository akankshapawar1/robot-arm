import React, { useEffect, useRef, useState } from 'react';
import { Button, Grid, Box } from '@mui/material';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import RobotComponent from './robot/RobotComponent.js';
import logo from './mowito_logo.jpeg';

function App() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  
  const toggleCamera = () => {
    if (stream) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const startCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = { video: true };

      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          setStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((e) => console.error(e));
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null); 
    }
  };

  useEffect(() => {
    return () => stopCamera(); 
  }, [stream]);

  return (
    <Box className="App" sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Box sx={{ padding: '1rem', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <img src={logo} alt="logo" style={{ height: '6rem', width: 'auto' }} />
      </Box>
      <Grid container sx={{ flexGrow: 1 }}>
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ 
            height: '100%', 
            width: '100%', 
            maxWidth: '600px', 
            maxHeight: '600px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            marginTop:'5vh'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                border:'1px black solid'
              }}
            />
            {!stream && (
              <VideocamOffIcon 
                fontSize='large'
                sx={{ 
                  color: 'gray',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  padding: '0.5rem',
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                }} 
              />
            )}
          </Box>
          <Button variant="contained" color="primary" onClick={toggleCamera} sx={{ mt: 2 }}>
            {stream ? 'Stop Camera' : 'Start Camera'}
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <RobotComponent />
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;