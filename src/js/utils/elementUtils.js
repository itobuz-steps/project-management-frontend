export function removeElementChildren(element) {
  element.innerHTML = '';
}

export function removeActive(element) {
  [...element.parentElement.children].forEach((child) => {
    child.classList.remove('active');
  });
  element.classList.toggle('active');
}

export function hideAll(element) {
  [...element.parentElement.children].forEach((child) => {
    child.classList.add('hidden');
  });
  element.classList.remove('hidden');
}

export function checkIfEmpty() {
  const tableBodyEl = document.querySelectorAll('.backlog table tbody');
  tableBodyEl.forEach((tb) => {
    const sprintId = tb.dataset.id;
    const emptyMessageEl = document.querySelector(
      `.empty-message[data-id="${sprintId}"]`
    );

    if (tb.children.length > 0) {
      emptyMessageEl.classList.add('hidden');
      return;
    }

    emptyMessageEl.classList.remove('hidden');
  });
}

export function toggleHidden(element) {
  element.classList.toggle('hidden');
}

export function dropdownEvent(sprint = {}) {
  const nameKey = sprint.key ? sprint.key : `backlog`;
  const dropdownButton = document.getElementById(`dropdownButton-${nameKey}`);
  const dropdownMenu = document.querySelector(`.dropdown-menu-${nameKey}`);
  const emptyMessage = document.querySelector(`#${nameKey}-empty-message`);

  dropdownButton.addEventListener('click', function () {
    dropdownMenu.classList.toggle('hidden');
  });

  const dropdownIcon = document.querySelector(`.dropdown-icon-${nameKey}`);
  dropdownButton.addEventListener('click', function () {
    if (dropdownIcon.classList.contains('rotate-270')) {
      dropdownIcon.classList.remove('rotate-270');
      checkIfEmpty();
    } else {
      dropdownIcon.classList.add('rotate-270');
      if (!emptyMessage.classList.contains('hidden')) {
        toggleHidden(emptyMessage);
      }
    }
  });
}

export function ifSelectedProject() {
  if (localStorage.getItem('selectedProject')) {
    document
      .getElementById('dashboardOptionsContainer')
      .classList.remove('hidden');
  }
}

export function setUpProjectName(project) {
  const projectName = document.getElementById('projectName');
  projectName.innerText = project.name;
}
