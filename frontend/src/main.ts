import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import './style.css';

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing page element: ${id}`);
  return element as T;
};
type Locale = 'ru' | 'kk' | 'en';
const translations: Record<Locale, Record<string, string>> = {
  ru: {
    language: 'Язык', landing_kicker: 'ЛОКАЛЬНАЯ 3D-СТУДИЯ', landing_title: 'Преврати изображение<br>в <em>трёхмерную модель.</em>', landing_description: 'Создай 3D-модель по фотографии, доработай её в редакторе и отрендери сцену собственным движком на Rust.', landing_enter: 'Перейти в приложение', github_link: 'Открыть GitHub проекта', landing_local: 'Работает локально', landing_free: 'Бесплатно · Open source', landing_how: 'ОДИН ПРОЦЕСС — ТРИ ИНСТРУМЕНТА', landing_features_title: 'От фото до готовой сцены', landing_feature_ai: 'Генерация из фото', landing_feature_ai_desc: 'Локальная модель TripoSR строит начальную 3D-форму и цветную текстуру.', landing_feature_edit: 'Редактор сцены', landing_feature_edit_desc: 'Добавляй фигуры, двигай объекты, настраивай материалы и сохраняй проект в GLB.', landing_feature_render: 'Рендер на Rust', landing_feature_render_desc: 'Настраивай примитивную сцену и запускай собственный трассировщик лучей.', landing_footer: 'Учебный проект · бесплатно и локально', landing_enter_bottom: 'Перейти к приложению ↓',
    nav_workspace: 'РАБОЧЕЕ МЕСТО', nav_preferences: 'НАСТРОЙКИ', nav_home: 'Главная', nav_files: 'Файлы', nav_models: 'Мои модели', nav_scene: 'Сцена', nav_render: 'Рендер', nav_materials: 'Материалы', nav_history: 'История генераций', nav_settings: 'Настройки', nav_about: 'О RT Studio', workspace_name: 'Личное пространство', workspace_plan: 'Локальный проект', signed_in: 'Войти', local_profile: 'Локальный профиль',
    page_home: 'Главная', page_files: 'Файлы', page_models: 'Мои модели', page_scene: 'Сцена', page_render: 'Рендер', page_material: 'Материалы', page_history: 'История', page_settings: 'Настройки', page_about: 'О проекте',
    image_workspace: 'РАБОЧЕЕ МЕСТО · ИЗОБРАЖЕНИЕ В 3D', home_title: 'Преврати изображение в <span>трёхмерную модель.</span>', home_subtitle: 'Создай основу 3D-модели, настрой сцену и отрендери её на Rust.', new_project: 'Новый проект', model_viewer: 'Просмотр 3D-модели', perspective_solid: 'ПЕРСПЕКТИВА · МОДЕЛЬ', orbit_hint: 'Вращение мышью · Колесо — масштаб', source_image: 'Исходное изображение', file_limit: 'JPG · PNG · ДО 10 МБ', drop_image: 'Перетащи изображение сюда', browse_files: 'выбрать файл', create_model: 'Создать 3D-модель', ray_tracer: 'Трассировщик лучей', render_scene_desc: 'Рендер одной из встроенных сцен собственным трассировщиком.', scene_label: 'Сцена', render_button: 'Рендерить PPM',
    scene_inspector: 'ИНСПЕКТОР СЦЕНЫ', properties: 'Параметры', object_tab: 'Объект', tools_tab: 'Инструменты', lighting_tab: 'Освещение', material_tab: 'Материал', camera_tab: 'Камера', transform: 'Трансформация', position: 'Позиция', rotation: 'Вращение', scale: 'Масштаб', display: 'Отображение', show_grid: 'Показать сетку', show_axes: 'Показать оси',
    account_action: 'Личный кабинет', account_title: 'Локальный аккаунт', account_intro: 'Создай профиль для этого браузера. Пароль не отправляется на сервер; это локальный вход, а не защита серверного аккаунта.', account_username: 'Имя пользователя', account_password: 'Пароль', account_login: 'Войти', account_create: 'Создать профиль', account_logout: 'Выйти', account_signed_out: 'Не выполнен вход. Данные остаются в этом браузере.', account_signed_in: 'Вход выполнен как',
    settings_title: 'Настройки рабочего места', settings_saved: 'Настройки сохраняются в этом браузере.', quality: 'Качество просмотра', color_style: 'Цветовой профиль', natural: 'Естественный', vivid: 'Яркая студия', shadows: 'Тени', reset_settings: 'Сбросить настройки', about_title: 'О RT Studio',
    file_list: 'Файлы', models_list: 'Мои модели', scene_objects: 'Объекты сцены', history_title: 'История действий', clear_history: 'Очистить историю', choose_image: 'Выбрать изображение', open_project: 'Открыть GLB', browse: 'Открыть', select: 'Выбрать', open_tools: 'Открыть инструменты',
    offline_server: 'Запусти Rust-сервер: cargo run', ai_offline: 'Изображение доступно для просмотра; для генерации установи TripoSR.', image_ready: 'Изображение проверено', model_ready: 'Модель готова · реконструкция приблизительная', generation_failed: 'Не удалось выполнить операцию.', account_exists: 'Профиль с таким именем уже существует.', account_created: 'Профиль создан. Вход выполнен.', login_failed: 'Не удалось войти: проверь имя пользователя и пароль.', logged_out: 'Выход выполнен.', password_short: 'Пароль должен содержать не менее 8 символов.', username_short: 'Имя пользователя должно содержать от 2 до 32 символов.', login_required: 'Сессия завершилась. Войди в аккаунт и повтори действие.',
  },
  kk: {
    language: 'Тіл', landing_kicker: 'ЖЕРГІЛІКТІ 3D-СТУДИЯ', landing_title: 'Суретті <em>3D модельге</em><br>айналдыр.', landing_description: 'Фотосуреттен 3D модель жаса, редакторда өңде және Rust қозғалтқышымен көріністі рендерле.', landing_enter: 'Қолданбаға өту', github_link: 'Жобаның GitHub парағын ашу', landing_local: 'Жергілікті түрде жұмыс істейді', landing_free: 'Тегін · Ашық код', landing_how: 'БІР ЖҰМЫС ҮДЕРІСІ — ҮШ ҚҰРАЛ', landing_features_title: 'Фотодан дайын көрініске дейін', landing_feature_ai: 'Фотодан модель жасау', landing_feature_ai_desc: 'Жергілікті TripoSR моделі бастапқы 3D пішін мен түсті текстура жасайды.', landing_feature_edit: 'Көрініс редакторы', landing_feature_edit_desc: 'Пішіндер қос, нысандарды жылжыт, материалдарды ретте және жобаны GLB түрінде сақта.', landing_feature_render: 'Rust арқылы рендер', landing_feature_render_desc: 'Қарапайым көріністі реттеп, өз сәуле трассалағышыңды іске қос.', landing_footer: 'Оқу жобасы · тегін және жергілікті', landing_enter_bottom: 'Қолданбаға өту ↓',
    nav_workspace: 'ЖҰМЫС АЙМАҒЫ', nav_preferences: 'БАПТАУЛАР', nav_home: 'Басты бет', nav_files: 'Файлдар', nav_models: 'Модельдерім', nav_scene: 'Көрініс', nav_render: 'Рендер', nav_materials: 'Материалдар', nav_history: 'Жасалу тарихы', nav_settings: 'Баптаулар', nav_about: 'RT Studio туралы', workspace_name: 'Жеке жұмыс аймағы', workspace_plan: 'Жергілікті жоба', signed_in: 'Кіру', local_profile: 'Жергілікті профиль',
    page_home: 'Басты бет', page_files: 'Файлдар', page_models: 'Модельдерім', page_scene: 'Көрініс', page_render: 'Рендер', page_material: 'Материалдар', page_history: 'Тарих', page_settings: 'Баптаулар', page_about: 'Жоба туралы',
    image_workspace: 'СУРЕТТЕН 3D ЖАСАУ АЙМАҒЫ', home_title: 'Суретті <span>үшөлшемді модельге</span> айналдыр.', home_subtitle: '3D модельдің негізін жаса, көріністі ретте және Rust-та рендерле.', new_project: 'Жаңа жоба', model_viewer: '3D модельді қарау', perspective_solid: 'ПЕРСПЕКТИВА · МОДЕЛЬ', orbit_hint: 'Тінтуірмен бұр · Дөңгелекпен үлкейт', source_image: 'Бастапқы сурет', file_limit: 'JPG · PNG · 10 МБ ДЕЙІН', drop_image: 'Суретті осында сүйреп әкел', browse_files: 'файл таңдау', create_model: '3D модель жасау', ray_tracer: 'Сәуле трассалағышы', render_scene_desc: 'Өз трассалағышыңмен дайын көріністердің бірін рендерле.', scene_label: 'Көрініс', render_button: 'PPM рендерлеу',
    scene_inspector: 'КӨРІНІС ИНСПЕКТОРЫ', properties: 'Қасиеттер', object_tab: 'Нысан', tools_tab: 'Құралдар', lighting_tab: 'Жарық', material_tab: 'Материал', camera_tab: 'Камера', transform: 'Түрлендіру', position: 'Орны', rotation: 'Бұрылуы', scale: 'Масштабы', display: 'Көрсету', show_grid: 'Торды көрсету', show_axes: 'Өстерді көрсету',
    account_action: 'Профиль', account_title: 'Жергілікті аккаунт', account_intro: 'Осы браузерге профиль жаса. Құпиясөз серверге жіберілмейді; бұл жергілікті кіру, серверлік аккаунт қорғанысы емес.', account_username: 'Пайдаланушы аты', account_password: 'Құпиясөз', account_login: 'Кіру', account_create: 'Профиль жасау', account_logout: 'Шығу', account_signed_out: 'Кірмегенсіз. Деректер осы браузерде қалады.', account_signed_in: 'Кірген пайдаланушы:',
    settings_title: 'Жұмыс аймағының баптаулары', settings_saved: 'Баптаулар осы браузерде сақталады.', quality: 'Көрсету сапасы', color_style: 'Түс профилі', natural: 'Табиғи', vivid: 'Қанық студия', shadows: 'Көлеңкелер', reset_settings: 'Баптауларды қалпына келтіру', about_title: 'RT Studio туралы',
    file_list: 'Файлдар', models_list: 'Модельдерім', scene_objects: 'Көрініс нысандары', history_title: 'Әрекеттер тарихы', clear_history: 'Тарихты тазалау', choose_image: 'Сурет таңдау', open_project: 'GLB ашу', browse: 'Ашу', select: 'Таңдау', open_tools: 'Құралдарды ашу',
    offline_server: 'Rust серверін іске қос: cargo run', ai_offline: 'Суретті көруге болады; модель жасау үшін TripoSR орнат.', image_ready: 'Сурет тексерілді', model_ready: 'Модель дайын · жуық реконструкция', generation_failed: 'Әрекетті орындау мүмкін болмады.', account_exists: 'Жергілікті профиль бар. Оның аты мен құпиясөзімен кір.', account_created: 'Жергілікті профиль жасалды. Жүйеге кірдің.', login_failed: 'Кіру мүмкін болмады: пайдаланушы аты мен құпиясөзді тексер.', logged_out: 'Жүйеден шықтың.', password_short: 'Құпиясөз кемінде 8 таңбадан тұруы керек.', username_short: 'Пайдаланушы аты 2–32 таңбадан тұруы керек.',
  },
  en: {
    language: 'Language', landing_kicker: 'LOCAL 3D STUDIO', landing_title: 'Turn an image into<br>a <em>three-dimensional model.</em>', landing_description: 'Create a 3D model from a photo, refine it in the editor, and render a scene with a Rust engine.', landing_enter: 'Enter the application', github_link: 'Open project on GitHub', landing_local: 'Runs locally', landing_free: 'Free · Open source', landing_how: 'ONE WORKFLOW — THREE TOOLS', landing_features_title: 'From photo to finished scene', landing_feature_ai: 'Image generation', landing_feature_ai_desc: 'The local TripoSR model creates a 3D shape and a color texture.', landing_feature_edit: 'Scene editor', landing_feature_edit_desc: 'Add shapes, move objects, tune materials, and save a project as GLB.', landing_feature_render: 'Rust rendering', landing_feature_render_desc: 'Tune a primitive scene and run your own ray tracer.', landing_footer: 'Student project · free and local', landing_enter_bottom: 'Enter the application ↓',
    nav_workspace: 'WORKSPACE', nav_preferences: 'PREFERENCES', nav_home: 'Home', nav_files: 'Files', nav_models: 'My Models', nav_scene: 'Scene', nav_render: 'Render', nav_materials: 'Materials', nav_history: 'Generation history', nav_settings: 'Settings', nav_about: 'About RT Studio', workspace_name: 'Personal workspace', workspace_plan: 'Local project', signed_in: 'Sign in', local_profile: 'Local profile',
    page_home: 'Home', page_files: 'Files', page_models: 'My Models', page_scene: 'Scene', page_render: 'Render', page_material: 'Materials', page_history: 'History', page_settings: 'Settings', page_about: 'About',
    image_workspace: 'IMAGE TO 3D WORKSPACE', home_title: 'Turn an image into a <span>3D model.</span>', home_subtitle: 'Create a 3D starting point, tune your scene, and render with Rust.', new_project: 'New project', model_viewer: '3D model viewer', perspective_solid: 'PERSPECTIVE · SOLID', orbit_hint: 'Drag to orbit · Scroll to zoom', source_image: 'Source image', file_limit: 'JPG · PNG · UP TO 10 MB', drop_image: 'Drop an image here', browse_files: 'browse files', create_model: 'Create 3D model', ray_tracer: 'Ray tracer', render_scene_desc: 'Render one of the built-in primitive scenes with your own ray tracer.', scene_label: 'Scene', render_button: 'Render PPM',
    scene_inspector: 'SCENE INSPECTOR', properties: 'Properties', object_tab: 'Object', tools_tab: 'Tools', lighting_tab: 'Lighting', material_tab: 'Material', camera_tab: 'Camera', transform: 'Transform', position: 'Position', rotation: 'Rotation', scale: 'Scale', display: 'Display', show_grid: 'Show grid', show_axes: 'Show axes',
    account_action: 'Account', account_title: 'Local account', account_intro: 'Create a profile for this browser. Your password is not sent to a server; this is local sign-in, not a server account security feature.', account_username: 'Username', account_password: 'Password', account_login: 'Sign in', account_create: 'Create profile', account_logout: 'Sign out', account_signed_out: 'Signed out. Data stays in this browser.', account_signed_in: 'Signed in as',
    settings_title: 'Workspace settings', settings_saved: 'Preferences are saved in this browser.', quality: 'Viewport quality', color_style: 'Color style', natural: 'Natural', vivid: 'Vivid studio', shadows: 'Shadows', reset_settings: 'Reset settings', about_title: 'About RT Studio',
    file_list: 'Files', models_list: 'My Models', scene_objects: 'Scene objects', history_title: 'Activity history', clear_history: 'Clear history', choose_image: 'Choose image', open_project: 'Open GLB', browse: 'Open', select: 'Select', open_tools: 'Open tools',
    offline_server: 'Start the Rust server: cargo run', ai_offline: 'Image preview works; install TripoSR to generate a model.', image_ready: 'Image verified', model_ready: 'Model ready · approximate reconstruction', generation_failed: 'The operation failed.', account_exists: 'An account with this name already exists.', account_created: 'Profile created and signed in.', login_failed: 'Sign-in failed: check your username and password.', logged_out: 'Signed out.', password_short: 'Password must be at least 8 characters.', username_short: 'Username must be 2 to 32 characters.', login_required: 'Your session expired. Sign in and try again.',
  },
};
const extraTranslations: Record<Locale, Record<string, string>> = {
  ru: { transform_tool: 'Инструмент трансформации', move: 'Переместить', rotate: 'Вращать', scale_tool: 'Масштаб', select_tool: 'Выбор', transform_help: 'G / R / S — инструмент · Q или Escape — скрыть gizmo.', add_primitive: 'Добавить фигуру', box: 'Куб', sphere: 'Сфера', cylinder: 'Цилиндр', cone: 'Конус', torus: 'Тор', plane: 'Плоскость', surface: 'Поверхность', smooth_shading: 'Сглаживание', wireframe: 'Каркас', mesh_info: 'Информация о сетке', export: 'Экспорт', export_glb: 'Экспорт GLB', export_obj: 'Экспорт OBJ', save_project: 'Сохранить проект', open_project_button: 'Открыть проект', quick_actions: 'Быстрые действия', stand_upright: 'Поставить вертикально', place_ground: 'Поставить на пол', frame_selection: 'Показать объект', delete_object: 'Удалить объект', shortcuts: 'Клавиши: G — движение · R — вращение · S — масштаб · Delete — удалить.', base_color: 'Основной цвет', roughness: 'Шероховатость', metalness: 'Металличность', transparent: 'Прозрачность', opacity: 'Непрозрачность', light_key: 'Основной свет', enable_light: 'Включить свет', intensity: 'Интенсивность', light_color: 'Цвет света', ambient: 'Окружающий свет', material_note: 'Настройки материала применяются к выбранному объекту.', camera_view: 'Камера перспективы', field_of_view: 'Поле зрения', frame_model: 'Вписать модель', reset_view: 'Сбросить вид', settings_quality_low: 'Низкое · быстрее', settings_quality_std: 'Стандартное', settings_quality_high: 'Высокое · чёткие тени', shadows_floor: 'Тени', floor_grid: 'Показать сетку пола', axes_toggle: 'Показать оси', footer_built: 'Учебный проект · трассировщик на Rust', local_workspace: 'ЛОКАЛЬНОЕ РАБОЧЕЕ МЕСТО', close: 'Закрыть', status_model: 'Модель готова · результат приблизительный', image_prompt: 'Для лучшего результата выбери один чёткий ракурс', remove_image: 'Убрать изображение', docs: 'Руководство проекта', page_workspace: 'Рабочее место', account_storage_error: 'Не удалось сохранить профиль в хранилище браузера.' },
  kk: { transform_tool: 'Түрлендіру құралы', move: 'Жылжыту', rotate: 'Бұру', scale_tool: 'Масштаб', select_tool: 'Таңдау', transform_help: 'G / R / S — құрал · Q немесе Escape — gizmo жасыру.', add_primitive: 'Пішін қосу', box: 'Текше', sphere: 'Шар', cylinder: 'Цилиндр', cone: 'Конус', torus: 'Тор', plane: 'Жазықтық', surface: 'Бет', smooth_shading: 'Тегістеу', wireframe: 'Қаңқа', mesh_info: 'Тор туралы ақпарат', export: 'Экспорт', export_glb: 'GLB экспорттау', export_obj: 'OBJ экспорттау', save_project: 'Жобаны сақтау', open_project_button: 'Жобаны ашу', quick_actions: 'Жылдам әрекеттер', stand_upright: 'Тік қою', place_ground: 'Еденге қою', frame_selection: 'Нысанды көрсету', delete_object: 'Нысанды жою', shortcuts: 'Пернелер: G — жылжыту · R — бұру · S — масштаб · Delete — жою.', base_color: 'Негізгі түс', roughness: 'Кедір-бұдырлық', metalness: 'Металлдық', transparent: 'Мөлдірлік', opacity: 'Күңгірттік', light_key: 'Негізгі жарық', enable_light: 'Жарықты қосу', intensity: 'Қарқындылық', light_color: 'Жарық түсі', ambient: 'Қоршаған жарық', material_note: 'Материал баптаулары таңдалған нысанға қолданылады.', camera_view: 'Перспективалық камера', field_of_view: 'Көру өрісі', frame_model: 'Модельді кадрға сыйғызу', reset_view: 'Көріністі қалпына келтіру', settings_quality_low: 'Төмен · жылдамырақ', settings_quality_std: 'Стандартты', settings_quality_high: 'Жоғары · анық көлеңке', shadows_floor: 'Көлеңкелер', floor_grid: 'Еден торын көрсету', axes_toggle: 'Өстерді көрсету', footer_built: 'Оқу жобасы · Rust трассалағышы', local_workspace: 'ЖЕРГІЛІКТІ ЖҰМЫС АЙМАҒЫ', close: 'Жабу', status_model: 'Модель дайын · жуық нәтиже', image_prompt: 'Жақсы нәтиже үшін бір анық ракурс таңда', remove_image: 'Суретті өшіру', docs: 'Жоба нұсқаулығы', page_workspace: 'Жұмыс аймағы', account_storage_error: 'Профильді браузерде сақтау мүмкін болмады.' },
  en: { transform_tool: 'Transform tool', move: 'Move', rotate: 'Rotate', scale_tool: 'Scale', select_tool: 'Select', transform_help: 'G / R / S activates a tool · Q or Escape hides the gizmo.', add_primitive: 'Add primitive', box: 'Box', sphere: 'Sphere', cylinder: 'Cylinder', cone: 'Cone', torus: 'Torus', plane: 'Plane', surface: 'Surface', smooth_shading: 'Smooth shading', wireframe: 'Wireframe', mesh_info: 'Mesh information', export: 'Export', export_glb: 'Export GLB', export_obj: 'Export OBJ', save_project: 'Save project', open_project_button: 'Open project', quick_actions: 'Quick actions', stand_upright: 'Stand upright', place_ground: 'Place on ground', frame_selection: 'Frame selection', delete_object: 'Delete selected', shortcuts: 'Shortcuts: G move · R rotate · S scale · Delete remove.', base_color: 'Base color', roughness: 'Roughness', metalness: 'Metalness', transparent: 'Transparent', opacity: 'Opacity', light_key: 'Key light', enable_light: 'Enable light', intensity: 'Intensity', light_color: 'Light color', ambient: 'Ambient', material_note: 'Material settings apply to the selected object.', camera_view: 'Perspective camera', field_of_view: 'Field of view', frame_model: 'Frame model', reset_view: 'Reset view', settings_quality_low: 'Low · faster', settings_quality_std: 'Standard', settings_quality_high: 'High · sharper shadows', shadows_floor: 'Shadows', floor_grid: 'Show floor grid', axes_toggle: 'Show axes', footer_built: 'Student project · Rust ray tracer', local_workspace: 'LOCAL WORKSPACE', close: 'Close', status_model: 'Model ready · approximate reconstruction', image_prompt: 'A single clear view works best', remove_image: 'Remove image', docs: 'Read the project guide', page_workspace: 'Workspace', account_storage_error: 'Could not save the profile in browser storage.' },
};
for (const locale of ['ru', 'kk', 'en'] as const) Object.assign(translations[locale], extraTranslations[locale]);
const aboutTranslations: Record<Locale, Record<string, string>> = {
  ru: { about_copy: 'Учебный проект: локальная генерация 3D по изображению, редактор модели и трассировщик лучей на Rust.', about_ai: 'Локальная модель TripoSR', about_view: 'Просмотр GLB на Three.js', about_render: 'Трассировщик Lambert на Rust', about_limit: 'По одной фотографии получается приближённая модель; скрытые стороны исходного объекта неизвестны.' },
  kk: { about_copy: 'Оқу жобасы: суреттен жергілікті 3D модель жасау, модель редакторы және Rust-тағы сәуле трассалағышы.', about_ai: 'Жергілікті TripoSR моделі', about_view: 'Three.js арқылы GLB көру', about_render: 'Rust-тағы Lambert трассалағышы', about_limit: 'Бір фотодан жуық модель жасалады; нысанның көрінбеген жақтары белгісіз.' },
  en: { about_copy: 'Student project: local image-to-3D generation, a model editor, and a ray tracer written in Rust.', about_ai: 'Local TripoSR model', about_view: 'GLB preview with Three.js', about_render: 'Lambert ray tracer in Rust', about_limit: 'One photo gives an approximate model; hidden sides cannot be recovered.' },
};
for (const locale of ['ru', 'kk', 'en'] as const) Object.assign(translations[locale], aboutTranslations[locale]);
const objectTranslations: Record<Locale, Record<string, string>> = {
  ru: { display: 'Отображение', show_axes: 'Показать оси', generated_object: 'Созданная модель', primitive_sample: 'Пример сцены', ai_model: 'AI-модель', primitive_state: 'Фигура', demo_state: 'Демо', imported_state: 'Импортированный проект', rounded_box: 'Скруглённый куб', select_one_image: 'Сначала выбери изображение.', add_object: 'добавлен в сцену.', selected_none: 'Объект не выбран', vertices: 'вершин', faces: 'граней', object_size: 'Размер' },
  kk: { display: 'Көрсету', show_axes: 'Өстерді көрсету', generated_object: 'Жасалған модель', primitive_sample: 'Көрініс үлгісі', ai_model: 'AI моделі', primitive_state: 'Пішін', demo_state: 'Демо', imported_state: 'Импортталған жоба', rounded_box: 'Жиектері жұмыр текше', select_one_image: 'Алдымен сурет таңда.', add_object: 'көрініске қосылды.', selected_none: 'Нысан таңдалмаған', vertices: 'төбе', faces: 'жақ', object_size: 'Өлшемі' },
  en: { display: 'Display', show_axes: 'Show axes', generated_object: 'Generated object', primitive_sample: 'Sample scene', ai_model: 'AI model', primitive_state: 'Primitive', demo_state: 'Demo', imported_state: 'Imported project', rounded_box: 'Rounded box', select_one_image: 'Choose an image first.', add_object: 'added to the scene.', selected_none: 'No mesh selected', vertices: 'vertices', faces: 'faces', object_size: 'Size' },
};
for (const locale of ['ru', 'kk', 'en'] as const) Object.assign(translations[locale], objectTranslations[locale]);
const runtimeTranslations: Record<Locale, Record<string, string>> = {
  ru: { image_verified: 'Изображение проверено', image_ready: 'Модель готова · реконструкция приблизительная', upload_title: 'Загрузка исходного изображения', checking_image: 'Проверка формата и размера', starting_generation: 'Запуск генерации', sending_image: 'Отправка изображения локальной AI-модели', generating: 'Создание 3D-модели', generation_wait: 'Это может занять несколько минут', model_download: 'Скачать GLB ↗', local_model_missing: 'Локальная AI-модель не установлена. Открой docs/index.md и выполни шаги установки TripoSR.', generation_started: 'Начата генерация AI-модели', generation_complete: 'Генерация AI-модели завершена · GLB готов', upload_failure: 'Не удалось выполнить операцию.', render_working: 'Трассировщик Rust рендерит изображение…', render_complete: 'Рендер завершён ·', render_download: 'Скачать результат PPM', render_error: 'Ошибка рендера.', render_done: 'Рендер PPM скачан.', server_ready: 'Сервер подключён · локальный AI готов', server_missing_ai: 'Сервер подключён · установи локальный AI', server_start: 'Запусти Rust-сервер: cargo run', ai_ready: 'Готов', ai_unavailable: 'Недоступен', install_ai: 'Установи локальную модель TripoSR', local_ai_ready: 'TripoSR установлен локально', offline: 'Нет соединения', no_image: 'Сначала выбери изображение.', upload_invalid: 'Выбери изображение JPEG или PNG.', upload_too_large: 'Размер изображения превышает 10 МБ.', history_empty: 'Действия появятся здесь после генерации модели или рендера.', files_empty: 'Здесь появятся локальные файлы.', models_empty: 'Созданные модели сохраняются в библиотеке этого браузера.', scene_empty: 'Сцена пуста. Открой инструменты, чтобы добавить фигуру, или создай модель из изображения.', settings_reset_done: 'Настройки рабочего места сброшены.', account_missing: 'Сначала создай локальный профиль.', render_scene_0: '01 — Одна сфера', render_scene_1: '02 — Куб и плоскость', render_scene_2: '03 — Набор фигур', render_scene_3: '04 — Другая камера', quality_label: 'Разрешение · качество', render_at: 'Рендерить', local_project: 'Локальная сессия', source_label: 'Файл-источник' },
  kk: { image_verified: 'Сурет тексерілді', image_ready: 'Модель дайын · жуық реконструкция', upload_title: 'Бастапқы сурет жүктелуде', checking_image: 'Пішімі мен өлшемі тексерілуде', starting_generation: 'Модель жасау басталуда', sending_image: 'Сурет жергілікті AI моделіне жіберілуде', generating: '3D модель жасалуда', generation_wait: 'Бірнеше минут күту қажет болуы мүмкін', model_download: 'GLB жүктеп алу ↗', local_model_missing: 'Жергілікті AI моделі орнатылмаған. TripoSR орнату үшін docs/index.md нұсқаулығын қара.', generation_started: 'AI модель жасау басталды', generation_complete: 'AI модель жасалды · GLB дайын', upload_failure: 'Әрекетті орындау мүмкін болмады.', render_working: 'Rust трассалағышы кескінді рендерлеп жатыр…', render_complete: 'Рендер аяқталды ·', render_download: 'PPM нәтижесін жүктеу', render_error: 'Рендер қатесі.', render_done: 'PPM рендері жүктелді.', server_ready: 'Сервер қосылды · жергілікті AI дайын', server_missing_ai: 'Сервер қосылды · жергілікті AI орнат', server_start: 'Rust серверін іске қос: cargo run', ai_ready: 'Дайын', ai_unavailable: 'Қолжетімсіз', install_ai: 'Жергілікті TripoSR моделін орнат', local_ai_ready: 'TripoSR жергілікті орнатылған', offline: 'Байланыс жоқ', no_image: 'Алдымен сурет таңда.', upload_invalid: 'JPEG не PNG суретін таңда.', upload_too_large: 'Сурет 10 МБ өлшем шегінен үлкен.', history_empty: 'Модель жасағаннан немесе рендерден кейін әрекеттер осында көрінеді.', files_empty: 'Жергілікті файлдар осында көрінеді.', models_empty: 'Жасалған модельдер осы браузер кітапханасында сақталады.', scene_empty: 'Көрініс бос. Пішін қосу үшін құралдарды аш немесе суреттен модель жаса.', settings_reset_done: 'Жұмыс аймағының баптаулары қалпына келтірілді.', account_missing: 'Алдымен жергілікті профиль жаса.', render_scene_0: '01 — Бір шар', render_scene_1: '02 — Текше мен жазықтық', render_scene_2: '03 — Пішіндер жиыны', render_scene_3: '04 — Басқа камера', quality_label: 'Ажыратымдылық · сапа', render_at: 'Рендерлеу', local_project: 'Жергілікті сеанс', source_label: 'Бастапқы файл' },
  en: { image_verified: 'Image verified', image_ready: 'Model ready · approximate reconstruction', upload_title: 'Uploading source image', checking_image: 'Checking format and dimensions', starting_generation: 'Starting generation', sending_image: 'Sending image to the local AI model', generating: 'Generating your 3D model', generation_wait: 'This can take a few minutes', model_download: 'Download GLB ↗', local_model_missing: 'The local AI model is not installed. Open docs/index.md and follow the TripoSR setup steps.', generation_started: 'AI generation started', generation_complete: 'AI generation completed · GLB is ready', upload_failure: 'The operation failed.', render_working: 'Rendering pixels with the Rust ray tracer…', render_complete: 'Render complete ·', render_download: 'Download PPM result', render_error: 'Render failed.', render_done: 'PPM render downloaded.', server_ready: 'Server connected · local AI ready', server_missing_ai: 'Server connected · install local AI', server_start: 'Start the Rust server: cargo run', ai_ready: 'Ready', ai_unavailable: 'Unavailable', install_ai: 'Install the local TripoSR model', local_ai_ready: 'TripoSR is installed locally', offline: 'Offline', no_image: 'Choose an image first.', upload_invalid: 'Choose a JPEG or PNG image.', upload_too_large: 'Image is over the 10 MB size limit.', history_empty: 'Activity will appear here after a model generation or render.', files_empty: 'Local files will appear here.', models_empty: 'Generated models are saved in this browser library.', scene_empty: 'This scene is empty. Open Tools to add a primitive or generate a model from an image.', settings_reset_done: 'Workspace settings restored.', account_missing: 'Create a local profile first.', render_scene_0: '01 — Single sphere', render_scene_1: '02 — Cube and plane', render_scene_2: '03 — Primitive set', render_scene_3: '04 — Alternate camera', quality_label: 'Resolution · quality', render_at: 'Render', local_project: 'Local session', source_label: 'Source file' },
};
for (const locale of ['ru', 'kk', 'en'] as const) Object.assign(translations[locale], runtimeTranslations[locale]);
Object.assign(translations.ru, { render_scene_0: '01 — Одна сфера', render_scene_1: '02 — Куб и плоскость', render_scene_2: '03 — Набор фигур', render_scene_3: '04 — Другая камера', quality_label: 'Разрешение · качество', render_at: 'Рендерить', local_project: 'Локальная сессия', source_label: 'Файл-источник' });
Object.assign(translations.kk, { render_scene_0: '01 — Бір шар', render_scene_1: '02 — Текше мен жазықтық', render_scene_2: '03 — Пішіндер жиыны', render_scene_3: '04 — Басқа камера', quality_label: 'Ажыратымдылық · сапа', render_at: 'Рендерлеу', local_project: 'Жергілікті сеанс', source_label: 'Бастапқы файл' });
Object.assign(translations.en, { render_scene_0: '01 — Single sphere', render_scene_1: '02 — Cube and plane', render_scene_2: '03 — Primitive set', render_scene_3: '04 — Alternate camera', quality_label: 'Resolution · quality', render_at: 'Render', local_project: 'Local session', source_label: 'Source file' });
Object.assign(translations.ru, { account_title: 'Аккаунт RT Studio', account_intro: 'Создай профиль для этого сервера. Пароль хранится на сервере в виде криптографического хеша; вход действует в этом браузере.', account_signed_out: 'Войди или создай профиль. Сессия защищена сервером.', account_created: 'Профиль создан. Вход выполнен как', account_signed_in: 'Вход выполнен как' });
Object.assign(translations.kk, { account_title: 'RT Studio аккаунты', account_intro: 'Осы серверде профиль жаса. Құпиясөз серверде криптографиялық хэш түрінде сақталады; кіру осы браузерде әрекет етеді.', account_signed_out: 'Кір немесе профиль жаса. Сеансты сервер қорғайды.', account_created: 'Профиль жасалды. Кірген пайдаланушы:', account_signed_in: 'Кірген пайдаланушы:' });
Object.assign(translations.en, { account_title: 'RT Studio account', account_intro: 'Create a profile on this server. Passwords are stored as a cryptographic hash; sign-in is active in this browser.', account_signed_out: 'Sign in or create a profile. Your session is protected by the server.', account_created: 'Profile created. Signed in as', account_signed_in: 'Signed in as' });
Object.assign(translations.ru, { download_glb: 'Скачать GLB' });
Object.assign(translations.kk, { download_glb: 'GLB жүктеп алу' });
Object.assign(translations.en, { download_glb: 'Download GLB' });
Object.assign(translations.ru, { login_required: 'Сессия завершилась. Войди в аккаунт и повтори действие.' });
Object.assign(translations.kk, { login_required: 'Сеанс аяқталды. Аккаунтқа кіріп, әрекетті қайтала.' });
Object.assign(translations.en, { login_required: 'Your session expired. Sign in and try again.' });
Object.assign(translations.ru, { account_missing: 'Войди или создай профиль на этом сервере.' });
Object.assign(translations.kk, { account_missing: 'Осы серверде профильге кір немесе жаңасын жаса.' });
Object.assign(translations.en, { account_missing: 'Sign in or create a profile on this server.' });
Object.assign(translations.ru, { logout_error: 'Не удалось завершить сессию на сервере.' });
Object.assign(translations.kk, { logout_error: 'Серверде сеансты аяқтау мүмкін болмады.' });
Object.assign(translations.en, { logout_error: 'Could not end the server session.' });
let currentLocale: Locale = (() => {
  try { const saved = localStorage.getItem('rt-studio-language'); return saved === 'kk' || saved === 'en' ? saved : 'ru'; } catch { return 'ru'; }
})();
function t(key: string): string { return translations[currentLocale][key] ?? translations.en[key] ?? key; }
function applyLanguage(locale: Locale): void {
  currentLocale = locale;
  document.documentElement.lang = locale;
  document.title = `${locale === 'ru' ? 'RT Studio — Изображение в 3D' : locale === 'kk' ? 'RT Studio — Суреттен 3D' : 'RT Studio — Image to 3D'}`;
  document.querySelectorAll<HTMLElement>('[data-l10n]').forEach((element) => {
    const text = translations[locale][element.dataset.l10n ?? ''];
    if (text) element.innerHTML = text;
  });
  for (const id of ['landing-language', 'app-language']) byId<HTMLSelectElement>(id).value = locale;
  const activeSection = document.querySelector<HTMLButtonElement>('[data-nav].active')?.dataset.nav;
  const pageKey = activeSection === 'My Models' ? 'page_models' : activeSection ? `page_${activeSection.toLowerCase()}` : 'page_home';
  byId('page-title').textContent = t(pageKey);
  try { localStorage.setItem('rt-studio-language', locale); } catch { /* Language remains active for this page. */ }
}
applyLanguage(currentLocale);
for (const id of ['landing-language', 'app-language']) byId<HTMLSelectElement>(id).addEventListener('change', (event) => applyLanguage((event.currentTarget as HTMLSelectElement).value as Locale));
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
const transformControls = new TransformControls(camera, canvas);
const transformHelper = transformControls.getHelper();
scene.add(transformHelper);
let transformMode: 'translate' | 'rotate' | 'scale' = 'translate';
let transformDragging = false;
transformControls.addEventListener('dragging-changed', (event) => {
  transformDragging = event.value as boolean;
  controls.enabled = !transformDragging;
});
transformControls.addEventListener('objectChange', () => syncTransformFields());

scene.add(new THREE.HemisphereLight('#d9e2ff', '#4a4650', 1.65));
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
const fillLight = new THREE.DirectionalLight('#dce7ff', 0.8);
fillLight.position.set(4, 2.5, 5);
scene.add(fillLight);
const rimLight = new THREE.DirectionalLight('#d0a0ff', 0.38);
rimLight.position.set(2, 3, -4);
scene.add(rimLight);
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
function readHistory(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem('rt-studio-history') ?? '[]') as unknown;
    return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === 'string').slice(0, 40) : [];
  } catch { return []; }
}
let history: string[] = readHistory();
let generatedModelUrl = '';
type SavedModel = { name: string; url: string; createdAt: string };
function readModels(): SavedModel[] {
  try {
    const saved = JSON.parse(localStorage.getItem('rt-studio-models') ?? '[]') as unknown;
    return Array.isArray(saved) ? saved.filter((item): item is SavedModel => !!item && typeof item === 'object' && typeof (item as SavedModel).url === 'string').slice(0, 50) : [];
  } catch { return []; }
}
let savedModels = readModels();
const modelDatabase: Promise<IDBDatabase> = new Promise((resolve, reject) => {
  if (!('indexedDB' in window)) { reject(new Error('IndexedDB is not available')); return; }
  const request = indexedDB.open('rt-studio-library', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('models');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('Could not open model library'));
});
function saveModelBlob(key: string, blob: Blob): Promise<void> {
  return modelDatabase.then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction('models', 'readwrite');
    transaction.objectStore('models').put(blob, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not save model'));
  }));
}
function readModelBlob(key: string): Promise<Blob> {
  return modelDatabase.then((db) => new Promise((resolve, reject) => {
    const request = db.transaction('models').objectStore('models').get(key);
    request.onsuccess = () => request.result instanceof Blob ? resolve(request.result) : reject(new Error('Saved model data is missing'));
    request.onerror = () => reject(request.error ?? new Error('Could not read saved model'));
  }));
}
type LastImage = { name: string; size: number; type: string };
function readLastImage(): LastImage | null {
  try {
    const value = JSON.parse(localStorage.getItem('rt-studio-last-image') ?? 'null') as unknown;
    return value && typeof value === 'object' && typeof (value as LastImage).name === 'string' ? value as LastImage : null;
  } catch { return null; }
}
let lastImage = readLastImage();
byId('files-count').textContent = String(savedModels.length + (lastImage ? 1 : 0));

function recordHistory(item: string): void {
  history.unshift(`${new Date().toLocaleString()} · ${item}`);
  history = history.slice(0, 40);
  try { localStorage.setItem('rt-studio-history', JSON.stringify(history)); } catch { /* Keep session history if browser storage is unavailable. */ }
}

async function rememberModel(url: string): Promise<void> {
  let storedUrl = url;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not download generated GLB (${response.status})`);
    const blob = await response.blob();
    if (blob.size > 250 * 1024 * 1024) throw new Error('GLB is larger than the 250 MB browser library limit');
    const key = crypto.randomUUID();
    await saveModelBlob(key, blob);
    storedUrl = `indexeddb:${key}`;
  } catch (error) {
    notify(error instanceof Error ? `${error.message}. The model remains available from the server for this session.` : 'The browser library could not save the model.', true);
  }
  savedModels = [{ name: 'Generated 3D model', url: storedUrl, createdAt: new Date().toLocaleString() }, ...savedModels.filter((model) => model.url !== storedUrl)].slice(0, 50);
  byId('files-count').textContent = String(savedModels.length + (lastImage ? 1 : 0));
  try { localStorage.setItem('rt-studio-models', JSON.stringify(savedModels)); } catch { notify('The model is ready, but browser storage could not save its library entry.', true); }
}

