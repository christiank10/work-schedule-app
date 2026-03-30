const grid = document.getElementById('calendar-grid');
const monthTitle = document.getElementById('current-month');
const totalDisplay = document.getElementById('total-days');

let viewDate = new Date(); 
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function render() {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    monthTitle.innerText = `${monthNames[month]} ${year}`;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const storageKey = `escala_${month}_${year}`;
    const saved = JSON.parse(localStorage.getItem(storageKey)) || {};
    
    grid.innerHTML = '';
    let count = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const isWorked = saved[i] || false;
        if (isWorked) count++;

        const date = new Date(year, month, i);
        const weekday = date.toLocaleDateString('pt-br', { weekday: 'short' }).replace('.', '');

        const el = document.createElement('div');
        el.className = `day-card shadow-sm ${isWorked ? 'active-work' : ''}`;
        el.innerHTML = `<span>${i}</span><small>${weekday}</small>`;
        el.onclick = () => toggleDay(i);
        grid.appendChild(el);
    }
    totalDisplay.innerText = count;
}

function toggleDay(day) {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const storageKey = `escala_${month}_${year}`;
    const saved = JSON.parse(localStorage.getItem(storageKey)) || {};
    saved[day] = !saved[day];
    localStorage.setItem(storageKey, JSON.stringify(saved));
    render();
}

window.changeMonth = (offset) => {
    viewDate.setMonth(viewDate.getMonth() + offset);
    render();
};

document.getElementById('reset-btn').onclick = () => {
    if(confirm("Deseja zerar as marcações deste mês?")) {
        localStorage.removeItem(`escala_${viewDate.getMonth()}_${viewDate.getFullYear()}`);
        render();
    }
};

render();