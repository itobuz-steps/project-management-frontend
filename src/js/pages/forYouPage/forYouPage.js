import projectService from '../../services/ProjectService';
import renderSelectedTab from '../../utils/renderSelectedTab';

function toggleForYouPage() {
  const forYouPage = document.getElementById('forYouPage');
  const mainPage = document.getElementById('main-section');
  mainPage.classList.toggle('hidden');
  forYouPage.classList.toggle('hidden');
}

export async function handleForYouPage() {
  const forYouButton = document.getElementById('forYouButton');
  const projectsContainer = document.getElementById('forYouProjectsContainer');
  const backToHomeBtn = document.getElementById('forYouGoBackBtn');
  forYouButton.addEventListener('click', toggleForYouPage);

  const projects = await projectService.getAllProjects();

  projects.forEach((project) => {
    const projectCard = createProjectCard(project);
    projectsContainer.appendChild(projectCard);
  });

  backToHomeBtn.addEventListener('click', async () => {
    await renderSelectedTab(localStorage.getItem('selectedProject'));
    toggleForYouPage();
  });
}

function createProjectCard(project) {
  const projectDiv = document.createElement('div');
  projectDiv.dataset.id = project._id;
  projectDiv.className =
    'flex flex-col gap-2 justify-between border-s-2 border-s-primary-500 rounded-md bg-white w-60 p-2 cursor-pointer';
  projectDiv.innerHTML = /* html */ `
    <p class="text-lg font-semibold">${project.name}</p>

    <div class="flex flex-col gap-2">
    <div class="flex justify-between">
    <p>Project Type</p>
    <p>${project.projectType}</p>
    </div>

    <div class="flex justify-between">
    <p>Members Assigned</p>
    <p>${project.members.length}</p>
    </div>
    <div>

  `;

  projectDiv.addEventListener('click', async () => {
    await renderSelectedTab(project._id);
    toggleForYouPage();
  });

  return projectDiv;
}
