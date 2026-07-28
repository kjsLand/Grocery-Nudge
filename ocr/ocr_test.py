import sys
from paddleocr import PaddleOCR


def main():
    if len(sys.argv) < 2:
        print("Usage: python ocr_test.py <path_to_image>")
        sys.exit(1)

    image_path = sys.argv[1]

    # use_textline_orientation handles rotated text, lang can be 'en', 'ch', etc.
    ocr = PaddleOCR(
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        lang='en'
    )

    result = ocr.predict(image_path)

    print("\n--- OCR Results ---")
    for res in result:
        texts = res["rec_texts"]
        scores = res["rec_scores"]
        for text, confidence in zip(texts, scores):
            print(f"Text: {text!r} | Confidence: {confidence:.4f}")


if __name__ == "__main__":
    main()