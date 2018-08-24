(function () {
    'use strict';

    function getPages (id) {
        return $('.pages section').filter(`[data-book=${id}]`);
    }

    function toggleCollapseMenu () {
        $('.nav').on('click', '.expandable', function (e) {
            let target = $(this).next();
            const id = $(this).find('button').attr('id');
            // use expanded variable to set the state of the target
            const expanded = $(this).find('button').attr('aria-expanded') === 'true' || false;
            $(this).find('button').attr('aria-expanded', !expanded);
            if (id !== undefined) {
                target = getPages(id);
            }
            target.attr('hidden', expanded);
        });
    }

    function main () {
        toggleCollapseMenu();
    }
    
    $(main);
})();