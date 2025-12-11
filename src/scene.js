import * as THREE from 'three'
import {
    PointerLockControls
} from 'three/examples/jsm/controls/PointerLockControls.js';
const textureLoader = new THREE.TextureLoader()
import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
const modelLoader = new GLTFLoader();
import {
    CSG
} from 'three-csg-ts';
import {
    GUI
} from 'lil-gui';

const canvas = document.querySelector('#room-canvas');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1a1a');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 0);
camera.lookAt(0, 0, -6.2);

//управление камерой
const controls = new PointerLockControls(camera, document.body);

document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyW') {
        controls.moveForward(0.1)
    }

    if (event.code === 'KeyA') {
        controls.moveRight(-0.1)
    }

    if (event.code === 'KeyS') {
        controls.moveForward(-0.1)
    }

    if (event.code === 'KeyD') {
        controls.moveRight(0.1)
    }

    if (event.code === "Enter") {
        if (controls.isLocked) {
            controls.unlock()
        } else {
            controls.lock();
        }
    }
});

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;

//добавление стен
const walls = [];

function makeWall(width, height, x, y, z, rotX = 0, rotY = 0, PBR = {}) {
    const thickness = 0.2;
    const geom = new THREE.BoxGeometry(width, height, thickness);

    const material = PBR.albedo ?
        new THREE.MeshStandardMaterial({
            map: PBR.albedo,
            normalMap: PBR.normal || null,
            roughnessMap: PBR.roughness || null,
            side: THREE.DoubleSide,
            metalness: 0.3,
        }) :
        new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            side: THREE.DoubleSide
        });

    const wall = new THREE.Mesh(geom, material);
    wall.position.set(x, y, z);
    wall.rotateX(rotX);
    wall.rotateY(rotY);
    return wall;
};

const width = 13;
const depth = 10;
const height = 7;
const pi = Math.PI;

const loadAndResizeTexture = (texture, sizeA, sizeB) => {
    const t = textureLoader.load(texture);
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(sizeA, sizeB)
    return t
};

//загрузка текстур
const floor = makeWall(width, depth, 0, 0, 0, pi / 2, 0, {
    albedo: loadAndResizeTexture('/assets/textures/wood_texture/WoodFloor034_2K-JPG_Color.jpg', 5, 5),
    roughnessMap: loadAndResizeTexture('/assets/textures/wood_texture/WoodFloor034_2K-JPG_Roughness.jpg', 5, 5),
    normalMap: loadAndResizeTexture('/assets/textures/wood_texture/WoodFloor034_2K-JPG_NormalGL.jpg', 5, 5)
});

walls.push(floor);

const backWall = makeWall(width, height, 0, height / 2, -depth / 2, 0, 0, {
    albedo: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-diffuse.jpg', 5, 5),
    roughnessMap: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-specular.jpg', 5, 5),
    normalMap: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-normal.jpg', 5, 5)
});

walls.push(backWall);

const frontWall = makeWall(width + 1, height + 1, 0, height / 2, depth / 2, 0, 0, {
    albedo: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-diffuse.jpg', 5, 5),
    roughnessMap: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-specular.jpg', 5, 5),
    normalMap: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-normal.jpg', 5, 5)
});


//создание отверствия в стене под окно
const windowHole = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 3.8, 0.4),
    new THREE.MeshStandardMaterial()
);

const wallWithHole = CSG.toMesh(
    CSG.fromMesh(frontWall).subtract(CSG.fromMesh(windowHole)),
    new THREE.Matrix4(),
    frontWall.material
);

wallWithHole.position.set(0, height / 2, depth / 2);

walls.push(wallWithHole)

const leftWall = makeWall(depth, height, -width / 2, height / 2, 0, 0, pi / 2, {
    albedo: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-diffuse.jpg', 5, 5),
    roughnessMap: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-specular.jpg', 5, 5),
    normalMap: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-normal.jpg', 5, 5)
});

walls.push(leftWall);

const rightWall = makeWall(depth, height, width / 2, height / 2, 0, 0, pi / 2, {
    albedo: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-diffuse.jpg', 5, 5),
    roughnessMap: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-specular.jpg', 5, 5),
    normalMap: loadAndResizeTexture('/assets/textures/wallpaper_10-2K/2K-walllpaper_10-normal.jpg', 5, 5)
});

walls.push(rightWall);

