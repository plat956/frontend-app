import { storage } from "./common.js";
import { templates } from "./templates.js";
import { ui } from "./ui.js";

export const events = {
    categoryHover: (el, type) => {
        const title = el.querySelector('.title');
        title.classList.remove("fade" + (type ? "Out" : "In"));
        title.classList.add("fade" + (type ? "In" : "Out"));
    },
    searchButtonHover: (el, type) => {
        const searchDropdown = document.querySelector('.category-drop');
        searchDropdown.classList.remove("fade" + (type ? "OutFast" : "InFast"));
        searchDropdown.classList.add("fade" + (type ? "InFast" : "OutFast"));

        const expandButton = document.querySelector('.expand-search');
        expandButton.style.transform = type ? "rotate(180deg)" : "rotate(0deg)";

        const searchInput = document.querySelector('input[name=t_search]');
        setTimeout(() => {
            if(type) {
                searchInput.focus();
            } else {
                searchInput.blur();
            }
        }, 50);
    },
    searchCategoriesKeyUp: (ev, text) => {
        const searchButtonUl = document.querySelector('.search-dropdown ul');

        let newData = storage.categories.filter(function (el) {
            return el.name.toLocaleLowerCase().includes(text.toLowerCase());
        });

        searchButtonUl.innerHTML = "";
        if(newData.length == 0) {
            newData.push({ name: "Nothing found", default: true });
        }
        newData.forEach(c => {
            const searchCategoryLi = templates.searchCategoryLi(c);
            searchButtonUl.insertAdjacentHTML('beforeend', searchCategoryLi);
        });

        events.addDropdownListener();
    },
    scroll: () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

        if (scrollTop + clientHeight >= scrollHeight - 5) {
            const page = Number(sessionStorage.getItem("page")) + 1;
            ui.renderCertificates(page);
        }
    },
    chooseCategory: name => {
        const categoryInput = document.querySelector('#category');
        categoryInput.value = name;
        ui.renderCertificates();
    },
    addDropdownListener: () => {
        const dropdown = document.querySelectorAll('#category-dropdown li:not([data-type*=default])');
        const button = document.querySelector('#selected-category');
        const searchDropdown = document.querySelector('.category-drop');
        const searchButton = document.querySelector('.search-dropdown');
        dropdown.forEach(c => {
            c.addEventListener("click", (ev) => {
                const name = ev.target.innerText;
                events.chooseCategory(name);
                button.innerText = name;
                searchDropdown.classList.remove("fadeInFast");
                searchDropdown.style.visibility = "hidden";
                searchButton.dispatchEvent(new Event('mouseleave'));
            });
        });
    },
    addCategoryListener: () => {
        const rendered = document.querySelectorAll('.category');
        const button = document.querySelector('#selected-category');
        rendered.forEach(c => {
            c.addEventListener("click", (ev) => {
                const name = ev.target.innerText;
                events.chooseCategory(name);
                button.innerText = name;
            });
        });
    }
}