use crate::math::vector::Vec3;

#[derive(Clone, Copy, Debug)]
pub struct PointLight {
    pub position: Vec3,
    pub color: Vec3,
    pub intensity: f64,
}

/// Lambert diffuse lighting plus ambient illumination. Color channels use 0..=1.
pub fn shade(
    base: Vec3,
    normal: Vec3,
    to_light: Vec3,
    light_color: Vec3,
    intensity: f64,
    ambient: f64,
) -> Vec3 {
    let diffuse = normal.normalized().dot(to_light.normalized()).max(0.0) * intensity;
    let amount = (ambient + diffuse).min(1.0);
    Vec3::new(
        (base.x * light_color.x * amount).clamp(0.0, 1.0),
        (base.y * light_color.y * amount).clamp(0.0, 1.0),
        (base.z * light_color.z * amount).clamp(0.0, 1.0),
    )
}

#[cfg(test)]
mod tests {
    use super::shade;
    use crate::math::vector::Vec3;
    #[test]
    fn ambient_light_and_color_clamping_work() {
        let dark = shade(
            Vec3::new(1.0, 0.5, 0.2),
            Vec3::new(0.0, 1.0, 0.0),
            Vec3::new(0.0, -1.0, 0.0),
            Vec3::new(2.0, 2.0, 2.0),
            2.0,
            0.2,
        );
        assert!((dark.x - 0.4).abs() < 1e-12);
        assert!((dark.y - 0.2).abs() < 1e-12);
        assert!((dark.z - 0.08).abs() < 1e-12);
        let bright = shade(
            Vec3::new(1.0, 1.0, 1.0),
            Vec3::new(0.0, 1.0, 0.0),
            Vec3::new(0.0, 1.0, 0.0),
            Vec3::new(2.0, 2.0, 2.0),
            3.0,
            0.5,
        );
        assert_eq!(bright, Vec3::new(1.0, 1.0, 1.0));
    }
}
