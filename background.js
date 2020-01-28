const showNavigationHelpersCommand = 'keyboard-warrior-show-navigation-helpers';

const showNavigationHelpers = () => {
    browser.tabs.insertCSS({
        file: '/keyboard-warrior.css'
    });
    browser.tabs.executeScript({
        file: '/content_scripts/keyboard-warrior.js'
    });
};

browser.browserAction.onClicked.addListener(showNavigationHelpers);

browser.commands.onCommand.addListener((command) => {
    if (command !== showNavigationHelpersCommand) {
        return;
    }

    showNavigationHelpers();
});