async function apiError(response: Response): Promise<Error> {
  const detail = (await response.text()).trim();
  if (response.status === 401) return new Error(t('login_required'));
  if (response.status === 503 && detail.includes('TripoSR')) {
    return new Error(t('local_model_missing'));
  }
  return new Error(detail || `Ошибка сервера (${response.status}).`);
}

function makeDemoModel(): THREE.Group {
  const demo = new THREE.Group();
  demo.name = 'Primitive sample';
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.92, 48, 32), new THREE.MeshStandardMaterial({ color: '#6285d8', roughness: 0.48, metalness: 0.12 }));
  sphere.name = 'Demo sphere';
  sphere.position.set(-0.56, 0.25, 0.05);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  demo.add(sphere);
  const cube = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: '#df8a62', roughness: 0.62, metalness: 0.04 }));
  cube.name = 'Demo cube';
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
  for (const child of [...modelGroup.children]) {
    modelGroup.remove(child);
    disposeModel(child);
  }
  modelGroup.add(object);
  selectObject(object, name, isGenerated);
  recordHistory(`${isGenerated ? 'Model generated' : 'Demo opened'} · ${name}`);
}

function selectObject(object: THREE.Object3D, name: string, isGenerated = false): void {
  currentModel = object;
  const displayName = name === 'Generated object' ? t('generated_object') : name === 'Primitive sample' ? t('primitive_sample') : name;
  activeObject = displayName;
  if (object.parent !== modelGroup) modelGroup.add(object);
  transformControls.attach(object);
  transformControls.setMode(transformMode);
  byId('model-label').textContent = displayName;
  const isPrimitive = typeof object.userData.primitiveType === 'string';
  byId('model-badge').textContent = isGenerated ? 'GENERATED' : isPrimitive ? 'OBJECT' : name === 'Primitive sample' ? 'DEMO' : 'PROJECT';
  byId('model-badge').classList.toggle('generated', isGenerated);
  byId('inspector-model-name').textContent = displayName;
  byId('object-state').textContent = isGenerated ? t('ai_model') : isPrimitive ? t('primitive_state') : name === 'Primitive sample' ? t('demo_state') : t('imported_state');
  byId<HTMLInputElement>('bevel').disabled = object.userData.primitiveType !== 'box';
  syncMaterialTransparencyControls();
  syncTransformFields();
  updateMeshStats();
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

let selectionStart: { x: number; y: number } | null = null;
const selectionRaycaster = new THREE.Raycaster();
canvas.addEventListener('pointerdown', (event) => { selectionStart = { x: event.clientX, y: event.clientY }; });
canvas.addEventListener('pointerup', (event) => {
  if (!selectionStart || transformDragging) return;
  const moved = Math.hypot(event.clientX - selectionStart.x, event.clientY - selectionStart.y);
  selectionStart = null;
  if (moved > 4) return;
  const rect = canvas.getBoundingClientRect();
  selectionRaycaster.setFromCamera(new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  ), camera);
  const hit = selectionRaycaster.intersectObjects(modelGroup.children, true)[0]?.object;
  if (!hit) return;
  let root = hit as THREE.Object3D;
  while (root.parent && root.parent !== modelGroup) root = root.parent;
  selectObject(root, root.name || 'Mesh', !!root.userData.generatedUpAxis);
});

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
  byId('files-count').textContent = String(savedModels.length + (file ? 1 : lastImage ? 1 : 0));
  document.getElementById('download-link')?.remove();
  const previewWrap = byId('image-preview-wrap');
  const placeholder = byId('upload-placeholder');
  const generate = byId<HTMLButtonElement>('generate-button');
  if (!file) {
    byId<HTMLImageElement>('image-preview').removeAttribute('src');
    previewWrap.classList.add('hidden');
    placeholder.classList.remove('hidden');
    byId('upload-status').textContent = t('image_prompt');
    generate.disabled = true;
    return;
  }
  const extension = file.name.toLowerCase().split('.').pop();
  const isSupportedImage = ['image/jpeg', 'image/png'].includes(file.type)
    || (!file.type && ['jpg', 'jpeg', 'png'].includes(extension ?? ''));
  if (!isSupportedImage || file.size > 10 * 1024 * 1024) {
    notify(file.size > 10 * 1024 * 1024 ? t('upload_too_large') : t('upload_invalid'), true);
    selectedFile = null;
    generate.disabled = true;
    previewWrap.classList.add('hidden');
    placeholder.classList.remove('hidden');
    return;
  }
  previewUrl = URL.createObjectURL(file);
  lastImage = { name: file.name, size: file.size, type: file.type || 'image' };
  try { localStorage.setItem('rt-studio-last-image', JSON.stringify(lastImage)); } catch { /* File metadata is optional. */ }
  byId('files-count').textContent = String(savedModels.length + 1);
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
    setLoading(true, t('generating'), `${task.status.toLowerCase().replace('_', ' ')} · ${task.progress}%`, task.progress);
    if (task.status === 'SUCCEEDED' && !task.model_url) throw new Error('Сервис завершил задачу, но не вернул GLB-модель. Проверьте журнал сервера и попробуйте ещё раз.');
    if (task.status === 'SUCCEEDED' && task.model_url) {
      await loadGeneratedModel(task.model_url);
      await rememberModel(task.model_url);
      setLoading(false);
      byId('upload-status').textContent = t('image_ready');
      const link = document.createElement('a');
      link.id = 'download-link';
      link.className = 'model-download';
      link.href = task.model_url;
      link.textContent = t('model_download');
      link.setAttribute('download', 'rt-studio-model.glb');
      byId('upload-status').after(link);
      recordHistory(t('generation_complete'));
      return;
    }
    if (['FAILED', 'CANCELED', 'EXPIRED'].includes(task.status)) throw new Error(task.message || `Generation ${task.status.toLowerCase()}.`);
  }
  throw new Error('Generation is taking longer than expected. You can check History or try again later.');
}

