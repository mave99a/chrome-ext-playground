// Update time
function updateTime() {
  const now = new Date();
  document.getElementById('stat-time').textContent =
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('stat-date').textContent =
    now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  document.getElementById('stat-random').textContent =
    Math.floor(Math.random() * 100);
}

// Interactive functions
function showAlert() {
  document.getElementById('demo-output').innerHTML =
    '<strong>Alert!</strong> You clicked the alert button at ' + new Date().toLocaleTimeString();
}

const quotes = [
  '"The best way to predict the future is to invent it." - Alan Kay',
  '"Code is like humor. When you have to explain it, it\'s bad." - Cory House',
  '"First, solve the problem. Then, write the code." - John Johnson',
  '"Simplicity is the soul of efficiency." - Austin Freeman',
  '"Make it work, make it right, make it fast." - Kent Beck'
];

function generateQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('demo-output').innerHTML = '<em>' + quote + '</em>';
}

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
];

let currentGradient = 0;

function changeBackground() {
  currentGradient = (currentGradient + 1) % gradients.length;
  document.body.style.background = gradients[currentGradient];
  document.getElementById('demo-output').innerHTML =
    '<strong>Background changed!</strong> Gradient #' + (currentGradient + 1);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Show URL
  document.getElementById('page-url').textContent = window.location.href;

  // Update stats every second
  updateTime();
  setInterval(updateTime, 1000);

  // Bind button events
  document.getElementById('btn-alert').addEventListener('click', showAlert);
  document.getElementById('btn-quote').addEventListener('click', generateQuote);
  document.getElementById('btn-color').addEventListener('click', changeBackground);
});
