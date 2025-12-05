import axios from 'axios';

const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const messageEl = document.getElementById('message');

async function joinInvite() {
  if (!token) {
    messageEl.textContent = 'No invite token found.';
    return;
  }

  const authToken = localStorage.getItem('accessToken');

  if (!authToken) {
    window.location.href = `./pages/login.html?redirectTo=${encodeURIComponent(
      window.location.href
    )}`;
    return;
  }

  try {
    const response = await axios.get('http://localhost:3001/invite/join', {
      params: { token },
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = response.data;
    if (data.success) {
      messageEl.textContent = data.message;

      setTimeout(() => {
        window.location.href = '../pages/dashboard.html';
      }, 2000);
    } else {
      messageEl.textContent = data.message;
    }
  } catch (error) {
    console.error(error);
    if (error.response?.data?.message) {
      messageEl.textContent = error.response.data.message;
    } else {
      messageEl.textContent = 'Something went wrong.';
    }
  }
}

joinInvite();