const storedModelObjectUrls = new Map<string, string>();
async function modelSourceUrl(url: string): Promise<string> {
  if (!url.startsWith('indexeddb:')) return url;
  const key = url.slice('indexeddb:'.length);
  const cached = storedModelObjectUrls.get(key);
  if (cached) return cached;
  const objectUrl = URL.createObjectURL(await readModelBlob(key));
  storedModelObjectUrls.set(key, objectUrl);
  return objectUrl;
}
async function downloadModel(url: string, filename = 'rt-studio-model.glb'): Promise<void> {
  const blob = url.startsWith('indexeddb:') ? await readModelBlob(url.slice('indexeddb:'.length)) : await fetch(url).then(async (response) => {
    if (!response.ok) throw new Error(`Could not download model (${response.status})`);
    return response.blob();
  });
  downloadBlob(blob, filename);
}

async function loadGeneratedModel(url: string): Promise<void> {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const gltf = await new GLTFLoader().loadAsync(await modelSourceUrl(url));
  const object = gltf.scene;
  object.updateMatrixWorld(true);
  const sourceBounds = new THREE.Box3().setFromObject(object);
  const sourceSize = sourceBounds.getSize(new THREE.Vector3());
  // TripoSR does not keep the dominant body axis consistent across generated meshes.
  const sourceUp = sourceSize.x >= sourceSize.y && sourceSize.x >= sourceSize.z
    ? new THREE.Vector3(1, 0, 0)
    : sourceSize.z >= sourceSize.y
      ? new THREE.Vector3(0, 0, 1)
      : new THREE.Vector3(0, 1, 0);
  object.userData.generatedUpAxis = sourceUp.toArray();
  object.quaternion.setFromUnitVectors(sourceUp, new THREE.Vector3(0, 1, 0));
  object.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(object);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const largest = Math.max(size.x, size.y, size.z, 0.001);
  const scale = 2.7 / largest;
  object.scale.setScalar(scale);
  object.position.copy(center).multiplyScalar(-scale);
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    if (!child.geometry.getAttribute('normal')) child.geometry.computeVertexNormals();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      material.transparent = false;
      material.opacity = 1;
      material.depthWrite = true;
      material.alphaTest = 0;
      material.alphaHash = false;
      if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
        material.color.set('#ffffff');
        material.roughness = Math.max(material.roughness, 0.72);
        material.metalness = 0;
        material.side = THREE.DoubleSide;
        material.needsUpdate = true;
      }
    }
  });
  modelGroup.position.set(0, 0, 0);
  modelGroup.rotation.set(0, 0, 0);
  modelGroup.scale.set(1, 1, 1);
  replaceModel(object, 'Generated object', true);
  generatedModelUrl = url;
  frameModel();
}

