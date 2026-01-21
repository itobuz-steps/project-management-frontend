import type { Project, Sprint } from '../interfaces/common';

export function removeElementChildren(element: HTMLElement) {
  element.innerHTML = '';
}

export function removeActive(element: HTMLElement) {
  const parent = element.parentElement;

  if (!parent) {
    return;
  }

  [...parent.children].forEach((child) => {
    child.classList.remove('active');
  });
  element.classList.toggle('active');
}

export function hideAll(element: HTMLElement) {
  const parent = element.parentElement;

  if (!parent) {
    return;
  }

  [...parent.children].forEach((child) => {
    child.classList.add('hidden');
  });
  element.classList.remove('hidden');
}

export function checkIfEmpty() {
  const tableBodyEl = document.querySelectorAll<HTMLTableSectionElement>(
    '.backlog table tbody'
  );
  tableBodyEl.forEach((tb) => {
    const sprintId = tb.dataset.id;
    const emptyMessageEl = document.querySelector(
      `.empty-message[data-id="${sprintId}"]`
    );

    if (!emptyMessageEl) {
      return;
    }

    if (tb.children.length > 0) {
      emptyMessageEl.classList.add('hidden');
      return;
    }

    emptyMessageEl.classList.remove('hidden');
  });
}

export function toggleHidden(element: HTMLElement) {
  element.classList.toggle('hidden');
}

export function dropdownEvent(sprint?: Sprint) {
  const nameKey = sprint?.key ?? 'backlog';

  const dropdownButton = document.getElementById(`dropdownButton-${nameKey}`);
  const dropdownMenu = document.querySelector<HTMLElement>(
    `.dropdown-menu-${nameKey}`
  );
  const emptyMessage = document.querySelector<HTMLElement>(
    `#${nameKey}-empty-message`
  );
  const dropdownIcon = document.querySelector<HTMLElement>(
    `.dropdown-icon-${nameKey}`
  );

  if (!dropdownButton || !dropdownMenu || !dropdownIcon) return;

  dropdownButton.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
  });

  dropdownButton.addEventListener('click', () => {
    if (dropdownIcon.classList.contains('rotate-270')) {
      dropdownIcon.classList.remove('rotate-270');
      checkIfEmpty();
    } else {
      dropdownIcon.classList.add('rotate-270');
      if (emptyMessage && !emptyMessage.classList.contains('hidden')) {
        toggleHidden(emptyMessage);
      }
    }
  });
}

export function ifSelectedProject() {
  if (localStorage.getItem('selectedProject')) {
    const el = document.getElementById('dashboardOptionsContainer');
    el?.classList.remove('hidden');
  }
}

export function setUpProjectName(project: Project) {
  const projectName = document.getElementById('projectName');
  projectName && (projectName.innerText = project.name);
}
