FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .


RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]