byId('generate-button').addEventListener('click', async () => {
  const button = byId<HTMLButtonElement>('generate-button');
  if (!selectedFile) { notify(t('select_one_image'), true); return; }
  button.disabled = true;
  setLoading(true, t('upload_title'), t('checking_image'), 4);
  try {
    if (!uploadId) {
      const form = new FormData();
      form.append('image', selectedFile);
      const upload = await fetch('/api/upload', { method: 'POST', body: form });
      if (!upload.ok) throw await apiError(upload);
      const data = await upload.json() as { id: string; width: number; height: number };
      uploadId = data.id;
      byId('upload-status').textContent = `Verified image · ${data.width} × ${data.height}`;
      setLoading(true, t('starting_generation'), t('sending_image'), 10);
    }
    const start = await fetch('/api/generation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ upload_id: uploadId }) });
    if (!start.ok) throw await apiError(start);
    const task = await start.json() as { id: string };
    generationId = task.id;
    recordHistory(t('generation_started'));
    setLoading(true, t('generating'), t('generation_wait'), 10);
    await pollGeneration(generationId);
    selectedFile = null;
    notify(t('image_ready'));
  } catch (error) {
    const message = error instanceof Error ? error.message : t('upload_failure');
    byId('upload-status').textContent = message;
    setLoading(false);
    notify(message, true);
  } finally {
    button.disabled = !selectedFile;
  }
});

function frameModel(): void {
  const target = activeTransformTarget();
  target.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3().setFromObject(target);
  const center = bounds.isEmpty() ? new THREE.Vector3(0, 0.25, 0) : bounds.getCenter(new THREE.Vector3());
  const radius = bounds.isEmpty() ? 1.5 : Math.max(bounds.getBoundingSphere(new THREE.Sphere()).radius, 0.6);
  const viewDirection = new THREE.Vector3(4.1, 3.1, 6.2).normalize();
  controls.target.copy(center);
  camera.position.copy(center).addScaledVector(viewDirection, Math.max(radius * 2.7, 2.5));
  controls.minDistance = Math.max(radius * 0.35, 0.2);
  controls.maxDistance = Math.max(radius * 12, 16);
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

function activeTransformTarget(): THREE.Object3D {
  return currentModel ?? modelGroup;
}

function syncTransformFields(): void {
  const target = activeTransformTarget();
  const fields = document.querySelectorAll<HTMLInputElement>('[data-transform]');
  fields.forEach((input) => {
    const [property, axis] = input.dataset.transform!.split('.');
    const value = (target[property as 'position' | 'rotation' | 'scale'] as THREE.Vector3)[axis as 'x' | 'y' | 'z'];
    input.value = property === 'rotation' ? String(Math.round(THREE.MathUtils.radToDeg(value))) : String(Number(value.toFixed(2)));
  });
}
document.querySelectorAll<HTMLInputElement>('[data-transform]').forEach((input) => input.addEventListener('change', () => {
  const [property, axis] = input.dataset.transform!.split('.');
  let value = Number(input.value);
  if (!Number.isFinite(value)) value = 0;
  if (property === 'rotation') value = THREE.MathUtils.degToRad(value);
  const vector = activeTransformTarget()[property as 'position' | 'rotation' | 'scale'] as THREE.Vector3;
  vector[axis as 'x' | 'y' | 'z'] = value;
  updateMeshStats();
}));

function resetTransform(): void {
  const target = activeTransformTarget();
  target.position.set(0, 0, 0);
  target.rotation.set(0, 0, 0);
  target.scale.set(1, 1, 1);
  syncTransformFields();
  updateMeshStats();
}
document.querySelectorAll<HTMLButtonElement>('[data-reset="transform"]').forEach((button) => button.addEventListener('click', resetTransform));
byId('reset-properties').addEventListener('click', resetTransform);

function updateMeshStats(): void {
  const target = currentModel;
  if (!target) { byId('mesh-stats').textContent = t('selected_none'); return; }
  let vertices = 0;
  let faces = 0;
  target.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const positions = child.geometry.getAttribute('position');
    if (!positions) return;
    vertices += positions.count;
    faces += (child.geometry.index?.count ?? positions.count) / 3;
  });
  target.updateWorldMatrix(true, true);
  const size = new THREE.Box3().setFromObject(target).getSize(new THREE.Vector3());
  byId('mesh-stats').textContent = `${vertices.toLocaleString()} ${t('vertices')} · ${Math.floor(faces).toLocaleString()} ${t('faces')}\n${t('object_size')} ${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}`;
}

