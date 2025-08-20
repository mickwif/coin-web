import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { MTLLoader, OBJLoader } from "three-stdlib";

// Hook to track window scroll
function useWindowScroll() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
}

export default function Coin() {
  const ref = useRef<THREE.Group>(null);

  // Viewport from react-three-fiber to handle responsive scaling
  const { viewport } = useThree();

  // Track scroll
  const scrollY = useWindowScroll();

  // --- Define materials from your new coin code ---
  const crystalMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xf4f7ff,
        metalness: 0.5,
        roughness: 0.1,
        transparent: false,
        opacity: 1,
        transmission: 0,
        thickness: 0.8,
        ior: 2,
        envMapIntensity: 0.6,
        clearcoat: 0.6,
        clearcoatRoughness: 0.1,
      }),
    []
  );

  const interiorMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xf4f7ff,
        metalness: 0.8,
        roughness: 0.1,
      }),
    []
  );

  // Load noise for bump map if desired
  const noiseTexture = useLoader(THREE.TextureLoader, "/noiseTexture.png");
  // Adjust tiling
  noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
  noiseTexture.repeat.set(24, 24);

  const exteriorMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.05,
        bumpMap: noiseTexture,
        bumpScale: 0.005,
      }),
    [noiseTexture]
  );

  // --- Load OBJ/MTL via react-three-fiber loaders ---
  const materials = useLoader(MTLLoader, "/yzycoin.mtl");
  const obj = useLoader(OBJLoader, "/yzycoin.obj", (loader:any) => {
    // Property 'setMaterials' does not exist on type 'Loader<Group<Object3DEventMap>>'.ts(2339)
    loader.setMaterials(materials);
  });

  // Once OBJ is loaded, traverse and replace materials based on name
  useEffect(() => {
    if (!obj) return;

    console.log("what about here", obj);

    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.isMesh) {
          const mat = child.material;
          // Some OBJ materials may come as arrays:
          if (Array.isArray(mat)) {
            mat.forEach((m, i) => {
              console.log("m name", m.name);
              if (m.name === "crystals") mat[i] = crystalMaterial;
              else if (m.name === "interior") mat[i] = interiorMaterial;
              else if (m.name === "exterior") mat[i] = exteriorMaterial;
            });
          } else {
            console.log("mat name", mat.name);
            if (mat?.name === "crystals") child.material = crystalMaterial;
            else if (mat?.name === "interior")
              child.material = interiorMaterial;
            else if (mat?.name === "exterior")
              child.material = exteriorMaterial;
          }
        }
      } else {
        console.log("Not a mesh");
      }
    });
  }, [obj, crystalMaterial, interiorMaterial, exteriorMaterial]);

  useEffect(() => {
    if (obj) {
      // Compute the bounding box and center the object
      const box = new THREE.Box3().setFromObject(obj);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Re-center the object
      obj.position.sub(center);
    }
  }, [obj]);

  // Scale coin based on viewport width
  useEffect(() => {
    if (ref.current) {
      // Example: 50% scale on small screens
      const scaleFactor = viewport.width < 768 ? 0.5 : 1;
      ref.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  }, [viewport.width]);

  // Animate via scroll + a slight wobble
  useFrame(() => {
    if (ref.current) {
      const baseRotationX = Math.PI * 2;
      // const baseRotationZ = 0;
      const scrollEffectX = scrollY * 0.001 * Math.PI * 4;
      // const baseRotationY = 0;

      // This portion blends natural spinning back to the base Z
      // const scrollInfluence = Math.abs(scrollY) * 0.0005;
      // const lerpFactor = 0.1;
      // const naturalRotationZ = ref.current.rotation.z + 0.005;
      // const naturalRotationY = ref.current.rotation.y + 0.001;

      // Blend natural Z rotation with the 'preferred' forward rotation
      // ref.current.rotation.y = THREE.MathUtils.lerp(
      //   naturalRotationY,
      //   baseRotationY,
      //   scrollInfluence
      // );

      // small floaty effect on x
      ref.current.rotation.y += 0.01;

      // X rotation depends on scroll
      ref.current.rotation.x = baseRotationX + scrollEffectX;

      // Slight wobble on Y
      // ref.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;

      // slight wobble on Z
      // ref.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {/* react threejs pink cube */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="pink" />
      </mesh>
      {obj && <primitive object={obj} />}
    </group>
  );
}
