(function () {
    'use strict';

    function getPages() {
        $('.notebook-container').on('click', '#js-getPages', function () {
            const notebookID = $(this).find('button')[0].id.slice(5);
            $.ajax(`/pages/${notebookID}`)
                .done(data => {
                    console.log(data);
                    $('.pages-lg').attr('data-book', `${notebookID}`);

                    // This makes pages get appended beneath their own respective notebook in the collapsible menu
                    $('.pages').filter(`[data-book=${notebookID}]`).append(markupPages(data.pages));
                })
                .fail(err => {
                    console.log(err);
                });
        });
    }

    function createPage(notebook) {
        const pageObject = {
            content: $('#editor').text(),
            meta: {
                wordCount: $('#editor').text() === "" ? 0 : $('#editor').text().split(' ').length
            },
            notebook: {
                title: `${notebook.title}`,
                id: `${notebook.id}`
            }
        };

        $.ajax(`/pages/add`, {
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(pageObject),
            dataType: 'json'
        })
            .done(function (data) {
                $('.pages-lg').attr('data-book', `${data.id}`);

                // This makes pages get appended beneath their own respective notebook in the collapsible menu
                $('.pages').filter(`[data-book=${data.id}]`).append(markupPages([data]));
            })
            .fail(err => {
                console.log(err);
            });
    }


    function updatePage() {

    }

    function deletePage() {

    }

    function getNotebooks() {
        $('#js-getNotebooks').on('click', function () {
            const userID = $('.profile').find('legend').attr('class');
            $.ajax(`/notebooks/${userID}`)
                .done((data) => {
                    $('.notebook-container').html(markupNotebooks(data.notebooks));
                })
                .fail(err => {
                    console.log(err);
                });
        });
    }

    function showNotebookList() {
        $('#js-notebook').on('click', function (e) {
            // refactor same as function accessProfile!!
            // or might have to create form dynamically and then remove it
            const target = $(this).next();
            const expanded = $(this).attr('aria-expanded') === 'true' || false;
            $(this).attr('aria-expanded', !expanded);
            target.attr('hidden', expanded);
        });
    }

    function createNotebook() {
        $('.notebook-form').on('keypress', function (e) {
            const userObject = {
                username: $("#email").val(),
                title: $('#title').val()
            };

            if (e.which === 13) {
                e.preventDefault();

                $.ajax('/notebooks/add', {
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(userObject),
                        dataType: 'json'
                    })
                    .done(function (data) {
                        $('.notebook-container').append(markupNotebooks([data.notebooks]));
                        createPage(data.notebooks);
                    })
                    .fail(err => {
                        console.log(err);
                    });
                $('#title').val('');
            }
        });
    }

    function getNotebookDetails(el) {
        return {
            id: el.siblings('.open-notebook').attr('id').split('-')[1],
            title: el.siblings('.open-notebook').text()
        };
    }

    function updateNotebook() {
        $('.notebook-container').on('click', '#edit-notebook', function (e) {
            e.stopPropagation();
            const originalNotebook = $(this).closest('.notebook');
            const notebookInfo = getNotebookDetails($(this));
            $(this).closest('h3').html(`<div class="one-line"><input class="notebook-title" type="text"></div>`);
            const userObject = {};

            $('.one-line').on('keypress', function (e) {
                if (e.which === 13) {
                    if ($(this).find('input').val() === "") {
                        $(originalNotebook).replaceWith(markupNotebooks([notebookInfo]));
                    } else {
                        userObject.title = $('.one-line .notebook-title').val();
                        userObject.id = notebookInfo.id;
                        $.ajax(`/notebooks/${notebookInfo.id}`, {
                            method: 'PUT',
                            contentType: 'application/json',
                            data: JSON.stringify(userObject),
                            dataType: 'json'
                        })
                        .done(function (data) {
                            $(originalNotebook).replaceWith(markupNotebooks([data]));
                        })
                        .fail(function (error) {
                            console.log(error);
                            const html = `<p class="row error">${error.responseText}</p>`;
                            $(html).insertBefore('.landing-page');
                        });
                    }
                }
            });

            $('.one-line').on('keyup', function (e) {
                if (e.which === 27) {
                    $(originalNotebook).replaceWith(markupNotebooks([notebookInfo]));
                }
            });
        });
    }

    function deleteNotebook() {
        $('.notebook-container').on('click', '#delete-notebook', function (e) {
            e.stopPropagation();
            const notebookInfo = getNotebookDetails($(this));
            const target = $(this).closest('h3');
            $.ajax(`/notebooks/${notebookInfo.id}`, {
                method: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify(notebookInfo),
                dataType: 'json'
            })
            .done(function (data) {
                // notebook isn't being removed!
                target.remove();
            })
            .fail(function (error) {
                console.log(error);
                const html = `<p class="row error">${error.responseText}</p>`;
                $(html).insertBefore('.landing-page');
            });
        });
    }

    function toggleCollapseMenu() {
        $('.nav').on('click', '.expandable', function (e) {

            let target = $(this).next();
            // console.log($(this), $(this).find('button'));
            // const id = $(this).find('button').attr('id');
            // use expanded variable to set the state of the target
            const expanded = $(this).find('button').attr('aria-expanded') === 'true' || false;
            $(this).find('button').attr('aria-expanded', !expanded);
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

    function toggleForms() {
        $('.js-change-form').on('click', function (e) {
            const current = $(this).closest('section');
            const target = $('body').find('.landing-page:hidden');
            target.attr('hidden', false);
            current.attr('hidden', true);
        });
    }

    function revealProgress() {
        $('#js-progress').on('click', function (e) {
            e.preventDefault();
            $('.my-progress').attr('hidden', false);
            hideProgress();
        });
    }

    function hideProgress() {
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
                        showDashboard();
                        $('.profile').find('legend').text(data.user);
                        $('.profile').find('legend').attr('class', data.id);
                        accessProfile(data);
                        // get name from server and display with greeting!
                    })
                    .fail(function (error) {
                        const html = `<p class="row error">${error.responseText}</p>`;
                        $(html).insertBefore('.landing-page');
                    });
            }
        });
    }

    function register() {
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
                        showDashboard();
                        $('.profile').find('legend').text(data);
                        accessProfile(data);
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

    function accessProfile(data) {
        $('#js-user').on('click', function (e) {
            e.preventDefault();
            const target = $(this).next();
            const expanded = $(this).attr('aria-expanded') === 'true' || false;
            $(this).attr('aria-expanded', !expanded);
            target.attr('hidden', expanded);
        });
    }

    function changeProfile() {
        $('#js-change').on('click', function (e) {
            e.preventDefault();
            const userObject = {
                user: $('.profile').find('legend').text()
            };

            const fields = ["#profile-name", "#profile-password"];

            fields.forEach(field => {
                if ($(field).val() !== "") {
                    let prop = field.split('-')[1];
                    userObject[prop] = $(field).val();
                }
            });

            if (Object.keys(userObject).length > 0) {
                $.ajax('/users/profile', {
                        method: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify(userObject),
                        dataType: 'json'
                    })
                    .done(function (data) {
                        console.log(data);
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
        ['main', '#js-logout', '#js-user', '.landing-page'].forEach(el => {
            if (el === '.landing-page') {
                $(el).attr('hidden', true);
            } else {
                $(el).attr('hidden', false);
            }
        });
    }

    function markupPages(pages) {
        const pageItems = [];
        pages.forEach(item => {
            const page = `<section role="region" class="col col-12"><button>+ Page</button><h2>${item.title}</h2><div><button class="page">My Page</button><button id="edit-notebook"><i class="fas fa-edit" aria-label="Edit Notebook Name"></i></button><button id="delete-notebook"><i class="far fa-trash-alt" aria-label="Delete Notebook"></i></button></div></section>`;
            pageItems.push(page);
        });
        return pageItems;
    }

    function markupNotebooks(notebooks) {
        const notebookTitles = [];
        notebooks.forEach(item => {
            const html = `<div class="notebook"><h3 class="expandable" id="js-getPages"><button class="open-notebook" aria-expanded="false" id="book-${item.id}">${item.title}</button><button id="edit-notebook"><i class="fas fa-edit" aria-label="Edit Notebook Name"></i></button><button id="delete-notebook"><i class="far fa-trash-alt" aria-label="Delete Notebook"></i></button></h3><div class="pages pages-mb" data-book="${item.id}"></div></div>`;
            notebookTitles.push(html);
        });
        return notebookTitles;
    }

    function main() {
        toggleCollapseMenu();
        togglePagesMenu();
        clearResize();
        login();
        register();
        revealProgress();
        toggleForms();
        changeProfile();
        showNotebookList();
        getNotebooks();
        createNotebook();
        updateNotebook();
        deleteNotebook();
        getPages();
    }

    $(main);
})();



