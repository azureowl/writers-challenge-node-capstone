(function () {
    'use strict';

    function getNotebooks() {
        $('#js-getNotebooks').on('click', function () {
            const userID = $('.profile').find('legend').attr('class');
            $.ajax(`/notebooks/${userID}`)
                .done((data) => {
                    console.log(data);
                    $('.notebook-container').html(markupNotebooks(data.notebooks));
                })
                .fail(err => {
                    console.log(err);
                });
        });
    }

    function getNotebookContent() {
        $('.collections').on('click', '.js-open-notebook', function () {
            const id = $(this).attr('id').split('-')[1];
            const title = $(this).text();
            $('#editor').attr('data-book', id);
            $.ajax(`/notebooks/book/${id}`)
                .done((content) => {
                    $('.ql-editor').html(content);
                })
                .fail(err => {
                    console.log(err);
                });
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
                if ($(this).find('input').val() === "") {
                    $('#js-notebook').click();
                    return;
                } else {
                    $.ajax('/notebooks/add', {
                            method: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(userObject),
                            dataType: 'json'
                        })
                        .done(function (data) {
                            $('#js-notebook').click();
                            $('.notebook-container').append(markupNotebooks([data.notebooks]));
                        })
                        .fail(err => {
                            console.log(err);
                        });
                    $('#title').val('');
                }
            }
        });

        $('.notebook-form').on('keyup', function (e) {
            if (e.which === 27) {
                $('#js-notebook').click();
                return;
            }
        });
    }

    function updateNotebookContent() {
        $('#js-save').on('click', function () {
            const notebookObj = {
                content: $('.ql-editor').html(),
                id: $('#editor').attr('data-book')
            };
            // if no notebook created, create one automatically!
            $.ajax(`/notebooks/book/${notebookObj.id}`, {
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(notebookObj),
                    dataType: 'json'
                })
                .done(function (data) {
                    $('#js-save').text('Saved!').prop('disabled', true).css({
                        color: '#45c34a'
                    });
                    const reset = setTimeout(() => {
                        $('#js-save').text('Save!').prop('disabled', false).css({
                            color: 'black'
                        });
                    }, 3000);

                })
                .fail(function (error) {
                    console.log(error);
                    const html = `<p class="row error">${error.responseText}</p>`;
                    $(html).insertBefore('.landing-page');
                });

        });
    }

    function updateNotebookTitle() {
        $('.notebook-container').on('click', '#edit-notebook', function (e) {
            e.stopPropagation();

            // Should user cancel change, save the current element to replace the toggled field
            const current = $(this).closest('.notebook');
            const notebookInfo = {
                id: $(this).siblings('.js-open-notebook').attr('id').split('-')[1],
                title: $(this).siblings('.js-open-notebook').text()
            };

            // Create the field for new title
            $(this).closest('h3').html(`<div class="one-line"><input class="notebook-title" type="text"></div>`);

            const userObject = {};

            $('.one-line').on('keypress', function (e) {
                if (e.which === 13) {
                    if ($(this).find('input').val() === "") {
                        $(current).replaceWith(markupNotebooks([notebookInfo]));
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
                                $(current).replaceWith(markupNotebooks([data]));
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
                    $(current).replaceWith(markupNotebooks([notebookInfo]));
                }
            });
        });
    }

    function deleteNotebook() {
        $('.notebook-container').on('click', '#delete-notebook', function (e) {
            e.stopPropagation();
            const notebookInfo = {
                id: $(this).siblings('.js-open-notebook').attr('id').split('-')[1],
                title: $(this).siblings('.js-open-notebook').text()
            };
            const target = $(this).closest('.notebook');
            $.ajax(`/notebooks/${notebookInfo.id}`, {
                    method: 'DELETE'
                })
                .done(function (data) {
                    target.remove();
                })
                .fail(function (error) {
                    console.log(error);
                    const html = `<p class="row error">${error.responseText}</p>`;
                    $(html).insertBefore('.landing-page');
                });
        });
    }

    function accessProfile(data) {
        $('#js-user').on('click', function (e) {
            e.preventDefault();
            toggleExpand($(this));
        });
    }

    function toggleAddNotebookForm() {
        $('#js-notebook').on('click', function (e) {
            toggleExpand($(this));
        });
    }

    function toggleExpand(el) {
        const target = el.next();
        const expanded = el.attr('aria-expanded') === 'true' || false;
        el.attr('aria-expanded', !expanded);
        target.attr('hidden', expanded);
    }

    function toggleCollapseMenu(bool) {
        $('.nav').on('click', '.expandable', function (e) {
            const target = $(this).next();
            const expanded = $(this).find('button').attr('aria-expanded') === 'true' || false;
            $(this).find('button').attr('aria-expanded', !expanded);
            target.attr('hidden', expanded);
        });
    }

    function toggleUserForms() {
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

    function logout() {
        console.log('logged out!');

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
                        setAccountDetails();
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
                        setAccountDetails();
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

    function markupNotebooks(notebooks) {
        const notebookTitles = [];
        notebooks.forEach(item => {
            const html = `<div class="notebook"><h3 class="expandable"><button class="js-open-notebook" aria-expanded="false" id="book-${item.id}">${item.title}</button><button id="edit-notebook"><i class="fas fa-edit" aria-label="Edit Notebook Name"></i></button><button id="delete-notebook"><i class="far fa-trash-alt" aria-label="Delete Notebook"></i></button></h3></div>`;
            notebookTitles.push(html);
        });
        return notebookTitles;
    }

    function setAccountDetails() {
        $('.profile').find('legend').text(data.user);
        $('.profile').find('legend').attr('class', data.id);
        accessProfile(data);
    }

    function main() {
        toggleCollapseMenu();
        login();
        logout();
        register();
        revealProgress();
        toggleUserForms();
        changeProfile();
        toggleAddNotebookForm();
        createNotebook();
        getNotebooks();
        getNotebookContent();
        updateNotebookContent();
        updateNotebookTitle();
        deleteNotebook();
    }

    $(main);
})();