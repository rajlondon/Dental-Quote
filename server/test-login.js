import express from 'express';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

const users = new Map();

// Simple register
app.post('/test/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    users.set(email, { email, passwordHash });
    res.json({ success: true, message: 'User created' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simple login
app.post('/test/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    console.log('User found:', user.email);
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    res.json({ success: true, message: 'Login successful', email: user.email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(8081, () => {
  console.log('Test server running on port 8081');
});
