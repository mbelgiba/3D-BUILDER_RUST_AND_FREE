import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './style.css';

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing page element: ${id}`);
  return element as T;
};
const canvas = byId<HTMLCanvasElement>('viewport');
const stage = byId<HTMLDivElement>('viewer-stage');
const toast = byId<HTMLDivElement>('toast');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#111318');
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
camera.position.set(4.1, 3.1, 6.2);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 0.35, 0);
controls.minDistance = 2.2;
controls.maxDistance = 16;

scene.add(new THREE.HemisphereLight('#d9e2ff', '#30323b', 1.15));
const keyLight = new THREE.DirectionalLight('#fff1d9', 1.2);
keyLight.position.set(-3, 5, -4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -6;
keyLight.shadow.camera.right = 6;
keyLight.shadow.camera.top = 6;
keyLight.shadow.camera.bottom = -6;
scene.add(keyLight);
scene.add(keyLight.target);
const grid = new THREE.GridHelper(16, 32, '#44495a', '#282b34');
(grid.material as THREE.Material).transparent = true;
(grid.material as THREE.Material).opacity = 0.62;
scene.add(grid);
const axes = new THREE.AxesHelper(1.7);
scene.add(axes);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.22 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.015;
floor.receiveShadow = true;
scene.add(floor);
const modelGroup = new THREE.Group();
scene.add(modelGroup);

let currentModel: THREE.Object3D | null = null;
let activeObject = 'Primitive sample';
let selectedFile: File | null = null;
let previewUrl = '';
let uploadId = '';
let generationId = '';
let toastTimer = 0;
let history: string[] = ['Workspace opened · primitive sample scene'];

async function apiError(response: Response): Promise<Error> {
  const detail = (await response.text()).trim();
  if (response.status === 503 && detail.includes('TripoSR')) {
    return new Error('Локальная AI-модель пока не установлена. Откройте docs/index.md и выполните шаги установки TripoSR.');
  }
  return new Error(detail || `Ошибка сервера (${response.status}).`);
}

function makeDemoModel(): THREE.Group {
  const demo = new THREE.Group();
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.92, 48, 32), new THREE.MeshStandardMaterial({ color: '#6285d8', roughness: 0.48, metalness: 0.12 }));
  sphere.position.set(-0.56, 0.25, 0.05);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  demo.add(sphere);
  const cube = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: '#df8a62', roughness: 0.62, metalness: 0.04 }));
  cube.position.set(0.79, -0.15, 0.1);
  cube.rotation.set(0.16, -0.34, 0.08);
  cube.castShadow = true;
  cube.receiveShadow = true;
  demo.add(cube);
  return demo;
}

function disposeModel(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
}

function replaceModel(object: THREE.Object3D, name: string, isGenerated: boolean): void {
  if (currentModel) {
    modelGroup.remove(currentModel);
    disposeModel(currentModel);
  }
  currentModel = object;
  modelGroup.add(object);
  activeObject = name;
  byId('model-label').textContent = name;
  byId('model-badge').textContent = isGenerated ? 'GENERATED' : 'DEMO';
  byId('model-badge').classList.toggle('generated', isGenerated);
  byId('inspector-model-name').textContent = name;
  byId('object-state').textContent = isGenerated ? 'AI model' : 'Demo';
  history.unshift(`${isGenerated ? 'Model generated' : 'Demo opened'} · ${name}`);
  syncTransformFields();
}

replaceModel(makeDemoModel(), 'Primitive sample', false);

function resize(): void {
  const width = Math.max(1, stage.clientWidth);
  const height = Math.max(1, stage.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();
function animate(): void {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

function notify(message: string, isError = false): void {
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3600);
}

function setLoading(show: boolean, title = '', detail = '', progress = 0): void {
  byId('loading-overlay').classList.toggle('hidden', !show);
  byId('loading-title').textContent = title;
  byId('loading-detail').textContent = detail;
  byId('progress-fill').setAttribute('style', `width:${Math.max(0, Math.min(100, progress))}%`);
}

function setSelectedImage(file: File | null): void {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = '';
  selectedFile = file;
  uploadId = '';
  document.getElementById('download-link')?.remove();
  const previewWrap = byId('image-preview-wrap');
  const placeholder = byId('upload-placeholder');
  const generate = byId<HTMLButtonElement>('generate-button');
  if (!file) {
    byId<HTMLImageElement>('image-preview').removeAttribute('src');
    previewWrap.classList.add('hidden');
    placeholder.classList.remove('hidden');
    byId('upload-status').textContent = 'A single clear view works best';
    generate.disabled = true;
    return;
  }
  const extension = file.name.toLowerCase().split('.').pop();
  const isSupportedImage = ['image/jpeg', 'image/png'].includes(file.type)
    || (!file.type && ['jpg', 'jpeg', 'png'].includes(extension ?? ''));
  if (!isSupportedImage || file.size > 10 * 1024 * 1024) {
    notify(file.size > 10 * 1024 * 1024 ? 'Image is over the 10 MB size limit.' : 'Choose a JPEG or PNG image.', true);
    selectedFile = null;
    generate.disabled = true;
    previewWrap.classList.add('hidden');
    placeholder.classList.remove('hidden');
    return;
  }
  previewUrl = URL.createObjectURL(file);
  byId<HTMLImageElement>('image-preview').src = previewUrl;
  previewWrap.classList.remove('hidden');
  placeholder.classList.add('hidden');
  byId('upload-status').textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  generate.disabled = false;
}

byId('choose-file').addEventListener('click', () => byId<HTMLInputElement>('image-input').click());
byId('drop-zone').addEventListener('click', (event) => {
  if ((event.target as HTMLElement).closest('button')) return;
  byId<HTMLInputElement>('image-input').click();
});
byId<HTMLInputElement>('image-input').addEventListener('change', (event) => {
  const input = event.currentTarget as HTMLInputElement;
  setSelectedImage(input.files?.[0] ?? null);
});
byId('remove-image').addEventListener('click', (event) => {
  event.stopPropagation();
  byId<HTMLInputElement>('image-input').value = '';
  setSelectedImage(null);
});
const dropZone = byId('drop-zone');
dropZone.addEventListener('dragover', (event) => { event.preventDefault(); dropZone.classList.add('dragging'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
  setSelectedImage(event.dataTransfer?.files[0] ?? null);
});

async function pollGeneration(id: string): Promise<void> {
  for (let attempt = 0; attempt < 360; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 5000));
    const response = await fetch(`/api/generation/${encodeURIComponent(id)}`);
    if (!response.ok) throw await apiError(response);
    const task = await response.json() as { status: string; progress: number; model_url?: string; message?: string };
    setLoading(true, 'Generating your model', `${task.status.toLowerCase().replace('_', ' ')} · ${task.progress}%`, task.progress);
    if (task.status === 'SUCCEEDED' && !task.model_url) throw new Error('Сервис завершил задачу, но не вернул GLB-модель. Проверьте журнал сервера и попробуйте ещё раз.');
    if (task.status === 'SUCCEEDED' && task.model_url) {
      await loadGeneratedModel(task.model_url);
      setLoading(false);
      byId('upload-status').textContent = 'Model ready · approximate reconstruction';
      const link = document.createElement('a');
      link.id = 'download-link';
      link.className = 'model-download';
      link.href = task.model_url;
      link.textContent = 'Download GLB ↗';
      link.setAttribute('download', 'rt-studio-model.glb');
      byId('upload-status').after(link);
      history.unshift('AI generation completed · GLB model is ready');
      return;
    }
    if (['FAILED', 'CANCELED', 'EXPIRED'].includes(task.status)) throw new Error(task.message || `Generation ${task.status.toLowerCase()}.`);
  }
  throw new Error('Generation is taking longer than expected. You can check History or try again later.');
}

async function loadGeneratedModel(url: string): Promise<void> {
  const gltf = await new GLTFLoader().loadAsync(url);
  const object = gltf.scene;
  const bounds = new THREE.Box3().setFromObject(object);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const largest = Math.max(size.x, size.y, size.z, 0.001);
  const scale = 2.7 / largest;
  object.scale.setScalar(scale);
  object.position.copy(center).multiplyScalar(-scale);
  object.traverse((child) => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; } });
  modelGroup.position.set(0, 0, 0);
  modelGroup.rotation.set(0, 0, 0);
  modelGroup.scale.set(1, 1, 1);
  replaceModel(object, 'Generated object', true);
  frameModel();
}

byId('generate-button').addEventListener('click', async () => {
  const button = byId<HTMLButtonElement>('generate-button');
  if (!selectedFile) return;
  button.disabled = true;
  setLoading(true, 'Uploading source image', 'Checking image format and dimensions', 4);
  try {
    if (!uploadId) {
      const form = new FormData();
      form.append('image', selectedFile);
      const upload = await fetch('/api/upload', { method: 'POST', body: form });
      if (!upload.ok) throw await apiError(upload);
      const data = await upload.json() as { id: string; width: number; height: number };
      uploadId = data.id;
      byId('upload-status').textContent = `Verified image · ${data.width} × ${data.height}`;
      setLoading(true, 'Starting generation', 'Sending image to the configured AI service', 10);
    }
    const start = await fetch('/api/generation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ upload_id: uploadId }) });
    if (!start.ok) throw await apiError(start);
    const task = await start.json() as { id: string };
    generationId = task.id;
    history.unshift('AI generation started · ' + new Date().toLocaleTimeString());
    setLoading(true, 'Generating your model', 'This can take a few minutes', 10);
    await pollGeneration(generationId);
    selectedFile = null;
    notify('Your generated model is ready.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The operation failed.';
    byId('upload-status').textContent = message;
    setLoading(false);
    notify(message, true);
  } finally {
    button.disabled = !selectedFile;
  }
});

function frameModel(): void {
  controls.target.set(0, 0.25, 0);
  camera.position.set(4.1, 3.1, 6.2);
  syncCameraPositionFields();
  controls.update();
}
byId('reset-camera').addEventListener('click', frameModel);
byId('camera-reset').addEventListener('click', frameModel);
byId('camera-reset-inline').addEventListener('click', frameModel);
byId('camera-home').addEventListener('click', frameModel);
byId('grid-toggle').addEventListener('click', () => { grid.visible = !grid.visible; byId<HTMLInputElement>('show-grid').checked = grid.visible; });
byId('axes-toggle').addEventListener('click', () => { axes.visible = !axes.visible; byId<HTMLInputElement>('show-axes').checked = axes.visible; });
byId<HTMLInputElement>('show-grid').addEventListener('change', (event) => { grid.visible = (event.currentTarget as HTMLInputElement).checked; });
byId<HTMLInputElement>('show-axes').addEventListener('change', (event) => { axes.visible = (event.currentTarget as HTMLInputElement).checked; });
byId('fullscreen').addEventListener('click', async () => {
  try { if (!document.fullscreenElement) await stage.requestFullscreen(); else await document.exitFullscreen(); } catch { notify('Fullscreen is not available in this browser.', true); }
});

function syncTransformFields(): void {
  const fields = document.querySelectorAll<HTMLInputElement>('[data-transform]');
  fields.forEach((input) => {
    const [property, axis] = input.dataset.transform!.split('.');
    const value = (modelGroup[property as 'position' | 'rotation' | 'scale'] as THREE.Vector3)[axis as 'x' | 'y' | 'z'];
    input.value = property === 'rotation' ? String(Math.round(THREE.MathUtils.radToDeg(value))) : String(Number(value.toFixed(2)));
  });
}
document.querySelectorAll<HTMLInputElement>('[data-transform]').forEach((input) => input.addEventListener('change', () => {
  const [property, axis] = input.dataset.transform!.split('.');
  let value = Number(input.value);
  if (!Number.isFinite(value)) value = 0;
  if (property === 'rotation') value = THREE.MathUtils.degToRad(value);
  const vector = modelGroup[property as 'position' | 'rotation' | 'scale'] as THREE.Vector3;
  vector[axis as 'x' | 'y' | 'z'] = value;
}));

function resetTransform(): void {
  modelGroup.position.set(0, 0, 0);
  modelGroup.rotation.set(0, 0, 0);
  modelGroup.scale.set(1, 1, 1);
  syncTransformFields();
}
document.querySelectorAll<HTMLButtonElement>('[data-reset="transform"]').forEach((button) => button.addEventListener('click', resetTransform));
byId('reset-properties').addEventListener('click', resetTransform);

const ambientLight = scene.children.find((child) => child instanceof THREE.HemisphereLight) as THREE.HemisphereLight;
byId<HTMLInputElement>('light-enabled').addEventListener('change', (event) => { keyLight.visible = (event.currentTarget as HTMLInputElement).checked; });
byId<HTMLInputElement>('light-intensity').addEventListener('input', (event) => {
  keyLight.intensity = Number((event.currentTarget as HTMLInputElement).value);
  byId('light-value').textContent = keyLight.intensity.toFixed(1);
});
document.querySelectorAll<HTMLInputElement>('[data-light]').forEach((input) => input.addEventListener('change', () => {
  const axis = input.dataset.light as 'x' | 'y' | 'z';
  keyLight.position[axis] = Number(input.value) || 0;
}));
byId<HTMLInputElement>('light-color').addEventListener('input', (event) => keyLight.color.set((event.currentTarget as HTMLInputElement).value));
byId<HTMLInputElement>('ambient-light').addEventListener('input', (event) => {
  ambientLight.intensity = Number((event.currentTarget as HTMLInputElement).value) * 5;
  byId('ambient-value').textContent = Number((event.currentTarget as HTMLInputElement).value).toFixed(2);
});

function updateMaterials(update: (material: THREE.MeshStandardMaterial) => void): void {
  currentModel?.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => { if (material instanceof THREE.MeshStandardMaterial) update(material); });
  });
}
byId<HTMLInputElement>('material-color').addEventListener('input', (event) => updateMaterials((material) => material.color.set((event.currentTarget as HTMLInputElement).value)));
byId<HTMLInputElement>('roughness').addEventListener('input', (event) => {
  const value = Number((event.currentTarget as HTMLInputElement).value);
  updateMaterials((material) => { material.roughness = value; });
  byId('roughness-value').textContent = value.toFixed(2);
});
byId<HTMLInputElement>('metalness').addEventListener('input', (event) => {
  const value = Number((event.currentTarget as HTMLInputElement).value);
  updateMaterials((material) => { material.metalness = value; });
  byId('metalness-value').textContent = value.toFixed(2);
});
byId<HTMLInputElement>('fov').addEventListener('input', (event) => {
  camera.fov = Number((event.currentTarget as HTMLInputElement).value);
  camera.updateProjectionMatrix();
  byId('fov-value').textContent = `${camera.fov}°`;
});

const cameraPositionRow = document.createElement('div');
cameraPositionRow.className = 'vector-row camera-position-row';
cameraPositionRow.innerHTML = '<label>Position</label><div class="xyz-fields"><label><i>X</i><input data-camera-position="x" type="number" step="0.1"></label><label><i>Y</i><input data-camera-position="y" type="number" step="0.1"></label><label><i>Z</i><input data-camera-position="z" type="number" step="0.1"></label></div>';
byId('panel-camera').querySelector('.range-row')?.before(cameraPositionRow);
function syncCameraPositionFields(): void {
  document.querySelectorAll<HTMLInputElement>('[data-camera-position]').forEach((input) => {
    const axis = input.dataset.cameraPosition as 'x' | 'y' | 'z';
    input.value = camera.position[axis].toFixed(2);
  });
}
document.querySelectorAll<HTMLInputElement>('[data-camera-position]').forEach((input) => input.addEventListener('change', () => {
  const axis = input.dataset.cameraPosition as 'x' | 'y' | 'z';
  camera.position[axis] = Number(input.value) || 0;
  controls.update();
}));
syncCameraPositionFields();

const resolutionLabel = document.createElement('label');
resolutionLabel.className = 'field-label resolution-label';
resolutionLabel.htmlFor = 'render-resolution';
resolutionLabel.textContent = 'Resolution · quality';
const resolutionSelect = document.createElement('select');
resolutionSelect.id = 'render-resolution';
resolutionSelect.className = 'select-field';
resolutionSelect.innerHTML = '<option value="400x300">400 × 300 · Draft</option><option value="800x600" selected>800 × 600 · Standard</option><option value="1200x900">1200 × 900 · High</option>';
byId<HTMLSelectElement>('render-scene').after(resolutionLabel, resolutionSelect);
resolutionSelect.addEventListener('change', () => {
  byId('render-button').innerHTML = `◉ &nbsp; Render ${resolutionSelect.value.replace('x', ' × ')} PPM`;
});

const renderTab = document.createElement('button');
renderTab.className = 'inspector-tab';
renderTab.dataset.tab = 'render';
renderTab.textContent = 'Render';
document.querySelector('.inspector-tabs')?.append(renderTab);
const renderPanel = document.createElement('div');
renderPanel.className = 'properties-content hidden';
renderPanel.id = 'panel-render';
renderPanel.dataset.panel = 'render';
renderPanel.append(document.querySelector('.render-card')!);
byId('panel-object').before(renderPanel);
document.querySelector<HTMLElement>('.lower-grid')!.style.gridTemplateColumns = '1fr';

document.querySelectorAll<HTMLButtonElement>('.inspector-tab').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.inspector-tab').forEach((tab) => tab.classList.remove('active'));
  document.querySelectorAll('[data-panel]').forEach((panel) => panel.classList.add('hidden'));
  button.classList.add('active');
  byId(`panel-${button.dataset.tab}`).classList.remove('hidden');
}));

byId('render-button').addEventListener('click', async () => {
  const button = byId<HTMLButtonElement>('render-button');
  button.disabled = true;
  byId('render-status').textContent = 'Rendering pixels with the Rust ray tracer…';
  try {
    const [width, height] = resolutionSelect.value.split('x').map(Number);
    const response = await fetch('/api/render', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scene: Number(byId<HTMLSelectElement>('render-scene').value), width, height }) });
    if (!response.ok) throw new Error(await response.text());
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rt-studio-render.ppm';
    link.click();
    URL.revokeObjectURL(url);
    byId('render-status').textContent = `Render complete · ${width} × ${height} PPM downloaded`;
    history.unshift('Ray tracer render completed · ' + new Date().toLocaleTimeString());
    notify('PPM render downloaded.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Render failed.';
    byId('render-status').textContent = message;
    notify(message, true);
  } finally { button.disabled = false; }
});

function openAbout(): void { byId<HTMLDialogElement>('about-dialog').showModal(); }
byId('help-button').addEventListener('click', openAbout);
byId('docs-button').addEventListener('click', () => { window.location.assign('/docs/index.md'); });
byId('close-dialog').addEventListener('click', () => byId<HTMLDialogElement>('about-dialog').close());
byId('about-dialog').addEventListener('click', (event) => { if (event.target === event.currentTarget) byId<HTMLDialogElement>('about-dialog').close(); });
byId('new-project').addEventListener('click', () => {
  resetTransform();
  byId<HTMLInputElement>('image-input').value = '';
  setSelectedImage(null);
  notify('New local workspace is ready.');
});
byId('sidebar-toggle').addEventListener('click', () => byId('sidebar').classList.toggle('collapsed'));
byId('object-more').addEventListener('click', resetTransform);
byId('profile-button').addEventListener('click', openAbout);
document.querySelectorAll<HTMLButtonElement>('[data-nav]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-nav]').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const section = button.dataset.nav!;
  byId('page-title').textContent = section;
  if (section === 'Files') { byId('upload-card').scrollIntoView({ behavior: 'smooth', block: 'center' }); byId<HTMLInputElement>('image-input').click(); }
  else if (section === 'My Models') {
    if (generationId) document.getElementById('download-link')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else notify('No generated models yet. Add an image and create a model.');
  } else if (section === 'History') {
    notify(history.length ? history.slice(0, 2).join('  ·  ') : 'No activity yet.');
  } else if (section === 'Settings') {
    document.querySelector<HTMLButtonElement>('[data-tab="camera"]')?.click();
    notify('Camera preferences are open in the inspector.');
  } else if (section === 'About') openAbout();
  else if (section === 'Home') window.scrollTo({ top: 0, behavior: 'smooth' });
}));

fetch('/api/health').then((response) => {
  if (!response.ok) throw new Error('server unavailable');
  return response.json() as Promise<{ ai_generation?: boolean }>;
}).then((health) => {
  byId('server-label').textContent = health.ai_generation ? 'Server connected · local AI ready' : 'Server connected · install local AI';
  byId('server-label').parentElement?.classList.add('connected');
  byId('ai-state').textContent = health.ai_generation ? 'Ready' : 'Unavailable';
  byId('ai-state-help').textContent = health.ai_generation ? 'TripoSR is installed locally' : 'Install the local TripoSR model';
  byId('ai-state-bar').classList.toggle('ready', !!health.ai_generation);
  if (!health.ai_generation) {
    byId('server-label').parentElement?.classList.add('ai-unavailable');
    byId('upload-status').textContent = 'Image preview works; install TripoSR to generate a 3D model.';
  }
}).catch(() => {
  byId('server-label').textContent = 'Start Rust backend to connect';
  byId('server-label').parentElement?.classList.add('disconnected');
  byId('ai-state').textContent = 'Offline';
  byId('ai-state-help').textContent = 'Start backend with cargo run';
});
