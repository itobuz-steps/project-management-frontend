import projectService from '../../services/ProjectService';
import { io, Socket } from 'socket.io-client';
import { config } from '../../config/config';

const socket: Socket = io(`${config.API_BASE_URL}/`, {
  auth: {
    token: localStorage.getItem('access_token') ?? undefined,
  },
});

socket.on('connect', () => {
  const projectId = localStorage.getItem('selectedProject');
  if (projectId) {
    loadProjectMembers(projectId);
  }
});

socket.on('userStatusChanged', () => {
  const projectId = localStorage.getItem('selectedProject');
  if (projectId) {
    loadProjectMembers(projectId);
  }
});

export async function loadProjectMembers(projectId: string): Promise<void> {
  try {
    const data = await projectService.getProjectMembers(projectId);

    const members = data.result;

    const container = document.getElementById('memberAvatars');
    if (!container) return;

    container.innerHTML = '';

    members.forEach((userInfo, index) => {
      const img = document.createElement('img');

      const imageUrl = userInfo.profileImage
        ? `${config.API_BASE_URL}/uploads/profile/${userInfo.profileImage}`
        : '../../../assets/img/profile.png';

      img.src = imageUrl;
      img.alt = userInfo.name;
      img.title = userInfo.name;

      img.className =
        'sm:min-w-10 sm:min-h-10 sm:max-w-10 sm:max-h-10 min-w-7 max-w-7 min-h-7 max-w-7 rounded-full object-cover border-2 border-white shadow-md hover:z-1 aspect-square';

      img.style.marginLeft = index === 0 ? '0px' : '-10px';

      if (userInfo.onlineStatus === 'online') {
        img.classList.add('border-green-400');
        img.classList.remove('border-white');
      }

      container.appendChild(img);
    });
  } catch (error) {
    console.error('Error loading images:', error);
  }
}
