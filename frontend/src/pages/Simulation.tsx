import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const simulationHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Predictive Streetlight Simulation</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Orbitron:wght@500;700&display=swap');

        body { 
            margin: 0; 
            overflow: hidden; 
            font-family: 'Inter', sans-serif; 
            background-color: #000;
            color: #e0e0e0;
        }
        canvas { display: block; }

        .panel {
            position: absolute;
            background-color: rgba(10, 20, 40, 0.85);
            backdrop-filter: blur(5px);
            padding: 15px;
            border-radius: 12px;
            border: 1px solid rgba(0, 255, 255, 0.3);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.15), inset 0 0 5px rgba(0, 255, 255, 0.1);
            z-index: 10;
        }

        .panel h3 {
            margin-top: 0;
            margin-bottom: 12px;
            font-family: 'Orbitron', sans-serif;
            font-size: 16px;
            color: #00ffff;
            border-bottom: 1px solid rgba(0, 255, 255, 0.5);
            padding-bottom: 8px;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
        }

        #title-text {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: #f0f0f0;
            font-size: 28px;
            font-family: 'Orbitron', sans-serif;
            font-weight: bold;
            text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
            z-index: 10;
        }

        #stats-panel {
            top: 20px;
            left: 20px;
            width: 300px;
        }
        #stats-panel p {
            margin: 8px 0;
            font-size: 14px;
        }
        #stats-panel span {
            font-weight: bold;
            color: #ffff00;
            float: right;
        }

        #controls-container {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 300px; /* --- FIX: Added explicit width to prevent collapsing --- */
        }

        .control-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .panel button {
            background: linear-gradient(145deg, #2a2a3a, #1a1a2a);
            color: #e0e0e0;
            border: 1px solid rgba(0, 255, 255, 0.4);
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
        }

        .panel button:hover {
            background: linear-gradient(145deg, #3a3a4a, #2a2a3a);
            color: #fff;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }

        .panel button.active {
            background: linear-gradient(145deg, #00ffff, #00b8b8);
            color: #001a1a;
            font-weight: bold;
            box-shadow: 0 0 15px #00ffff;
            border-color: #00ffff;
        }

        #view-controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
        }
        #view-controls .control-group {
            flex-direction: row;
        }
        
        #instructions {
            position: absolute;
            bottom: 20px;
            left: 20px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            transition: opacity 1s ease-in-out 5s;
            opacity: 1;
        }
        #instructions.fade-out {
            opacity: 0;
        }

        /* --- NEW: Responsive Layout Styles --- */
        @media (max-width: 800px) {
            #title-text {
                font-size: 22px;
                top: 15px;
            }
            .panel {
                padding: 12px;
            }
            #stats-panel {
                width: 250px;
            }
            #instructions {
                display: none; /* Hide for more space on tablets */
            }
        }

        @media (max-width: 640px) {
             #stats-panel {
                top: 10px;
                left: 10px;
                width: calc(100% - 20px); /* Full width */
                z-index: 11;
            }
            #controls-container {
                top: 165px; /* Position below stats panel, moved up */
                left: 10px;
                right: auto;
                width: calc(100% - 20px); /* Full width */
                gap: 10px; /* Reduced gap between panels */
            }
            #view-controls {
                bottom: 10px;
            }
            #title-text {
                /* Hide title on very small screens to prevent overlap */
                display: none; 
            }

            /* --- FIX: Make all UI elements more compact --- */
            .panel {
                padding: 10px;
            }
            .panel h3 {
                margin-bottom: 8px;
                padding-bottom: 6px;
                font-size: 15px;
            }
            .control-group {
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
                gap: 5px; /* Reduced gap for row layout */
            }
            .panel button {
                padding: 8px 10px; /* Reduced padding for smaller screens */
                flex-grow: 1; /* Allow buttons to grow and fill space nicely */
            }
        }

    </style>
