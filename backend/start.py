import subprocess

command = "flask --app app.py --debug run"

try:
    subprocess.run(command, shell=True)
except subprocess.CalledProcessError as e:
    print(f"Error: Failed to run the command. Details: {str(e)}")
except KeyboardInterrupt:
    print("Process interrupted by user.")
