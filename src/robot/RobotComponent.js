import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { saveAs } from 'file-saver'; // Import saveAs from file-saver

function RevolutJoint({ position, rotation }) {
  const mesh = useRef();
  console.log("RevolutJoint rendering", { position, rotation });
  return (
    <mesh ref={mesh} position={position} rotation={rotation}>
      <cylinderGeometry args={[15, 15, 25, 32]} />
      <meshLambertMaterial color={0xdf1111} />
    </mesh>
  );
}

function Link({ position }) {
  const mesh = useRef();
  console.log("Link component rendering at position:", position);
  return (
    <mesh ref={mesh} position={position}>
      <cylinderGeometry args={[5, 5, 100, 32]} />
      <meshLambertMaterial color={0x000000} transparent opacity={1} />
    </mesh>
  );
}

function Manipulator({ angles }) {
  console.log("Manipulator component rendering");
  const shoulder1 = useRef();
  const revJoin2 = useRef();

  useFrame(() => {
    const radA1 = angles.a1 * (Math.PI / 180);
    const radA2 = angles.a2 * (Math.PI / 180);
    if (shoulder1.current) {
      console.log("Updating shoulder1 rotation");
      shoulder1.current.rotation.z = radA1;
    }
    if (revJoin2.current) {
      console.log("Updating revJoin2 rotation");
      revJoin2.current.rotation.z = radA2;
    }
  });

  return (
    <group>
      <RevolutJoint position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <group ref={shoulder1} position={[0, 15, 0]}>
          <Link position={[0, 50, 0]} />
          <group ref={revJoin2} position={[0, 100, 0]}>
            <RevolutJoint position={[0, 0, 0]} rotation={[0, 0, 0]}>
              <Link position={[0, 50, 0]} />
            </RevolutJoint>
          </group>
        </group>
      </RevolutJoint>
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
  const [angles, setAngles] = useState({ a1: 0, a2: 0 });
  // const shoulder1 = useRef();

  const increaseAngle1 = () => setAngles((prev) => ({ ...prev, a1: Math.min(prev.a1 + 1, 90) }));
  const decreaseAngle1 = () => setAngles((prev) => ({ ...prev, a1: Math.max(prev.a1 - 1, -90) }));
  const increaseAngle2 = () => setAngles((prev) => ({ ...prev, a2: Math.min(prev.a2 + 1, 90) }));
  const decreaseAngle2 = () => setAngles((prev) => ({ ...prev, a2: Math.max(prev.a2 - 1, -90) }));

  const saveAngles = () => {
    const filename = prompt('Enter the filename to save joint angles:', 'joint_angles.txt');
    if (filename) {
      const fileContent = `Joint 1 Angle: ${angles.a1} degrees\nJoint 2 Angle: ${angles.a2} degrees`;
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
          <input type="text" value={angles.a1} readOnly />
          <button onClick={decreaseAngle1}>-</button>
        </div>
        <div>
          <label>Joint 2: </label>
          <button onClick={increaseAngle2}>+</button>
          <input type="text" value={angles.a2} readOnly />
          <button onClick={decreaseAngle2}>-</button>
        </div>
        <button onClick={saveAngles}>Save</button>
      </div>
      <Canvas camera={{position:[300,140,100],fov:75}}>
        <ambientLight intensity={0.4}/>
        <OrbitControls/>
        <GridHelper/>
        {/* <RevolutJoint position={[0, 0, 0]} rotation={[0, 0, 0]} />
        <group ref={shoulder1} position={[0, 15, 0]} />
        <Link position={[0, 50, 0]} />
        <RevolutJoint position={[0, 100, 0]} rotation={[0, 0, 0]} />
        <Link position={[0, 150, 0]} /> */}
        <Manipulator angles={angles} />
      </Canvas>
    </>
  );
}
