FROM python:3.13.3-slim

# Diretório de trabalho
WORKDIR /app

# Copia apenas os requirements e instala dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código
COPY . /app