function addPrimitive(type: string): void {
  const color = new THREE.Color().setHSL(Math.random(), 0.48, 0.62);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.56, metalness: 0.04 });
  let geometry: THREE.BufferGeometry;
  let name: string;
  switch (type) {
    case 'sphere': geometry = new THREE.SphereGeometry(0.55, 48, 32); name = t('sphere'); break;
    case 'cylinder': geometry = new THREE.CylinderGeometry(0.45, 0.45, 1, 40); name = t('cylinder'); break;
    case 'cone': geometry = new THREE.ConeGeometry(0.55, 1.1, 40); name = t('cone'); break;
    case 'torus': geometry = new THREE.TorusGeometry(0.42, 0.14, 20, 56); name = t('torus'); break;
    case 'plane': geometry = new THREE.PlaneGeometry(1.2, 1.2, 1, 1); name = t('plane'); break;
    default: geometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.08); name = t('rounded_box'); type = 'box';
  }
  const object = new THREE.Mesh(geometry, material);
  object.name = name;
  object.userData.primitiveType = type;
  object.castShadow = true;
  object.receiveShadow = true;
  const currentBounds = new THREE.Box3().setFromObject(modelGroup);
  const center = currentBounds.isEmpty() ? new THREE.Vector3() : currentBounds.getCenter(new THREE.Vector3());
  object.position.set(center.x + (currentBounds.isEmpty() ? 0 : 1.25), type === 'plane' ? 0.02 : 0.55, center.z);
  if (type === 'plane') object.rotation.x = -Math.PI / 2;
  modelGroup.add(object);
  selectObject(object, name);
  byId('model-badge').textContent = 'OBJECT';
  byId('object-state').textContent = 'Primitive';
  recordHistory(`${name} ${t('add_object')}`);
  frameModel();
  notify(`${name} ${t('add_object')}`);
}