</head>
<body>
    <div id="title-text">AI Predictive Streetlight Simulation</div>

    <div id="stats-panel" class="panel">
        <h3>Energy Savings Analysis</h3>
        <p>Smart System: <span id="smart-energy">0.0000 kWh</span></p>
        <p>Traditional System: <span id="traditional-energy">0.0000 kWh</span></p>
        <p>Energy Saved: <span id="energy-saved">0.0000 kWh</span></p>
    </div>

    <div id="controls-container">
        <div id="system-mode-panel" class="panel">
            <h3>System Mode</h3>
            <div class="control-group">
                <button id="btn-smart-mode" class="active">Smart AI</button>
                <button id="btn-traditional-mode">Traditional</button>
            </div>
        </div>
        <div id="scenario-controls" class="panel">
            <h3>Traffic Scenario</h3>
             <div class="control-group">
                <button id="btn-no-traffic">No Traffic</button>
                <button id="btn-low-traffic" class="active">Low Traffic</button>
                <button id="btn-high-traffic">High Traffic</button>
                <button id="btn-emergency">Emergency</button>
            </div>
        </div>
    </div>
    
    <div id="view-controls" class="panel">
        <div class="control-group">
             <button id="btn-orbit-view" class="active">Orbit View</button>
             <button id="btn-street-view">Street View</button>
        </div>
    </div>

    <div id="instructions">
        <strong>Tip:</strong> In 'Street View', press 'C' to cycle between vehicles.
    </div>

    <script>
        window.onload = function() {
            // --- Scene Setup ---
            const scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x0a0a1a, 50, 400);

            // --- Camera Setup ---
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 60, 80);

            // --- Renderer Setup ---
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.body.appendChild(renderer.domElement);

            // --- Controls Setup ---
            const controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;

            // --- Lighting and Sky ---
            const ambientLight = new THREE.AmbientLight(0x151520, 0.5);
            scene.add(ambientLight);
            
            const skyGeometry = new THREE.SphereGeometry(400, 32, 15);
            const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x05051a, side: THREE.BackSide });
            const sky = new THREE.Mesh(skyGeometry, skyMaterial);
            scene.add(sky);

            // --- Environment Constants ---
            const roadWidth = 16;
            const roadLength = 600;

            // --- Ground & Roads ---
            const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.5 });
            const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, roadLength), roadMaterial);
            mainRoad.rotation.x = -Math.PI / 2;
            mainRoad.receiveShadow = true;
            scene.add(mainRoad);
            
            // --- Streetlights ---
            const streetlightHeight = 15;
            const lights = [];
            // --- CHANGE: Set base intensity to 60% of max intensity for safety ---
            const maxIntensity = 4.0;
            const baseIntensity = maxIntensity * 0.6; // 2.4
            const streetlightSpacing = 40;

            function createStreetlight(x, z, rotationY = 0) {
                const group = new THREE.Group();
                const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.7 });
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, streetlightHeight, 8), poleMat);
                pole.position.y = streetlightHeight / 2;
                pole.castShadow = true;
                group.add(pole);

                const bulbMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x000000 });
                const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 8), bulbMat);
                bulb.position.set(0, streetlightHeight - 0.5, 0);
                group.add(bulb);
                
                const light = new THREE.SpotLight(0xffffff, baseIntensity, 80, Math.PI * 0.35, 0.5, 1.0);
                light.position.copy(bulb.position);
                light.target.position.set(0, 0, 0);
                
                if (Math.abs(x) < 100 && Math.abs(z) < 100) light.castShadow = true;
                light.shadow.mapSize.width = 1024;
                light.shadow.mapSize.height = 1024;

                group.add(light, light.target);
                group.position.set(x, 0, z);
                group.rotation.y = rotationY;
                scene.add(group);
                
                lights.push({ light, bulb: bulbMat, cooldown: 0, targetIntensity: baseIntensity, originalColor: new THREE.Color(0xffffff) });
            }

            // --- Procedural Buildings ---
            function createBuilding(x, z, rotationY = 0) {
                const height = Math.random() * 80 + 20;
                const color = new THREE.Color(0x202020).addScalar(Math.random() * 0.1);
                const building = new THREE.Mesh(
                    new THREE.BoxGeometry(Math.random() * 10 + 10, height, 10),
                    new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.9 })
                );
                building.position.set(x, height / 2, z);
                building.rotation.y = rotationY;
                building.receiveShadow = true;
                scene.add(building);
            }

            // --- Scene Population ---
            for (let i = -15 / 2; i < 15 / 2; i++) {
                const pos = i * streetlightSpacing;
                if (Math.abs(pos) > roadWidth / 2 + 5) {
                    createStreetlight(-(roadWidth / 2 + 5), pos, -Math.PI / 2);
                    createStreetlight((roadWidth / 2 + 5), pos, Math.PI / 2);
                }
            }
             for (let i = 0; i < 30; i++) {
                const zPos = (Math.random() - 0.5) * roadLength * 0.9;
                const side = (Math.random() > 0.5) ? -25 : 25;
                if (Math.abs(zPos) > roadWidth/2 + 10) createBuilding(side, zPos);
            }

            // --- Vehicle Creation ---
            let cars = [];
            let emergencyVehicle = null;
            let followCar = null;
            let currentCarIndex = 0;

            function createVehicle(config) {
                const group = new THREE.Group();
                const color = config.isEmergency ? 0xffffff : new THREE.Color(Math.random(), Math.random(), Math.random());
                const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.5 });
                
                const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 1), bodyMat);
                body.position.y = 0.4;
                body.castShadow = true;
                group.add(body);

                if(config.isEmergency) {
                    const siren = new THREE.Mesh(
                        new THREE.BoxGeometry(0.5, 0.2, 0.5),
                        new THREE.MeshBasicMaterial({ color: 0xff0000, emissive: 0xff0000 })
                    );
                    siren.position.y = 0.9;
                    group.add(siren);
                    group.siren = siren;
                }
                
                group.position.set(config.x, 0, config.z);
                group.rotation.y = config.speed > 0 ? 0 : Math.PI;
                scene.add(group);

                group.speed = config.speed;
                group.isEmergency = config.isEmergency || false;
                cars.push(group);

                if (group.isEmergency) emergencyVehicle = group;
                if (!followCar) {
                    followCar = group;
                    currentCarIndex = cars.length - 1;
                }
            }

            // --- Scenario Management ---
            let isSmartMode = true;
            const scenarios = {
                'no': { cars: 0 },
                'low': { cars: 5 },
                'high': { cars: 20 },
                'emergency': { cars: 1, emergency: true }
            };

            function clearEntities() {
                cars.forEach(car => scene.remove(car));
                cars = [];
                followCar = null;
                emergencyVehicle = null;
                currentCarIndex = 0;
            }

            function setTrafficScenario(level) {
                clearEntities();
                const config = scenarios[level];

                for (let i = 0; i < config.cars; i++) {
                    const lane = Math.random() > 0.5 ? 4 : -4;
                    const speed = (lane > 0 ? 1 : -1) * (Math.random() * 10 + 15 + (config.emergency ? 20 : 0));
                    createVehicle({
                        x: lane,
                        z: (Math.random() - 0.5) * roadLength,
                        speed: speed,
                        isEmergency: config.emergency || false
                    });
                }
                 document.querySelectorAll('#scenario-controls button').forEach(b => b.classList.remove('active'));
                 // --- FIX: Correctly handle different button ID patterns ---
                 const buttonId = level === 'emergency' ? 'btn-emergency' : 'btn-' + level + '-traffic';
                 const activeButton = document.getElementById(buttonId);
                 if (activeButton) {
                    activeButton.classList.add('active');
                 }
            }

            document.getElementById('btn-no-traffic').addEventListener('click', () => setTrafficScenario('no'));
            document.getElementById('btn-low-traffic').addEventListener('click', () => setTrafficScenario('low'));
            document.getElementById('btn-high-traffic').addEventListener('click', () => setTrafficScenario('high'));
            document.getElementById('btn-emergency').addEventListener('click', () => setTrafficScenario('emergency'));
            
            document.getElementById('btn-smart-mode').addEventListener('click', (e) => {
                isSmartMode = true;
                e.target.classList.add('active');
                document.getElementById('btn-traditional-mode').classList.remove('active');
            });
            document.getElementById('btn-traditional-mode').addEventListener('click', (e) => {
                isSmartMode = false;
                e.target.classList.add('active');
                document.getElementById('btn-smart-mode').classList.remove('active');
            });

            // --- View Mode & Controls ---
            let currentViewMode = 'orbit';
            document.getElementById('btn-orbit-view').addEventListener('click', () => {
                currentViewMode = 'orbit';
                controls.enabled = true;
                document.getElementById('btn-orbit-view').classList.add('active');
                document.getElementById('btn-street-view').classList.remove('active');
            });
            document.getElementById('btn-street-view').addEventListener('click', () => {
                currentViewMode = 'street';
                controls.enabled = false;
                 document.getElementById('btn-street-view').classList.add('active');
                document.getElementById('btn-orbit-view').classList.remove('active');
            });

            window.addEventListener('keydown', (e) => {
                if (currentViewMode === 'street' && e.key.toLowerCase() === 'c' && cars.length > 0) {
                    currentCarIndex = (currentCarIndex + 1) % cars.length;
                    followCar = cars[currentCarIndex];
                }
            });

            // --- Energy Calculation ---
            // --- CHANGE: Adjusted WATT_DIM to correspond to the new baseIntensity ---
            const WATT_DIM = 111, WATT_MAX = 180;
            let totalSmartEnergy = 0, totalTraditionalEnergy = 0;
            const smartEnergyElem = document.getElementById('smart-energy');
            const traditionalEnergyElem = document.getElementById('traditional-energy');
            const energySavedElem = document.getElementById('energy-saved');
            let lastStatUpdateTime = 0;

            // --- Animation Loop ---
            const clock = new THREE.Clock();
            const lightPositionVec = new THREE.Vector3();
            const carPositionVec = new THREE.Vector3();
            const projectedPositionVec = new THREE.Vector3();
            const carDirectionVec = new THREE.Vector3(0, 0, 1);

            // Fade out instructions after a delay
            setTimeout(() => document.getElementById('instructions').classList.add('fade-out'), 1000);

            setTrafficScenario('low');

            function animate(time) {
                requestAnimationFrame(animate);
                const delta = clock.getDelta();
                
                // --- Camera Logic ---
                if (currentViewMode === 'street' && followCar) {
                    const offset = new THREE.Vector3(0, 3, -8);
                    const carPos = followCar.getWorldPosition(new THREE.Vector3());
                    const cameraPos = carPos.clone().add(offset.applyQuaternion(followCar.quaternion));
                    
                    camera.position.lerp(cameraPos, 1.0 - Math.exp(-10 * delta)); // Smoother, frame-rate independent lerp
                    camera.lookAt(carPos);
                } else {
                    controls.update();
                }

                // --- Vehicle Movement & Emergency Siren ---
                cars.forEach(car => {
                    car.position.z += car.speed * delta;
                    if (Math.abs(car.position.z) > roadLength / 2) car.position.z *= -1;
                    if (car.isEmergency) {
                        car.siren.material.emissive.setHex(Math.sin(time * 30) > 0 ? 0xff0000 : 0x0000ff);
                    }
                });

                // --- Lighting Logic ---
                const activationRadius = 40;
                const lookaheadDistance = 60; // How far ahead to "predict"
                let currentFrameSmartPower = 0;

                lights.forEach(lightObj => {
                    if (isSmartMode) {
                        let isActivated = false;
                        let isEmergencyActivation = false; // Track *why* it's activated
                        lightObj.light.getWorldPosition(lightPositionVec);
                        lightObj.light.color.set(lightObj.originalColor); // Reset color each frame

                        if (emergencyVehicle) {
                            emergencyVehicle.getWorldPosition(carPositionVec);
                             if (Math.abs(lightPositionVec.x - carPositionVec.x) < 10) {
                                isActivated = true;
                                isEmergencyActivation = true; // It's an emergency
                            }
                        } 
                        
                        if (!isActivated) { // Only check for normal cars if not already activated by emergency
                            for (const car of cars) {
                                car.getWorldPosition(carPositionVec);
                                carDirectionVec.set(0, 0, car.speed > 0 ? 1 : -1).applyQuaternion(car.quaternion);
                                projectedPositionVec.copy(carPositionVec).add(carDirectionVec.multiplyScalar(lookaheadDistance));
                                
                                if (lightPositionVec.distanceTo(carPositionVec) < activationRadius || lightPositionVec.distanceTo(projectedPositionVec) < activationRadius * 1.5) {
                                    isActivated = true;
                                    break;
                                }
                            }
                        }
                        
                        // --- NEW COOLDOWN LOGIC ---
                        if (isActivated) {
                            lightObj.targetIntensity = maxIntensity;
                            lightObj.cooldown = 5.0; // Set cooldown to 5 seconds as requested
                            if (isEmergencyActivation) {
                                lightObj.light.color.set(0xaaddff); // Blue tint for emergency
                            }
                        } else {
                            if (lightObj.cooldown > 0) {
                                lightObj.cooldown -= delta;
                                lightObj.targetIntensity = maxIntensity; // Keep intensity high
                                // Color remains white (it was reset at the start of the loop)
                            } else {
                                lightObj.targetIntensity = baseIntensity;
                            }
                        }
                        // --- END NEW LOGIC ---

                    } else { // Traditional Mode
                         lightObj.targetIntensity = maxIntensity;
                         lightObj.cooldown = 0; // Reset cooldown if switching modes
                    }

                    // --- NEW VISUAL APPEAL LOGIC (Asymmetric Lerp) ---
                    // Brighten up fast (10.0), fade out slow (1.5)
                    const transitionSpeed = (lightObj.targetIntensity > lightObj.light.intensity) ? 10.0 : 1.5;
                    
                    // Smooth transition and energy calculation
                    lightObj.light.intensity = THREE.MathUtils.lerp(lightObj.light.intensity, lightObj.targetIntensity, transitionSpeed * delta);
                    lightObj.bulb.emissive.setHex(lightObj.light.intensity > baseIntensity + 0.1 ? 0xffff00 : 0x000000);
                    
                    const intensityFraction = (lightObj.light.intensity - baseIntensity) / (maxIntensity - baseIntensity);
                    const currentPower = WATT_DIM + (WATT_MAX - WATT_DIM) * Math.max(0, Math.min(1, intensityFraction));
                    currentFrameSmartPower += currentPower;
                });
                
                // Update energy stats
                totalSmartEnergy += currentFrameSmartPower * delta;
                totalTraditionalEnergy += (lights.length * WATT_MAX) * delta;

                if (time - lastStatUpdateTime > 250) {
                    const toKWh = (ws) => (ws / 3600000).toFixed(4);
                    smartEnergyElem.textContent = toKWh(totalSmartEnergy) + ' kWh';
                    traditionalEnergyElem.textContent = toKWh(totalTraditionalEnergy) + ' kWh';
                    energySavedElem.textContent = toKWh(totalTraditionalEnergy - totalSmartEnergy) + ' kWh';
                    lastStatUpdateTime = time;
                }

                renderer.render(scene, camera);
            }

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }, false);

            animate(0);
        };
    </script>
</body>
</html>`;

export default function Simulation() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'AI Predictive Streetlight Simulation';
  }, []);

  const onBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Predictive Streetlight Simulation</h2>
        <div>
          <Button variant="secondary" onClick={onBack}>Back</Button>
        </div>
      </div>

      <div className="w-full rounded-lg overflow-hidden border" style={{ flex: 1, minHeight: 480 }}>
        <iframe
          title="AI Predictive Streetlight Simulation"
          srcDoc={simulationHtml}
          style={{ width: '100%', height: '100%', border: '0' }}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
