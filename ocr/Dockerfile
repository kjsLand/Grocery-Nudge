FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir paddlepaddle paddleocr

COPY ocr_test.py .

ENV OMP_NUM_THREADS=1
ENV FLAGS_use_mkldnn=0

ENTRYPOINT ["python", "ocr_test.py"]