function rotateSelected(axis: 'x' | 'y' | 'z', degrees = 90): void {
  const target = activeTransformTarget();
  target.rotation[axis] += THREE.MathUtils.degToRad(degrees);
  syncTransformFields();
  updateMeshStats();
}

function setSelectedWireframe(enabled: boolean): void {
  currentModel?.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => { if ('wireframe' in material) (material as THREE.Material & { wireframe: boolean }).wireframe = enabled; });
  });
}

function setSmoothShading(enabled: boolean): void {
  currentModel?.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (enabled) child.geometry.computeVertexNormals();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
        material.flatShading = !enabled;
        material.needsUpdate = true;
      }
    });
  });
}

byId<HTMLInputElement>('wireframe').addEventListener('change', (event) => setSelectedWireframe((event.currentTarget as HTMLInputElement).checked));
byId<HTMLInputElement>('smooth-shading').addEventListener('change', (event) => setSmoothShading((event.currentTarget as HTMLInputElement).checked));
document.querySelectorAll<HTMLButtonElement>('[data-primitive]').forEach((button) => button.addEventListener('click', () => addPrimitive(button.dataset.primitive!)));
function setTransformMode(mode: 'translate' | 'rotate' | 'scale'): void {
  transformMode = mode;
  transformControls.setMode(mode);
  if (currentModel) transformControls.attach(currentModel);
  transformHelper.visible = true;
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
  byId('disable-transform').classList.remove('active');
}

function disableTransformGizmo(): void {
  transformControls.detach();
  transformHelper.visible = false;
  document.querySelectorAll('[data-mode]').forEach((button) => button.classList.remove('active'));
  byId('disable-transform').classList.add('active');
}

document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.addEventListener('click', () => setTransformMode(button.dataset.mode as 'translate' | 'rotate' | 'scale')));
byId('disable-transform').addEventListener('click', disableTransformGizmo);
document.querySelectorAll<HTMLButtonElement>('[data-rotate]').forEach((button) => button.addEventListener('click', () => rotateSelected(button.dataset.rotate as 'x' | 'y' | 'z')));
byId('stand-upright').addEventListener('click', () => {
  const target = activeTransformTarget();
  const rawAxis = target.userData.generatedUpAxis as [number, number, number] | undefined;
  if (rawAxis) target.quaternion.setFromUnitVectors(new THREE.Vector3(...rawAxis), new THREE.Vector3(0, 1, 0));
  else target.rotation.set(0, 0, 0);
  syncTransformFields();
  updateMeshStats();
  notify('Long axis aligned to Y. Rotate manually if the pose needs adjustment.');
});
byId('place-ground').addEventListener('click', () => {
  const target = activeTransformTarget();
  target.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3().setFromObject(target);
  if (!bounds.isEmpty()) target.position.y -= bounds.min.y;
  syncTransformFields();
  updateMeshStats();
});
byId('frame-selected').addEventListener('click', frameModel);
function deleteSelectedObject(): void {
  if (!currentModel || currentModel.parent !== modelGroup) return;
  const removed = currentModel;
  transformControls.detach();
  modelGroup.remove(removed);
  disposeModel(removed);
  currentModel = null;
  activeObject = t('selected_none');
  byId('model-label').textContent = activeObject;
  byId('model-badge').textContent = 'EMPTY';
  byId('inspector-model-name').textContent = activeObject;
  byId('object-state').textContent = 'Empty scene';
  syncTransformFields();
  updateMeshStats();
  recordHistory('Deleted selected object');
}
byId('delete-object').addEventListener('click', deleteSelectedObject);
document.addEventListener('keydown', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('input, textarea, select, [contenteditable="true"]') || byId<HTMLDialogElement>('about-dialog').open || collectionDialog.open) return;
  const mode = ({ g: 'translate', r: 'rotate', s: 'scale' } as const)[event.key.toLowerCase() as 'g' | 'r' | 's'];
  if (mode) {
    setTransformMode(mode);
  } else if (event.key === 'Escape' || event.key.toLowerCase() === 'q') {
    disableTransformGizmo();
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    deleteSelectedObject();
  }
});
byId<HTMLInputElement>('bevel').addEventListener('input', (event) => {
  const radius = Number((event.currentTarget as HTMLInputElement).value);
  byId('bevel-value').textContent = `Bevel ${radius.toFixed(2)}`;
  if (!(currentModel instanceof THREE.Mesh) || currentModel.userData.primitiveType !== 'box') return;
  currentModel.geometry.dispose();
  currentModel.geometry = radius === 0 ? new THREE.BoxGeometry(1, 1, 1) : new RoundedBoxGeometry(1, 1, 1, 4, radius);
  if (byId<HTMLInputElement>('smooth-shading').checked) currentModel.geometry.computeVertexNormals();
  updateMeshStats();
});

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportGlb(object: THREE.Object3D, filename: string): Promise<void> {
  object.updateWorldMatrix(true, true);
  object.traverse((child) => {
    if (child instanceof THREE.Mesh && !child.geometry.getAttribute('normal')) child.geometry.computeVertexNormals();
  });
  const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
  const result = await new GLTFExporter().parseAsync(object, { binary: true, onlyVisible: true });
  if (!(result instanceof ArrayBuffer)) throw new Error('GLB exporter returned an unexpected result.');
  downloadBlob(new Blob([result], { type: 'model/gltf-binary' }), filename);
  recordHistory(`Exported ${filename}`);
}

byId('export-glb').addEventListener('click', () => {
  if (currentModel) void exportGlb(currentModel, 'rt-studio-model.glb').catch((error: unknown) => notify(error instanceof Error ? error.message : 'GLB export failed.', true));
});
byId('export-obj').addEventListener('click', () => {
  if (!currentModel) return;
  void import('three/addons/exporters/OBJExporter.js').then(({ OBJExporter }) => {
    currentModel?.updateWorldMatrix(true, true);
    const output = currentModel ? new OBJExporter().parse(currentModel) : '';
    downloadBlob(new Blob([output], { type: 'text/plain' }), 'rt-studio-model.obj');
    recordHistory('Exported rt-studio-model.obj');
  }).catch((error: unknown) => notify(error instanceof Error ? error.message : 'OBJ export failed.', true));
});
byId('save-project').addEventListener('click', () => {
  if (modelGroup.children.length) void exportGlb(modelGroup, 'rt-studio-project.glb').then(() => notify('Project saved as a GLB file.')).catch((error: unknown) => notify(error instanceof Error ? error.message : 'Project export failed.', true));
});
byId('open-project').addEventListener('click', () => byId<HTMLInputElement>('project-input').click());
byId<HTMLInputElement>('project-input').addEventListener('change', async (event) => {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  try {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const gltf = await new GLTFLoader().parseAsync(await file.arrayBuffer(), '');
    replaceModel(gltf.scene, file.name.replace(/\.glb$/i, ''), false);
    byId('model-badge').textContent = 'PROJECT';
    byId('object-state').textContent = 'Imported project';
    frameModel();
    notify('Project opened.');
  } catch (error) {
    notify(error instanceof Error ? error.message : 'Could not open this GLB project.', true);
  }
});

const ambientLight = scene.children.find((child) => child instanceof THREE.HemisphereLight) as THREE.HemisphereLight;
type WorkspaceSettings = { quality: 'low' | 'standard' | 'high'; colorStyle: 'natural' | 'vivid'; shadows: boolean; grid: boolean; axes: boolean };
const defaultWorkspaceSettings: WorkspaceSettings = { quality: 'standard', colorStyle: 'natural', shadows: true, grid: true, axes: true };
function readWorkspaceSettings(): WorkspaceSettings {
  try {
    const saved = JSON.parse(localStorage.getItem('rt-studio-settings') ?? 'null') as Partial<WorkspaceSettings> | null;
    return { ...defaultWorkspaceSettings, ...(saved ?? {}) };
  } catch { return { ...defaultWorkspaceSettings }; }
}
let workspaceSettings = readWorkspaceSettings();

