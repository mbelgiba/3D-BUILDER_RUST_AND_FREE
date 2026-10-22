mod api;
mod geometry;
mod math;
mod renderer;

use renderer::{ppm, scene::four_demo_scenes};
use std::{fs, io};

fn load_dotenv() {
    let Ok(contents) = fs::read_to_string(".env") else {
        return;
    };
    for line in contents.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let Some((name, value)) = line.split_once('=') else {
            continue;
        };
        let name = name.trim();
        if name.is_empty() || std::env::var_os(name).is_some() {
            continue;
        }
        let value = value.trim().trim_matches(['"', '\'']);
        // Keep this deliberately small: .env values are plain strings, without shell expansion.
        unsafe {
            std::env::set_var(name, value);
        }
    }
}

fn render_scenes() -> io::Result<()> {
    fs::create_dir_all("renders")?;
    for (name, scene) in four_demo_scenes() {
        let pixels = scene.render(800, 600);
        let path = format!("renders/{name}.ppm");
        ppm::write(&path, 800, 600, &pixels)?;
        println!("Wrote {path}");
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    load_dotenv();
    if std::env::args().nth(1).as_deref() == Some("render-scenes") {
        render_scenes()?;
        return Ok(());
    }
    api::serve().await
}
