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

    function toggleForms () {
        $('.js-change-form').on('click', function (e) {
            const current = $(this).closest('section');
            const target = $('body').find('.landing-page:hidden');
            target.attr('hidden', false);
            current.attr('hidden', true);
        });
    }

    function revealProgress () {
        $('#js-progress').on('click', function (e) {
            e.preventDefault();
            $('.my-progress').attr('hidden', false);
            hideProgress();
        });
    }

    function hideProgress () {
        $('#js-close-progress').on('click', function (e) {
            e.preventDefault();
            $('.my-progress').attr('hidden', true);
        });
    }

    function login() {
        $('#js-login').on('click', function (e) {
            e.preventDefault();

            const userObject = {
                username: $("#email").val(),
                password: $("#password").val()
            };

            if (userObject.username == "") {
                alert('Email username is required.');
            } else if (userObject.password == "") {
                alert('Password is required.');
            } else {
                $.ajax('/users/login', {
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(userObject),
                    dataType: 'json'
                })
                    .done(function (data) {
                        console.log(data);
                        showDashboard();
                        // get name from server and display with greeting!
                    })
                    .fail(function (error) {
                        const html = `<p class="row error">${error.responseText}</p>`;
                        $(html).insertBefore('.landing-page');
                    });
            }
        });
    }

    function register () {
        $('#js-register').on('click', function (e) {
            e.preventDefault();

            const userObject = {
                name: $("#name").val(),
                username: $("#reg-username").val(),
                password: $("#reg-pw").val()
            };

            // refactor!
            if (userObject.name == "") {
                alert('Name is required.');
            } else if (userObject.username == "") {
                alert('Email username is required.');
            } else if (userObject.password == "") {
                alert('Password is required.');
            } else {
                $.ajax('/users/register', {
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(userObject),
                    dataType: 'json'
                })
                    .done(function (data) {
                        console.log(data);
                        showDashboard();
                        // get name from server and display with greeting!
                    })
                    .fail(function (error) {
                        console.log(error);
                        const html = `<p class="row error">${error.responseText}</p>`;
                        $(html).insertBefore('.landing-page');
                    });
            }

        });
    }

    function showDashboard() {
        $('main').attr('hidden', false);
        $('#js-logout').attr('hidden', false);
        $('.landing-page').attr('hidden', true);
    }

    function main() {
        toggleCollapseMenu();
        togglePagesMenu();
        clearResize();
        login();
        register();
        revealProgress();
        toggleForms();
    }

    $(main);
})();