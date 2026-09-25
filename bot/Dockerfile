# Build from the repository root:  docker build -f bot/Dockerfile -t clipbot .
FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY clipper/requirements.txt clipper/requirements.txt
COPY bot/requirements.txt bot/requirements.txt
RUN pip install --no-cache-dir -r bot/requirements.txt
COPY clipper clipper
COPY bot bot
WORKDIR /app/bot
ENV DATA_DIR=/data
VOLUME /data
CMD ["python", "-m", "clipbot"]
