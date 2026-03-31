let timeModal;
let viewDate = new Date();
let selectedDay = null;
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

document.addEventListener('DOMContentLoaded', () => {
    timeModal = new bootstrap.Modal(document.getElementById('timeModal'));
    document.getElementById('btnSalvar').onclick = salvarPonto;
    document.getElementById('btnRemover').onclick = removerPonto;
    render();
});

function render() {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const key = `escala_${month}_${year}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};
    
    document.getElementById('current-month').innerText = `${monthNames[month]} ${year}`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    document.getElementById('pdf-periodo-label').innerText = `Período: 01/${month+1}/${year} a ${lastDay}/${month+1}/${year}`;

    const grid = document.getElementById('calendar-grid');
    const tableBody = document.getElementById('table-body-pdf');
    grid.innerHTML = ''; tableBody.innerHTML = '';
    let count = 0;

    for (let i = 1; i <= lastDay; i++) {
        const data = saved[i];
        const dateObj = new Date(year, month, i);
        const weekday = dateObj.toLocaleDateString('pt-br', { weekday: 'short' }).replace('.', '');

        // CARDS WEB
        const el = document.createElement('div');
        el.className = `day-card ${data ? 'active-work' : ''}`;
        el.innerHTML = `<small>${weekday}</small><span class="day-num">${i}</span>
            ${data ? `<div class="card-times">${data.ent}<br>${data.almS} - ${data.almR}<br>${data.sai}</div>` : ''}`;
        el.onclick = () => {
            selectedDay = i;
            document.getElementById('modalDateTitle').innerText = `Dia ${i} de ${monthNames[month]}`;
            document.getElementById('inEnt').value = data ? data.ent : "08:00";
            document.getElementById('inAlmS').value = data ? data.almS : "12:00";
            document.getElementById('inAlmR').value = data ? data.almR : "13:00";
            document.getElementById('inSai').value = data ? data.sai : "17:00";
            timeModal.show();
        };
        grid.appendChild(el);

        // TABELA PDF
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i}/${month+1}</td>
            <td style="text-transform:uppercase">${weekday}</td>
            <td>${data ? data.ent : '-'}</td>
            <td>${data ? data.almS : '-'}</td>
            <td>${data ? data.almR : '-'}</td>
            <td>${data ? data.sai : '-'}</td>
        `;
        tableBody.appendChild(tr);
        if (data) count++;
    }
    document.getElementById('total-days').innerText = count;
}

function salvarPonto() {
    const key = `escala_${viewDate.getMonth()}_${viewDate.getFullYear()}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};
    saved[selectedDay] = {
        ent: document.getElementById('inEnt').value,
        almS: document.getElementById('inAlmS').value,
        almR: document.getElementById('inAlmR').value,
        sai: document.getElementById('inSai').value
    };
    localStorage.setItem(key, JSON.stringify(saved));
    timeModal.hide();
    render();
}

function removerPonto() {
    const key = `escala_${viewDate.getMonth()}_${viewDate.getFullYear()}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};
    delete saved[selectedDay];
    localStorage.setItem(key, JSON.stringify(saved));
    timeModal.hide();
    render();
}

function changeMonth(dir) { viewDate.setMonth(viewDate.getMonth() + dir); render(); }

function zerarMes() {
    if(confirm("Zerar todos os dados deste mês?")) {
        localStorage.removeItem(`escala_${viewDate.getMonth()}_${viewDate.getFullYear()}`);
        render();
    }
}

function gerarPDF() {
    render(); // Força atualização da tabela
    const element = document.getElementById('area-pdf-print');
    element.classList.remove('d-none'); // Mostra para captura

    const opt = {
        margin: [5, 5, 5, 5],
        filename: `Escala_${monthNames[viewDate.getMonth()]}_${viewDate.getFullYear()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Delay para garantir que o PDF capture os dados preenchidos
    setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
            element.classList.add('d-none');
        });
    }, 500);
}