const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/names', (req, res) => {
  const names = JSON.parse(fs.readFileSync('names.json', 'utf8'));
  res.json({ names });
});

app.get('/play', (req, res) => {
  const { name, variable } = req.query;

  const names = JSON.parse(fs.readFileSync('names.json', 'utf8'));
  const selectedName = names.find(item => item.name === name);

  if (!selectedName) {
    return res.status(400).json({ error: 'Invalid name' });
  }

  const groupWeights = {
    'UK': 2,  // Higher weight for UK
    'NL': 1   // Lower weight for NL
    // Add more groups and weights as needed
  };

  const getRandomIndexWithWeight = (weights) => {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
      if (random < weights[i]) return i;
      random -= weights[i];
    }

    return weights.length - 1;
  };

  const randomGroup = getRandomIndexWithWeight(Object.values(groupWeights));
  const filteredNames = names.filter(item => item.group === Object.keys(groupWeights)[randomGroup]);
  const randomIndex = Math.floor(Math.random() * filteredNames.length);
  const selectedVariable = filteredNames[randomIndex].name;

  res.json({ variable: selectedVariable, remainingNames: names.filter(item => item.name !== name && item.name !== selectedVariable).map(item => item.name) });
});

app.post('/saveCombination', (req, res) => {
  const combination = req.body;
  fs.readFile('combinations.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }

    const combinations = JSON.parse(data);
    combinations.push(combination);

    fs.writeFile('combinations.json', JSON.stringify(combinations), 'utf8', (err) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.sendStatus(200);
    });
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});