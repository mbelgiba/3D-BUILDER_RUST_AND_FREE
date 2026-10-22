use super::Shape;
use crate::math::{ray::Ray, vector::Vec3};

/// A closed cylinder whose central axis is parallel to the Y axis.
#[derive(Clone, Copy, Debug)]
pub struct Cylinder {
    pub center_x: f64,
    pub center_z: f64,
    pub radius: f64,
    pub min_y: f64,
    pub max_y: f64,
}

impl Shape for Cylinder {
    fn intersect(&self, ray: Ray) -> Option<f64> {
        if self.radius <= 0.0 || self.min_y >= self.max_y {
            return None;
        }
        let ox = ray.origin.x - self.center_x;
        let oz = ray.origin.z - self.center_z;
        let a = ray.direction.x * ray.direction.x + ray.direction.z * ray.direction.z;
        let mut nearest = f64::INFINITY;

        if a > 0.0 {
            let half_b = ox * ray.direction.x + oz * ray.direction.z;
            let c = ox * ox + oz * oz - self.radius * self.radius;
            let discriminant = half_b * half_b - a * c;
            if discriminant >= 0.0 {
                let root = discriminant.sqrt();
                for distance in [(-half_b - root) / a, (-half_b + root) / a] {
                    let y = ray.origin.y + distance * ray.direction.y;
                    if distance >= 0.0 && y >= self.min_y && y <= self.max_y {
                        nearest = nearest.min(distance);
                    }
                }
            }
        }

        // Intersect both end caps. The side may have been parallel to the ray.
        if ray.direction.y != 0.0 {
            for cap_y in [self.min_y, self.max_y] {
                let distance = (cap_y - ray.origin.y) / ray.direction.y;
                if distance >= 0.0 {
                    let point = ray.at(distance);
                    let dx = point.x - self.center_x;
                    let dz = point.z - self.center_z;
                    if dx * dx + dz * dz <= self.radius * self.radius {
                        nearest = nearest.min(distance);
                    }
                }
            }
        }
        if nearest.is_finite() {
            Some(nearest)
        } else {
            None
        }
    }

    fn normal_at(&self, point: Vec3) -> Vec3 {
        let cap_epsilon = 1e-8;
        if (point.y - self.min_y).abs() < cap_epsilon {
            Vec3::new(0.0, -1.0, 0.0)
        } else if (point.y - self.max_y).abs() < cap_epsilon {
            Vec3::new(0.0, 1.0, 0.0)
        } else {
            Vec3::new(point.x - self.center_x, 0.0, point.z - self.center_z).normalized()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::Cylinder;
    use crate::{
        geometry::Shape,
        math::{ray::Ray, vector::Vec3},
    };

    #[test]
    fn cylinder_hits_side_and_cap_and_misses() {
        let cylinder = Cylinder {
            center_x: 0.0,
            center_z: 0.0,
            radius: 1.0,
            min_y: -1.0,
            max_y: 1.0,
        };
        assert_eq!(
            cylinder.intersect(Ray::new(
                Vec3::new(-3.0, 0.0, 0.0),
                Vec3::new(1.0, 0.0, 0.0)
            )),
            Some(2.0)
        );
        assert_eq!(
            cylinder.intersect(Ray::new(
                Vec3::new(0.0, 3.0, 0.0),
                Vec3::new(0.0, -1.0, 0.0)
            )),
            Some(2.0)
        );
        assert_eq!(
            cylinder.intersect(Ray::new(Vec3::new(3.0, 0.0, 3.0), Vec3::new(1.0, 0.0, 0.0))),
            None
        );
    }
}
