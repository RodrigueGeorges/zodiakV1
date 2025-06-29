import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Simuler la fonction places
app.get('/api/places', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  // Forward the request to Nominatim
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'zodiak-app/1.0 (contact@votredomaine.com)',
      },
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Nominatim error' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Test the API: http://localhost:${PORT}/api/places?q=paris`);
}); 