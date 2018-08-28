(function () {
    'use strict';

    function getPages(id) {
        return $('.pages section').filter(`[data-book=${id}]`);
    }

    // function getNotebooks() {
    //     $.getJSON('http://localhost:8080/notebooks', function (data) {
    //         markupNotebooks(data.notebooks);
    //     }).fail(err => {
    //         console.log("uh oh!");
    //     });
    // }

    function markupNotebooks (data) {
        const notebookTitles = [];

        data.forEach(item => {
            console.log(item);
            const html = `<h3 class="expandable">
            <button class="notebooks" aria-expanded="false" id="notebook-1">
                ${item.title}
                </button>
            </h3>`;
            notebookTitles.push(html);
        });

        $('.collections').html(notebookTitles);
    }

    function toggleCollapseMenu() {
        $('.nav').on('click', '.expandable', function (e) {
            let target = $(this).next();
            const id = $(this).find('button').attr('id');
            // use expanded variable to set the state of the target
            const expanded = $(this).find('button').attr('aria-expanded') === 'true' || false;
            // getNotebooks();
            $(this).find('button').attr('aria-expanded', !expanded);
            if (id !== undefined) {
                target = getPages(id);
            }
            target.attr('hidden', expanded);
        });
    }

    function togglePagesMenu() {
        $('#js-view').on('click', function () {
            $('.pages-lg').toggleClass('toggledPages');
            $('form').toggleClass('toggledPages');
        });
    }

    // Remove new widths should user resize window while toggledPages is still on
    function clearResize() {
        $(window).resize(() => {
            if ($('form.toggledPages').length === 1) {
                $('.pages-lg').removeClass('toggledPages');
                $('form').removeClass('toggledPages');
            }
        });
    }

    function login() {
        $('#js-login').on('click', function (e) {
            e.preventDefault();
            $('main').attr('hidden', false);
            $('.landing-page').attr('hidden', true);
        });
    }

    function main() {
        toggleCollapseMenu();
        togglePagesMenu();
        clearResize();
        login();
    }

    $(main);
})();