let categoriesData = [
    {
        title: "Category 1ddddddddddddddddddddddd",
        image: "cake.jpg"
    },
    {
        title: "Category 2",
        image: "cake.jpg"
    },
    {
        title: "Category 3",
        image: "cake.jpg"
    },
    {
        title: "Category 4",
        image: "cake.jpg"
    }
];

const templates = {
    categoryBlock: c => {
        return `<div class="category">
                    <img src="images/category/${c.image}" class="picture" alt="${c.title}" />
                    <div class="title">
                        <span>${c.title}</span>
                    </div>
                </div>`;
    },
    searchCategoryLi: c => {
        return `<li>${c.title}</li>`;
    }
}

const events = {
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
    }
}

const functions = {
    fadeIn: (el, ms) => {
        let opacity = 0.01;
        let timer = setInterval(function() {
            if(opacity >= 1) {
                clearInterval(timer);
            }
            el.style.opacity = opacity;
            opacity += opacity * 0.15;
        }, ms);
    },
    fadeOut: (el, ms) => {
        let opacity = 1;
        let timer = setInterval(function() {
            if(opacity <= 0.1) {
                clearInterval(timer);
            }
            el.style.opacity = opacity;
            opacity -= opacity * 0.15;
        }, ms);
    },
    toTop: function () {
        window.scrollTo({top: 0, behavior: 'smooth'});
    },
    scrollFn: () => {
        console.log(document.documentElement.scrollTop);
        const button = document.querySelector('.top-button');
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            button.style.visibility = "visible";
        } else {
            button.style.visibility = "hidden";
        }
    }
}

const ui = {
    render: function () {
        window.onscroll = functions.scrollFn;
        this.renderCategories();
        this.renderGlobalSearchDropdown();
    },
    renderCategories: () => {
        const categoriesArea = document.querySelector('.categories-wrap');

        categoriesData.forEach(c => {
            const categoryBlock = templates.categoryBlock(c);
            categoriesArea.insertAdjacentHTML('beforeend', categoryBlock);

            let category = categoriesArea.lastChild;
            category.addEventListener("mouseenter", ev => events.categoryHover(ev.target, true));
            category.addEventListener("mouseleave", ev => events.categoryHover(ev.target, false));
        });

        const categories = categoriesArea.querySelectorAll('.category');

        let drawn = 0;
        let fadeInterval = setInterval(function() {
            if(drawn == categories.length - 1) {
                clearInterval(fadeInterval);
            }
            functions.fadeIn(categories[drawn], 20);
            drawn++;
        }, 300);
    },
    renderGlobalSearchDropdown: () => {
        const searchButton = document.querySelector('.search-dropdown');
        const searchButtonUl = searchButton.querySelector('ul');
        categoriesData.forEach(c => {
            const searchCategoryLi = templates.searchCategoryLi(c);
            searchButtonUl.insertAdjacentHTML('beforeend', searchCategoryLi);
        });
        searchButton.addEventListener('mouseenter', ev => events.searchButtonHover(ev.target, true));
        searchButton.addEventListener('mouseleave', ev => events.searchButtonHover(ev.target, false));
    }
}
