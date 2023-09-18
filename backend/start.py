import subprocess

if __name__ == '__main__':
    # Run the Flask server
    flask_command = 'flask --app app.py --debug run'
    subprocess.run(flask_command, shell=True)
