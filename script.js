let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let myChart = null;

// DASHBOARD LOGIC (Home Page)
function updateDashboard() {
    const totalDisplay = document.getElementById('monthlyTotalDisplay');
    if (!totalDisplay) return;

    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    let monthlySum = 0;
    const totals = { Food: 0, Transport: 0, Utilities: 0, Shopping: 0, Health: 0 };

    expenses.forEach(exp => {
        const d = new Date(exp.date);
        if (d.getMonth() === currMonth && d.getFullYear() === currYear) {
            monthlySum += exp.amount;
            if (totals.hasOwnProperty(exp.category)) totals[exp.category] += exp.amount;
        }
    });

    totalDisplay.innerText = `$${monthlySum.toFixed(2)}`;
    updatePieChart(Object.values(totals));
}

function updatePieChart(dataValues) {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    if (myChart) myChart.destroy(); // Fix: Destroy old chart to allow new data

    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Food', 'Transport', 'Utilities', 'Shopping', 'Health'],
            datasets: [{
                data: dataValues,
                backgroundColor: ['#fbbf24', '#3b82f6', '#10b981', '#f472b6', '#8b5cf6']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// FORM HANDLING
const form = document.getElementById('expenseForm');
if (form) {
    document.getElementById('dateInput').valueAsDate = new Date();
    updateDashboard();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const expense = {
            id: Date.now(),
            date: document.getElementById('dateInput').value,
            amount: parseFloat(document.getElementById('amountInput').value),
            category: document.getElementById('categoryInput').value,
            desc: document.getElementById('descInput').value || 'No description'
        };
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateDashboard();
        form.reset();
        document.getElementById('dateInput').valueAsDate = new Date();
    });
}

// HISTORY LOGIC (History Page)
function displayHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;

    // Display all initially
    renderHistoryItems(expenses);
}

function renderHistoryItems(itemsToRender) {
    const list = document.getElementById('historyList');
    const totalDisplay = document.getElementById('historyTotalDisplay');
    
    let total = 0;
    list.innerHTML = itemsToRender.sort((a,b) => new Date(b.date) - new Date(a.date)).map(exp => {
        total += exp.amount;
        return `
            <div class="history-item">
                <div>
                    <strong>${exp.category}</strong> <small>(${exp.date})</small><br>
                    <span style="color:#64748b; font-size:0.85em;">${exp.desc}</span>
                </div>
                <div style="font-weight:bold; color:var(--danger)">$${exp.amount.toFixed(2)}</div>
            </div>
        `;
    }).join('');

    totalDisplay.innerText = `$${total.toFixed(2)}`;
}

function filterHistory() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = expenses.filter(exp => 
        exp.category.toLowerCase().includes(query) || 
        exp.desc.toLowerCase().includes(query)
    );
    renderHistoryItems(filtered);
}

function resetData() {
    if(confirm("Delete all records?")) {
        localStorage.clear();
        location.reload();
    }
}