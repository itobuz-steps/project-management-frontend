import '../../../scss/main.css';

const toggleBtn = document.querySelector(".toggle-sidebar-btn");
    const sidebar = document.querySelector("#sidebar");
      const main = document.querySelector(".main");


      toggleBtn?.addEventListener("click", () => {
        sidebar.classList.toggle("-translate-x-full");
        sidebar.classList.toggle("translate-x-0");
      });


      document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !toggleBtn?.contains(e.target)) {
          sidebar.classList.add("-translate-x-full");
          sidebar.classList.remove("translate-x-0");
          main.classList.remove("ml-64");
        }
      });


      const projectsMenu = document.getElementById("projectsMenu");
      const dropdown = document.getElementById("projectsDropdown");


      dropdown.classList.add("transition-all", "duration-300", "overflow-hidden", "max-h-0");


      projectsMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();

        const isOpen = dropdown.classList.contains("max-h-[500px]");

        if (isOpen) {
          
          dropdown.classList.add("max-h-0");
          dropdown.classList.remove("max-h-[500px]");
          dropdown.classList.add("hidden"); 
        } else {
          
          dropdown.classList.remove("hidden"); 
          setTimeout(() => { 
            dropdown.classList.remove("max-h-0");
            dropdown.classList.add("max-h-[500px]");
          }, 10);
        }
      });
      document.addEventListener("click", (e) => {
        if (!projectsMenu.contains(e.target)) {
          dropdown.classList.remove("max-h-[500px]");
          dropdown.classList.add("max-h-0");
          dropdown.classList.add("hidden");
        }
      });

