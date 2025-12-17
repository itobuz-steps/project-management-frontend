import projectService from '../../services/ProjectService';

export async function loadProjectMembers(projectId) {
  try {
    const data = await projectService.getProjectMembers(projectId);
    const members = data.result;

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
        'w-7 h-7 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-md hover:z-1 aspect-square';

      img.style.marginLeft = index === 0 ? '0px' : '-10px';

      container.appendChild(img);
    });
  } catch (error) {
    console.error('Error loading images:', error);
  }
}
