use wasm_bindgen::prelude::*;

// Filter: Grayscale
#[wasm_bindgen]
pub fn grayscale(pixels: &mut [u8]) {
    for i in (0..pixels.len()).step_by(4) {
        let r = pixels[i] as f32;
        let g = pixels[i + 1] as f32;
        let b = pixels[i + 2] as f32;

        let gray = (0.299 * r + 0.587 * g + 0.114 * b) as u8;

        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
    }
}

// Filter: Invert colors
#[wasm_bindgen]
pub fn invert(pixels: &mut [u8]) {
    for i in (0..pixels.len()).step_by(4) {
        pixels[i] = 255 - pixels[i];
        pixels[i + 1] = 255 - pixels[i + 1];
        pixels[i + 2] = 255 - pixels[i + 2];
    }
}

// Filter: Brightness adjustment
#[wasm_bindgen]
pub fn brightness(pixels: &mut [u8], amount: i32) {
    for i in (0..pixels.len()).step_by(4) {
        pixels[i] = clamp(pixels[i] as i32 + amount);
        pixels[i + 1] = clamp(pixels[i + 1] as i32 + amount);
        pixels[i + 2] = clamp(pixels[i + 2] as i32 + amount);
    }
}

// Filter: Sepia
#[wasm_bindgen]
pub fn sepia(pixels: &mut [u8]) {
    for i in (0..pixels.len()).step_by(4) {
        let r = pixels[i] as f32;
        let g = pixels[i + 1] as f32;
        let b = pixels[i + 2] as f32;

        pixels[i] = clamp((r * 0.393 + g * 0.769 + b * 0.189) as i32);
        pixels[i + 1] = clamp((r * 0.349 + g * 0.686 + b * 0.168) as i32);
        pixels[i + 2] = clamp((r * 0.272 + g * 0.534 + b * 0.131) as i32);
    }
}

// Filter: Contrast adjustment
#[wasm_bindgen]
pub fn contrast(pixels: &mut [u8], amount: i32) {
    let factor = (259.0 * (amount as f32 + 255.0)) / (255.0 * (259.0 - amount as f32));
    for i in (0..pixels.len()).step_by(4) {
        pixels[i] = clamp((factor * (pixels[i] as f32 - 128.0) + 128.0) as i32);
        pixels[i + 1] = clamp((factor * (pixels[i + 1] as f32 - 128.0) + 128.0) as i32);
        pixels[i + 2] = clamp((factor * (pixels[i + 2] as f32 - 128.0) + 128.0) as i32);
    }
}

// Filter: Vignette effect
#[wasm_bindgen]
pub fn vignette(pixels: &mut [u8], width: u32, height: u32, strength: f32) {
    let center_x = width as f32 / 2.0;
    let center_y = height as f32 / 2.0;
    let max_dist = (center_x.powi(2) + center_y.powi(2)).sqrt();

    for y in 0..height {
        for x in 0..width {
            let i = ((y * width + x) * 4) as usize;

            let dx = x as f32 - center_x;
            let dy = y as f32 - center_y;
            let dist = (dx.powi(2) + dy.powi(2)).sqrt();

            let norm_dist = dist / max_dist;

            let factor = 1.0 - (norm_dist * strength);

            pixels[i] = (pixels[i] as f32 * factor) as u8;
            pixels[i + 1] = (pixels[i + 1] as f32 * factor) as u8;
            pixels[i + 2] = (pixels[i + 2] as f32 * factor) as u8;
        }
    }
}

// Filter: Resize (Nearest Neighbor)
#[wasm_bindgen]
pub fn resize(pixels: &[u8], width: u32, height: u32, new_width: u32, new_height: u32) -> Vec<u8> {
    let mut new_pixels = vec![0u8; (new_width * new_height * 4) as usize];
    let x_ratio = width as f32 / new_width as f32;
    let y_ratio = height as f32 / new_height as f32;

    for y in 0..new_height {
        for x in 0..new_width {
            let px = (x as f32 * x_ratio).floor() as u32;
            let py = (y as f32 * y_ratio).floor() as u32;

            let old_idx = ((py * width + px) * 4) as usize;
            let new_idx = ((y * new_width + x) * 4) as usize;

            if old_idx + 3 < pixels.len() {
                new_pixels[new_idx] = pixels[old_idx];
                new_pixels[new_idx + 1] = pixels[old_idx + 1];
                new_pixels[new_idx + 2] = pixels[old_idx + 2];
                new_pixels[new_idx + 3] = pixels[old_idx + 3];
            }
        }
    }
    new_pixels
}

