import projectService from '../../services/ProjectService';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/', {
  auth: { token: localStorage.getItem('access_token') },
});

socket.on('connect', () =>
  loadProjectMembers(localStorage.getItem('selectedProject'))
);

socket.on('userStatusChanged', () => {
  console.log('');
  loadProjectMembers(localStorage.getItem('selectedProject'));
});

export async function loadProjectMembers(projectId) {
  try {
    if (!projectId) return;

    const data = await projectService.getProjectMembers(projectId);
    const members = data.result;

    console.log(members);

    const container = document.getElementById('memberAvatars');
    container.innerHTML = '';

    members.forEach((userInfo, index) => {
      const img = document.createElement('img');
      const imageUrl = userInfo.profileImage
        ? `http://localhost:3001/uploads/profile/${userInfo.profileImage}`
        : `../../../assets/img/profile.png`;

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
