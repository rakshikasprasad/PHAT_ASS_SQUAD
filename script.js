const scriptURL = 'https://script.google.com/macros/s/AKfycbxf4sFlFPhctJHRuVQ9hhZDJB1XtF8kVNehhCmC2-b4_IVOf3iM7uSDj9G2tB3BZWpkYQ/exec'; // Replace with your deployed script URL

const calendarEl = document.getElementById('calendar');
const userSelect = document.getElementById('userSelect');
const statusSelect = document.getElementById('statusSelect');
const saveBtn = document.getElementById('saveBtn');
const groupView = document.getElementById('groupView');
const monthLabel = document.getElementById('monthLabel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let selectedDate = null;
let calendarData = {}; // {date: status}
let allData = [];

const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function updateCalendar() {
  calendarEl.innerHTML = '';
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  dayNames.forEach(day => {
    const el = document.createElement('div');
    el.className = 'day-name';
    el.textContent = day;
    calendarEl.appendChild(el);
  });

  for (let i = 0; i < firstDay; i++) {
    calendarEl.appendChild(document.createElement('div'));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const el = document.createElement('div');
    el.className = 'day';
    el.textContent = d;
    el.dataset.date = dateStr;

    if (calendarData[dateStr]) {
      el.classList.add(calendarData[dateStr]);
    }

    el.onclick = () => {
      document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
      el.classList.add('selected');
      selectedDate = dateStr;
    };

    calendarEl.appendChild(el);
  }

  monthLabel.textContent = `${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}`;
}

function loadData() {
  fetch(scriptURL)
    .then(res => res.json())
    .then(data => {
      allData = data;
      const name = userSelect.value;
      calendarData = {};

      data.forEach(entry => {
        if (entry.name === name) {
          calendarData[entry.date] = entry.status.toLowerCase();
        }
      });

      updateCalendar();
      renderGroupView();
    });
}

function renderGroupView() {
  const grouped = {};
  allData.forEach(entry => {
    if (!grouped[entry.date]) grouped[entry.date] = [];
    grouped[entry.date].push(`${entry.name}: ${entry.status}`);
  });

  let html = '';
  Object.keys(grouped).sort().forEach(date => {
    html += `<strong>${date}</strong><br>`;
    html += grouped[date].map(e => `- ${e}`).join('<br>') + '<br><br>';
  });

  groupView.innerHTML = html;
}

saveBtn.onclick = () => {
  if (!selectedDate) {
    alert('Please select a day.');
    return;
  }

  const status = statusSelect.value;
  calendarData[selectedDate] = status;

  const name = userSelect.value;
  const availability = Object.entries(calendarData).map(([date, status]) => ({ date, status }));

  fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify({ name, availability }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.text())
    .then(() => {
      alert('Availability saved!');
      selectedDate = null;
      loadData();
    })
    .catch(() => alert("Error saving. Please check Google Script permissions."));
};

userSelect.onchange = loadData;

prevBtn.onclick = () => {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }
  updateCalendar();
};

nextBtn.onclick = () => {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }
  updateCalendar();
};

loadData();
