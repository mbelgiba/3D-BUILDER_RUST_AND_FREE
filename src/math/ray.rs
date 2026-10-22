use super::vector::Vec3;

/// A ray starts at `origin` and travels along `direction`.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Ray {
    pub origin: Vec3,
    pub direction: Vec3,
}

impl Ray {
    pub const fn new(origin: Vec3, direction: Vec3) -> Self {
        Self { origin, direction }
    }

    pub fn at(self, distance: f64) -> Vec3 {
        self.origin + self.direction * distance
    }
}

#[cfg(test)]
mod tests {
    use super::Ray;
    use crate::math::vector::Vec3;

    #[test]
    fn point_along_ray_uses_origin_and_direction() {
        let ray = Ray::new(Vec3::new(1.0, 2.0, 3.0), Vec3::new(0.0, 2.0, 0.0));
        assert_eq!(ray.at(2.0), Vec3::new(1.0, 6.0, 3.0));
    }
}
