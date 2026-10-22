use super::Shape;
use crate::math::{ray::Ray, vector::Vec3};

/// Axis-aligned cube described by its minimum and maximum corners.
#[derive(Clone, Copy, Debug)]
pub struct Cube {
    pub min: Vec3,
    pub max: Vec3,
}

impl Shape for Cube {
    fn intersect(&self, ray: Ray) -> Option<f64> {
        let mut near: f64 = 0.0;
        let mut far = f64::INFINITY;
        for (origin, direction, min, max) in [
            (ray.origin.x, ray.direction.x, self.min.x, self.max.x),
            (ray.origin.y, ray.direction.y, self.min.y, self.max.y),
            (ray.origin.z, ray.direction.z, self.min.z, self.max.z),
        ] {
            if direction == 0.0 {
                if origin < min || origin > max {
                    return None;
                }
                continue;
            }
            let mut first = (min - origin) / direction;
            let mut second = (max - origin) / direction;
            if first > second {
                std::mem::swap(&mut first, &mut second);
            }
            near = near.max(first);
            far = far.min(second);
            if near > far {
                return None;
            }
        }
        if far < 0.0 {
            None
        } else if near > 0.0 {
            Some(near)
        } else {
            Some(far)
        }
    }

    fn normal_at(&self, point: Vec3) -> Vec3 {
        let center = (self.min + self.max) * 0.5;
        let half = (self.max - self.min) * 0.5;
        let local = point - center;
        let x = (local.x / half.x).abs();
        let y = (local.y / half.y).abs();
        let z = (local.z / half.z).abs();
        if x >= y && x >= z {
            Vec3::new(local.x.signum(), 0.0, 0.0)
        } else if y >= z {
            Vec3::new(0.0, local.y.signum(), 0.0)
        } else {
            Vec3::new(0.0, 0.0, local.z.signum())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::Cube;
    use crate::{
        geometry::Shape,
        math::{ray::Ray, vector::Vec3},
    };

    #[test]
    fn cube_handles_hit_miss_and_parallel_axis() {
        let cube = Cube {
            min: Vec3::new(-1.0, -1.0, -1.0),
            max: Vec3::new(1.0, 1.0, 1.0),
        };
        assert_eq!(
            cube.intersect(Ray::new(
                Vec3::new(0.0, 0.0, -3.0),
                Vec3::new(0.0, 0.0, 1.0)
            )),
            Some(2.0)
        );
        assert_eq!(
            cube.intersect(Ray::new(
                Vec3::new(2.0, 0.0, -3.0),
                Vec3::new(0.0, 0.0, 1.0)
            )),
            None
        );
        assert_eq!(
            cube.intersect(Ray::new(Vec3::new(0.0, 0.0, 0.0), Vec3::new(1.0, 0.0, 0.0))),
            Some(1.0)
        );
    }
}
