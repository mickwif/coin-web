// YzyCoinScene.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';

import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import {
  createCrystalMaterial,
  createExteriorMaterial,
  createInteriorMaterial,
} from './materials';

// Hook to track window scroll
function useWindowScroll() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
}

export function YzyCoinModel() {
  const [isLoaded, setIsLoaded] = useState(false); // Track loading state
  const groupRef = useRef<THREE.Group>(null);

  // Track scroll
  const scrollY = useWindowScroll();

  // Load the GLTF model
  const gltf = useLoader(GLTFLoader, '/coin-new-mat.gltf');

  // Load the bump texture
  // const bumpTexture = useLoader(THREE.TextureLoader, "/bump.webp");
  const bumpTexture = useLoader(THREE.TextureLoader, '/bump-arch.webp');
  useEffect(() => {
    if (bumpTexture) {
      bumpTexture.wrapS = THREE.RepeatWrapping;
      bumpTexture.wrapT = THREE.RepeatWrapping;
    }
  }, [bumpTexture]);

  // Create your custom materials
  const crystalMaterial = createCrystalMaterial();
  const interiorMaterial = createInteriorMaterial();
  const exteriorMaterial = createExteriorMaterial(bumpTexture);

  // Once the GLTF is loaded, traverse and swap out the materials
  useEffect(() => {
    if (!gltf) return;

    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const { material } = mesh;

        // Update materials by name (assumes materials have names in GLTF)
        if (Array.isArray(material)) {
          material.forEach((mat, i) => {
            // switch (mat.name) {
            material[i] = interiorMaterial;
            // case 'crystals':
            //   material[i] = crystalMaterial;
            //   break;
            // case 'interior':
            //   material[i] = interiorMaterial;
            //   break;
            // case 'exterior':
            //   material[i] = exteriorMaterial;
            //   break;
            // default:
            //   console.warn(`No matching material found for: ${mat.name}`);
            // }
          });
        } else {
          mesh.material = interiorMaterial;
          // switch (material?.name) {
          //   case 'crystals':
          //     mesh.material = crystalMaterial;
          //     break;
          //   case 'interior':
          //     mesh.material = interiorMaterial;
          //     break;
          //   case 'exterior':
          //     mesh.material = exteriorMaterial;
          //     break;
          //   default:
          //     console.warn(`No matching material found for: ${material?.name}`);
          // }
        }
      }
    });

    setIsLoaded(true);
  }, [gltf, crystalMaterial, interiorMaterial, exteriorMaterial]);

  // Rotate the object
  useFrame(() => {
    const baseRotationX = Math.PI * 2;

    if (groupRef.current) {
      const scrollEffectX = scrollY * 0.001 * Math.PI * 4;
      groupRef.current.rotation.x = baseRotationX + scrollEffectX;

      groupRef.current.rotation.y += 0.01; // rotate on Y
    }
  });

  return (
    <group ref={groupRef}>
      {/** If GLTF is loaded, render it */}
      {gltf && isLoaded && <primitive object={gltf.scene} />}
    </group>
  );
}
