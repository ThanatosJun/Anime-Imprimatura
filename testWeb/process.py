import sys 
import json

result = {
    'Name': sys.argv[1],
    'From': sys.argv[2]
  }

json = json.dumps(result)

print(str(json))
sys.stdout.flush()