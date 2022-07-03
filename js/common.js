const cfg = {
    remoteHost: "http://localhost:8080"
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
        return `<div class="item">
                <img src="data:image/png;base64,${c.image}" class="picture">
                <div class="footer">
                    <div class="descr">
                        <div>
                            <div class="item-name">${c.name}</div>
                            <div class="item-descr">${c.description}</div>
                        </div>
                        <div class="extra-info">
                            <div>
                                <span class="material-icons fav">favorite</span>
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
        return `<li>${c.name}</li>`;
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
        let newData = store.categories.filter(function (el) {
            return el.name.toLocaleLowerCase().includes(text.toLowerCase());
        });
        const searchButtonUl = document.querySelector('.search-dropdown ul');
        searchButtonUl.innerHTML = "";
        if(newData.length == 0) {
            newData.push({ name: "Ничего не найдено" });
        }
        newData.forEach(c => {
            const searchCategoryLi = templates.searchCategoryLi(c);
            searchButtonUl.insertAdjacentHTML('beforeend', searchCategoryLi);
        });
    },
    scroll: (ev) => {
        const {
            scrollTop,
            scrollHeight,
            clientHeight
        } = document.documentElement;

        ui.redrawScrollButton(scrollTop);

        if(sessionStorage.preventScrollPosCounter === 'false') {
            sessionStorage.scrollTop = scrollTop;
        }

        if(scrollTop == 0) {
            sessionStorage.preventScrollPosCounter = false;
        }

        if (scrollTop + clientHeight >= scrollHeight - 5) {
            const page = Number(sessionStorage.getItem("page")) + 1;
            ui.renderCertificates(page);
        }
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
        sessionStorage.preventScrollPosCounter = true;
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
    }
}

const ui = {
    render: function () {
        this.renderCategories();
        this.renderCertificates();
        window.addEventListener('scroll', ev => events.scroll(ev));
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
            },
            errorCallback: resp => {
                alert('Something went wrong during fetching tags data');
            }
        });
    },
    renderCertificates: (page = 0) => {
        sessionStorage.setItem("page", page);

        fn.ajax({
            url: cfg.remoteHost + "/certificates",
            method: "GET",
            params: {
                sorts: '-createDate',
                page: page
            },
            successCallback: resp => {
                const data = JSON.parse(resp);
                ui.drawCertificates(page, data.page.totalPages, data._embedded);
            },
            errorCallback: resp => {
                alert('Something went wrong during fetching certificates data');
            }
        });
    },
    drawCertificates: (page, totalPages, data) => {
        const itemArea = document.querySelector('.item-container');

        if(page < totalPages) {
            data.certificates.forEach(c => {
                const certificateBlock = templates.certificateBlock(c);
                itemArea.insertAdjacentHTML('beforeend', certificateBlock);
            });
        } else {
            sessionStorage.setItem("page", totalPages - 1);
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
    redrawScrollButton: (scrollTop) => {
        const button = document.querySelector('.top-button');
        if (scrollTop > 0) {
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
