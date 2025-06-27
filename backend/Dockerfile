FROM python:3.12-slim

WORKDIR /app

# Copia o requirements.txt
COPY backend/requirements.txt /app/

# Instala as dependências via pip
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código do backend
COPY backend /app/backend

# Exponha a porta do Flask
EXPOSE 5000

# Define variável de ambiente para o Flask
ENV FLASK_APP=backend.wsgi

# Comando padrão para rodar o Flask
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
