# WeCare Backend

# to run backend

- activate the virtual environment

```bash
    venv/Scripts/activate
```

- install modules (dependencies) for the application

```bash
    pip install -r requirements.txt
```

- start the backend in Development mode

```bash
    flask run --debug
```

- start the backend in development (Linux)

```bash
    gunicorn run:server
```

- start the backend on a windows system

```bash
    python waitress_server.py
```
