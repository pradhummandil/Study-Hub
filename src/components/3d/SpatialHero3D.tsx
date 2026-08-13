import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SpatialHero3DProps {
  className?: string;
}

export const SpatialHero3D: React.FC<SpatialHero3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 480;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf8f6f0, 0.04);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 6.5);

    // WebGL Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting Setup: Soft warm paper ambient + direction key light + terracotta accent light
    const ambientLight = new THREE.AmbientLight(0xf5f0e8, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x2d5a3f, 1.8);
    dirLight.position.set(4, 6, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xc86d51, 2.0, 12);
    pointLight.position.set(-3, -1, 3);
    scene.add(pointLight);

    const goldLight = new THREE.PointLight(0xd4af37, 1.6, 10);
    goldLight.position.set(2, -2, 2);
    scene.add(goldLight);

    // Main 3D Group
    const group = new THREE.Group();
    scene.add(group);

    // Curated Materials matching brand tokens
    const materials = {
      forestCover: new THREE.MeshStandardMaterial({ color: 0x1b3022, roughness: 0.35, metalness: 0.15 }),
      scholarGreen: new THREE.MeshStandardMaterial({ color: 0x2d5a3f, roughness: 0.4, metalness: 0.1 }),
      paperPages: new THREE.MeshStandardMaterial({ color: 0xf8f6f0, roughness: 0.7, metalness: 0.05 }),
      terracotta: new THREE.MeshStandardMaterial({ color: 0xc86d51, roughness: 0.4, metalness: 0.1 }),
      goldMetallic: new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.2 }),
      parchmentCard: new THREE.MeshStandardMaterial({ color: 0xede8db, roughness: 0.5, metalness: 0.05 }),
    };

    // Layer Z1: Background Study Ring
    const ringGeo = new THREE.TorusGeometry(2.4, 0.03, 16, 100);
    const ringMesh = new THREE.Mesh(ringGeo, materials.goldMetallic);
    ringMesh.rotation.x = Math.PI / 3;
    ringMesh.position.set(0, 0, -1.2);
    group.add(ringMesh);

    // Layer Z2: Main Central Open Study Book
    const bookGroup = new THREE.Group();
    const spineGeo = new THREE.BoxGeometry(0.12, 2.2, 0.3);
    const spineMesh = new THREE.Mesh(spineGeo, materials.forestCover);
    bookGroup.add(spineMesh);

    const coverLeftGeo = new THREE.BoxGeometry(1.4, 2.2, 0.08);
    const coverLeft = new THREE.Mesh(coverLeftGeo, materials.forestCover);
    coverLeft.position.set(-0.7, 0, -0.1);
    coverLeft.rotation.y = 0.25;
    coverLeft.castShadow = true;
    bookGroup.add(coverLeft);

    const coverRight = new THREE.Mesh(coverLeftGeo, materials.scholarGreen);
    coverRight.position.set(0.7, 0, -0.1);
    coverRight.rotation.y = -0.25;
    coverRight.castShadow = true;
    bookGroup.add(coverRight);

    const pageBlockGeo = new THREE.BoxGeometry(1.3, 2.1, 0.18);
    const pagesLeft = new THREE.Mesh(pageBlockGeo, materials.paperPages);
    pagesLeft.position.set(-0.68, 0, 0.02);
    pagesLeft.rotation.y = 0.22;
    pagesLeft.receiveShadow = true;
    bookGroup.add(pagesLeft);

    const pagesRight = new THREE.Mesh(pageBlockGeo, materials.paperPages);
    pagesRight.position.set(0.68, 0, 0.02);
    pagesRight.rotation.y = -0.22;
    pagesRight.receiveShadow = true;
    bookGroup.add(pagesRight);

    bookGroup.position.set(-0.2, 0.2, 0);
    bookGroup.rotation.set(0.3, -0.2, 0.1);
    group.add(bookGroup);

    // Layer Z3: Foreground Object 1 — Question Paper
    const paperGroup = new THREE.Group();
    const paperGeo = new THREE.BoxGeometry(1.3, 1.8, 0.04);
    const paperMesh = new THREE.Mesh(paperGeo, materials.parchmentCard);
    paperMesh.castShadow = true;
    paperGroup.add(paperMesh);
    paperGroup.position.set(1.4, 0.8, 0.8);
    paperGroup.rotation.set(-0.2, -0.4, 0.15);
    group.add(paperGroup);

    // Layer Z3: Foreground Object 2 — Flashcards Stack
    const flashcardGroup = new THREE.Group();
    const cardGeo = new THREE.BoxGeometry(1.1, 1.5, 0.05);
    const cardTop = new THREE.Mesh(cardGeo, materials.terracotta);
    cardTop.castShadow = true;
    flashcardGroup.add(cardTop);
    const cardBottom = new THREE.Mesh(cardGeo, materials.scholarGreen);
    cardBottom.position.set(0.08, -0.06, -0.06);
    cardBottom.rotation.z = -0.1;
    flashcardGroup.add(cardBottom);
    flashcardGroup.position.set(-1.6, -0.6, 0.9);
    flashcardGroup.rotation.set(0.2, 0.35, -0.2);
    group.add(flashcardGroup);

    // Layer Z3: Foreground Object 3 — Study Timer Orb
    const timerGroup = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(0.45, 32, 32);
    const sphereMesh = new THREE.Mesh(sphereGeo, materials.goldMetallic);
    sphereMesh.castShadow = true;
    timerGroup.add(sphereMesh);

    const ringTorus = new THREE.TorusGeometry(0.55, 0.02, 16, 50);
    const ringTorusMesh = new THREE.Mesh(ringTorus, materials.terracotta);
    ringTorusMesh.rotation.x = Math.PI / 2;
    timerGroup.add(ringTorusMesh);

    timerGroup.position.set(1.1, -1.0, 1.2);
    group.add(timerGroup);

    // Layer Z3: Foreground Object 4 — StudyMate AI Diamond Crystal
    const aiGroup = new THREE.Group();
    const octaGeo = new THREE.OctahedronGeometry(0.4, 0);
    const octaMesh = new THREE.Mesh(octaGeo, materials.terracotta);
    octaMesh.castShadow = true;
    aiGroup.add(octaMesh);
    const aiRingGeo = new THREE.TorusGeometry(0.6, 0.015, 16, 40);
    const aiRingMesh = new THREE.Mesh(aiRingGeo, materials.scholarGreen);
    aiRingMesh.rotation.x = Math.PI / 4;
    aiGroup.add(aiRingMesh);
    aiGroup.position.set(-1.2, 1.1, 1.1);
    group.add(aiGroup);

    // Layer Z3: Foreground Object 5 — Student Avatar Silhouette Capsule
    const studentGroup = new THREE.Group();
    const headGeo = new THREE.SphereGeometry(0.25, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, materials.forestCover);
    headMesh.position.y = 0.4;
    studentGroup.add(headMesh);
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.35, 0.6, 24);
    const bodyMesh = new THREE.Mesh(bodyGeo, materials.scholarGreen);
    studentGroup.add(bodyMesh);
    studentGroup.position.set(0.1, -1.2, 0.7);
    studentGroup.rotation.z = -0.1;
    group.add(studentGroup);

    // Raycaster for independent object hover responses
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();
    let hoveredObject: THREE.Object3D | null = null;

    // Interactive target objects mapping
    const interactiveGroups = [
      { group: bookGroup, name: 'book', baseZ: 0, scaleTarget: 1 },
      { group: paperGroup, name: 'paper', baseZ: 0.8, scaleTarget: 1 },
      { group: flashcardGroup, name: 'flashcard', baseZ: 0.9, scaleTarget: 1 },
      { group: timerGroup, name: 'timer', baseZ: 1.2, scaleTarget: 1 },
      { group: aiGroup, name: 'ai', baseZ: 1.1, scaleTarget: 1 },
      { group: studentGroup, name: 'student', baseZ: 0.7, scaleTarget: 1 },
    ];

    // Mouse movement parallax state
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.28;
      targetRotX = y * 0.22;

      // Update raycaster
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Scroll depth effect
    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Raycast test for hover elevation
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(group.children, true);

      hoveredObject = null;
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj.parent && obj.parent !== group) {
          obj = obj.parent;
        }
        hoveredObject = obj;
      }

      // Smooth mouse lerp
      currentRotX += (targetRotX - currentRotX) * 0.06;
      currentRotY += (targetRotY - currentRotY) * 0.06;
      group.rotation.x = currentRotX;
      group.rotation.y = currentRotY + Math.sin(elapsedTime * 0.5) * 0.03;

      // Update interactive groups with independent floating & hover responses
      interactiveGroups.forEach((item) => {
        const isHovered = hoveredObject === item.group;
        item.scaleTarget = isHovered ? 1.18 : 1.0;

        // Smooth scale interpolation
        item.group.scale.x += (item.scaleTarget - item.group.scale.x) * 0.1;
        item.group.scale.y += (item.scaleTarget - item.group.scale.y) * 0.1;
        item.group.scale.z += (item.scaleTarget - item.group.scale.z) * 0.1;
      });

      // Micro floating animation for depth objects with independent phases
      bookGroup.position.y = 0.2 + Math.sin(elapsedTime * 1.2) * 0.08;
      paperGroup.position.y = 0.8 + Math.cos(elapsedTime * 1.4) * 0.1;
      paperGroup.rotation.z = 0.15 + Math.sin(elapsedTime * 0.8) * 0.05;

      flashcardGroup.position.y = -0.6 + Math.sin(elapsedTime * 1.6) * 0.09;
      flashcardGroup.rotation.y = 0.35 + Math.cos(elapsedTime * 1.1) * 0.08;

      timerGroup.position.y = -1.0 + Math.cos(elapsedTime * 1.8) * 0.1;
      timerGroup.rotation.y = elapsedTime * 0.6;
      ringMesh.rotation.z = elapsedTime * 0.2;

      aiGroup.position.y = 1.1 + Math.sin(elapsedTime * 2.0) * 0.12;
      aiGroup.rotation.y = elapsedTime * 0.9;
      aiRingMesh.rotation.z = -elapsedTime * 0.5;

      studentGroup.position.y = -1.2 + Math.cos(elapsedTime * 1.0) * 0.05;

      // Scroll camera zoom & composition morph
      const targetZ = Math.max(4.2, 6.5 - scrollY * 0.004);
      const targetY = scrollY * 0.0015;
      camera.position.z += (targetZ - camera.position.z) * 0.08;
      camera.position.y += (targetY - camera.position.y) * 0.08;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full h-[400px] sm:h-[460px] lg:h-[520px] ${className}`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

