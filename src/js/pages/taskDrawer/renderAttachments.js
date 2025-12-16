export function renderAttachments(task) {
  const attachmentsList = document.getElementById('attachmentsList');
  attachmentsList.innerHTML = '';

  if (!task.attachments || task.attachments.length === 0) {
    attachmentsList.innerHTML = `
      <p class="text-gray-400 text-sm">No attachments</p>
    `;
    return;
  }

  task.attachments.forEach((fileName) => {
    const fileUrl = `http://localhost:3001/uploads/attachments/${fileName}`;

    const attachmentItem = document.createElement('a');

    attachmentItem.href = fileUrl;
    attachmentItem.target = '_blank';
    attachmentItem.className =
      'flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-200 transition text-[#03045e] text-sm';

    attachmentItem.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-[#03045e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828a4 4 0 00-5.656-5.656L6.343 10.172a6 6 0 108.485 8.485L20 13" />
      </svg>
      <span class="truncate">${fileName}</span>
    `;

    attachmentsList.appendChild(attachmentItem);
  });
}
