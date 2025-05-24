import React, { useRef, useState, useEffect } from 'react';
import { Button, Typography, Box, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { saveAs } from 'file-saver'; 
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function RevolutJoint({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <sphereGeometry args={[15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshLambertMaterial color={0xbcbbbb} transparent opacity={1} />
    </mesh>
  );
}

function Link({ position, dimensions, color }) {
  const [width, height] = dimensions; 
  const cylinderPosition = [0, height / 2, 0]; 

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={dimensions} />
        <meshLambertMaterial color={color} transparent opacity={1} />
      </mesh>
      <mesh position={cylinderPosition} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[width / 2, width / 2, width, 32]} />
        <meshLambertMaterial color={color} transparent opacity={1} />
      </mesh>
    </group>
  );
}

function Manipulator({ angles, colors }) {
  const linkRefs = useRef(angles.map(() => React.createRef()));

  useFrame(() => {
      linkRefs.current.forEach((ref, index) => {
          if (ref.current) {
              ref.current.rotation.z = angles[index] * (Math.PI / 180);
          }
      });
  });

  return (
      <>
        <RevolutJoint position={[0, 0, 0]} rotation={[0, 0, 0]} />
        <Chain angles={angles} refs={linkRefs.current} index={0} colors={colors} />
      </>
  );
}

function Chain({ angles, refs, index, colors }) {
  if (index >= angles.length) return null;

  const boxHeight = 40; 
  const position = [0, boxHeight * index, 0]; 
  const color = colors[index]; // Get the color for the current link

  return (
      <group ref={refs[index]} position={position} rotation={[0, 0, angles[index] * (Math.PI / 180)]}>
        <Link dimensions={[10, boxHeight, 10]} color={color} position={[0, boxHeight / 2, 0]} />
        <Chain angles={angles} refs={refs} index={index + 1} colors={colors} />
      </group>
  );
}

function GridHelper() {
  const { scene } = useThree();
  useEffect(() => {
    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);
    return () => {
      scene.remove(gridHelper);
    };
  }, [scene]);
  return null;
}

export default function RobotComponent() {
  const [angles, setAngles] = useState([0, 0]);  
  const [increment, setIncrement] = useState(1); // State for increment unit
  const colors = ['#cc0000', '#fba54a'];

  const increaseAngle1 = () => setAngles((prev) => [Math.min(prev[0] + increment, 90), prev[1]]);
  const decreaseAngle1 = () => setAngles((prev) => [Math.max(prev[0] - increment, -90), prev[1]]);
  const increaseAngle2 = () => setAngles((prev) => [prev[0], Math.min(prev[1] + increment, 90)]);
  const decreaseAngle2 = () => setAngles((prev) => [prev[0], Math.max(prev[1] - increment, -90)]);

  const saveAngles = () => {
    const filename = prompt('Enter the filename to save joint angles:', 'joint_angles.txt');
    if (filename) {
      const fileContent = `Joint 1 Angle: ${angles[0]} degrees\nJoint 2 Angle: ${angles[1]} degrees`;
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, filename);
    }
  };

  const resetAngles = () => {
    setAngles([0, 0]);
  };

  return (
    <Box id="control-panel" sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      margin: 'auto',
    }}>
      <Canvas camera={{ position: [150, 50, 50], fov: 75 }} style={{ height: '65vh', border: '1px #999999 solid' }}>
        <directionalLight intensity={1} position={[100, 100, 100]} castShadow />
        <ambientLight intensity={1} />
        <OrbitControls />
        <GridHelper />
        <Manipulator angles={angles} colors={colors} />
      </Canvas>
      
      <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography component="label" sx={{ color: 'lightgray', marginRight: '0.5rem' , fontSize:'1.2rem'}}>Joint 1:</Typography>
          <IconButton onClick={decreaseAngle1} sx={{ color: 'white','&:hover': {
                backgroundColor: 'gray',
                color: 'white', 
              }, }}><RemoveIcon/></IconButton>
          <input type="text" value={angles[0]} readOnly style={{ textAlign: 'center', padding:'0.3rem', width:'50px', pointerEvents:'none' }} />
          <IconButton onClick={increaseAngle1} sx={{ color: 'white','&:hover': {
                backgroundColor: 'gray',
                color: 'white', 
              }, }}><AddIcon/></IconButton>
        </Box>
        <FormControl variant="outlined" sx={{ minWidth: 120, margin: '2rem' }}>
        <InputLabel id="increment-label" sx={{ color: 'white', transform: 'translate(14px, -25px) scale(1)' }}>
          Step Size
        </InputLabel>
          <Select
            labelId="increment-label"
            id="increment-select"
            value={increment}
            onChange={(e) => setIncrement(e.target.value)}
            label="Step Size"
            size='small'
            sx={{ backgroundColor: 'white' }}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography component="label" sx={{ color: 'lightgray', marginRight: '0.5rem', fontSize:'1.2rem'}}>Joint 2:</Typography>
          <IconButton onClick={decreaseAngle2} sx={{ color: 'white', '&:hover': {
                backgroundColor: 'gray',
                color: 'white', 
              }, }}><RemoveIcon/></IconButton>
          <input type="text" value={angles[1]} readOnly style={{ textAlign: 'center', padding:'0.3rem', width:'50px', pointerEvents:'none'}} />
          <IconButton onClick={increaseAngle2} 
            sx={{ color: 'white',
              '&:hover': {
                backgroundColor: 'gray',
                color: 'white', 
              },
             }}>
            <AddIcon/>
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Button variant="contained" color="primary" onClick={saveAngles} sx={{ marginBottom: '1rem', width:'30%' }}>
          Save
        </Button>
        <Button variant="contained" color="secondary" onClick={resetAngles} sx={{ marginBottom: '1rem', width:'30%' }}>
          Reset
        </Button>
      </Box>
    </Box>
  );
}
