const confirmationModal = document.getElementById(
  'confirmationModal'
) as HTMLElement | null;
const cancelConfirmBtn = document.getElementById(
  'cancelConfirm'
) as HTMLButtonElement | null;
const confirmBtn = document.getElementById(
  'confirm'
) as HTMLButtonElement | null;
const confirmMessage = document.getElementById(
  'confirmModalMessage'
) as HTMLElement | null;

let confirmCallback: (() => void | Promise<void>) | null = null;

export function showConfirmModal(
  message: string,
  callback: () => void | Promise<void>
): void {
  if (!confirmationModal || !confirmMessage) return;

  confirmMessage.textContent = message;
  confirmCallback = callback;

  confirmationModal.classList.remove('hidden');
}

cancelConfirmBtn?.addEventListener('click', () => {
  if (!confirmationModal) return;

  confirmationModal.classList.add('hidden');
  confirmCallback = null;
});

confirmBtn?.addEventListener('click', async () => {
  if (!confirmationModal) return;

  confirmationModal.classList.add('hidden');

  if (confirmCallback) {
    await confirmCallback();
  }

  confirmCallback = null;
});
