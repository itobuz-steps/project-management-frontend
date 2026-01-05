import axios from 'axios';
import { svgObject } from './svgObjects';
import showToast from './showToast';
import { updateProjectList } from '../pages/dashboard/sidebar/sidebar';

export function getColorByType(task) {
  if (task.type === 'task') {
    return 'bg-blue-600';
  } else if (task.type === 'story') {
    return 'bg-green-600';
  } else {
    return 'bg-red-600';
  }
}

export function getColorByPriority(task) {
  if (task.priority === 'low') {
    return 'bg-green-500';
  } else if (task.priority === 'medium') {
    return 'bg-primary-400';
  } else if (task.priority === 'high') {
    return 'bg-yellow-400';
  } else {
    return 'bg-red-400';
  }
}

export function getSvgByType(task) {
  if (task.type === 'task') {
    return `${svgObject.task}`;
  } else if (task.type === 'story') {
    return `${svgObject.story}`;
  } else {
    return `${svgObject.bug}`;
  }
}

export function getSvgByPriority(task) {
  if (task.priority === 'low') {
    return `${svgObject.low}`;
  } else if (task.priority === 'medium') {
    return `${svgObject.medium}`;
  } else if (task.priority === 'high') {
    return `${svgObject.high}`;
  } else {
    return `${svgObject.critical}`;
  }
}

export async function checkForInvite() {
  const inviteToken = localStorage.getItem('inviteToken');
  const authToken = localStorage.getItem('access_token');
  if (inviteToken) {
    try {
      await axios.get('http://localhost:3001/invite/join', {
        params: { token: inviteToken },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      showToast('User Joined The Project Successfully', 'success');
      updateProjectList();
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('inviteToken');
    }
  }
}

export function keyboardEvents() {
  let keyArray = [];
  const searchBar = document.getElementById('search-input-field');
  document.addEventListener('keydown', (e) => {
    keyArray.push(e.key);

    if (
      keyArray.length === 2 &&
      keyArray[0] === 'Meta' &&
      keyArray[1] === 'k'
    ) {
      searchBar.focus();
    }
  });

  document.addEventListener('keyup', () => {
    keyArray = [];
  });
}