// Filter: Crop
#[wasm_bindgen]
pub fn crop(
    pixels: &[u8],
    width: u32,
    height: u32,
    start_x: u32,
    start_y: u32,
    new_width: u32,
    new_height: u32,
) -> Vec<u8> {
    let mut new_pixels = vec![0u8; (new_width * new_height * 4) as usize];

    for y in 0..new_height {
        let src_start_y = start_y + y;
        if src_start_y >= height {
            break;
        }

        let src_row_start = (src_start_y * width + start_x) as usize * 4;
        let dst_row_start = (y * new_width) as usize * 4;

        let row_len = (new_width as usize) * 4;
        let src_slice = &pixels[src_row_start..src_row_start + row_len];
        let dst_slice = &mut new_pixels[dst_row_start..dst_row_start + row_len];

        dst_slice.copy_from_slice(src_slice);
    }

    new_pixels
}

// Filter: Flip Horizontal
#[wasm_bindgen]
pub fn flip_horizontal(pixels: &[u8], width: u32, height: u32) -> Vec<u8> {
    let mut new_pixels = vec![0u8; pixels.len()];

    for y in 0..height {
        for x in 0..width {
            let old_idx = ((y * width + x) * 4) as usize;
            let new_idx = ((y * width + (width - 1 - x)) * 4) as usize;

            new_pixels[new_idx] = pixels[old_idx];
            new_pixels[new_idx + 1] = pixels[old_idx + 1];
            new_pixels[new_idx + 2] = pixels[old_idx + 2];
            new_pixels[new_idx + 3] = pixels[old_idx + 3];
        }
    }
    new_pixels
}

// Filter: Flip Vertical
#[wasm_bindgen]
pub fn flip_vertical(pixels: &[u8], width: u32, height: u32) -> Vec<u8> {
    let mut new_pixels = vec![0u8; pixels.len()];

    for y in 0..height {
        let old_row_start = (y * width) as usize * 4;
        let new_row_start = ((height - 1 - y) * width) as usize * 4;

        let row_len = width as usize * 4;
        new_pixels[new_row_start..new_row_start + row_len]
            .copy_from_slice(&pixels[old_row_start..old_row_start + row_len]);
    }
    new_pixels
}

// Simple pseudo-random number generator for noise
struct Lcg {
    state: u32,
}

impl Lcg {
    fn new(seed: u32) -> Self {
        Self { state: seed }
    }

    fn next(&mut self) -> f32 {
        self.state = self.state.wrapping_mul(1664525).wrapping_add(1013904223);
        (self.state % 100) as f32 / 100.0
    }
}

// Filter: Lofi (Warm tint + Noise + Slight Desaturation)
#[wasm_bindgen]
pub fn lofi(pixels: &mut [u8]) {
    let mut rng = Lcg::new(12345);

    for i in (0..pixels.len()).step_by(4) {
        let r_in = pixels[i] as f32;
        let g_in = pixels[i + 1] as f32;
        let b_in = pixels[i + 2] as f32;

        // 1. Desaturate slightly
        let gray = r_in * 0.299 + g_in * 0.587 + b_in * 0.114;
        let desat = 0.2;
        let r = r_in * (1.0 - desat) + gray * desat;
        let g = g_in * (1.0 - desat) + gray * desat;
        let b = b_in * (1.0 - desat) + gray * desat;

        // 2. Warm Tint
        let r = r + 30.0;
        let g = g + 15.0;

        // 3. Add Noise
        let noise = (rng.next() - 0.5) * 30.0;

        pixels[i] = clamp((r + noise) as i32);
        pixels[i + 1] = clamp((g + noise) as i32);
        pixels[i + 2] = clamp((b + noise) as i32);
    }
}

// Filter: Vintage (Faded + Magenta/Blue Tint)
#[wasm_bindgen]
pub fn vintage(pixels: &mut [u8]) {
    for i in (0..pixels.len()).step_by(4) {
        let r = pixels[i] as f32;
        let g = pixels[i + 1] as f32;
        let b = pixels[i + 2] as f32;

        // Boost Red and Blue (Magenta), reduce Green
        pixels[i] = clamp((r * 0.9 + 40.0) as i32);
        pixels[i + 1] = clamp((g * 0.7 + 10.0) as i32);
        pixels[i + 2] = clamp((b * 0.9 + 40.0) as i32);
    }
}

// Filter: Cyberpunk (High Contrast + Cool Cyan/Magenta split)
#[wasm_bindgen]
pub fn cyberpunk(pixels: &mut [u8]) {
    for i in (0..pixels.len()).step_by(4) {
        let r = pixels[i] as f32;
        let g = pixels[i + 1] as f32;
        let b = pixels[i + 2] as f32;

        pixels[i] = clamp((r * 1.3 - 30.0) as i32);
        pixels[i + 1] = clamp((g * 0.9) as i32);
        pixels[i + 2] = clamp((b * 1.4 - 10.0) as i32);
    }
}

fn clamp(value: i32) -> u8 {
    if value < 0 {
        0
    } else if value > 255 {
        255
    } else {
        value as u8
    }
}
