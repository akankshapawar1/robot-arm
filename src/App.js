import React, { useEffect, useRef, useState } from 'react';
import { Button, Grid, Box } from '@mui/material';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import RobotComponent from './robot/RobotComponent.js';

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
    <div className="App">
      <Grid container style={{ width: '100%', height: '100%' }}>
        <Grid item xs={6} style={{ position: 'relative', height:'60rem', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <Box sx={{height:'50rem', width:'50rem', display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
              }}
            />
            {!stream && (
              <VideocamOffIcon 
                fontSize='large'
                style={{ 
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
          <div style={{ position: 'relative' }}>
            <Button variant="contained" color="primary" onClick={toggleCamera}>
              {stream ? 'Stop Camera' : 'Start Camera'}
            </Button>
          </div>
        </Grid>
        <Grid item xs={6} style={{ height: '60rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <RobotComponent />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
