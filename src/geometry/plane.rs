use super::Shape;
use crate::math::{ray::Ray, vector::Vec3};

#[derive(Clone, Copy, Debug)]
pub struct Plane {
    pub point: Vec3,
    pub normal: Vec3,
}

impl Shape for Plane {
    fn intersect(&self, ray: Ray) -> Option<f64> {
        let normal = self.normal.normalized();
        let denominator = normal.dot(ray.direction);
        if denominator.abs() < 1e-10 {
            return None;
        }
        let distance = (self.point - ray.origin).dot(normal) / denominator;
        if distance >= 0.0 {
            Some(distance)
        } else {
            None
        }
    }

    fn normal_at(&self, _point: Vec3) -> Vec3 {
        self.normal.normalized()
    }
}

#[cfg(test)]
mod tests {
    use super::Plane;
    use crate::{
        geometry::Shape,
        math::{ray::Ray, vector::Vec3},
    };

    #[test]
    fn plane_hit_parallel_and_behind() {
        let plane = Plane {
            point: Vec3::default(),
            normal: Vec3::new(0.0, 1.0, 0.0),
        };
        assert_eq!(
            plane.intersect(Ray::new(
                Vec3::new(0.0, 2.0, 0.0),
                Vec3::new(0.0, -1.0, 0.0)
            )),
            Some(2.0)
        );
        assert_eq!(
            plane.intersect(Ray::new(Vec3::new(0.0, 2.0, 0.0), Vec3::new(1.0, 0.0, 0.0))),
            None
        );
        assert_eq!(
            plane.intersect(Ray::new(Vec3::new(0.0, 2.0, 0.0), Vec3::new(0.0, 1.0, 0.0))),
            None
        );
    }
}
