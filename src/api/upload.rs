use axum::{Json, extract::Multipart, http::StatusCode, response::IntoResponse};
use image::ImageReader;
use serde::Serialize;
use std::{io::Cursor, path::Path};

const MAX_UPLOAD_BYTES: usize = 10 * 1024 * 1024;
const MAX_IMAGE_PIXELS: u64 = 25_000_000;

#[derive(Serialize)]
struct UploadResult {
    id: String,
    format: String,
    width: u32,
    height: u32,
}

#[derive(Debug)]
struct ImageDetails {
    format: &'static str,
    width: u32,
    height: u32,
}

fn inspect_image(data: &[u8]) -> Result<ImageDetails, (StatusCode, &'static str)> {
    if data.len() > MAX_UPLOAD_BYTES {
        return Err((
            StatusCode::PAYLOAD_TOO_LARGE,
            "Image exceeds the 10 MB limit",
        ));
    }
    // Detect the type from bytes, then inspect dimensions before fully decoding.
    let reader = ImageReader::new(Cursor::new(data))
        .with_guessed_format()
        .map_err(|_| (StatusCode::BAD_REQUEST, "Unsupported or invalid image"))?;
    let format = match reader.format() {
        Some(image::ImageFormat::Jpeg) => "jpeg",
        Some(image::ImageFormat::Png) => "png",
        _ => {
            return Err((
                StatusCode::BAD_REQUEST,
                "Only JPEG and PNG images are supported",
            ));
        }
    };
    let (width, height) = reader.into_dimensions().map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            "Image dimensions could not be read",
        )
    })?;
    if u64::from(width) * u64::from(height) > MAX_IMAGE_PIXELS {
        return Err((
            StatusCode::PAYLOAD_TOO_LARGE,
            "Image exceeds the 25 megapixel limit",
        ));
    }
    let reader = ImageReader::new(Cursor::new(data))
        .with_guessed_format()
        .map_err(|_| (StatusCode::BAD_REQUEST, "Image data could not be decoded"))?;
    reader
        .decode()
        .map_err(|_| (StatusCode::BAD_REQUEST, "Image data could not be decoded"))?;
    Ok(ImageDetails {
        format,
        width,
        height,
    })
}

pub async fn upload_image(mut multipart: Multipart) -> impl IntoResponse {
    let mut bytes = None;
    loop {
        let field = match multipart.next_field().await {
            Ok(Some(field)) => field,
            Ok(None) => break,
            Err(_) => return (StatusCode::BAD_REQUEST, "Invalid multipart upload").into_response(),
        };
        if field.name() == Some("image") {
            match field.bytes().await {
                Ok(data) => {
                    bytes = Some(data);
                    break;
                }
                Err(_) => {
                    return (StatusCode::BAD_REQUEST, "Could not read uploaded image")
                        .into_response();
                }
            }
        }
    }
    let Some(data) = bytes else {
        return (StatusCode::BAD_REQUEST, "Expected an image field").into_response();
    };

    let details = match inspect_image(&data) {
        Ok(details) => details,
        Err(error) => return error.into_response(),
    };

    let id = uuid::Uuid::new_v4().to_string();
    if let Err(error) = std::fs::create_dir_all("uploads") {
        eprintln!("Could not create upload directory: {error}");
        return (StatusCode::INTERNAL_SERVER_ERROR, "Could not save image").into_response();
    }
    let path = Path::new("uploads").join(format!("{id}.{}", details.format));
    if let Err(error) = std::fs::write(path, &data) {
        eprintln!("Could not save upload: {error}");
        return (StatusCode::INTERNAL_SERVER_ERROR, "Could not save image").into_response();
    }
    (
        StatusCode::OK,
        Json(UploadResult {
            id,
            format: details.format.to_string(),
            width: details.width,
            height: details.height,
        }),
    )
        .into_response()
}

#[cfg(test)]
mod tests {
    use super::{MAX_UPLOAD_BYTES, inspect_image};
    use axum::http::StatusCode;
    use image::{DynamicImage, ImageFormat, Rgb, RgbImage};
    use std::io::Cursor;

    #[test]
    fn rejects_bytes_that_are_not_an_image() {
        assert_eq!(
            inspect_image(b"not an image").unwrap_err().0,
            StatusCode::BAD_REQUEST
        );
    }

    #[test]
    fn rejects_images_over_the_byte_limit() {
        let data = vec![0; MAX_UPLOAD_BYTES + 1];
        assert_eq!(
            inspect_image(&data).unwrap_err().0,
            StatusCode::PAYLOAD_TOO_LARGE
        );
    }

    #[test]
    fn detects_and_decodes_png_from_content() {
        let image = DynamicImage::ImageRgb8(RgbImage::from_pixel(2, 3, Rgb([20, 40, 60])));
        let mut bytes = Cursor::new(Vec::new());
        image
            .write_to(&mut bytes, ImageFormat::Png)
            .expect("PNG fixture should encode");
        let details = inspect_image(bytes.get_ref()).expect("valid PNG should be accepted");
        assert_eq!(details.format, "png");
        assert_eq!((details.width, details.height), (2, 3));
    }
}
