(function () {
    'use strict';

    var quill = new Quill('#editor', {
        theme: 'snow'
    });

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

    function getNotebookContent() {
        $('.collections').on('click', '.js-open-notebook', function () {
            const id = $(this).attr('id');
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

            // if field is empty on 'ENTER', close the form
            if (e.which === 13) {
                e.preventDefault();
                if ($(this).find('input').val() === "") {
                    $('#js-notebook').click();
                    return;
                } else {
                    $('.ql-editor').html('');
                    createNotebookAJAX(userObject);
                    $('#title').val('');
                }
            }
        });

        // if field is empty on 'ESC', close the form
        $('.notebook-form').on('keyup', function (e) {
            if (e.which === 27) {
                $('#js-notebook').click();
                $('#title').val('');
                return;
            }
        });
    }

    function createNotebookAJAX(user) {
        $.ajax('/notebooks/add', {
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(user),
                dataType: 'json'
            })
            .done(function (data) {
                $('#js-notebook').click();
                $('#editor').attr('data-book', data.notebooks.id);
                $('.notebook-container').append(markupNotebooks([data.notebooks]));
                updateNotebookContent();
            })
            .fail(err => {
                console.log(err);
            });
    }


    // Automatic saving after *wait* milliseconds. Debounce function postpones call to updateNotebookContent()
    var saveText = _.debounce(updateNotebookContent, 500);

    function saveContentAuto() {
        $('#editor').on('keyup', function (e) {
            saveText();
        });
    }

    function updateNotebookContent() {
        const notebookObj = {
            content: $('.ql-editor').html(),
            id: $('#editor').attr('data-book')
        };

        if (notebookObj.id === undefined) {
            // if editor receives changes without a notebook, create a notebook
            const userObject = {
                username: $("#email").val(),
                title: 'My Notebook'
            };
            createNotebookAJAX(userObject);
        } else {
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
        }
    }

    function updateNotebookTitle() {
        $('.notebook-container').on('click', '#edit-notebook', function (e) {
            e.stopPropagation();

            // Save the current element to replace the toggled field should user change his mind
            const current = $(this).closest('.notebook');
            const notebookInfo = {
                id: $(this).siblings('.js-open-notebook').attr('id'),
                title: $(this).siblings('.js-open-notebook').text()
            };

            // Create the toggled field
            $(this).closest('h3').html(`<div class="one-line"><input class="notebook-title" type="text" placeholder="Change title or ESC" aria-label="Edit Notebook Title or hit ESC key"></div>`);

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
                id: $(this).siblings('.js-open-notebook').attr('id'),
                title: $(this).siblings('.js-open-notebook').text()
            };
            const target = $(this).closest('.notebook');
            if (window.confirm(`Delete ${notebookInfo.title} notebook? This cannot be undone.`)) {
                $.ajax(`/notebooks/${notebookInfo.id}`, {
                        method: 'DELETE'
                    })
                    .done(function (data) {
                        $('#editor').removeAttr('data-book');
                        $('.ql-editor').html('');
                        target.remove();
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
                        setAccountDetails(data);
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
                        setAccountDetails(data);
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

    function modifyUserProfile() {
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
            const html = `<div class="notebook"><h3 class="expandable"><button class="js-open-notebook" aria-expanded="false" id="${item.id}">${item.title}</button><button id="edit-notebook"><i class="fas fa-edit" aria-label="Edit Notebook Name"></i></button><button id="delete-notebook"><i class="far fa-trash-alt" aria-label="Delete Notebook"></i></button></h3></div>`;
            notebookTitles.push(html);
        });
        return notebookTitles;
    }

    function setAccountDetails(data) {
        $('.profile').find('legend').text(data.user);
        $('.profile').find('legend').attr('class', data.id);
        accessProfile(data);
    }

    function openWordTools() {
        $('.tools').on('click', function (e) {
            e.stopPropagation();
            $('main').addClass('mb-hidden');
            if ($(e.target).attr('id') === 'js-open-dictionary') {
                $('#dialog1_label').text('Search Dictionary');
                $('.dialog-form-button button').attr('id', 'dictionary');
            }
            if ($(e.target).attr('id') === 'js-open-thesaurus') {
                $('#dialog1_label').text('Search Thesaurus');
                $('.dialog-form-button button').attr('id', 'thesaurus');
            }

            $("#dialog1").attr('hidden', false);
            $('.dialog-form-item input').focus();
            closeWordTools($(e.target));
        });
    }

    function closeWordTools(target) {
        $('#js-close-tools').on('click', function () {
            $('main').removeClass('mb-hidden');
            $("#dialog1").attr('hidden', true);
            $('.dialog-form-button button').removeAttr('id');
            $('#js-definitions').html('');
            $(target).focus();
        });
    }

    function setOXSettings() {
        let id;
        let word;
        $('.dialog_form').on('submit', function (e) {
            e.preventDefault();
            id = $('.dialog-form-button button').attr('id');
            word = $('.wordtool').val();
            callOXAJAX(word, id);
        });

        $('#js-definitions').on('click', '.thesaurus-result', function (e) {
            id = "thesaurus";
            word = $(this).text();
            callOXAJAX(word, id);
        })
    }

    function callOXAJAX(term, id) {
        $.ajax(`/wordtool/${term}/book/${id}`)
                .done(data => {
                    if (data === null) {
                        return $('#js-definitions').html(`Unable to find ${term}`);
                    } else if (data.type === 'dictionary') {
                        markupDefinitions(data.response);
                    } else if (data.type === 'thesaurus') {
                        markupThesaurus(data.response);
                    }
                })
                .fail(err => {
                    console.log(err);
                });
    }

    function markupDefinitions(data) {
        const markup = [];
        data.results[0].lexicalEntries.forEach((item, index) => {
            const start = `<ul id="js-definitions"><li><span class="word">${data.results[0].id}<sup>${index+1}</sup></span><hr><span class="js-category">${item.lexicalCategory}</span><ul class="definition">`;

            const end = `</ul></li></ul>`;
            const definitions = item.entries[0].senses.map((defs, index) => {
                return `<li>${index+1} <span>${defs.definitions[0]}</span></li>`;
            });

            markup.push(`${start}${definitions.join('')}${end}`);
        });

        $('#js-definitions').html(markup);
    }

    function markupThesaurus(data) {
        const markup = [];
        const start = `<li class="thesaurus-result-list"><div><h3>Synonym</h3><ul>`;
        const middle = `</ul></div><div><h3>Antonym</h3><ul>`;
        const end = `</ul></div></li>`;

        const synonyms = data.results[0].lexicalEntries[0].entries[0].senses[0].synonyms.map(item => {
            return `<li><button class="thesaurus-result" type="button">${item.text}</button></li>`;
        });

        const antonyms = data.results[0].lexicalEntries[0].entries[0].senses[0].antonyms.map(item => {
            return `<li><button class="thesaurus-result" type="button">${item.text}</button></li>`;
        });

        markup.push(`${start}${synonyms.join('')}${middle}${antonyms.join('')}${end}`);

        $('#js-definitions').html(markup);
    }

    function main() {
        toggleCollapseMenu();
        login();
        logout();
        register();
        revealProgress();
        toggleUserForms();
        modifyUserProfile();
        toggleAddNotebookForm();
        createNotebook();
        getNotebooks();
        getNotebookContent();
        updateNotebookTitle();
        deleteNotebook();
        saveContentAuto();
        openWordTools();
        setOXSettings();
    }

    $(main);
})();