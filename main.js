import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class PortfolioScene {
    constructor() {
        // Create container
        this.canvasContainer = document.createElement('div');
        this.canvasContainer.id = 'three-container';
        Object.assign(this.canvasContainer.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            zIndex: '0'
        });
        document.body.appendChild(this.canvasContainer);

        // Initialize state
        this.islands = [];
        this.projects = [];
        
        document.body.style.background = '#000';
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';

        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.remove();
        
        this.init();
        this.createEnvironment();
        this.loadAssets();
        this.setupUI();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.canvasContainer.appendChild(this.renderer.domElement);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 25);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lighting
        this.setupLighting();
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    createEnvironment() {
        this.createIslands();

        // Central platform
        const platform = new THREE.Mesh(
            new THREE.CylinderGeometry(6, 6, 0.4, 64),
            new THREE.MeshStandardMaterial({
                color: 0x222222,
                metalness: 0.3,
                roughness: 0.7
            })
        );
        platform.position.y = -3;
        this.scene.add(platform);

        this.createParticles();
    }

    createIslands() {
        const categories = ['Frontend', 'Backend', 'Game Dev', 'Web Tech', 'Databases', 'Tools'];
        const islandGeometry = new THREE.ConeGeometry(4, 1, 32);
        const radius = 20;
        
        for (let i = 0; i < 6; i++) {
            const islandMaterial = new THREE.MeshStandardMaterial({ 
                color: new THREE.Color(`hsl(${30 + i * 50}, 70%, 50%)`),
                roughness: 0.7,
                metalness: 0.2
            });
            
            const island = new THREE.Mesh(islandGeometry, islandMaterial);
            const angle = (i / 6) * Math.PI * 2;
            island.position.set(
                Math.cos(angle) * radius,
                -2 + (Math.random() * 3 - 1.5),
                Math.sin(angle) * radius
            );
            island.rotation.y = Math.random() * Math.PI * 2;
            
            // Hit area
            const hitArea = new THREE.Mesh(
                new THREE.SphereGeometry(6),
                new THREE.MeshBasicMaterial({ visible: false })
            );
            hitArea.position.copy(island.position);
            this.scene.add(hitArea);
            
            this.scene.add(island);
            this.islands.push({
                mesh: island,
                hitArea: hitArea,
                category: categories[i]
            });

            // Skill bars
            const bars = new THREE.Group();
            for (let i = 0; i < 4; i++) {
                const height = 0.8 + Math.random() * 2;
                const bar = new THREE.Mesh(
                    new THREE.BoxGeometry(0.5, height, 0.5),
                    new THREE.MeshBasicMaterial({
                        color: new THREE.Color(`hsl(${Math.random() * 60}, 80%, 60%)`),
                        transparent: true,
                        opacity: 0.8
                    })
                );
                bar.position.set((i - 1.5) * 0.6, height/2, 0);
                bars.add(bar);
            }
            bars.position.y = 0.5;
            island.add(bars);
        }
    }

    createParticles() {
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(400 * 3);
        const colors = new Float32Array(400 * 3);

        for (let i = 0; i < 400; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            colors[i * 3] = 0.3 + Math.random() * 0.7;
            colors[i * 3 + 1] = 0.3 + Math.random() * 0.7;
            colors[i * 3 + 2] = 0.3 + Math.random() * 0.7;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        this.particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.particleSystem);
    }

    loadAssets() {
        this.createProjects();
        this.createAvatar();
    }

    createProjects() {
        const projectRadius = 6;
        
        const projects = [
            { type: 'box', color: 0x3498db, size: [1.5, 1.5, 1.5] },
            { type: 'cylinder', color: 0x2ecc71, size: [0.8, 0.8, 2] },
            { type: 'sphere', color: 0xe74c3c, size: [1, 16, 16] }
        ];
        
        projects.forEach((proj, i) => {
            let geometry;
            if (proj.type === 'box') {
                geometry = new THREE.BoxGeometry(...proj.size);
            } else if (proj.type === 'cylinder') {
                geometry = new THREE.CylinderGeometry(proj.size[0], proj.size[1], proj.size[2]);
            } else {
                geometry = new THREE.SphereGeometry(proj.size[0], proj.size[1], proj.size[2]);
            }
            
            const mesh = new THREE.Mesh(
                geometry,
                new THREE.MeshStandardMaterial({
                    color: proj.color,
                    metalness: 0.2,
                    roughness: 0.7
                })
            );
            
            mesh.position.set(
                Math.cos(i * Math.PI * 2 / 3) * projectRadius,
                0,
                Math.sin(i * Math.PI * 2 / 3) * projectRadius
            );
            
            this.scene.add(mesh);
            this.projects.push(mesh);
        });
    }

    createAvatar() {
        const avatarGroup = new THREE.Group();
        
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xf1c40f })
        );
        head.position.y = 1.5;
        avatarGroup.add(head);
        
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x2980b9 })
        );
        body.position.y = 0.5;
        avatarGroup.add(body);
        
        avatarGroup.position.y = -2;
        avatarGroup.scale.set(0.8, 0.8, 0.8);
        this.scene.add(avatarGroup);
        this.avatar = avatarGroup;
    }

    setupUI() {
        this.skillData = {
            'Frontend': {
                level: 0.9,
                description: 'Frontend development expertise',
                technologies: ['JavaScript', 'HTML', 'CSS', 'Tailwind CSS']
            },
            'Backend': {
                level: 0.85,
                description: 'Server-side development',
                technologies: ['Node.js', 'Python', 'PHP']
            },
            'Game Dev': {
                level: 0.8,
                description: 'Game development experience',
                technologies: ['C#', 'Unity', 'Phaser']
            },
            'Web Tech': {
                level: 0.75,
                description: 'Web technologies and frameworks',
                technologies: ['Electron.js', 'Three.js']
            },
            'Databases': {
                level: 0.7,
                description: 'Database management',
                technologies: ['SQLite', 'MySQL']
            },
            'Tools': {
                level: 0.8,
                description: 'Development tools',
                technologies: ['Git', 'Webpack', 'VSCode']
            }
        };

        this.uiPanel = document.createElement('div');
        this.uiPanel.id = 'ui-panel';
        this.uiPanel.innerHTML = `
            <button id="skills-btn">Skills</button>
            <button id="projects-btn">Projects</button>
            <button id="contact-btn">Contact</button>
        `;
        document.body.appendChild(this.uiPanel);

        this.renderer.domElement.addEventListener('click', (event) => {
            if (!this.islands) return;
            
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            
            const hits = raycaster.intersectObjects(
                this.islands.map(island => island.hitArea)
            );
            
            if (hits.length > 0) {
                const island = this.islands.find(i => i.hitArea === hits[0].object);
                this.showSkillDetails(island);
            }
        });

        document.getElementById('skills-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showTextPanel(`
                <h2>My Skills</h2>
                <div class="skills-grid">
                    <div><strong>Frontend:</strong> JavaScript, HTML, CSS, Tailwind</div>
                    <div><strong>Backend:</strong> Node.js, Python, PHP</div>
                    <div><strong>Game Dev:</strong> C#, Unity, Phaser</div>
                    <div><strong>Web Tech:</strong> Electron.js, Three.js</div>
                    <div><strong>Databases:</strong> SQLite, MySQL</div>
                </div>
            `);
        });
        
        document.getElementById('projects-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showTextPanel(`
                <h2>My Projects</h2>
                <div class="project">
                    <h3>3D Portfolio</h3>
                    <p>Built with Three.js to showcase my work and skills.</p>
                    <p><a href="https://github.com/LibmusHawk/Portfolio">https://github.com/LibmusHawk/Portfolio<a/></p>
                </div>
                <div class="project">
                    <h3>Feryx GPX viewer</h3>
                    <p>Application viewing GPX files developed in Electron.js with Node.js backend.</p>
                    <p><a href="https://github.com/LibmusHawk/Feryx_GPX_viewer">https://github.com/LibmusHawk/Feryx_GPX_viewer<a/></p>
                </div>
                <div class="project">
                    <h3>Fungle, Music/Video website</h3>
                    <p>PHP website where you can upload and view music, and videos.</p>
                    <p><a href="https://github.com/LibmusHawk/Fungle">https://github.com/LibmusHawk/Fungle</a></p>
                </div>
            `);
        });
        
        document.getElementById('contact-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showTextPanel(`
                <h2>Contact Me</h2>
                <div class="contact-info">
                    <p><strong>Email: </strong><a href="mailto:linus@hauk.fi">linus@hauk.fi</a></p>
                    <p><strong>GitHub: </strong><a href="https://github.com/LibmusHawk">https://github.com/LibmusHawk</a></p>
                    <p><strong>Phone:</strong> +358 451609994</p>
                </div>
            `);
        });
    }

    showSkillDetails(island) {
        if (!this.islands || !island || !this.skillData[island.category]) return;
        
        const skillData = this.skillData[island.category];
        
        const existingPanel = document.getElementById('skill-panel');
        if (existingPanel) existingPanel.remove();
        
        const panel = document.createElement('div');
        panel.id = 'skill-panel';
        panel.className = 'info-panel';
        panel.innerHTML = `
            <h3>${island.category}</h3>
            <div class="skill-meter">
                <div style="width:${skillData.level * 100}%"></div>
            </div>
            <p>${skillData.description}</p>
            <ul>
                ${skillData.technologies.map(t => `<li>${t}</li>`).join('')}
            </ul>
        `;
        document.body.appendChild(panel);
        
        const islandPos = island.mesh.position.clone();
        islandPos.y += 4;
        const screenPos = islandPos.project(this.camera);
        panel.style.left = `${(screenPos.x * 0.5 + 0.5) * 100}%`;
        panel.style.top = `${(-screenPos.y * 0.5 + 0.5) * 100}%`;
    }

    showTextPanel(content) {
        const existing = document.getElementById('text-panel');
        if (existing) existing.remove();
        
        const panel = document.createElement('div');
        panel.id = 'text-panel';
        panel.className = 'info-panel';
        panel.innerHTML = content;
        
        panel.style.left = '50%';
        panel.style.bottom = '80px';
        panel.style.transform = 'translateX(-50%)';
        
        document.body.appendChild(panel);
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => panel.remove();
        panel.appendChild(closeBtn);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        if (this.islands) {
            this.islands.forEach((island, i) => {
                island.mesh.rotation.y += 0.001 * (i + 1);
                island.mesh.position.y = -2 + Math.sin(Date.now() * 0.001 + i) * 0.5;
                if (island.hitArea) island.hitArea.position.copy(island.mesh.position);
            });
        }
        
        if (this.projects) {
            this.projects.forEach((proj, i) => {
                proj.rotation.y += 0.005 * (i + 1);
                proj.position.y = Math.sin(Date.now() * 0.001 + i * 2) * 0.3;
            });
        }
        
        if (this.avatar) this.avatar.rotation.y += 0.01;
        
        if (this.particleSystem) {
            const positions = this.particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.008;
                if (positions[i + 1] > 30) positions[i + 1] = -30;
            }
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Minimal CSS
const style = document.createElement('style');
style.textContent = `
    #three-container {
        z-index: 0;
    }
    #ui-panel, .info-panel {
        position: fixed;
        z-index: 100;
    }
    .info-panel {
        background: rgba(0,0,0,0.7);
        padding: 20px;
        border-radius: 10px;
        max-width: 400px;
        color: white;
    }
`;
document.head.appendChild(style);

new PortfolioScene();