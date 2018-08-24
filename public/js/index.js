(function () {
    'use strict';

    function toggleCollapseMenu () {
        $('.nav').on('click', '.expandable', function (e) {
            const target = $(this).next();
            // use expanded variable to set the state of the target
            const expanded = $(this).find('button').attr('aria-expanded') === 'true' || false;
            $(this).find('button').attr('aria-expanded', !expanded);
            target.attr('hidden', expanded);
        });
    }
    
    function main () {
        toggleCollapseMenu();
    }
    
    $(main);
})();