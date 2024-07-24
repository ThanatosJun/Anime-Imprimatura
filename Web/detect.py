import sys 
import json

result = {
    'CHD_name': sys.argv[1],
    'image_path': sys.argv[2]
}

json = json.dumps(result)

print(str(json))
sys.stdout.flush()