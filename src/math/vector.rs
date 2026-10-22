use std::ops::{Add, Div, Mul, Neg, Sub};

/// A three-dimensional vector used for positions, directions, and colors.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Vec3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl Vec3 {
    pub const fn new(x: f64, y: f64, z: f64) -> Self {
        Self { x, y, z }
    }

    pub fn dot(self, other: Self) -> f64 {
        self.x * other.x + self.y * other.y + self.z * other.z
    }

    pub fn cross(self, other: Self) -> Self {
        Self::new(
            self.y * other.z - self.z * other.y,
            self.z * other.x - self.x * other.z,
            self.x * other.y - self.y * other.x,
        )
    }

    pub fn length(self) -> f64 {
        self.dot(self).sqrt()
    }

    /// Returns a zero vector for zero length instead of dividing by zero.
    pub fn normalized(self) -> Self {
        let length = self.length();
        if length == 0.0 {
            Self::default()
        } else {
            self / length
        }
    }
}

impl Add for Vec3 {
    type Output = Self;
    fn add(self, rhs: Self) -> Self {
        Self::new(self.x + rhs.x, self.y + rhs.y, self.z + rhs.z)
    }
}

impl Sub for Vec3 {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self {
        Self::new(self.x - rhs.x, self.y - rhs.y, self.z - rhs.z)
    }
}

impl Mul<f64> for Vec3 {
    type Output = Self;
    fn mul(self, rhs: f64) -> Self {
        Self::new(self.x * rhs, self.y * rhs, self.z * rhs)
    }
}

impl Div<f64> for Vec3 {
    type Output = Self;
    fn div(self, rhs: f64) -> Self {
        Self::new(self.x / rhs, self.y / rhs, self.z / rhs)
    }
}

impl Neg for Vec3 {
    type Output = Self;
    fn neg(self) -> Self {
        Self::new(-self.x, -self.y, -self.z)
    }
}

#[cfg(test)]
mod tests {
    use super::Vec3;

    #[test]
    fn dot_product_matches_components() {
        assert_eq!(
            Vec3::new(1.0, 2.0, 3.0).dot(Vec3::new(4.0, -5.0, 6.0)),
            12.0
        );
    }

    #[test]
    fn cross_product_is_perpendicular_to_both_inputs() {
        let a = Vec3::new(1.0, 2.0, 3.0);
        let b = Vec3::new(4.0, 5.0, 6.0);
        let cross = a.cross(b);
        assert_eq!(cross, Vec3::new(-3.0, 6.0, -3.0));
        assert_eq!(cross.dot(a), 0.0);
        assert_eq!(cross.dot(b), 0.0);
    }

    #[test]
    fn normalization_has_unit_length_and_handles_zero() {
        let unit = Vec3::new(0.0, 3.0, 4.0).normalized();
        assert!((unit.length() - 1.0).abs() < 1e-12);
        assert_eq!(Vec3::default().normalized(), Vec3::default());
    }
}
