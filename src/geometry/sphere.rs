use super::Shape;
use crate::math::{ray::Ray, vector::Vec3};

#[derive(Clone, Copy, Debug)]
pub struct Sphere {
    pub center: Vec3,
    pub radius: f64,
}

impl Shape for Sphere {
    fn intersect(&self, ray: Ray) -> Option<f64> {
        let offset = ray.origin - self.center;
        let a = ray.direction.dot(ray.direction);
        if a == 0.0 || self.radius <= 0.0 {
            return None;
        }
        let half_b = offset.dot(ray.direction);
        let c = offset.dot(offset) - self.radius * self.radius;
        let discriminant = half_b * half_b - a * c;
        if discriminant < 0.0 {
            return None;
        }

        let root = discriminant.sqrt();
        let near = (-half_b - root) / a;
        let far = (-half_b + root) / a;
        if near >= 0.0 {
            Some(near)
        } else if far >= 0.0 {
            Some(far)
        } else {
            None
        }
    }

    fn normal_at(&self, point: Vec3) -> Vec3 {
        ((point - self.center) / self.radius).normalized()
    }
}

#[cfg(test)]
mod tests {
    use super::Sphere;
    use crate::{
        geometry::Shape,
        math::{ray::Ray, vector::Vec3},
    };

    fn ray(origin: Vec3, direction: Vec3) -> Ray {
        Ray::new(origin, direction)
    }

    #[test]
    fn sphere_hit_miss_and_tangent() {
        let sphere = Sphere {
            center: Vec3::default(),
            radius: 1.0,
        };
        assert_eq!(
            sphere.intersect(ray(Vec3::new(0.0, 0.0, -3.0), Vec3::new(0.0, 0.0, 1.0))),
            Some(2.0)
        );
        assert_eq!(
            sphere.intersect(ray(Vec3::new(2.0, 0.0, -3.0), Vec3::new(0.0, 0.0, 1.0))),
            None
        );
        assert_eq!(
            sphere.intersect(ray(Vec3::new(1.0, 0.0, -3.0), Vec3::new(0.0, 0.0, 1.0))),
            Some(3.0)
        );
    }
}
