export const templates = {
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

