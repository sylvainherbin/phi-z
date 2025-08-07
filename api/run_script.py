import subprocess
import json
import os
import sys

# Define the directory where the scripts are located
SCRIPTS_DIR = 'scripts'

def handler(event, context):
    """
    Vercel serverless function to run a specified Python script.
    """
    # Set up the response headers to allow CORS (Cross-Origin Resource Sharing)
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }

    # Handle preflight CORS requests
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }

    try:
        # Check for the presence of the 'scriptName' in the POST body
        body = json.loads(event['body'])
        script_name = body.get('scriptName')

        if not script_name or not script_name.endswith('.py'):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({"error": "Invalid or missing scriptName."})
            }

        # Construct the full path to the script
        script_path = os.path.join(SCRIPTS_DIR, script_name)

        # A security check: ensure the script path is within the designated scripts directory
        # This prevents directory traversal attacks
        if not os.path.realpath(script_path).startswith(os.path.realpath(SCRIPTS_DIR)):
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({"error": "Unauthorized script path."})
            }

        # A list of allowed scripts to prevent execution of arbitrary files
        allowed_scripts = [
            'CMB.py',
            'Cosmic_Chronometers.py',
            'SNIa.py',
            'bao.py',
            'cluster_deficit_calc.py',
            'galaxy_2pcf_check.py',
            'validate_bao_hz.py'
        ]

        if script_name not in allowed_scripts:
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({"error": "Script is not in the list of allowed scripts."})
            }

        # Use subprocess to execute the script and capture its output
        result = subprocess.run(
            [sys.executable, script_path], 
            capture_output=True, 
            text=True,
            timeout=60 # A 60-second timeout to prevent long-running processes
        )

        # Check for errors in script execution
        if result.returncode != 0:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({
                    "success": False,
                    "output": result.stdout,
                    "error": result.stderr
                })
            }
        
        # Return the script's output
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                "success": True,
                "output": result.stdout
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": f"Internal Server Error: {str(e)}"})
        }

