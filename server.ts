import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

const app = express();
app.use(bodyParser.json());

// Allow frontend requests
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Demo users
const USERS = [
  { id: 1, email: "test@example.com", password: "123456" }
];

const ACCESS_SECRET = "dev_access_secret";

// Login route
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, ACCESS_SECRET, { expiresIn: "1h" });

  res.json({ token, user: { id: user.id, email: user.email } });
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));