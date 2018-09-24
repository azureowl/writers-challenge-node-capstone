(function () {
    'use strict';

    var quill = new Quill('#editor', {
        theme: 'snow'
    });

    // Get all of user's notebooks and list them in the navigation sidebar
    function getNotebooks() {
        $('#js-getNotebooks').on('click', function () {
            const userID = $('legend').attr('class');
            $.ajax(`/notebooks/${userID}/all`, {
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                    }
                })
                .done((data) => {
                    $('.notebook-container').html(markupNotebooks(data.notebooks));
                })
                .fail(err => {
                    console.log(err);
                });
        });
    }

    // Select a notebook and display its content in the editor
    function getNotebookContent() {
        $('.collections').on('click', '.js-open-notebook', function () {
            const id = $(this).attr('id');
            const title = $(this).text();
            $('#editor').attr('data-book', id);
            $.ajax(`/notebooks/${id}`, {
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                    }
                })
                .done((content) => {
                    $('.ql-editor').html(content);
                    $('.ql-editor').focus();
                })
                .fail(err => {
                    console.log(err);
                });
        });
    }

    function createNotebook() {
        $('.notebook-form').on('keypress', function (e) {
            const userObject = {
                username: $('.profile').find('legend').text(),
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

    // AJAX request shared between manual notebook creation and direct typing to the editor without a notebook
    function createNotebookAJAX(user) {
        $.ajax('/notebooks', {
                method: 'POST',
                contentType: 'application/json',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                },
                data: JSON.stringify(user),
                dataType: 'json'
            })
            .done(function (data) {
                $('#js-notebook').click();
                $('#editor').attr('data-book', data.notebooks.id);
                $('.notebook-container').append(markupNotebooks([data.notebooks]));
                $('.ql-editor').focus();
                updateNotebookContent();
            })
            .fail(err => {
                console.log(err);
            });
    }


    // * Automatic saving after *wait* milliseconds. Debounce function postpones call to
    // updateNotebookContent()
    var saveText = _.debounce(updateNotebookContent, 500);

    function saveContentAuto() {
        $('.ql-editor').on('keypress', function (e) {
            saveText();
        });
    }

    function updateNotebookContent(e) {
        const notebookObj = {
            content: $('.ql-editor').html(),
            id: $('#editor').attr('data-book')
        };

        if (notebookObj.id === undefined) {
            // if editor receives changes without a notebook, create a notebook
            const userObject = {
                username: $('.profile').find('legend').text(),
                title: 'My Notebook'
            };
            createNotebookAJAX(userObject);
        } else {
            updateNotebookAJAX(notebookObj);
        }
    }

    function updateNotebookTitle() {
        $('.notebook-container').on('click', '#edit-notebook', function (e) {
            e.stopPropagation();
            // Save the default element to be put back should user change his mind
            const defaultValue = $(this).closest('.notebook');
            const notebookObj = {
                id: $(this).parent().siblings('.js-open-notebook').attr('id'),
                title: $(this).parent().siblings('.js-open-notebook').text()
            };

            // Create the toggled field
            $(this).closest('h3').html(`<div class="change-title"><input class="notebook-title" type="text" placeholder="Change title or ESC" aria-label="Edit Notebook Title or hit ESC key"></div>`);

            $('.change-title').on('keypress', function (e) {
                if (e.which === 13) {
                    if ($(this).find('input').val() === "") {
                        $(defaultValue).replaceWith(markupNotebooks([notebookObj]));
                    } else {
                        // User confirms title change
                        notebookObj.title = $('.change-title .notebook-title').val();
                        updateNotebookAJAX(notebookObj, e);
                    }
                }
            });

            $('.change-title').on('keyup', function (e) {
                if (e.which === 27) {
                    $(defaultValue).replaceWith(markupNotebooks([notebookObj]));
                }
            });
        });
    }

    function updateNotebookAJAX (notebookObj, event) {
        $.ajax(`/notebooks/${notebookObj.id}`, {
            method: 'PUT',
            contentType: 'application/json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
            },
            data: JSON.stringify(notebookObj),
            dataType: 'json'
        })
        .done(function (data) {
            if ('title' in data) {
                $(event.currentTarget).closest('.notebook').replaceWith(markupNotebooks([data]));
            }
            $('.js-save').text('Saved!');
            const reset = setTimeout(() => {
                $('.js-save').text('');
            }, 3000);
            $('p.error').remove();
        })
        .fail(function (error) {
            console.log(error);
            const html = `<p class="row error">${error.responseText}</p>`;
            $(html).insertAfter('header');
        });
    }

    function deleteNotebook() {
        $('.notebook-container').on('click', '#delete-notebook', function (e) {
            e.stopPropagation();
            const notebookObj = {
                id: $(this).parent().siblings('.js-open-notebook').attr('id'),
                title: $(this).parent().siblings('.js-open-notebook').text()
            };
            const target = $(this).closest('.notebook');
            if (window.confirm(`Delete ${notebookObj.title} notebook? This cannot be undone.`)) {
                $.ajax(`/notebooks/${notebookObj.id}`, {
                        method: 'DELETE',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                        }
                    })
                    .done(function (data) {
                        $('#editor').removeAttr('data-book');
                        $('.ql-editor').html('');
                        target.remove();
                        $('p.error').remove();
                    })
                    .fail(function (error) {
                        console.log(error);
                        const html = `<p class="row error">${error.responseText}</p>`;
                        $(html).insertAfter('header');
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

    // For the profile and notebook form
    function toggleExpand(el) {
        const target = el.next();
        const expanded = el.attr('aria-expanded') === 'true' || false;
        el.attr('aria-expanded', !expanded);
        target.attr('hidden', expanded);
    }

    // FOr the navigation sidebar collapsible menu
    function toggleCollapseMenu(bool) {
        $('.nav').on('click', '.expandable', function (e) {
            const target = $(this).next();
            const expanded = $(this).find('button').attr('aria-expanded') === 'true' || false;
            $(this).find('button').attr('aria-expanded', !expanded);
            target.attr('hidden', expanded);
        });
    }

    // Hide one form when the other is toggled: login and registration
    function toggleUserForms() {
        $('.js-change-form').on('click', function (e) {
            const current = $(this).closest('section');
            const target = $('body').find('.landing-page:hidden');
            target.attr('hidden', false);
            current.attr('hidden', true);
        });
    }

    function toggleProgressBox() {
        $('#js-progress').on('click', function (e) {
            e.preventDefault();
            $('.my-progress').attr('hidden', false);
            $('#js-close-progress').focus();
            getWordCount();
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
        $('#js-logout').on('click', function () {
            $('.profile').find('legend').removeClass();
            location.reload();
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
                        onloginRegistration(data);
                    })
                    .fail(function (error) {
                        const html = `<p class="row error">${error.responseText}</p>`;
                        $(html).insertAfter('header');
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
                        onloginRegistration(data);
                    })
                    .fail(function (error) {
                        console.log(error);
                        const html = `<p class="row error">${error.responseText}</p>`;
                        $(html).insertAfter('header');
                    });
            }

        });
    }

    function onloginRegistration(data) {
        localStorage.setItem('token', data.token);
        toggleDashboard();
        setAccountDetails(data);
        $('p.error').remove();
        $('#js-help').focus();
    }

    function modifyUserProfile() {
        $('#js-change').on('click', function (e) {
            e.preventDefault();
            const userObject = {
                user: $('.profile').find('legend').text()
            };

            const fields = ["#profile-name", "#profile-password", "#profile-goal"];

            fields.forEach(field => {
                if ($(field).val() !== "") {
                    let prop = field.split('-')[1];
                    userObject[prop] = $(field).val();
                }
            });

            if (Object.keys(userObject).length > 1) {
                $.ajax('/users/profile', {
                        method: 'PUT',
                        contentType: 'application/json',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                        },
                        data: JSON.stringify(userObject),
                        dataType: 'json'
                    })
                    .done(function (data) {
                        updateGoal(data);
                        $('p.error').remove();
                    })
                    .fail(function (error) {
                        console.log(error);
                        const html = `<p class="row error">${error.responseText}</p>`;
                        $(html).insertAfter('header');
                    });
            }

        });
    }

    // Update the word count goal, then update progress
    function updateGoal(goal) {
        $('progress').attr('max', goal);
        $('progress').attr('aria-valuemax', goal);
        getWordCount();
    }

    // Calc total word count across all notebooks
    function getWordCount() {
        const userID = $('legend').attr('class');
        $.ajax(`/notebooks/${userID}/all`, {
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
            }
        })
        .done((data) => {
            $('progress').attr('value', data.wordCountTotal);
            $('progress').attr('aria-valuenow', data.wordCountTotal);
            getGoal(userID, data.wordCountTotal);
        })
        .fail(function (error) {
            console.log(error);
        });
    }

    // Check goal and check if completed
    function getGoal(userID, count) {
        $.ajax(`/users/profile/${userID}`, {
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                }
            })
            .done(function (goal) {
                $('progress').attr('max', goal);
                $('progress').attr('aria-valuemax', goal);
                if (count/goal >= 1) {
                    $('.my-progress h2').text(`Congratulations! You completed your goal of writing ${goal} words!`);
                } else if (count/goal >= 0.60) {
                    $('.my-progress h2').text(`Good job! You've written ${count} words out of your goal of ${goal}.`);
                } else {
                    $('.my-progress h2').text(`You've written ${count} words out of ${goal}.`);
                }
            })
            .fail(function (error) {
                console.log(error);
            });
    }

    // Toggles the dashboard when user logs in and out
    function toggleDashboard() {
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
            const html = `<div class="notebook"><h3 class="expandable"><button class="js-open-notebook" aria-expanded="false" id="${item.id}">${item.title}</button><div><button id="edit-notebook"><i class="fas fa-edit" aria-label="Edit Notebook Name"></i></button><button id="delete-notebook"><i class="far fa-trash-alt" aria-label="Delete Notebook"></i></button></div></h3></div>`;
            notebookTitles.push(html);
        });
        return notebookTitles;
    }

    // Identify the user profile with displayed email
    function setAccountDetails(data) {
        $('.profile').find('legend').text(data.user);
        $('.profile').find('legend').attr('class', data.id);
        accessProfile(data);
    }

    // Display dictionary, thesaurus, or help box dialogue
    function openWordTools() {
        $('.tools').on('click', 'h2', function (e) {
            e.stopPropagation();
            $('main').addClass('mb-hidden');
            if ($(e.target).attr('id') === 'js-open-dictionary') {
                $('#dialog1_label').text('Search Dictionary');
                $('.dialog-form-button button').attr('id', 'dictionary');
                triggerDialog1();
            }
            if ($(e.target).attr('id') === 'js-open-thesaurus') {
                $('#dialog1_label').text('Search Thesaurus');
                $('.dialog-form-button button').attr('id', 'thesaurus');
                triggerDialog1();
            }
            if ($(e.target).attr('id') === 'js-help') {
                $("#dialog2").attr('hidden', false);
                $('.js-close-tools').focus();
            }

            function triggerDialog1() {
                $("#dialog1").attr('hidden', false);
                $("#dialog2").attr('hidden', true);
                $('#js-definitions').html('');
                $('.dialog-form-item input').focus();
            }

            closeWordTools($(e.target));
        });
    }

    function closeWordTools(target) {
        $('.js-close-tools').on('click', function () {
            $('main').removeClass('mb-hidden');
            $("#dialog1").attr('hidden', true);
            $("#dialog2").attr('hidden', true);
            $('.dialog-form-button button').removeAttr('id');
            $('#js-definitions').html('');
            $(target).focus();
        });
    }

    // Oxford dictionary AJAX settings for typed word or clicked word button
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
        });
    }

    function callOXAJAX(term, id) {
        $.ajax(`/wordtool/${term}/book/${id}`)
            .done(data => {
                if (data === null) {
                    return $('#js-definitions').html(`No entry available for '${term}'`);
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

                if ('definitions' in defs) {
                    return `<li>${index+1} <span>${defs.definitions[0]}</span></li>`;
                }

                if ('crossReferenceMarkers' in defs) {
                    // it's a link
                    return `<li>${index+1} <span>${defs.crossReferenceMarkers[0]}</span></li>`;
                }

            });

            markup.push(`${start}${definitions.join('')}${end}`);
        });

        if (markup.length > 0) {
            $('#js-definitions').html(markup);
        } else {
            return $('#js-definitions').html(`No entry available`);
        }
    }

    function markupThesaurus(data) {
        const markup = [];
        const start = `<li class="thesaurus-result-list"><div><h3>Synonym</h3><ul>`;
        const middle = `</ul></div><div><h3>Antonym</h3><ul>`;
        const end = `</ul></div></li>`;
        const synonymArr = data.results[0].lexicalEntries[0].entries[0].senses[0].synonyms;
        const antonymArr = data.results[0].lexicalEntries[0].entries[0].senses[0].antonyms;
        let synonyms = [], antonyms = [];

        if (synonymArr !== undefined) {
            synonyms = synonymArr.map(item => {
                return `<li><button class="thesaurus-result" type="button">${item.text}</button></li>`;
            });
        }

        if (antonymArr !== undefined) {
            antonyms = antonymArr.map(item => {
                return `<li><button class="thesaurus-result" type="button">${item.text}</button></li>`;
            });
        }
        markup.push(`${start} ${synonyms.join('')} ${middle} ${antonyms.join('')} ${end}`);
        $('#js-definitions').html(markup);
    }

    function getPrompt() {
        $('#js-prompt').on('click', function () {
            $.getJSON('https://ineedaprompt.com/dictionary/default/prompt?q=adj+noun+adv+verb+noun+location')
                .done(data => {
                    $('.ql-editor').prepend(data.english);
                })
                .fail(err => {
                    console.log(err);
                });
        });
    }

    function main() {
        toggleCollapseMenu();
        login();
        logout();
        register();
        toggleProgressBox();
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
        getPrompt();
    }

    $(main);
})();