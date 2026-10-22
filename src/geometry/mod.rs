pub mod cube;
pub mod cylinder;
pub mod plane;
pub mod sphere;

use crate::math::{ray::Ray, vector::Vec3};

/// Shared interface for shapes that can be intersected by a ray.
pub trait Shape {
    /// Returns the nearest non-negative distance along the ray, if it hits.
    fn intersect(&self, ray: Ray) -> Option<f64>;

    fn normal_at(&self, point: Vec3) -> Vec3;
}
