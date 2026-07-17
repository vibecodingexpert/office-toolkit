from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import numpy as np
import cv2


def upscale_image(image: Image.Image, scale: int = 2) -> Image.Image:
    img = np.array(image)
    if scale > 4:
        scale = 4
    if scale < 1:
        scale = 1
    h, w = img.shape[:2]
    new_w, new_h = w * scale, h * scale
    if scale == 2:
        interpolations = [cv2.INTER_CUBIC, cv2.INTER_LINEAR]
    else:
        interpolations = [cv2.INTER_LANCZOS4]

    current = img
    for interp in interpolations:
        current = cv2.resize(current, (new_w, new_h), interpolation=interp)

    return Image.fromarray(cv2.cvtColor(current, cv2.COLOR_RGB2BGR) if len(current.shape) == 3 else current)


def enhance_image(image: Image.Image, sharpness: float = 1.0, contrast: float = 1.0,
                  brightness: float = 1.0, saturation: float = 1.0, denoise: bool = False) -> Image.Image:
    if sharpness != 1.0:
        image = ImageEnhance.Sharpness(image).enhance(sharpness)
    if contrast != 1.0:
        image = ImageEnhance.Contrast(image).enhance(contrast)
    if brightness != 1.0:
        image = ImageEnhance.Brightness(image).enhance(brightness)
    if saturation != 1.0:
        image = ImageEnhance.Color(image).enhance(saturation)
    if denoise:
        img = np.array(image)
        img = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)
        image = Image.fromarray(img)
    return image


def blur_background(image: Image.Image, blur_radius: int = 25) -> Image.Image:
    img = np.array(image)
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blur, 240, 255, cv2.THRESH_BINARY_INV)
    kernel = np.ones((5, 5), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    if cv2.countNonZero(thresh) == 0:
        return image
    blurred = cv2.GaussianBlur(img, (blur_radius | 1, blur_radius | 1), 0)
    mask = thresh.astype(float) / 255.0
    mask = cv2.merge([mask, mask, mask])
    result = (img * mask + blurred * (1 - mask)).astype(np.uint8)
    return Image.fromarray(result)


def create_collage(images: list[Image.Image], cols: int = 2, spacing: int = 10,
                   bg_color: str = "#ffffff", width: int = 1920) -> Image.Image:
    if not images:
        raise ValueError("No images provided")
    aspect_ratios = [im.width / im.height for im in images]
    rows = (len(images) + cols - 1) // cols
    spacing_total = spacing * (cols - 1)
    cell_w = (width - spacing_total) // cols
    cell_h = int(cell_w / max(aspect_ratios)) if aspect_ratios else cell_w
    height = rows * cell_h + spacing * (rows - 1)
    canvas = Image.new("RGB", (width, height), bg_color)

    for i, img in enumerate(images):
        col = i % cols
        row = i // cols
        x = col * (cell_w + spacing)
        y = row * (cell_h + spacing)
        resized = img.resize((cell_w, cell_h), Image.LANCZOS)
        canvas.paste(resized, (x, y))
    return canvas
