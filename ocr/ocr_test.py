import sys
import os
from rapidocr import RapidOCR
from PIL import Image
from pillow_heif import register_heif_opener

register_heif_opener()


def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python ocr_test.py <path_to_image>")

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        sys.exit(f"No such file: {image_path}")

    from rapidocr import RapidOCR, EngineType, ModelType, OCRVersion

    engine = RapidOCR(params={
        "Det.engine_type": EngineType.ONNXRUNTIME,
        "Det.ocr_version": OCRVersion.PPOCRV6,
        "Det.model_type": ModelType.PPOCRV4,
        "Rec.engine_type": EngineType.ONNXRUNTIME,
        "Rec.ocr_version": OCRVersion.PPOCRV6,
        "Rec.model_type": ModelType.PPOCRV4,
    })
    result = engine(Image.open(image_path).convert("RGB"))

    print("\n--- OCR Results ---")
    if result.txts is None:
        print("No text detected.")
        return
    for text, confidence in zip(result.txts, result.scores):
        print(f"Text: {text!r} | Confidence: {confidence:.4f}")


if __name__ == "__main__":
    main()