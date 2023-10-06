document.addEventListener('DOMContentLoaded', () => {
  const nameSelect = document.getElementById('nameSelect');
  const submitButton = document.getElementById('submitButton');
  const resultContainer = document.getElementById('resultContainer');

  let namesData; // Variable to store the names data

  fetch('/names')
    .then(response => response.json())
    .then(data => {
      namesData = data;

      const names = namesData.names.map(item => item.name);
      names.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        nameSelect.appendChild(option);
      });

      submitButton.addEventListener('click', () => {
        const selectedName = nameSelect.value;
        const selectedGroup = namesData.names.find(item => item.name === selectedName).group;

        let otherGroup = selectedGroup === 'UK' ? 'NL' : 'UK';
    let filteredNames = namesData.names.filter(item => item.group === otherGroup && item.name !== selectedName);
        let availableVariables = filteredNames.map(item => item.name);

        if (availableVariables.length === 0) {
          filteredNames = namesData.names.filter(item => item.group === selectedGroup && item.name !== selectedName);
            availableVariables = filteredNames.map(item => item.name);
        }

        const randomVariable = availableVariables[Math.floor(Math.random() * availableVariables.length)];

        fetch(`/play?name=${selectedName}&variable=${randomVariable}`)
          .then(response => response.json())
          .then(data => {
            const { variable, remainingNames } = data;
            resultContainer.innerHTML = `
              <h3>Hello ${selectedName}!</h3>
              <p style="color: #007bff; font-weight: bold;">You have selected <span style="color: #007bff;">${variable}</span>.</p>
            `;

            // Remove selected name and variable from the list
            const optionToRemove = nameSelect.querySelector(`option[value='${selectedName}']`);
            optionToRemove.remove();

            const variableToRemove = 
        nameSelect.querySelector(`option[value='${variable}']`);
            variableToRemove.remove();
            
            nameSelect.innerHTML = '';
            remainingNames.forEach(name => {
              const option = document.createElement('option');
              option.value = name;
              option.textContent = name;
              nameSelect.appendChild(option);
            });

            // Save combination to combinations.json
            const combination = { selectedName, variable };
            fetch('/saveCombination', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(combination)
            });
          });
      });
    });
});