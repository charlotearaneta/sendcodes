/*
  Cake Raffle Application
  Features:
  - Add participants
  - Draw random winner
  - Reset raffle
  - Remove individual participants
*/

// DOM Elements
const form = document.getElementById('entry-form');
const nameInput = document.getElementById('name');
const participantsList = document.getElementById('participants-list');
const drawButton = document.getElementById('draw-button');
const resetButton = document.getElementById('reset-button');
const winnerDisplay = document.getElementById('winner-display');
const participantCount = document.getElementById('participant-count');

// Array to store participant names
let participants = [];

// Initialize the application
function initApp() {
  // Load saved participants from localStorage (optional)
  const savedParticipants = localStorage.getItem('cakeRaffleParticipants');
  if (savedParticipants) {
    participants = JSON.parse(savedParticipants);
    participants.forEach(name => addParticipantToDOM(name));
    updateParticipantCount();
    updateDrawButton();
  }
  
  // Focus on input field
  nameInput.focus();
}

// Add participant to DOM
function addParticipantToDOM(name) {
  const participantItem = document.createElement('div');
  participantItem.className = 'participant-item';
  participantItem.innerHTML = `
    <span>${name}</span>
    <button class="remove-btn" data-name="${name}" title="Remove ${name}">×</button>
  `;
  participantsList.appendChild(participantItem);
  
  // Remove empty state message if it exists
  const emptyMessage = participantsList.querySelector('.empty-message');
  if (emptyMessage) {
    emptyMessage.remove();
  }
}

// Update participant count display
function updateParticipantCount() {
  participantCount.textContent = `(${participants.length})`;
}

// Update draw button state
function updateDrawButton() {
  drawButton.disabled = participants.length === 0;
}

// Save participants to localStorage (optional)
function saveParticipants() {
  localStorage.setItem('cakeRaffleParticipants', JSON.stringify(participants));
}

// Form submission handler
form.addEventListener('submit', function(event) {
  event.preventDefault();
  
  const name = nameInput.value.trim();
  
  // Validate input
  if (!name) {
    showMessage('Please enter a name', 'error');
    nameInput.focus();
    return;
  }
  
  if (name.length > 30) {
    showMessage('Name is too long (max 30 characters)', 'error');
    nameInput.select();
    return;
  }
  
  if (participants.includes(name)) {
    showMessage(`${name} is already in the raffle!`, 'error');
    nameInput.select();
    return;
  }
  
  // Add participant
  participants.push(name);
  addParticipantToDOM(name);
  updateParticipantCount();
  updateDrawButton();
  saveParticipants();
  
  // Show success message
  showMessage(`${name} added to raffle! 🎉`, 'success');
  
  // Clear input and focus
  nameInput.value = '';
  nameInput.focus();
});

// Draw button click handler
drawButton.addEventListener('click', function() {
  if (participants.length === 0) {
    showMessage('Add participants before drawing!', 'error');
    return;
  }
  
  // Disable buttons during draw
  drawButton.disabled = true;
  resetButton.disabled = true;
  
  // Create suspense
  let countdown = 3;
  winnerDisplay.innerHTML = `<p>Drawing in ${countdown}... ⏳</p>`;
  
  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      winnerDisplay.innerHTML = `<p>Drawing in ${countdown}... ⏳</p>`;
    } else {
      clearInterval(countdownInterval);
      
      // Draw the winner
      const winnerIndex = Math.floor(Math.random() * participants.length);
      const winner = participants[winnerIndex];
      
      // Display winner with animation
      winnerDisplay.innerHTML = `
        <p>
          🎊🎉 <strong>${winner}</strong> 🎉🎊<br>
          <span style="font-size: 18px; margin-top: 10px; display: block;">
            Wins the cake! 🍰
          </span>
        </p>
      `;
      winnerDisplay.classList.add('winner-animation');
      
      // Re-enable buttons
      drawButton.disabled = false;
      resetButton.disabled = false;
      
      // Play celebration sound (optional)
      try {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => { /* Ignore audio errors */ });
      } catch (e) {
        // Audio not critical, continue
      }
      
      // Show confetti effect
      createConfetti();
    }
  }, 600);
});

// Reset button click handler
resetButton.addEventListener('click', function() {
  if (participants.length === 0 && !winnerDisplay.innerHTML.includes('Winner')) {
    showMessage('Nothing to reset!', 'info');
    return;
  }
  
  if (confirm('Are you sure you want to reset the raffle? This will clear all participants and the winner.')) {
    // Clear data
    participants = [];
    participantsList.innerHTML = '';
    winnerDisplay.innerHTML = '';
    winnerDisplay.classList.remove('winner-animation');
    
    // Update UI
    updateParticipantCount();
    updateDrawButton();
    
    // Clear localStorage
    localStorage.removeItem('cakeRaffleParticipants');
    
    // Show reset message
    showMessage('Raffle has been reset! Add new participants.', 'info');
    
    // Add empty state message
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'No participants yet. Add some names above!';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.color = '#999';
    emptyMessage.style.fontStyle = 'italic';
    emptyMessage.style.padding = '20px';
    participantsList.appendChild(emptyMessage);
    
    // Focus on input
    nameInput.focus();
  }
});

// Remove participant handler (event delegation)
participantsList.addEventListener('click', function(event) {
  if (event.target.classList.contains('remove-btn')) {
    const nameToRemove = event.target.dataset.name;
    const index = participants.indexOf(nameToRemove);
    
    if (index > -1) {
      // Remove from array
      participants.splice(index, 1);
      
      // Remove from DOM
      event.target.closest('.participant-item').remove();
      
      // Update UI
      updateParticipantCount();
      updateDrawButton();
      saveParticipants();
      
      // Show message
      showMessage(`${nameToRemove} removed from raffle`, 'info');
      
      // If list is empty, add empty message
      if (participants.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No participants yet. Add some names above!';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#999';
        emptyMessage.style.fontStyle = 'italic';
        emptyMessage.style.padding = '20px';
        participantsList.appendChild(emptyMessage);
      }
    }
  }
});

// Helper function to show messages
function showMessage(message, type) {
  // Remove existing messages
  const existingMessage = document.querySelector('.status-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `status-message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    animation: slideInRight 0.3s ease;
  `;
  
  // Set colors based on type
  switch(type) {
    case 'error':
      messageDiv.style.background = 'linear-gradient(to right, #ff416c, #ff4b2b)';
      break;
    case 'success':
      messageDiv.style.background = 'linear-gradient(to right, #4CAF50, #2E7D32)';
      break;
    default:
      messageDiv.style.background = 'linear-gradient(to right, #007bff, #0056b3)';
  }
  
  // Add to page
  document.body.appendChild(messageDiv);
  
  // Remove after 3 seconds
  setTimeout(() => {
    messageDiv.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}

// Create confetti effect
function createConfetti() {
  const colors = ['#ff4081', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 2px;
      top: -20px;
      left: ${Math.random() * 100}vw;
      animation: confetti ${1 + Math.random() * 2}s linear forwards;
      z-index: 999;
    `;
    
    document.body.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => confetti.remove(), 3000);
  }
}

// Add CSS for confetti animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes confetti {
    to {
      transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', initApp);