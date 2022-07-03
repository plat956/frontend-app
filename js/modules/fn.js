export const fn = {
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
