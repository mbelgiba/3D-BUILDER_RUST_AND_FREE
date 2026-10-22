use crate::math::vector::Vec3;
use std::{
    io::{self, Write},
    path::Path,
};

pub fn header(width: usize, height: usize) -> String {
    format!("P3\n{width} {height}\n255\n")
}
pub fn channel_to_byte(value: f64) -> u8 {
    (value.clamp(0.0, 1.0) * 255.0).round() as u8
}

pub fn write(
    path: impl AsRef<Path>,
    width: usize,
    height: usize,
    pixels: &[Vec3],
) -> io::Result<()> {
    std::fs::write(path, encode(width, height, pixels)?)
}

pub fn encode(width: usize, height: usize, pixels: &[Vec3]) -> io::Result<Vec<u8>> {
    if pixels.len() != width * height {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "pixel count does not match image dimensions",
        ));
    }
    let mut output = Vec::new();
    output.write_all(header(width, height).as_bytes())?;
    for pixel in pixels {
        writeln!(
            output,
            "{} {} {}",
            channel_to_byte(pixel.x),
            channel_to_byte(pixel.y),
            channel_to_byte(pixel.z)
        )?;
    }
    output.flush()?;
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::{channel_to_byte, header};
    #[test]
    fn ppm_header_is_p3_with_dimensions() {
        assert_eq!(header(800, 600), "P3\n800 600\n255\n");
    }
    #[test]
    fn channels_clamp_to_byte_range() {
        assert_eq!(channel_to_byte(-0.5), 0);
        assert_eq!(channel_to_byte(0.5), 128);
        assert_eq!(channel_to_byte(2.0), 255);
    }
}
