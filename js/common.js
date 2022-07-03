const cfg = {
    remoteHost: "http://localhost:8080"
}

const storage = {
    categories: {},
    totalPages: null
}

const templates = {
    categoryBlock: c => {
        return `<div class="category">
                    <img src="data:image/png;base64,${c.image}" class="picture" alt="${c.name}" />
                    <div class="title">
                        <span>${c.name}</span>
                    </div>
                </div>`;
    },
    certificateBlock: c => {
        return `<div class="item new_item">
                    <div class="item-frame">
                        <img src="data:image/png;base64,${c.image}" class="picture">
                    </div>
                    <div class="footer">
                        <div class="descr">
                            <div>
                                <div class="item-name">${c.name}</div>
                                <div class="item-descr">${c.description}</div>
                            </div>
                            <div class="extra-info">
                                <div>
                                    <span class="material-icons fav">favorite_border</span>
                                </div>
                            </div>
                        </div>
                        <div class="price">
                            <div class="price-left">$${c.price}</div>
                            <div class="cart">
                                <button class="button small">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>`;
    },
    searchCategoryLi: c => {
        const cl = c.default !== undefined ? ' data-type="default"' : '';
        return `<li${cl}>${c.name}</li>`;
    },
    errorMessage: msg => {
        return `<div class="error-msg">${msg}</div>`;
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

const fn = {
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
    toTop: function () {
        sessionStorage.scrollTop = document.documentElement.scrollTop;
        window.scrollTo({top: 0, behavior: 'smooth'});
    },
    restoreScroll: function () {
        window.scrollTo({top: sessionStorage.scrollTop, behavior: 'smooth'});
    },
    formatParams: params => {
        return "?" + Object
            .keys(params)
            .map(function(key){
                return key+"="+encodeURIComponent(params[key])
            })
            .join("&")
    },
    ajax: function (data) {
        const request = new XMLHttpRequest();
        request.open(data.method, data.url + this.formatParams(data.params));

        request.addEventListener("readystatechange", () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    data.successCallback(request.response);
                } else {
                    data.errorCallback(request.response);
                }
            }
        });
        request.send();
    },
    debounce: function (func, timeout = 300){
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }
}

const ui = {
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
