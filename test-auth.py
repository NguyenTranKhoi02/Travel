import urllib.request
import json
import ssl

firebaseConfig = {
  "apiKey": "AIzaSyAiXzF-UtDR23AdYzN92ttCFwwkt3KlyAw"
}
url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebaseConfig['apiKey']}"
data = json.dumps({
    "email": "horsetravel23@gmail.com",
    "password": "Anviphg1",
    "returnSecureToken": True
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        print("SUCCESS:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("ERROR:", e.code, e.read().decode('utf-8'))
