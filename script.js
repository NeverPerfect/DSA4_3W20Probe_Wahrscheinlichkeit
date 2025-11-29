// Hilfsfunktion: Würfle 3W20 und berechne TaP*-Statistik
function test(e1, e2, e3, taw) {
    const tapStatistik = Array(taw + 1).fill(0);
    let success = 0;
    const totalRolls = 20 * 20 * 20;

    for (let w1 = 1; w1 <= 20; w1++) {
        for (let w2 = 1; w2 <= 20; w2++) {
            for (let w3 = 1; w3 <= 20; w3++) {
                if (meisterhaft(w1, w2, w3)) {
                    success++; // Doppel-1: Immer Erfolg
                    tapStatistik[taw]++; // Volle TaP* übrig
                } else if (patzer(w1, w2, w3)) {
                    continue; // Doppel-20: Immer Misserfolg
                } else {
                    // Berechne benötigte TaP zum Ausgleichen
                    const tapVerbrauch =
                        Math.max(0, w1 - e1) +
                        Math.max(0, w2 - e2) +
                        Math.max(0, w3 - e3);
                    if (tapVerbrauch <= taw) {
                        success++; // Erfolg, wenn genug TaP
                        const tapUebrig = taw - tapVerbrauch; // TaP* = TaW - verbrauchte TaP
                        tapStatistik[tapUebrig]++;
                    }
                }
            }
        }
    }

    // Berechne die Wahrscheinlichkeiten für jeden TaP*-Wert
    const tapWahrscheinlichkeiten = tapStatistik.map(count => (count / totalRolls) * 100);

    return {
        gesamt: (success / totalRolls) * 100,
        tapWahrscheinlichkeiten: tapWahrscheinlichkeiten,
        doppel1Wahrscheinlichkeit: (3 / totalRolls) * 100 // 3/8000 * 100 = 0.0375% pro Doppel-1-Kombination, insgesamt 0.75% für 3W20
    };
}

// Doppel-1: Immer Erfolg
function meisterhaft(w1, w2, w3) {
    return (w1 === 1 && w2 === 1) ||
        (w2 === 1 && w3 === 1) ||
        (w1 === 1 && w3 === 1);
}

// Doppel-20: Immer Misserfolg
function patzer(w1, w2, w3) {
    return (w1 === 20 && w2 === 20) ||
        (w2 === 20 && w3 === 20) ||
        (w1 === 20 && w3 === 20);
}

// Event-Listener für den Button
document.getElementById('berechnen').addEventListener('click', function () {
    const e1 = parseInt(document.getElementById('eigenschaft1').value);
    const e2 = parseInt(document.getElementById('eigenschaft2').value);
    const e3 = parseInt(document.getElementById('eigenschaft3').value);
    const taw = parseInt(document.getElementById('taw').value);
    const mod = parseInt(document.getElementById('modifikator').value);

    // Berechne effektiven TaW und Erleichterung
    const effektiverTaW = taw + Math.min(0, mod);
    const erleichterung = Math.max(0, mod);
    const maxTap = effektiverTaW + erleichterung;

    // Führe die Berechnung durch
    const ergebnis = test(e1, e2, e3, maxTap);

    // Ergebnis anzeigen
    let html = `<h3>Ergebnis:</h3>`;
    html += `<p>Erfolgswahrscheinlichkeit gesamt: <span class="${ergebnis.gesamt >= 50 ? 'erfolg' : 'misserfolg'}">${ergebnis.gesamt.toFixed(2)}%</span></p>`;
    html += `<p>Wahrscheinlichkeit für Doppel-1 (volle TaP*): <strong>${ergebnis.doppel1Wahrscheinlichkeit.toFixed(2)}%</strong></p>`;

    // Tabelle für übrig behaltene TaP* (TaP*)
    html += `<h3>Wahrscheinlichkeit für übrig behaltene TaP*:</h3>`;
    html += `<table><tr><th>TaP* übrig</th><th>Wahrscheinlichkeit</th></tr>`;

    for (let tapUebrig = 0; tapUebrig <= maxTap; tapUebrig++) {
        const wahrscheinlichkeit = ergebnis.tapWahrscheinlichkeiten[tapUebrig] || 0;
        html += `<tr><td>${tapUebrig}</td><td>${wahrscheinlichkeit.toFixed(2)}%</td></tr>`;
    }

    html += `</table>`;

    document.getElementById('ergebnis').innerHTML = html;
});
