import '../styles/index.scss';
import loadTexture from '~/scripts/util/texture-loader';
import * as THREE from 'three';
import MSDF from './MSDFText';
import * as dat from 'dat.gui';

window.THREE = THREE;

const map = (value, minA, maxA, minB, maxB, clamped = false) => {
	if (clamped) value = Math.min(maxA, Math.max(minA, value));
	return ((value - minA) / (maxA - minA)) * (maxB - minB) + minB;
}


class App {
	constructor() {
		this.animate = this.animate.bind(this);
		this.resize = this.resize.bind(this);

		this.vp = {
			width: window.innerWidth,
			height: window.innerHeight,
			dpr: devicePixelRatio || 1
		}

		this.message = 'titan';
		this.normalScale = 1;
		this.normalDisplacement = 0.1;
		this.matcapMap = 9;
		this.normalMap = 1;
		this.fontSize = map(this.vp.width, 300, 1920, 1, 6);
		this.outline = false;
		this.stroke = 15;

		this.setup();
		this.setupGUI();
	}

	setupGUI() {
		const gui = new dat.GUI();
		gui.add(this, 'message').onChange(e => {
			this.msdfText.update(e.toUpperCase());
		});
		gui.add(this, 'fontSize', 1, 10).step(0.1).onChange(e => {
			this.msdfText.fontSize = e;
			this.msdfText.mesh.scale.set(e, e, 1);
			this.msdfText.calcBounds();
		});
		gui.add(this, 'normalScale', 0, 2).onChange(e => {
			this.msdfText.mesh.material.uniforms.normalScale.value = e;
		});
		gui.add(this, 'normalDisplacement', 0, 1).onChange(e => {
			this.msdfText.mesh.material.uniforms.normalDisplacement.value = e;
		});
		gui.add(this, 'normalMap', 1, 6).step(1).onChange(e => {
			this.updateNormal(e);
		});
		gui.add(this, 'matcapMap', 1, 49).step(1).onChange(e => {
			this.updateMatcap(e);
		});
		gui.add(this, 'outline').onChange(e => {
			this.msdfText.mesh.material.uniforms.outline.value = e;
		});
		gui.add(this, 'stroke', 1, 30).step(1).onChange(e => {
			this.msdfText.mesh.material.uniforms.stroke.value = e;
		});
	}

	async setup() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera( this.vp.width / - 2, this.vp.width / 2, this.vp.height / 2, this.vp.height / - 2, 1, 1000 );

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize( this.vp.width, this.vp.height );
		this.renderer.setPixelRatio(this.vp.dpr);
		document.body.appendChild( this.renderer.domElement );

		this.camera.position.z = 5;

		this.msdfText = await this.setupText();
		this.scene.add(this.msdfText.mesh);
		this.msdfText.resize(this.vp);

		window.addEventListener('mousemove', e => {
			const x = (e.clientX - this.vp.width*0.5) * 0.5;
			const y = (e.clientY - this.vp.height*0.5) * 0.5;
			this.msdfText.mesh.material.uniforms.mouse.value = [x,y];
		});
		window.addEventListener('touchmove', e => {
			const x = (e.touches[0].clientX - this.vp.width*0.5) * 0.5;
			const y = (e.touches[0].clientY - this.vp.height*0.5) * 0.5;
			this.msdfText.mesh.material.uniforms.mouse.value = [x,y];
		});

		window.addEventListener('resize', this.resize);

		this.animate();
	}

	async updateMatcap(index) {
		const matcapMap = await loadTexture(`public/matcaps/${index.toString().padStart(5, '0')}.png`);
		matcapMap.needsUpdate = true;
		this.msdfText.mesh.material.uniforms.matcapMap.value = matcapMap;
	}

	async updateNormal(index) {
		const normalMap = await loadTexture(`public/normals/${index.toString().padStart(5, '0')}.jpg`);
		normalMap.needsUpdate = true;
		this.msdfText.mesh.material.uniforms.normalMap.value = normalMap;
	}

	async setupText() {
		const normalMap = await loadTexture(`public/normals/${this.normalMap.toString().padStart(5, '0')}.jpg`);
		const matcapMap = await loadTexture(`public/matcaps/${this.matcapMap.toString().padStart(5, '0')}.png`);
		normalMap.needsUpdate = true;
		matcapMap.needsUpdate = true;

		return await new MSDF({
            text: this.message,
            fontSize: this.fontSize,
            lineHeight: 0.7,
            letterSpacing: 1,
            align: 'center',
            normalMap,
            matcapMap,
            width: this.vp.width*0.9,
            normalScale: this.normalScale,
            normalDisplacement: this.normalDisplacement,
            outline: this.outline,
            stroke: this.stroke
        }).setup();
	}

	animate() {
		requestAnimationFrame( this.animate );

		this.renderer.setClearColor(0x050505);
		this.renderer.render( this.scene, this.camera );
	};

	resize() {
		this.vp.width = window.innerWidth;
		this.vp.height = window.innerHeight;

		this.renderer.setSize(this.vp.width, this.vp.height);
		this.msdfText.resize(this.vp);

		this.camera.left = this.vp.width / - 2;
		this.camera.right = this.vp.width / 2;
		this.camera.top = this.vp.height / 2;
		this.camera.bottom = this.vp.height / - 2;
		this.camera.updateProjectionMatrix();

		this.msdfText.update(this.message.toUpperCase());
	}
}

new App();
