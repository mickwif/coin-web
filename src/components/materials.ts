// materials.ts
import * as THREE from 'three';

/**
 * Creates the custom crystal material
 */
export function createCrystalMaterial() {
  const crystalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe0ebff,
    metalness: 0.7,
    roughness: 0,
    transparent: false,
    opacity: 1,
    transmission: 0,
    thickness: 0.8,
    ior: 0.8,
    envMapIntensity: 0.9,
    clearcoat: 1,
    clearcoatRoughness: 0.01,
  });

  crystalMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.fresnelColor = { value: new THREE.Color(0xe0ebff) };
    shader.uniforms.fresnelPower = { value: 5.0 };
    shader.uniforms.fresnelScale = { value: 2.5 };

    shader.fragmentShader =
      `
          uniform vec3 fresnelColor;
          uniform float fresnelPower;
          uniform float fresnelScale;
  
          vec3 fresnelEffect(vec3 color, vec3 normal, vec3 viewDir) {
            float fresnel = pow(1.0 - dot(normal, viewDir), fresnelPower) * fresnelScale;
            return mix(color, fresnelColor, fresnel);
          }
        ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      `gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
      `
            vec3 viewDir = normalize(vViewPosition);
            outgoingLight = fresnelEffect(outgoingLight, normal, viewDir);
            gl_FragColor = vec4(outgoingLight, diffuseColor.a);
          `
    );
  };

  return crystalMaterial;
}

/**
 * Creates the custom interior material
 */
export function createInteriorMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.8,
    roughness: 0,
  });
}

/**
 * Creates the custom exterior material with noise bump
 * (You must pass in the loaded bumpTexture)
 */
export function createExteriorMaterial(bumpTexture: THREE.Texture) {
  bumpTexture.repeat.y = -1; // Flip on the vertical axis

  const exteriorMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.9,
    roughness: 0.15,
    bumpMap: bumpTexture,
    bumpScale: 2, // the noiseIntensity
    envMapIntensity: 1.2,
  });

  exteriorMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.fresnelColor = { value: new THREE.Color(0xffffff) };
    shader.uniforms.fresnelPower = { value: 4.0 };
    shader.uniforms.fresnelScale = { value: 1.5 };

    shader.fragmentShader =
      `
      uniform vec3 fresnelColor;
      uniform float fresnelPower;
      uniform float fresnelScale;

      vec3 fresnelEffect(vec3 color, vec3 normal, vec3 viewDir) {
        float fresnel = pow(1.0 - dot(normal, viewDir), fresnelPower) * fresnelScale;
        return mix(color, fresnelColor, fresnel);
      }
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      `gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
      `
        vec3 viewDir = normalize(vViewPosition);
        outgoingLight = fresnelEffect(outgoingLight, normal, viewDir);
        gl_FragColor = vec4(outgoingLight, diffuseColor.a);
      `
    );
  };

  return exteriorMaterial;
}
