FROM python:3.13

WORKDIR /app

COPY requirements.txt ./

RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=4000
ENV FLASK_DEBUG=0
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

EXPOSE 4000

CMD [ "python","-u","backend/app.py","--host=0.0.0.0","--port=4000" ]