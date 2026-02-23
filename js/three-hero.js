/* ══════════════════════════════════
   THREE-HERO.JS — Animación 3D Hero
   ══════════════════════════════════ */

(function () {
  const canvas = document.getElementById('three-canvas');
  const banner = document.getElementById('banner');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
  camera.position.set(0, 8, 32);
  camera.lookAt(0, 0, 0);

  /* ══ COLORES ══ */
  const C_ORANGE  = new THREE.Color(0xF2911B);
  const C_TEAL    = new THREE.Color(0x04BFBF);
  const C_SUPPORT = new THREE.Color(0x037F8C);

  /* ══ TERRAIN GRID ══ */
  const GRID_W = 80, GRID_H = 50, GRID_SEG_W = 80, GRID_SEG_H = 50;
  const terrainGeo = new THREE.PlaneGeometry(GRID_W, GRID_H, GRID_SEG_W, GRID_SEG_H);
  terrainGeo.rotateX(-Math.PI / 2);

  const vCount = terrainGeo.attributes.position.count;
  const vColors = new Float32Array(vCount * 3);
  terrainGeo.setAttribute('color', new THREE.BufferAttribute(vColors, 3));

  const terrainMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.position.y = -6;
  scene.add(terrain);

  /* ══ PARTÍCULAS FLOTANTES ══ */
  const P_COUNT = 200;
  const pPositions  = new Float32Array(P_COUNT * 3);
  const pColors     = new Float32Array(P_COUNT * 3);
  const pSizes      = new Float32Array(P_COUNT);
  const pVelocities = [];
  const pBasePos    = [];

  for (let i = 0; i < P_COUNT; i++) {
    const x = (Math.random() - 0.5) * 70;
    const y = (Math.random() - 0.5) * 25 + 2;
    const z = (Math.random() - 0.5) * 40;
    pPositions[i*3]   = x;
    pPositions[i*3+1] = y;
    pPositions[i*3+2] = z;
    pBasePos.push(new THREE.Vector3(x, y, z));
    pVelocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 0.008,
      (Math.random() - 0.5) * 0.005,
      (Math.random() - 0.5) * 0.008
    ));
    const t = Math.random();
    const col = t < 0.5 ? C_ORANGE.clone().lerp(C_TEAL, t * 2) : C_TEAL.clone().lerp(C_SUPPORT, (t - 0.5) * 2);
    pColors[i*3]   = col.r;
    pColors[i*3+1] = col.g;
    pColors[i*3+2] = col.b;
    pSizes[i] = Math.random() * 3 + 1;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(pColors, 3));
  pGeo.setAttribute('pSize',    new THREE.BufferAttribute(pSizes, 1));

  const pMat = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      attribute float pSize;
      varying vec3  vColor;
      varying float vDist;
      uniform vec3  uMouse3D;
      void main() {
        vColor = color;
        vec3 pos = position;
        vec3 diff = pos - uMouse3D;
        float d = length(diff);
        float strength = smoothstep(8.0, 0.0, d) * 3.5;
        pos += normalize(diff) * strength;
        vDist = d;
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        float dist = -mvPos.z;
        gl_PointSize = pSize * (400.0 / dist);
        gl_Position  = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying vec3  vColor;
      varying float vDist;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float core  = 1.0 - smoothstep(0.0, 0.15, d);
        float glow  = 1.0 - smoothstep(0.1,  0.5,  d);
        float alpha = core * 0.95 + glow * 0.5;
        float bright = smoothstep(10.0, 0.0, vDist) * 0.6;
        gl_FragColor = vec4(vColor + bright, alpha);
      }
    `,
    uniforms: { uMouse3D: { value: new THREE.Vector3(999, 999, 999) } }
  });

  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ══ ANILLOS ORBITALES ══ */
  function makeRing(radius, tube, color, opacity) {
    const g = new THREE.TorusGeometry(radius, tube, 6, 100);
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
    return new THREE.Mesh(g, m);
  }
  const ring1 = makeRing(5,   0.03, 0xF2911B, 0.5);
  const ring2 = makeRing(8.5, 0.025, 0x04BFBF, 0.35);
  const ring3 = makeRing(12,  0.018, 0x037F8C, 0.2);
  ring1.rotation.set(1.1,  0.3,  0);
  ring2.rotation.set(0.5,  0.8,  0.4);
  ring3.rotation.set(1.9,  1.1, -0.3);
  scene.add(ring1, ring2, ring3);

  /* ══ CURSOR 3D GLOW ══ */
  const cursorGeo = new THREE.SphereGeometry(1.2, 16, 16);
  const cursorMat = new THREE.MeshBasicMaterial({ color: 0x04BFBF, transparent: true, opacity: 0, depthWrite: false });
  const cursorMesh = new THREE.Mesh(cursorGeo, cursorMat);
  scene.add(cursorMesh);

  const haloGeo = new THREE.SphereGeometry(3.5, 16, 16);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xF2911B, transparent: true, opacity: 0, depthWrite: false, side: THREE.BackSide });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  scene.add(haloMesh);

  /* ══ MOUSE / TOUCH ══ */
  const mouseNDC    = new THREE.Vector2(999, 999);
  const mouse3D     = new THREE.Vector3();
  const raycaster   = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let   isOnBanner  = false;

  function updateMouse3D() {
    raycaster.setFromCamera(mouseNDC, camera);
    raycaster.ray.intersectPlane(groundPlane, mouse3D);
    pMat.uniforms.uMouse3D.value.copy(mouse3D);
    cursorMesh.position.copy(mouse3D).setY(mouse3D.y + 1.5);
    haloMesh.position.copy(cursorMesh.position);
  }

  banner.addEventListener('mousemove', e => {
    const r = banner.getBoundingClientRect();
    mouseNDC.x =  ((e.clientX - r.left)  / r.width)  * 2 - 1;
    mouseNDC.y = -((e.clientY - r.top)   / r.height) * 2 + 1;
    isOnBanner = true;
    cursorMat.opacity = 0.18;
    haloMat.opacity   = 0.06;
    updateMouse3D();
  });

  banner.addEventListener('mouseleave', () => {
    isOnBanner = false;
    mouseNDC.set(999, 999);
    pMat.uniforms.uMouse3D.value.set(999, 999, 999);
    cursorMat.opacity = 0;
    haloMat.opacity   = 0;
  });

  let shockwaveActive = false, shockwaveT = 0, shockwaveOrigin = new THREE.Vector3();
  banner.addEventListener('click', () => {
    shockwaveOrigin.copy(mouse3D);
    shockwaveActive = true;
    shockwaveT = 0;
  });

  banner.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    const r = banner.getBoundingClientRect();
    mouseNDC.x =  ((t.clientX - r.left) / r.width)  * 2 - 1;
    mouseNDC.y = -((t.clientY - r.top)  / r.height) * 2 + 1;
    updateMouse3D();
  }, { passive: false });

  /* ══ RESIZE ══ */
  function resize() {
    const w = banner.clientWidth, h = banner.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ══ ANIMATE ══ */
  let frame = 0;
  const camTarget = new THREE.Vector3(0, 4, 28);
  const camCurrent = new THREE.Vector3(0, 8, 32);

  function animate() {
    requestAnimationFrame(animate);
    frame++;
    const t = frame * 0.006;

    /* Terrain wave */
    const pos = terrainGeo.attributes.position;
    const col = terrainGeo.attributes.color;
    const mx = mouse3D.x, mz = mouse3D.z;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      let wave  = Math.sin(x * 0.25 + t * 1.2) * 0.9;
          wave += Math.sin(z * 0.3  + t * 0.9)  * 0.7;
          wave += Math.sin((x + z) * 0.15 + t)  * 0.5;

      const dMx = x - mx, dMz = z - mz;
      const distM = Math.sqrt(dMx*dMx + dMz*dMz);
      if (isOnBanner) {
        wave += Math.sin(distM * 0.6 - t * 4) * Math.exp(-distM * 0.08) * 2.5;
      }

      if (shockwaveActive) {
        const dx = x - shockwaveOrigin.x, dz = z - shockwaveOrigin.z;
        const dr = Math.sqrt(dx*dx + dz*dz);
        const front = shockwaveT * 18;
        const ring  = Math.exp(-Math.pow(dr - front, 2) * 0.15);
        wave += ring * 4 * Math.exp(-shockwaveT * 1.2);
      }

      pos.setY(i, wave);

      const h01 = (wave + 3) / 6;
      const cc = C_TEAL.clone().lerp(C_ORANGE, Math.max(0, Math.min(1, h01)));
      const proximity = Math.exp(-distM * 0.12) * (isOnBanner ? 0.6 : 0);
      col.setXYZ(i,
        Math.min(1, cc.r + proximity * 0.8),
        Math.min(1, cc.g + proximity * 0.2),
        Math.min(1, cc.b + proximity * 0.1)
      );
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;

    if (shockwaveActive) {
      shockwaveT += 0.025;
      if (shockwaveT > 3) shockwaveActive = false;
    }

    /* Partículas */
    const pAttr = pGeo.attributes.position;
    for (let i = 0; i < P_COUNT; i++) {
      pBasePos[i].add(pVelocities[i]);
      const bp = pBasePos[i];
      if (Math.abs(bp.x) > 35) pVelocities[i].x *= -1;
      if (Math.abs(bp.y) > 12) pVelocities[i].y *= -1;
      if (Math.abs(bp.z) > 20) pVelocities[i].z *= -1;
      pAttr.setXYZ(i, bp.x, bp.y + Math.sin(t + i * 0.4) * 0.4, bp.z);
    }
    pAttr.needsUpdate = true;

    /* Anillos */
    ring1.rotation.z += 0.004;
    ring2.rotation.z -= 0.003;
    ring3.rotation.y += 0.002;
    ring1.rotation.y += 0.001;
    ring2.rotation.x += 0.0015;

    /* Cámara parallax */
    if (isOnBanner) {
      camTarget.set(mouseNDC.x * 2, 4 + mouseNDC.y * 1.5, 28 - mouseNDC.y * 2);
    } else {
      camTarget.set(0, 4, 28);
    }
    camCurrent.lerp(camTarget, 0.03);
    camera.position.copy(camCurrent);
    camera.lookAt(0, 0, 0);

    /* Cursor glow pulse */
    if (isOnBanner) {
      const pulse = 0.12 + Math.sin(frame * 0.12) * 0.06;
      cursorMat.opacity = pulse;
      haloMat.opacity   = pulse * 0.35;
    }

    renderer.render(scene, camera);
  }
  animate();

  /* ══ EXPONER PARA PANEL EDITOR ══ */
  window._threeScene          = scene;
  window._threeNodes          = particles;
  window._threeEdges          = terrain;
  window._threeRing1          = ring1;
  window._threeRing2          = ring2;
  window._threeRing3          = ring3;
  window._threeNodeGeo        = pGeo;
  window._threeEdgeMat        = terrainMat;
  window._threeNodePositions  = pBasePos;
  window._threeNodeVelocities = pVelocities;
})();
