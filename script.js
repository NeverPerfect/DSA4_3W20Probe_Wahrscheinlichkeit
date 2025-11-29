// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
} else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
});

// ----------------------------------------
// Kritische Erfolge / Patzer
// ----------------------------------------
function isCriticalSuccess(w1, w2, w3) {
    return (w1 === 1 && w2 === 1) || (w2 === 1 && w3 === 1) || (w1 === 1 && w3 === 1);
}

function isCriticalFailure(w1, w2, w3) {
    return (w1 === 20 && w2 === 20) || (w2 === 20 && w3 === 20) || (w1 === 20 && w3 === 20);
}


// ----------------------------------------
// KORREKTE Berechnung aller TaP* Wahrscheinlichkeiten
// ----------------------------------------
function calculateTapProbabilities(e1, e2, e3, tawBase, mod = 0) {
    const tawEff = tawBase + mod;
    const counts = new Array(tawBase + 1).fill(0);
    let successTotal = 0;

    for (let w1 = 1; w1 <= 20; w1++) {
        for (let w2 = 1; w2 <= 20; w2++) {
            for (let w3 = 1; w3 <= 20; w3++) {

                let tap = null; // wird nur gesetzt, wenn Probe erfolgreich

                // Critical Success → volle TaP*
                if (isCriticalSuccess(w1, w2, w3)) {
                    tap = tawBase;
                }
                // Normale Erfolge → alle Würfel ≤ Eigenschaft
                else if (w1 <= e1 && w2 <= e2 && w3 <= e3) {
                    const cost = (e1 - w1) + (e2 - w2) + (e3 - w3); // tatsächliche Ausnutzung
                    tap = Math.min(cost, tawBase);
                }
                // Alles andere → Fehlschlag, wird nicht gezählt
                else {
                    continue;
                }

                counts[tap]++;
                successTotal++;
            }
        }
    }

    return {
        total: successTotal / 8000 * 100,
        taps: counts.map(c => c / 8000 * 100)
    };
}

// ----------------------------------------
// Anzeige aktualisieren
// ----------------------------------------
function updateResults() {
    const e1 = parseInt(document.getElementById('eigenschaft1').value);
    const e2 = parseInt(document.getElementById('eigenschaft2').value);
    const e3 = parseInt(document.getElementById('eigenschaft3').value);
    const taw = parseInt(document.getElementById('taw').value);
    const mod = parseInt(document.getElementById('modifikator').value);

    const tawBase = taw;          // maximal mögliche TaP*
    const tawEff = taw + mod;    // effektiver TaW für die Probe

    const result = calculateTapProbabilities(e1, e2, e3, tawEff, tawBase);

    // Gesamterfolgswahrscheinlichkeit anzeigen
    const probabilityElement = document.getElementById('erfolgswahrscheinlichkeit');
    probabilityElement.textContent = `${result.total.toFixed(1)}%`;

    if (result.total >= 70)
        probabilityElement.className = 'probability-display high-probability';
    else if (result.total >= 30)
        probabilityElement.className = 'probability-display medium-probability';
    else
        probabilityElement.className = 'probability-display low-probability';

    // Tabelle aktualisieren
    updateProbabilityTable(tawBase, result.taps);
}

// ----------------------------------------
// Tabelle für TaP* Wahrscheinlichkeiten
// ----------------------------------------
function updateProbabilityTable(tawBase, tapProbabilities) {

    const tableBody = document.querySelector('#tapTable tbody');
    tableBody.innerHTML = '';

    // ⬇️ HIER kommt deine Schleife hin:
    for (let tap = 0; tap <= tawBase; tap++) {
        const row = document.createElement('tr');

        const tapCell = document.createElement('td');
        tapCell.textContent = tap;

        const probCell = document.createElement('td');
        probCell.textContent = `${tapProbabilities[tap].toFixed(2)}%`;

        // Farben wie gewohnt
        probCell.className = 'probability-value';
        if (tapProbabilities[tap] >= 70) probCell.classList.add('high-probability');
        else if (tapProbabilities[tap] >= 30) probCell.classList.add('medium-probability');
        else probCell.classList.add('low-probability');

        row.appendChild(tapCell);
        row.appendChild(probCell);
        tableBody.appendChild(row);
    }
}


// ----------------------------------------
// Event Listener
// ----------------------------------------
document.querySelectorAll('.number-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-target');
        const input = document.getElementById(targetId);
        let value = parseInt(input.value);
        if (e.currentTarget.classList.contains('plus')) {
            value = Math.min(value + 1, parseInt(input.max));
        } else {
            value = Math.max(value - 1, parseInt(input.min));
        }
        input.value = value;
        updateResults();
    });
});

document.querySelectorAll('.number-field').forEach(input => {
    input.addEventListener('change', updateResults);
    input.addEventListener('input', (e) => {
        const min = parseInt(e.target.min);
        const max = parseInt(e.target.max);
        let value = parseInt(e.target.value) || 0;
        value = Math.min(Math.max(value, min), max);
        e.target.value = value;
        updateResults();
    });
});

// Keyboard support
document.querySelectorAll('.number-field').forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            input.value = Math.min(parseInt(input.value) + 1, parseInt(input.max));
            updateResults();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            input.value = Math.max(parseInt(input.value) - 1, parseInt(input.min));
            updateResults();
        }
    });
});

// Initialer Start
updateResults();
