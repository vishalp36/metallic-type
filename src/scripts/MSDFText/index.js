import * as THREE from 'three';
import { manifold } from './fonts';
import createGeometry from './msdf-jam-3/three-bmfont-text';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

const toRadians = val => (val / 180) * Math.PI;

export default class MSDFText {
    constructor(options = {}) {
        this.options = Object.assign(
            {
                text: 'TEXT TEXT',
                align: 'left',
                lineHeight: 0.8,
                fontSize: 5,
                color: new THREE.Color('#ff0000'),
                outline: false,
                opacity: 1
            },
            options
        );
        this.fontSize = this.options.fontSize;
    }

    async setup() {
        this.object3d = new THREE.Object3D();
        this.manifoldMap = await manifold.map;
        this.manifoldData = await manifold.json;
        this.baseFontSize = this.manifoldData.info.size;

        await this.setupText();
        this.object3d.add(this.mesh);

        return this;
    }

    setupText() {
        const geo = this.geo = createGeometry({
            align: this.options.align,
            font: this.manifoldData,
            lineHeight: this.manifoldData.common.lineHeight * this.options.lineHeight,
            letterSpacing: this.options.letterSpacing,
            text: this.options.text.toUpperCase().toString(),
            width: this.options.width / this.fontSize
        });

        const uniforms = {
            uAlpha: { value: this.options.opacity || 0 },
            msdfMap: { value: this.manifoldMap },
            color: { value: this.options.color },
            resolution: { value: [0, 0] },
            normalMap: {value: this.options.normalMap },
            matcapMap: {value: this.options.matcapMap },
            mouse: {value: [0,0]},
            normalScale: {value: this.options.normalScale || 1},
            normalDisplacement: {value: this.options.normalDisplacement || 1},
            stroke: {value: this.options.stroke || 1},
            outline: {value: this.options.outline || false}
        };

        const mat = new THREE.ShaderMaterial({
            uniforms,
            defines: {
                OUTLINE: this.options.outline
            },
            transparent: true,
            vertexShader,
            fragmentShader
        });

        mat.extensions.derivatives = true;

        const mesh = this.mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = toRadians(180);

        mesh.scale.set(this.fontSize, this.fontSize, 1);

        this.calcBounds();
    }

    calcBounds() {
        const geo = this.geo;
        const mesh = this.mesh;

        this.geo.computeBoundingBox();

        this.boundingBox = {
            width: Math.abs(geo.boundingBox.min.x) + geo.boundingBox.max.x,
            height: geo.boundingBox.min.y + geo.boundingBox.max.y
        };

        if (this.options.align === 'center') {
            mesh.position.x = -this.boundingBox.width * this.fontSize * 0.5;
        } else if (this.options.align === 'left') {
            // mesh.position.x -= window.innerHeight * 0.65;
        } else if (this.options.align === 'right') {
            mesh.position.x = -this.boundingBox.width * this.fontSize;
        }

        mesh.position.y = this.boundingBox.height * this.fontSize * 0.5;
    }

    update(text) {
        this.geo.update(text);
        this.calcBounds();
    }

    resize({width, height, dpr}) {
        this.mesh.material.uniforms.resolution.value = [width*dpr, height*dpr];
    }
}
