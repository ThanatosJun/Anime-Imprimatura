import json
import sys

# 獲取命令行參數
name = sys.argv[1]
from_place = sys.argv[2]

data = {
    "Name": name,
    "From": from_place
}

print(json.dumps(data))
