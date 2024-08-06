import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { saveAs } from 'file-saver'; 

function RevolutJoint({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[15, 15, 25, 32]} />
      <meshLambertMaterial color={0xdf1111} />
    </mesh>
  );
}

function Link({ position }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[10, 10, 100, 32]} /> 
      <meshLambertMaterial color={0x00ff00} transparent opacity={.5} />
    </mesh>
  );
}

function Manipulator({ angles }) {
  // Create an array of refs
  const refs = useRef(angles.map(() => React.createRef()));

  useFrame(() => {
    refs.current.forEach((ref, index) => {
      if (ref.current) {
        ref.current.rotation.z = angles[index] * (Math.PI / 180);
      }
    });
  });

  return <Chain angles={angles} refs={refs.current} index={0} />;
}

function Chain({ angles, refs, index }) {
  if (index >= angles.length) return null; 
  const position = index === 0 ? [0, 0, 0] : [0, 100 * (index), 0];
  const hasLink = index <= angles.length - 1; 

  return (
    <group ref={refs[index]} position={position} rotation={[0, 0, angles[index] * (Math.PI / 180)]}>
      {index === 0 ? (
        <RevolutJoint position={[0, 0, 0]} rotation={[0, 0, 0]} />
      ) : (
        <></>
      )}
      {hasLink && <Link position={[0, 40, 0]} />}
      <Chain angles={angles} refs={refs} index={index + 1} /> {/* Recursive call for the next segment */}
    </group>
  );
}

function SphereJoint({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[5, 32, 32]} />  
      <meshBasicMaterial color={0x00ff00} /> 
    </mesh>
  );
}

function GridHelper() {
  const { scene } = useThree();
  useEffect(() => {
    const gridHelper = new THREE.GridHelper(200, 50);
    gridHelper.position.y = -12;
    scene.add(gridHelper);
    return () => {
      scene.remove(gridHelper);
    };
  }, [scene]);
  return null;
}

export default function RobotComponent() {
  const [angles, setAngles] = useState([0, 0]);  

  const increaseAngle1 = () => setAngles((prev) => [Math.min(prev[0] + 1, 90), prev[1]]);
  const decreaseAngle1 = () => setAngles((prev) => [Math.max(prev[0] - 1, -90), prev[1]]);
  const increaseAngle2 = () => setAngles((prev) => [prev[0], Math.min(prev[1] + 1, 90)]);
  const decreaseAngle2 = () => setAngles((prev) => [prev[0], Math.max(prev[1] - 1, -90)]);

  const saveAngles = () => {
    const filename = prompt('Enter the filename to save joint angles:', 'joint_angles.txt');
    if (filename) {
      const fileContent = `Joint 1 Angle: ${angles[0]} degrees\nJoint 2 Angle: ${angles[1]} degrees`;
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, filename);
    }
  };

  return (
    <>
      <div id="control-panel">
        <div>
          <label>Joint 1: </label>
          <button onClick={increaseAngle1}>+</button>
          <input type="text" value={angles[0]} readOnly />
          <button onClick={decreaseAngle1}>-</button>
        </div>
        <div>
          <label>Joint 2: </label>
          <button onClick={increaseAngle2}>+</button>
          <input type="text" value={angles[1]} readOnly />
          <button onClick={decreaseAngle2}>-</button>
        </div>
        <button onClick={saveAngles}>Save</button>
      </div>
      <Canvas camera={{position:[300,140,100],fov:75}}>
        <ambientLight intensity={0.4}/>
        <OrbitControls/>
        <GridHelper/>
        <Manipulator angles={angles} />
      </Canvas>
    </>
  );
}
