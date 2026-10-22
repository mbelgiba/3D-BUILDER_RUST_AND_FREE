use crate::{
    geometry::{Shape, cube::Cube, cylinder::Cylinder, plane::Plane, sphere::Sphere},
    math::{ray::Ray, vector::Vec3},
    renderer::{
        camera::Camera,
        light::{PointLight, shade},
    },
};

#[derive(Clone, Copy, Debug)]
pub enum Object {
    Sphere { shape: Sphere, color: Vec3 },
    Cube { shape: Cube, color: Vec3 },
    Plane { shape: Plane, color: Vec3 },
    Cylinder { shape: Cylinder, color: Vec3 },
}

impl Object {
    fn intersect(self, ray: Ray) -> Option<f64> {
        match self {
            Self::Sphere { shape, .. } => shape.intersect(ray),
            Self::Cube { shape, .. } => shape.intersect(ray),
            Self::Plane { shape, .. } => shape.intersect(ray),
            Self::Cylinder { shape, .. } => shape.intersect(ray),
        }
    }
    fn normal_at(self, point: Vec3) -> Vec3 {
        match self {
            Self::Sphere { shape, .. } => shape.normal_at(point),
            Self::Cube { shape, .. } => shape.normal_at(point),
            Self::Plane { shape, .. } => shape.normal_at(point),
            Self::Cylinder { shape, .. } => shape.normal_at(point),
        }
    }
    fn color(self) -> Vec3 {
        match self {
            Self::Sphere { color, .. }
            | Self::Cube { color, .. }
            | Self::Plane { color, .. }
            | Self::Cylinder { color, .. } => color,
        }
    }
}

#[derive(Clone)]
pub struct Scene {
    pub camera: Camera,
    pub light: PointLight,
    pub ambient: f64,
    pub objects: Vec<Object>,
}

impl Scene {
    pub fn render(&self, width: usize, height: usize) -> Vec<Vec3> {
        let mut pixels = Vec::with_capacity(width * height);
        for y in 0..height {
            for x in 0..width {
                pixels.push(self.trace(self.camera.ray_for_pixel(x, y, width, height)));
            }
        }
        pixels
    }
    fn trace(&self, ray: Ray) -> Vec3 {
        let hit = self
            .objects
            .iter()
            .filter_map(|object| object.intersect(ray).map(|distance| (*object, distance)))
            .filter(|(_, distance)| *distance >= 0.0)
            .min_by(|a, b| a.1.total_cmp(&b.1));
        let Some((object, distance)) = hit else {
            return Vec3::new(0.025, 0.035, 0.06);
        };
        let point = ray.at(distance);
        let normal = object.normal_at(point);
        let to_light = self.light.position - point;
        let shadow_ray = Ray::new(point + normal * 1e-5, to_light);
        let blocked = self.objects.iter().any(|other| {
            other
                .intersect(shadow_ray)
                .is_some_and(|t| t > 1e-5 && t < 1.0)
        });
        if blocked {
            return object.color() * self.ambient;
        }
        shade(
            object.color(),
            normal,
            to_light,
            self.light.color,
            self.light.intensity,
            self.ambient,
        )
    }
}

pub fn four_demo_scenes() -> Vec<(&'static str, Scene)> {
    let camera = Camera {
        position: Vec3::new(0.0, 1.0, -6.0),
        target: Vec3::new(0.0, 0.0, 0.0),
        up: Vec3::new(0.0, 1.0, 0.0),
        vertical_fov_degrees: 45.0,
    };
    let light = PointLight {
        position: Vec3::new(-3.0, 5.0, -4.0),
        color: Vec3::new(1.0, 0.95, 0.85),
        intensity: 0.85,
    };
    let first = Scene {
        camera,
        light,
        ambient: 0.12,
        objects: vec![Object::Sphere {
            shape: Sphere {
                center: Vec3::default(),
                radius: 1.0,
            },
            color: Vec3::new(0.15, 0.55, 0.9),
        }],
    };
    let plane = Object::Plane {
        shape: Plane {
            point: Vec3::new(0.0, -1.1, 0.0),
            normal: Vec3::new(0.0, 1.0, 0.0),
        },
        color: Vec3::new(0.55, 0.58, 0.63),
    };
    let second = Scene {
        camera,
        light: PointLight {
            intensity: 0.45,
            ..light
        },
        ambient: 0.08,
        objects: vec![
            plane,
            Object::Cube {
                shape: Cube {
                    min: Vec3::new(-0.8, -1.0, -0.8),
                    max: Vec3::new(0.8, 0.6, 0.8),
                },
                color: Vec3::new(0.85, 0.3, 0.12),
            },
        ],
    };
    let full = Scene {
        camera,
        light,
        ambient: 0.12,
        objects: vec![
            Object::Plane {
                shape: Plane {
                    point: Vec3::new(0.0, -1.1, 0.0),
                    normal: Vec3::new(0.0, 1.0, 0.0),
                },
                color: Vec3::new(0.5, 0.53, 0.58),
            },
            Object::Sphere {
                shape: Sphere {
                    center: Vec3::new(-1.3, 0.0, 0.0),
                    radius: 0.8,
                },
                color: Vec3::new(0.12, 0.55, 0.9),
            },
            Object::Cube {
                shape: Cube {
                    min: Vec3::new(-0.35, -1.0, -0.65),
                    max: Vec3::new(0.95, 0.3, 0.65),
                },
                color: Vec3::new(0.9, 0.3, 0.12),
            },
            Object::Cylinder {
                shape: Cylinder {
                    center_x: 1.45,
                    center_z: 0.0,
                    radius: 0.55,
                    min_y: -1.0,
                    max_y: 0.9,
                },
                color: Vec3::new(0.2, 0.75, 0.35),
            },
        ],
    };
    let other_view = Scene {
        camera: Camera {
            position: Vec3::new(5.0, 2.2, -5.0),
            target: Vec3::new(0.0, -0.1, 0.0),
            up: Vec3::new(0.0, 1.0, 0.0),
            vertical_fov_degrees: 45.0,
        },
        ..full.clone()
    };
    vec![
        ("scene1-sphere", first),
        ("scene2-cube-plane", second),
        ("scene3-primitives", full),
        ("scene4-camera", other_view),
    ]
}
