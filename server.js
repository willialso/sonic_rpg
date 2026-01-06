const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Handle all routes by serving index.html (for client-side routing if needed)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

