import * as bootstrap from 'bootstrap';

function showMessage(text, type = 'info', messageId = 'message') {
  const messageDiv = document.getElementById(messageId);
  if (type === 'danger') {
    messageDiv.innerHTML = `<div
      class="p-4 mt-2.5 text-sm text-red-800 rounded-lg bg-red-100" role="alert">
      ${text}
    </div>`;
  } else if (type === 'info') {
    messageDiv.innerHTML = `<div
      class="p-4 mt-2.5 text-sm text-blue-800 rounded-lg bg-blue-100" role="alert">
      ${text}
    </div>`;
  } else if (type === 'success') {
    messageDiv.innerHTML = `<div
      class="p-4 mt-2.5 text-sm text-green-800 rounded-lg bg-green-100" role="alert">
      ${text}
    </div>`;
  } else if (type === 'warning') {
    messageDiv.innerHTML = `<div 
    class="p-4 mt-2.5 text-sm text-yellow-800 rounded-lg bg-yellow-100" role="alert">
  ${text}
</div>`;
  }
}



export {showMessage };
