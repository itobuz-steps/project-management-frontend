import projectService from '../../services/ProjectService.js';

export async function handleFormSubmission(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const projectType = document.getElementById('projectType').value;
  const columnInput = document.getElementById('columns').value;

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
  } catch (error) {
    console.error(error.message);
  }
}
