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

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting: Warm key light, cool soft ambient
    const ambientLight = new THREE.AmbientLight(0xf5f0e8, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xd7a84a, 2.0);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xc76b4a, 1.5, 10);
    pointLight.position.set(-3, -2, 2);
    scene.add(pointLight);

    // Group for floating educational objects
    const group = new THREE.Group();
    scene.add(group);

    // Create 3D educational materials (Paper/Book/Laptop/Timer meshes)
    const materials = {
      bookCover: new THREE.MeshStandardMaterial({ color: 0x1f473b, roughness: 0.3, metalness: 0.1 }),
      pages: new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.8 }),
      terracotta: new THREE.MeshStandardMaterial({ color: 0xc76b4a, roughness: 0.4 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xd7a84a, metalness: 0.6, roughness: 0.2 }),
    };

    // 1. Book mesh
    const bookGroup = new THREE.Group();
    const coverGeo = new THREE.BoxGeometry(1.6, 2.2, 0.2);
    const coverMesh = new THREE.Mesh(coverGeo, materials.bookCover);
    bookGroup.add(coverMesh);
    const pageGeo = new THREE.BoxGeometry(1.5, 2.1, 0.18);
    const pageMesh = new THREE.Mesh(pageGeo, materials.pages);
    pageMesh.position.x = 0.05;
    bookGroup.add(pageMesh);
    bookGroup.position.set(-1.4, 0.6, 0);
    bookGroup.rotation.set(0.3, 0.4, -0.2);
    group.add(bookGroup);

    // 2. Laptop / Screen frame
    const laptopGroup = new THREE.Group();
    const screenGeo = new THREE.BoxGeometry(2.4, 1.6, 0.1);
    const screenMesh = new THREE.Mesh(screenGeo, materials.bookCover);
    laptopGroup.add(screenMesh);
    const displayGeo = new THREE.PlaneGeometry(2.2, 1.4);
    const displayMesh = new THREE.Mesh(displayGeo, materials.pages);
    displayMesh.position.z = 0.06;
    laptopGroup.add(displayMesh);
    laptopGroup.position.set(1.2, -0.4, 0.5);
    laptopGroup.rotation.set(-0.2, -0.3, 0.1);
    group.add(laptopGroup);

    // 3. Question paper / Flashcard floating
    const cardGeo = new THREE.BoxGeometry(1.2, 1.6, 0.05);
    const cardMesh = new THREE.Mesh(cardGeo, materials.terracotta);
    cardMesh.position.set(0.2, 1.2, -0.5);
    cardMesh.rotation.set(0.2, -0.2, 0.3);
    group.add(cardMesh);

    // 4. Timer / Badge sphere
    const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMesh = new THREE.Mesh(sphereGeo, materials.gold);
    sphereMesh.position.set(-0.8, -1.2, 0.8);
    group.add(sphereMesh);

    // Mouse movement parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Scroll influence
    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Continuous slow floating rotation
      group.rotation.y += 0.004;
      bookGroup.position.y = 0.6 + Math.sin(Date.now() * 0.0015) * 0.12;
      laptopGroup.position.y = -0.4 + Math.cos(Date.now() * 0.0018) * 0.1;
      cardMesh.position.y = 1.2 + Math.sin(Date.now() * 0.002) * 0.15;
      sphereMesh.position.y = -1.2 + Math.cos(Date.now() * 0.0022) * 0.12;

      // Mouse tilt (max +/- 2 deg)
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, mouseY * 0.1, 0.05);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, mouseX * 0.15, 0.05);

      // Scroll camera zoom
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, Math.max(4.5, 7 - scrollY * 0.003), 0.05);

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
    <div className={`relative w-full h-[380px] lg:h-[480px] ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
