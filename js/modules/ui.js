import { storage, cfg } from "./common.js";
import { events } from "./events.js";
import { fn } from "./fn.js";
import { templates } from "./templates.js";

export const ui = {
    render: function () {
        this.renderCategories();
        this.renderCertificates();
        window.addEventListener("scroll", ui.drawPageLoader);
        window.addEventListener("scroll", fn.debounce(() => events.scroll(), 1600));
        window.addEventListener("scroll", ui.redrawScrollButton);

        const searchInput = document.querySelector('#global_search');
        searchInput.addEventListener("keyup", fn.debounce(() => ui.renderCertificates(), 1000));
    },
    renderCategories: () => {
        fn.ajax({
            url: cfg.remoteHost + "/tags",
            method: "GET",
            params: {},
            successCallback: resp => {
                const data = JSON.parse(resp);
                const categories = data._embedded.tags;
                ui.drawCategories(categories);
                ui.drawGlobalSearch(categories);
                storage.categories = categories;
                events.addCategoryListener();
                events.addDropdownListener();
            },
            errorCallback: resp => {
                alert('Something went wrong during fetching tags data');
            }
        });
    },
    renderCertificates: (page = 0) => {
        sessionStorage.setItem("page", page);
        const search = document.querySelector('#global_search').value;
        const category = document.querySelector('#category').value;

        fn.ajax({
            url: cfg.remoteHost + "/certificates",
            method: "GET",
            params: {
                sorts: '-createDate',
                page: page,
                search: search,
                tags: category
            },
            successCallback: resp => {
                const data = JSON.parse(resp);
                storage.totalPages = data.page.totalPages;
                ui.drawCertificates(page, data._embedded);
                document.querySelector('.page-loader').style.display = 'none';
            },
            errorCallback: resp => {
                alert('Something went wrong during fetching certificates data');
            }
        });
    },
    drawCertificates: (page, data) => {
        const itemArea = document.querySelector('.item-container');

        if(page == 0) {
            itemArea.innerHTML = "";
        }

        if(storage.totalPages == 0) {
            itemArea.innerHTML = templates.errorMessage("Nothing found for your query");
        } else if(page < storage.totalPages) {
            data.certificates.forEach(c => {
                const certificateBlock = templates.certificateBlock(c);
                itemArea.insertAdjacentHTML('beforeend', certificateBlock);
            });

            const itemBlock = itemArea.querySelectorAll('.new_item');
            itemBlock.forEach(el => {
                el.classList.remove("new_item");
            });

            let drawn = 0;
            let fadeInterval = setInterval(function() {
                if(drawn == itemBlock.length - 1) {
                    clearInterval(fadeInterval);
                }
                const el = itemBlock[drawn];
                fn.fadeIn(el, 15);
                drawn++;
            }, 250);

        } else {
            sessionStorage.setItem("page", storage.totalPages - 1);
        }
    },
    drawCategories: categories => {
        const categoriesArea = document.querySelector('.categories-wrap');

        categories.forEach(c => {
            const categoryBlock = templates.categoryBlock(c);
            categoriesArea.insertAdjacentHTML('beforeend', categoryBlock);

            let category = categoriesArea.lastChild;
            category.addEventListener("mouseenter", ev => events.categoryHover(ev.target, true));
            category.addEventListener("mouseleave", ev => events.categoryHover(ev.target, false));
        });

        const categoriesBlock = categoriesArea.querySelectorAll('.category');
        let drawn = 0;
        let fadeInterval = setInterval(function() {
            if(drawn == categoriesBlock.length - 1) {
                clearInterval(fadeInterval);
            }
            fn.fadeIn(categoriesBlock[drawn], 20);
            drawn++;
        }, 300);
    },
    drawGlobalSearch: categories => {
        const searchButton = document.querySelector('.search-dropdown');
        const searchButtonUl = searchButton.querySelector('ul');

        categories.forEach(c => {
            const searchCategoryLi = templates.searchCategoryLi(c);
            searchButtonUl.insertAdjacentHTML('beforeend', searchCategoryLi);
        });
        searchButton.addEventListener('mouseenter', ev => events.searchButtonHover(ev.target, true));
        searchButton.addEventListener('mouseleave', ev => events.searchButtonHover(ev.target, false));
    },
    drawPageLoader: () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const page = Number(sessionStorage.getItem("page"));

        if (scrollTop + clientHeight >= scrollHeight - 5 && (storage.totalPages == null || page < storage.totalPages - 1)) {
            document.querySelector('.page-loader').style.display = 'block';
        }
    },
    redrawScrollButton: () => {
        const button = document.querySelector('.top-button');
        if (document.documentElement.scrollTop > 0) {
            button.style.visibility = "visible";
            button.innerText = "arrow_upward";
            button.setAttribute( "onClick", "fn.toTop();" );
        } else {
            button.style.visibility = "visible";
            button.innerText = "arrow_downward";
            button.setAttribute( "onClick", "fn.restoreScroll();" );
        }
    }
}