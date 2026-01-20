type ToastType = 'success' | 'error' | 'info';

function showToast(
  message: string,
  type: ToastType = 'info',
  delay: number = 2000
): void {
  const container = document.getElementById('toast-container');

  if (!container) return;

  container.className =
    'absolute bottom-5 right-5 z-60 flex flex-col gap-3';

  const colorClasses: Record<ToastType, string> = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
  };

  const toast = document.createElement('div');

  toast.className = `
    toast-item
    ${colorClasses[type]}
    flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
    transform transition-all duration-300
    opacity-0 translate-y-4
  `;

  toast.innerHTML = `
    <span class="text-sm font-medium">${message}</span>
    <button
      class="ml-auto text-white/80 hover:text-white focus:outline-none text-xl leading-none"
      aria-label="Close"
    >
      &times;
    </button>
  `;

  const closeButton = toast.querySelector<HTMLButtonElement>('button');

  closeButton?.addEventListener('click', () => removeToast(toast));

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-4');
  });

  window.setTimeout(() => removeToast(toast), delay);
}

function removeToast(toast: HTMLElement): void {
  toast.remove();
}

export default showToast;
