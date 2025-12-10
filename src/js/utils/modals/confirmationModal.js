const drawerBackdrop = document.querySelector('.drawer-backdrop');
const confirmationModal = document.getElementById('confirmationModal');
const cancelConfirmBtn = document.getElementById('cancelConfirm');
const confirmBtn = document.getElementById('confirm');
const confirmMessage = document.getElementById('confirmModalMessage');

let confirmCallback = null;

export function showConfirmModal(message, callback) {
  confirmMessage.textContent = message;
  confirmCallback = callback;

  confirmationModal.classList.remove('hidden');
  drawerBackdrop.classList.remove('hidden');
}

cancelConfirmBtn.addEventListener('click', () => {
  confirmationModal.classList.add('hidden');
  drawerBackdrop.classList.add('hidden');

  confirmCallback = null;
});

confirmBtn.addEventListener('click', async () => {
  if (confirmCallback) {
    await confirmCallback();
  }

  confirmationModal.classList.add('hidden');
  drawerBackdrop.classList.add('hidden');

  confirmCallback = null;
});
