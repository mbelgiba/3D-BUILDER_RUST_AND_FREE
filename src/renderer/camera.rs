use crate::math::{ray::Ray, vector::Vec3};

#[derive(Clone, Copy, Debug)]
pub struct Camera {
    pub position: Vec3,
    pub target: Vec3,
    pub up: Vec3,
    pub vertical_fov_degrees: f64,
}

impl Camera {
    pub fn ray_for_pixel(&self, x: usize, y: usize, width: usize, height: usize) -> Ray {
        let forward = (self.target - self.position).normalized();
        let right = self.up.cross(forward).normalized();
        let up = forward.cross(right).normalized();
        let aspect = width as f64 / height as f64;
        let half_height = (self.vertical_fov_degrees.to_radians() * 0.5).tan();
        let px = (2.0 * (x as f64 + 0.5) / width as f64 - 1.0) * aspect * half_height;
        let py = (1.0 - 2.0 * (y as f64 + 0.5) / height as f64) * half_height;
        Ray::new(self.position, (forward + right * px + up * py).normalized())
    }
}

#[cfg(test)]
mod tests {
    use super::Camera;
    use crate::math::vector::Vec3;
    #[test]
    fn center_pixel_points_at_target() {
        let camera = Camera {
            position: Vec3::new(0.0, 0.0, -3.0),
            target: Vec3::default(),
            up: Vec3::new(0.0, 1.0, 0.0),
            vertical_fov_degrees: 60.0,
        };
        let ray = camera.ray_for_pixel(1, 1, 3, 3);
        assert!(ray.direction.z > 0.99);
        assert!(ray.direction.x.abs() < 0.001 && ray.direction.y.abs() < 0.001);
        let right_ray = camera.ray_for_pixel(2, 1, 3, 3);
        assert!(right_ray.direction.x > 0.0);
    }
}
