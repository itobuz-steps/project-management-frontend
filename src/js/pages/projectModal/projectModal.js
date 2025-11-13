import '../../../scss/main.css';
import projectService from '../../services/ProjectService.js';

const toggleButton = document.getElementById('toggleButton');
const closeButton = document.getElementById('CloseButton');
const modal = document.getElementById('project-modal');
const form = document.querySelector('form');

toggleButton.addEventListener('click', () => {
  modal.classList.toggle('hidden');
});
closeButton.addEventListener('click', () => {
  modal.classList.toggle('hidden');
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const projectType = document.getElementById('projectType').value;
  const columnInput = document.getElementById('columns').value.trim();

  let columns = [];
  if (columnInput) {
    columns = columnInput
      .split(',')
      .map((col) => col.trim())
      .filter((col) => col.length > 0);
  }

  const projectData = {
    name,
    projectType,
    columns,
  };

  try {
    const createdProject = await projectService.createProject(projectData);
    console.log(createdProject);

    // form.reset();
    // modal.classList.add('hidden');
  } catch (error) {
    console.error(error.message);
  }
});
