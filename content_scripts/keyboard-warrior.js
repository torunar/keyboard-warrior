((document, window) => {
    const navigationHelperClass = '__kw-nav-helper __kw-nav-helper--unboxed',
        navigationHelperSelector = '.__kw-nav-helper',
        interactiveElementsSelector = 'a,button',
        bindingKeys = [
            ['1', 'digit1'],
            ['2', 'digit2'],
            ['3', 'digit3'],
            ['4', 'digit4'],
            ['5', 'digit5'],
            ['6', 'digit6'],
            ['7', 'digit7'],
            ['8', 'digit8'],
            ['9', 'digit9'],
            ['0', 'digit0'],
            ['q', 'keyq'],
            ['w', 'keyw'],
            ['e', 'keye'],
            ['r', 'keyr'],
            ['t', 'keyt'],
            ['y', 'keyy'],
            ['u', 'keyu'],
            ['i', 'keyi'],
            ['p', 'keyp'],
            ['a', 'keya'],
            ['s', 'keys'],
            ['d', 'keyd'],
            ['f', 'keyf'],
            ['g', 'keyg'],
            ['h', 'keyh'],
            ['j', 'keyj'],
            ['k', 'keyk'],
            ['l', 'keyl'],
            ['z', 'keyz'],
            ['x', 'keyx'],
            ['c', 'keyc'],
            ['v', 'keyv'],
            ['b', 'keyb'],
            ['n', 'keyn'],
            ['m', 'keym'],
            ['-', 'minus'],
            ['=', 'equal'],
            ['[', 'bracketleft'],
            [']', 'bracketright'],
        ].values();
    let bindElements = {};

    /**
     * Gets all interactive elements that can be focused.
     *
     * @param {Element} container
     * @returns {NodeList}
     */
    const getInteractiveElements = (container) => {
        return container.querySelectorAll(interactiveElementsSelector);
    };

    /**
     *
     * @param {DOMRect} element
     * @param {DOMRect} area
     * @returns {boolean|boolean}
     */
    const isOverlappingArea = (element, area) => {
        const isOverlappingVertically = element.top >= 0 && element.top <= area.height
            || element.bottom > 0 && element.bottom <= area.height
            || element.top < 0 && element.bottom > area.height;

        const isOverlappingHorizontally = element.left >= 0 && element.left <= area.width
            || element.right > 0 && element.right <= area.width
            || element.left < 0 && element.right > area.width;

        return isOverlappingVertically && isOverlappingHorizontally;
    };

    /**
     * Checks if the element or any of its parents are not hidden or collapsed.
     *
     * @param {Element} element
     */
    const isElementDisplayed = (element) => {
        const computedStyle = window.getComputedStyle(element);

        if (computedStyle.display === 'none'
            || parseInt(computedStyle.height) === 0 && (computedStyle.overflow === 'hidden' || computedStyle.overflowY === 'hidden')
            || parseInt(computedStyle.width) === 0 && (computedStyle.overflow === 'hidden' || computedStyle.overflowX === 'hidden')
            || element.tagName.toLowerCase() === 'details' && !element.open
        ) {
            return false;
        }

        if (element.parentElement) {
            return isElementDisplayed(element.parentElement);
        }

        return true;
    };

    /**
     * Creates unqiue set of elements.
     * This method is used to create helpers only for unqiue interactive elements and skip elements that duplicate them.
     *
     * @param {Object} carry
     * @param {Element} element
     * @returns {Object}
     */
    const getUniqueElements = (carry, element) => {
        let uniqueKey = element.outerHTML;
        if (element.href
            && element.href !== '#'
            && !element.href.startsWith('javascript:')
        ) {
            uniqueKey = element.href;
        }

        if (!carry[uniqueKey]) {
            carry[uniqueKey] = element;
        }

        return carry;
    };

    /**
     * Gets element visibility properties.
     *
     * @param {Element} element
     * @param {DOMRect} area
     * @returns {{element: Element, isVisible: boolean}}
     */
    const getElementVisibility = (element, area) => {
        const boundingRect = element.getBoundingClientRect(),
            isVisible = isOverlappingArea(boundingRect, area);

        return {element, isVisible};
    };

    /**
     * Gets element that will get navigation helpers.
     *
     * @param {NodeList} elements
     * @param {DOMRect} area
     * @returns {Array.<{element: Element, isVisible: boolean}>}
     */
    const getBindableElements = (elements, area) => {
        const uniqueDisplayedElements = [...elements]
            .filter(isElementDisplayed)
            .reduce(getUniqueElements, {});

        return Object.values(uniqueDisplayedElements).map((element) => getElementVisibility(element, area));
    };

    /**
     * Resets navigation helpers.
     *
     * @param {ParentNode} container
     */
    const reset = (container) => {
        container.querySelectorAll(navigationHelperSelector).forEach((element) => {
            element.remove();
        });

        bindElements = {};
    };

    /**
     * Creates navigation helper.
     *
     * @param {Element} element
     * @param {string} key
     */
    const createNavigationHelper = (element, key) => {
        const helper = document.createElement('b');
        helper.setAttribute('data-key', key);
        helper.setAttribute('class', navigationHelperClass);

        const boundingRect = element.getBoundingClientRect(),
            top = Math.max(0, boundingRect.top),
            left = Math.max(0, boundingRect.left),
            width = boundingRect.right - left,
            height = boundingRect.bottom - top;

        helper.setAttribute('style', `top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px;`);

        document.body.appendChild(helper);
    };

    /**
     * @param {KeyboardEvent} event
     */
    const handleElementActivation = (event) => {
        const activatedElement = bindElements[event.code.toLowerCase()];
        if (activatedElement) {
            activatedElement.focus();
            activatedElement.click();
        }
        reset(document);
    };

    const handleReset = () => {
        reset(document);
    };

    const bindEvents = () => {
        window.addEventListener(
            'scroll',
            handleReset,
            {once: true}
        );

        window.addEventListener(
            'resize',
            handleReset,
            {once: true}
        );

        window.addEventListener(
            'click',
            handleReset,
            {once: true}
        );

        document.removeEventListener(
            'keypress',
            handleElementActivation
        );

        document.addEventListener(
            'keypress',
            handleElementActivation,
            {once: true}
        );
    };

    const init = () => {
        const bindableElements = getBindableElements(
            getInteractiveElements(document),
            new DOMRect(0, 0, window.innerWidth, window.innerHeight)
        );

        bindableElements.map((item) => {
            if (!item.isVisible) {
                return;
            }

            const [key, code] = bindingKeys.next().value;
            if (!key) {
                console.log('We are out of minerals, milord!');
                return;
            }

            createNavigationHelper(item.element, key);

            bindElements[code] = item.element;
        });
    };

    reset(document);
    bindEvents();
    init();
})(document, window);