function applyWorkspaceSettings(): void {
  const dpr = window.devicePixelRatio || 1;
  const pixelRatio = workspaceSettings.quality === 'low' ? 1 : workspaceSettings.quality === 'high' ? Math.min(dpr, 2) : Math.min(dpr, 1.5);
  const shadowSize = workspaceSettings.quality === 'low' ? 512 : workspaceSettings.quality === 'high' ? 2048 : 1024;
  renderer.setPixelRatio(pixelRatio);
  renderer.shadowMap.enabled = workspaceSettings.shadows;
  keyLight.castShadow = workspaceSettings.shadows;
  keyLight.shadow.map?.dispose();
  keyLight.shadow.mapSize.set(shadowSize, shadowSize);
  const vivid = workspaceSettings.colorStyle === 'vivid';
  ambientLight.color.set(vivid ? '#fff0dd' : '#d9e2ff');
  ambientLight.groundColor.set(vivid ? '#45395c' : '#4a4650');
  keyLight.color.set(vivid ? '#ffe0ad' : '#fff1d9');
  fillLight.color.set(vivid ? '#9bbcff' : '#dce7ff');
  fillLight.intensity = vivid ? 1.0 : 0.8;
  rimLight.visible = vivid;
  grid.visible = workspaceSettings.grid;
  axes.visible = workspaceSettings.axes;
  byId<HTMLInputElement>('show-grid').checked = workspaceSettings.grid;
  byId<HTMLInputElement>('show-axes').checked = workspaceSettings.axes;
  byId<HTMLInputElement>('quality-setting').value = workspaceSettings.quality;
  byId<HTMLInputElement>('color-style-setting').value = workspaceSettings.colorStyle;
  byId<HTMLInputElement>('shadows-setting').checked = workspaceSettings.shadows;
  byId<HTMLInputElement>('grid-setting').checked = workspaceSettings.grid;
  byId<HTMLInputElement>('axes-setting').checked = workspaceSettings.axes;
  byId<HTMLInputElement>('light-color').value = `#${keyLight.color.getHexString()}`;
  byId<HTMLInputElement>('ambient-light').value = String(vivid ? 0.25 : 0.2);
  byId('ambient-value').textContent = vivid ? '0.25' : '0.20';
}

function saveWorkspaceSettings(): void {
  try { localStorage.setItem('rt-studio-settings', JSON.stringify(workspaceSettings)); } catch { notify('Browser storage is unavailable; these settings will only last for this session.', true); }
  applyWorkspaceSettings();
}

function openSettings(): void { applyWorkspaceSettings(); byId<HTMLDialogElement>('settings-dialog').showModal(); }
byId('close-settings').addEventListener('click', () => byId<HTMLDialogElement>('settings-dialog').close());
byId<HTMLDialogElement>('settings-dialog').addEventListener('click', (event) => { if (event.target === event.currentTarget) byId<HTMLDialogElement>('settings-dialog').close(); });
byId<HTMLSelectElement>('quality-setting').addEventListener('change', (event) => { workspaceSettings.quality = (event.currentTarget as HTMLSelectElement).value as WorkspaceSettings['quality']; saveWorkspaceSettings(); });
byId<HTMLSelectElement>('color-style-setting').addEventListener('change', (event) => { workspaceSettings.colorStyle = (event.currentTarget as HTMLSelectElement).value as WorkspaceSettings['colorStyle']; saveWorkspaceSettings(); });
byId<HTMLInputElement>('shadows-setting').addEventListener('change', (event) => { workspaceSettings.shadows = (event.currentTarget as HTMLInputElement).checked; saveWorkspaceSettings(); });
byId<HTMLInputElement>('grid-setting').addEventListener('change', (event) => { workspaceSettings.grid = (event.currentTarget as HTMLInputElement).checked; saveWorkspaceSettings(); });
byId<HTMLInputElement>('axes-setting').addEventListener('change', (event) => { workspaceSettings.axes = (event.currentTarget as HTMLInputElement).checked; saveWorkspaceSettings(); });
byId('settings-reset').addEventListener('click', () => { workspaceSettings = { ...defaultWorkspaceSettings }; saveWorkspaceSettings(); notify(t('settings_reset_done')); });
applyWorkspaceSettings();

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
function applyMaterialTransparency(enabled: boolean, opacity: number): void {
  currentModel?.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      material.transparent = enabled;
      material.opacity = enabled ? opacity : 1;
      material.depthWrite = !enabled;
      material.needsUpdate = true;
    });
  });
}

function syncMaterialTransparencyControls(): void {
  let material: THREE.Material | undefined;
  currentModel?.traverse((child) => {
    if (material || !(child instanceof THREE.Mesh)) return;
    material = Array.isArray(child.material) ? child.material[0] : child.material;
  });
  const enabled = material?.transparent ?? false;
  const opacity = enabled ? (material?.opacity ?? 1) : 1;
  byId<HTMLInputElement>('material-transparent').checked = enabled;
  byId<HTMLInputElement>('material-opacity').value = String(opacity);
  byId('material-opacity-value').textContent = `${Math.round(opacity * 100)}%`;
}

byId<HTMLInputElement>('material-transparent').addEventListener('change', (event) => {
  const enabled = (event.currentTarget as HTMLInputElement).checked;
  const slider = byId<HTMLInputElement>('material-opacity');
  if (enabled && Number(slider.value) === 1) slider.value = '0.45';
  if (!enabled) slider.value = '1';
  const opacity = Number(slider.value);
  byId('material-opacity-value').textContent = `${Math.round(opacity * 100)}%`;
  applyMaterialTransparency(enabled, opacity);
});
byId<HTMLInputElement>('material-opacity').addEventListener('input', (event) => {
  const opacity = Number((event.currentTarget as HTMLInputElement).value);
  byId('material-opacity-value').textContent = `${Math.round(opacity * 100)}%`;
  if (byId<HTMLInputElement>('material-transparent').checked) applyMaterialTransparency(true, opacity);
});
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
resolutionLabel.dataset.l10n = 'quality_label';
resolutionLabel.textContent = t('quality_label');
const resolutionSelect = document.createElement('select');
resolutionSelect.id = 'render-resolution';
resolutionSelect.className = 'select-field';
resolutionSelect.innerHTML = '<option value="400x300" data-l10n="resolution_draft">400 × 300 · Draft</option><option value="800x600" selected data-l10n="resolution_standard">800 × 600 · Standard</option><option value="1200x900" data-l10n="resolution_high">1200 × 900 · High</option>';
const resolutionLabels: Record<Locale, Record<string, string>> = { ru: { resolution_draft: 'Черновик', resolution_standard: 'Стандарт', resolution_high: 'Высокое' }, kk: { resolution_draft: 'Жоба', resolution_standard: 'Стандарт', resolution_high: 'Жоғары' }, en: { resolution_draft: 'Draft', resolution_standard: 'Standard', resolution_high: 'High' } };
for (const locale of ['ru', 'kk', 'en'] as const) Object.assign(translations[locale], resolutionLabels[locale]);
byId<HTMLSelectElement>('render-scene').after(resolutionLabel, resolutionSelect);
resolutionSelect.addEventListener('change', () => {
  byId('render-button').innerHTML = `◉ &nbsp; ${t('render_at')} ${resolutionSelect.value.replace('x', ' × ')} PPM`;
});

type CollectionRow = { title: string; detail: string; actionLabel?: string; action?: () => void; downloadUrl?: string };
const collectionDialog = document.createElement('dialog');
collectionDialog.id = 'collection-dialog';
collectionDialog.className = 'about-dialog collection-dialog';
collectionDialog.innerHTML = '<button class="dialog-close" aria-label="Close">×</button><h2 class="collection-title"></h2><div class="collection-list"></div>';
document.body.append(collectionDialog);
collectionDialog.querySelector('.dialog-close')!.addEventListener('click', () => collectionDialog.close());
collectionDialog.addEventListener('click', (event) => { if (event.target === collectionDialog) collectionDialog.close(); });

function showCollection(title: string, rows: CollectionRow[], emptyMessage: string): void {
  collectionDialog.querySelector<HTMLElement>('.collection-title')!.textContent = title;
  const list = collectionDialog.querySelector<HTMLElement>('.collection-list')!;
  list.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'collection-empty';
    empty.textContent = emptyMessage;
    list.append(empty);
  }
  for (const row of rows) {
    const item = document.createElement('article');
    item.className = 'collection-row';
    const copy = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = row.title;
    const detail = document.createElement('span');
    detail.textContent = row.detail;
    copy.append(name, detail);
    item.append(copy);
    if (row.action && row.actionLabel) {
      const button = document.createElement('button');
      button.className = 'secondary-button collection-action';
      button.textContent = row.actionLabel;
      button.addEventListener('click', () => { collectionDialog.close(); row.action?.(); });
      item.append(button);
    }
    if (row.downloadUrl) {
      const link = document.createElement('button');
      link.className = 'secondary-button collection-action collection-download';
      link.textContent = t('download_glb');
      link.addEventListener('click', () => { void downloadModel(row.downloadUrl!, 'rt-studio-model.glb').catch((error: unknown) => notify(error instanceof Error ? error.message : 'Could not download model.', true)); });
      item.append(link);
    }
    list.append(item);
  }
  collectionDialog.showModal();
}

function showModels(): void {
  const models = generatedModelUrl && !savedModels.some((model) => model.url === generatedModelUrl)
    ? [{ name: 'Generated 3D model', url: generatedModelUrl, createdAt: 'Current session' }, ...savedModels]
    : savedModels;
  const rows: CollectionRow[] = models.map((model) => ({
    title: model.name,
    detail: `${model.createdAt} · GLB`,
    actionLabel: t('browse'),
    action: () => { generatedModelUrl = model.url; void loadGeneratedModel(model.url).catch((error: unknown) => notify(error instanceof Error ? error.message : 'Could not load the model.', true)); },
    downloadUrl: model.url,
  }));
  showCollection(t('models_list'), rows, t('models_empty'));
}

function showFiles(): void {
  const rows: CollectionRow[] = [];
  if (lastImage) rows.push({
    title: lastImage.name,
    detail: `${t('source_label')} · ${(lastImage.size / 1024 / 1024).toFixed(2)} MB`,
    actionLabel: t('choose_image'),
    action: () => byId<HTMLInputElement>('image-input').click(),
  });
  rows.push({ title: t('models_list'), detail: `${savedModels.length} GLB`, actionLabel: t('browse'), action: showModels });
  rows.push({ title: t('open_project'), detail: 'GLB', actionLabel: t('open_project'), action: () => byId<HTMLInputElement>('project-input').click() });
  showCollection(t('file_list'), rows, t('files_empty'));
}

