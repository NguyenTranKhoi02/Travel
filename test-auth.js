const firebaseConfig = {
  apiKey: "AIzaSyAiXzF-UtDR23AdYzN92ttCFwwkt3KlyAw",
  authDomain: "antravel.firebaseapp.com",
  projectId: "antravel"
};
// I can just hit the Identity Toolkit API directly with fetch!
const email = "horsetravel23@gmail.com";
const password = "Anviphg1";
const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, returnSecureToken: true })
}).then(res => res.json()).then(data => console.log(data)).catch(console.error);