const ceiling = makeWall(width, depth, 0, height, 0, pi / 2, 0, {
    albedo: loadAndResizeTexture('/assets/textures/ceiling_texture/WhiteStuccoWall02_2K_BaseColor.png', 0.2, 0.2),
    roughnessMap: loadAndResizeTexture('/assets/textures/ceiling_texture/WhiteStuccoWall02_2K_Roughness.png', 0.2, 0.2),
    normalMap: loadAndResizeTexture('/assets/textures/ceiling_texture/WhiteStuccoWall02_2K_Normal.png', 0.2, 0.2)
});

walls.push(ceiling);

//добавление мебели
const modelDictionary = {
    bedModel: '/assets/models/bed__bedside_table/scene.gltf',
    ceilingLamp: '/assets/models/ceiling_lamp_flower_style/scene.gltf',
    windowModel: '/assets/models/window/scene.gltf',
    doorModel: '/assets/models/wooden_door/scene.gltf',
    woodenTableModel: '/assets/models/wooden_table/scene.gltf'
};

function loadModel(url) {
    return new Promise((resolve, reject) => {
        modelLoader.load(
            url,
            gltf => {
                //добавление шедоумап каждой модели мебели
                gltf.scene.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                resolve(gltf.scene);
            },
            undefined,
            error => reject(error)
        );
    });
};

async function loadAndAssignModels(dict) {
    return new Promise(async (resolve, reject) => {
        const keys = Object.keys(dict);
        const urls = Object.values(dict);
        const promises = urls.map(url => loadModel(url));
        try {
            const loadedModels = await Promise.all(promises);
            keys.forEach((key, index) => {
                dict[key] = loadedModels[index];
            });
            resolve(dict);
        } catch (error) {
            reject(error);
        }
    });
};

//расстановка мебели
loadAndAssignModels(modelDictionary).then(models => {
    models.bedModel.scale.set(0.02, 0.02, 0.02);
    models.bedModel.position.set(-4.1, 0, -3.8);
    models.bedModel.rotateY(pi / 2);
    scene.add(models.bedModel);
    models.windowModel.scale.set(0.06, 0.06, 0.06);
    models.windowModel.position.set(-0.5, 0.8, 6.2);
    models.windowModel.rotateY(pi / 2);
    scene.add(models.windowModel);
    models.doorModel.scale.set(1.8, 1.9, 1.9);
    models.doorModel.position.set(-6.3, 2.2, 4.2);
    scene.add(models.doorModel);
    models.ceilingLamp.scale.set(0.02, 0.02, 0.02);
    models.ceilingLamp.position.set(0, 4, 0);
    scene.add(models.ceilingLamp);
    models.woodenTableModel.scale.set(7, 7, 7);
    models.woodenTableModel.position.set(0, 0, -2);
    scene.add(models.woodenTableModel);
});

//добавление шедоумап каждой стене
walls.forEach(obj => {
    obj.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(obj);
});

//свет лампы
const lampLight = new THREE.PointLight(0xf7e9c7, 0, 100, Math.PI, 1);
lampLight.position.set(0, 5, 0);
lampLight.castShadow = true;
lampLight.shadow.bias = -0.0003;
lampLight.shadow.normalBias = 0.02;
lampLight.shadow.mapSize.width = 1024;
lampLight.shadow.mapSize.height = 1024;
lampLight.shadow.camera.near = 1;
lampLight.shadow.camera.far = 6;
scene.add(lampLight);

//свет из-за окна для симуляции солнца, меняем интенсивность для симуляции дня и вечера
const lightBehindWindow = new THREE.PointLight(0xf7e9c7, 300, 100, Math.PI, 1);
lightBehindWindow.position.set(-0.5, 4, 9);
lightBehindWindow.castShadow = true;
lightBehindWindow.shadow.bias = -0.0003
lightBehindWindow.shadow.normalBias = 0.02;
lightBehindWindow.shadow.mapSize.width = 1024
lightBehindWindow.shadow.mapSize.height = 1024
lightBehindWindow.shadow.camera.near = 1;
lightBehindWindow.shadow.camera.far = 6;
scene.add(lightBehindWindow);

//поскольку three не имеет рейтрейсинга для отражения света из-за окна, добавляем PointLight внуть
const lightInside = new THREE.PointLight(0xf7e9c7, 150, 100, Math.PI, 1);
lightInside.position.set(0, 4, 0);
scene.add(lightInside);

//добавление интерфейса для контроля освещения
const gui = new GUI();

const settings = {
    timeOfDay: 'День',
};

function updateLights() {
    if (settings.timeOfDay === 'День') {
        lightInside.intensity = 150;
    } else {
        lightInside.intensity = 10;
    }
};

gui.add(settings, 'timeOfDay', ['День', 'Вечер']).name('Время дня').onChange(updateLights);
gui.add(lampLight, 'intensity', 0, 150).step(5).name('Интенсивность света лампы');

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});