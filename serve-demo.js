import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5002;

// Serve static files
app.use(express.static('.'));

// Serve the demo-package-test.html file
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'demo-package-test.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Demo server running at http://0.0.0.0:${port}`);
  console.log(`Access the package demo at: http://0.0.0.0:${port}/demo-package-test.html`);
});