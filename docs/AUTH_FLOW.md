1. Register: user submits phone, password, name, role.
   → Server hashes password with bcrypt.
   → Creates user document.
   → Returns JWT (expires in 7 days) + user object.

2. Login: user submits phone + password.
   → Server finds user by phone.
   → Compares password with bcrypt.compare.
   → Returns JWT + user object.

3. Client stores token in localStorage under key "scissors_token".
   Client stores user object in localStorage under key "scissors_user".

4. Every API request (except login/register) includes header:
   Authorization: Bearer <token>

5. Server auth middleware:
   - Reads header
   - Verifies JWT with JWT_SECRET
   - Attaches req.user = { id, role }
   - If invalid: returns 401

6. Token payload contains:
   { id: userId, role: "customer"|"barber"|"owner", iat, exp }

7. On 401 response in frontend:
   → Clear localStorage
   → Redirect to /login