function showScene(): void {
  const rows: CollectionRow[] = modelGroup.children.map((object, index) => {
    let meshCount = 0;
    let triangles = 0;
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      meshCount += 1;
      triangles += child.geometry.index ? child.geometry.index.count / 3 : (child.geometry.getAttribute('position')?.count ?? 0) / 3;
    });
    const name = object.name || `Object ${index + 1}`;
    return {
      title: name,
      detail: `${meshCount} mesh${meshCount === 1 ? '' : 'es'} · ${Math.round(triangles).toLocaleString()} triangles`,
      actionLabel: t('select'),
      action: () => selectObject(object, name, object === currentModel && generatedModelUrl !== ''),
    };
  });
  if (rows.length < 10) rows.push({ title: t('add_primitive'), detail: [t('box'), t('sphere'), t('cylinder'), t('cone'), t('torus'), t('plane')].join(', '), actionLabel: t('open_tools'), action: () => document.querySelector<HTMLButtonElement>('[data-tab="tools"]')?.click() });
  showCollection(t('scene_objects'), rows, t('scene_empty'));
}

function showHistory(): void {
  const rows: CollectionRow[] = history.map((entry) => ({ title: entry, detail: t('local_project') }));
  if (history.length) rows.push({ title: t('clear_history'), detail: t('local_profile'), actionLabel: t('clear_history'), action: () => {
    history = [];
    try { localStorage.removeItem('rt-studio-history'); } catch { /* History remains cleared for this session. */ }
    showHistory();
  } });
  showCollection(t('history_title'), rows, t('history_empty'));
}

const renderTab = document.createElement('button');
renderTab.className = 'inspector-tab';
renderTab.dataset.tab = 'render';
renderTab.dataset.l10n = 'nav_render';
renderTab.textContent = t('nav_render');
document.querySelector('.inspector-tabs')?.append(renderTab);
const renderPanel = document.createElement('div');
renderPanel.className = 'properties-content hidden';
renderPanel.id = 'panel-render';
renderPanel.dataset.panel = 'render';
renderPanel.append(document.querySelector('.render-card')!);
byId('panel-object').before(renderPanel);
document.querySelector<HTMLElement>('.lower-grid')!.style.gridTemplateColumns = '1fr';
applyLanguage(currentLocale);

document.querySelectorAll<HTMLButtonElement>('.inspector-tab').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.inspector-tab').forEach((tab) => tab.classList.remove('active'));
  document.querySelectorAll('[data-panel]').forEach((panel) => panel.classList.add('hidden'));
  button.classList.add('active');
  byId(`panel-${button.dataset.tab}`).classList.remove('hidden');
}));

byId('render-button').addEventListener('click', async () => {
  const button = byId<HTMLButtonElement>('render-button');
  button.disabled = true;
  byId('render-status').textContent = t('render_working');
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
    byId('render-status').textContent = `${t('render_complete')} ${width} × ${height} PPM`;
    recordHistory(t('render_done'));
    notify(t('render_done'));
  } catch (error) {
    const message = error instanceof Error ? error.message : t('render_error');
    byId('render-status').textContent = message;
    notify(message, true);
  } finally { button.disabled = false; }
});

function openAbout(): void { byId<HTMLDialogElement>('about-dialog').showModal(); }
let workspaceEntryPending = false;
let currentUsername = '';
let authReady = false;
function activeUsername(): string {
  return currentUsername;
}
function refreshAccountUi(): void {
  const username = activeUsername();
  const signedIn = !!username;
  byId('profile-name').textContent = username || t('signed_in');
  byId('profile-status').textContent = signedIn ? t('account_signed_in') : t('local_profile');
  byId('profile-avatar').textContent = (username || '?').slice(0, 1).toUpperCase();
  byId('top-avatar').textContent = (username || '?').slice(0, 1).toUpperCase();
  byId('account-logout').classList.toggle('hidden', !signedIn);
  byId('account-status').textContent = signedIn ? `${t('account_signed_in')} ${username}.` : t('account_signed_out');
}
function showAccount(): void {
  byId<HTMLInputElement>('account-username').value = activeUsername();
  refreshAccountUi();
  byId<HTMLDialogElement>('account-dialog').showModal();
}
function setAccountMessage(message: string, error = false): void {
  const status = byId('account-status');
  status.textContent = message;
  status.classList.toggle('account-error', error);
}
byId<HTMLFormElement>('account-form').addEventListener('submit', (event) => { event.preventDefault(); void loginLocalAccount(); });
async function authenticate(path: string, successMessage: string): Promise<void> {
  const username = byId<HTMLInputElement>('account-username').value.trim();
  const password = byId<HTMLInputElement>('account-password').value;
  try {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (!response.ok) {
      await response.text();
      const invalidUsername = !/^[\p{L}\p{N}_-]{2,32}$/u.test(username);
      setAccountMessage(response.status === 409 ? t('account_exists') : response.status === 400 ? (invalidUsername ? t('username_short') : t('password_short')) : response.status === 503 ? t('server_start') : t('login_failed'), true);
      return;
    }
    const user = await response.json() as { username: string };
    currentUsername = user.username;
    authReady = true;
    byId<HTMLInputElement>('account-password').value = '';
    refreshAccountUi();
    setAccountMessage(`${successMessage} ${user.username}.`);
    byId<HTMLDialogElement>('account-dialog').close();
    if (workspaceEntryPending) { workspaceEntryPending = false; enterWorkspace(); }
  } catch { setAccountMessage(t('server_start'), true); }
}
function createLocalAccount(): Promise<void> { return authenticate('/api/auth/register', t('account_created')); }
function loginLocalAccount(): Promise<void> { return authenticate('/api/auth/login', t('account_signed_in')); }
byId('profile-button').addEventListener('click', showAccount);
byId('landing-account').addEventListener('click', showAccount);
byId('close-account').addEventListener('click', () => byId<HTMLDialogElement>('account-dialog').close());
byId<HTMLDialogElement>('account-dialog').addEventListener('click', (event) => { if (event.target === event.currentTarget) byId<HTMLDialogElement>('account-dialog').close(); });
byId('account-create').addEventListener('click', () => { void createLocalAccount(); });
byId('account-login').addEventListener('click', () => { void loginLocalAccount(); });
byId('account-logout').addEventListener('click', () => {
  void fetch('/api/auth/logout', { method: 'POST' }).then((response) => {
    if (!response.ok) throw new Error('Logout request failed');
    currentUsername = '';
    workspaceEntryPending = false;
    document.body.classList.add('landing-mode');
    byId<HTMLDialogElement>('account-dialog').close();
    refreshAccountUi();
    requestAnimationFrame(() => resize());
  }).catch(() => notify(t('logout_error'), true));
});
refreshAccountUi();
void fetch('/api/auth/session').then(async (response) => {
  if (response.ok) currentUsername = ((await response.json()) as { username: string }).username;
}).catch(() => undefined).finally(() => { authReady = true; refreshAccountUi(); });
for (const id of ['landing-language', 'app-language']) byId<HTMLSelectElement>(id).addEventListener('change', refreshAccountUi);

async function enterWorkspace(): Promise<void> {
  if (!authReady) {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) currentUsername = ((await response.json()) as { username: string }).username;
    } catch { /* The account dialog will explain that the backend is offline. */ }
    authReady = true;
  }
  if (!activeUsername()) {
    workspaceEntryPending = true;
    showAccount();
    setAccountMessage(t('account_missing'));
    return;
  }
  document.body.classList.remove('landing-mode');
  requestAnimationFrame(() => { resize(); controls.update(); });
  try { sessionStorage.setItem('rt-studio-entered-workspace', '1'); } catch { /* The button still enters the application. */ }
}
byId('enter-workspace').addEventListener('click', enterWorkspace);
byId('enter-workspace-bottom').addEventListener('click', enterWorkspace);
byId('help-button').addEventListener('click', openAbout);
byId('docs-button').addEventListener('click', () => { window.location.assign('/docs/index.md'); });
byId('close-dialog').addEventListener('click', () => byId<HTMLDialogElement>('about-dialog').close());
byId('about-dialog').addEventListener('click', (event) => { if (event.target === event.currentTarget) byId<HTMLDialogElement>('about-dialog').close(); });
byId('new-project').addEventListener('click', () => {
  replaceModel(makeDemoModel(), 'Primitive sample', false);
  generationId = '';
  resetTransform();
  byId<HTMLInputElement>('image-input').value = '';
  setSelectedImage(null);
  notify('New local workspace is ready.');
});
byId('sidebar-toggle').addEventListener('click', () => byId('sidebar').classList.toggle('collapsed'));
byId('object-more').addEventListener('click', resetTransform);
document.querySelectorAll<HTMLButtonElement>('[data-nav]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-nav]').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const section = button.dataset.nav!;
  const titleKey = section === 'My Models' ? 'page_models' : `page_${section.toLowerCase()}`;
  byId('page-title').textContent = t(titleKey);
  if (section === 'Files') showFiles();
  else if (section === 'My Models') showModels();
  else if (section === 'Scene') showScene();
  else if (section === 'Render' || section === 'Material') document.querySelector<HTMLButtonElement>(`[data-tab="${section.toLowerCase()}"]`)?.click();
  else if (section === 'History') showHistory();
  else if (section === 'Settings') openSettings();
  else if (section === 'About') openAbout();
  else if (section === 'Home') window.scrollTo({ top: 0, behavior: 'smooth' });
}));

let localServerState: 'checking' | 'offline' | 'ai-ready' | 'ai-missing' = 'checking';
function refreshServerLabels(): void {
  const connected = localServerState === 'ai-ready' || localServerState === 'ai-missing';
  const aiReady = localServerState === 'ai-ready';
  byId('server-label').textContent = localServerState === 'offline' ? t('server_start') : aiReady ? t('server_ready') : localServerState === 'ai-missing' ? t('server_missing_ai') : '…';
  byId('ai-state').textContent = localServerState === 'offline' ? t('offline') : aiReady ? t('ai_ready') : t('ai_unavailable');
  byId('ai-state-help').textContent = localServerState === 'offline' ? t('offline_server') : aiReady ? t('local_ai_ready') : t('install_ai');
  if (!aiReady && connected) byId('upload-status').textContent = t('ai_offline');
}
for (const id of ['landing-language', 'app-language']) byId<HTMLSelectElement>(id).addEventListener('change', refreshServerLabels);

fetch('/api/health').then((response) => {
  if (!response.ok) throw new Error('server unavailable');
  return response.json() as Promise<{ ai_generation?: boolean }>;
}).then((health) => {
  localServerState = health.ai_generation ? 'ai-ready' : 'ai-missing';
  refreshServerLabels();
  byId('server-label').parentElement?.classList.add('connected');
  byId('ai-state-bar').classList.toggle('ready', !!health.ai_generation);
  if (!health.ai_generation) {
    byId('server-label').parentElement?.classList.add('ai-unavailable');
    byId('upload-status').textContent = t('ai_offline');
  }
}).catch(() => {
  localServerState = 'offline';
  refreshServerLabels();
  byId('server-label').parentElement?.classList.add('disconnected');
});
