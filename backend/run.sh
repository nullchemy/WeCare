#!/bin/bash


if [ ! -d "./venv" ]; then
    echo "Creating a virtual Environment"
    python -m venv venv

    # activate the virtual environment
    echo "Activating Virtual Environment"
    venv/Scripts/activate


    echo "installing Libraries"
    if [ -x "$(command -v pip3)" ]; then # if pip3 executable exists in PATH
        pip3 install -r requirements.txt
    else
        pip install  -r requirements.txt
    fi
fi

# activate the virtual environment
echo "Activating Virtual Environment"
venv/Scripts/activate


export FLASK_APP=server
export FLASK_DEBUG=true

echo "running the server"
flask run