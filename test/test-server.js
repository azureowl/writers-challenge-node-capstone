const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const {Notebook} = require('../models/notebook');
const {User} = require('../models/user');
var ObjectId = require('mongodb').ObjectID;
const faker = require('faker');
const mongoose = require('mongoose');

var chai = require('chai');
var chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

// Create placeholder notebooks with one user

function seedNotebooks() {
    console.info('Seeding notebook data for one user');
    const notebookData = [];
    const user = {
        "name": "Boston Bauer",
        "username": "boston@gmail.com",
        "password": 123456,
        "_id": ObjectId('5b8de6abc7147a5a52c21762')
    };

    return User.create(user)
        .then(user => {
            for (let i=1; i<=5; i++) {
                notebookData.push(generateNotebookData(user._id));
            }
            return Notebook.insertMany(notebookData);
        })
        .catch((err) => console.log(err));
}

function generateNotebookData (id) {
    return {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        user: id
    };
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Writing App Capstone Resource', function () {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        console.log('generate notebook data');
        return seedNotebooks();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });


    // ******* TESTING GET ******* //
    describe('GET notebooks endpoint', function () {
        it('GET /notebooks/:userID Should return all notebooks for user', function () {
            return chai.request(app)
                .get(`/notebooks/${'5b8de6abc7147a5a52c21762'}`)
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.notebooks).to.have.lengthOf.above(0);
                })
                .catch(err => {console.log(err);});
        });

        it('GET /notebooks/book/:id Should return notebook content', function () {
            return Notebook.findOne({})
                .then(notebook => {
                    const id = notebook._id;
                    return chai.request(app)
                        .get(`/notebooks/book/${id}`)
                        .then(function (res) {
                            expect(res).to.have.status(200);
                            expect(res).to.be.json;
                            expect(res.body).to.be.a('string');
                        })
                        .catch(err => {console.log(err);});
                })
                .catch(err => {console.log(err);});
        });
    });

    // ******* TESTING POST ******* //
    describe('POST notebooks endpoint', function () {
        it('POST /notebooks/add Should add a notebooks for user', function () {
            return User.findOne()
                .then(user => {
                    const username = user.username;
                    return chai.request(app)
                        .post('/notebooks/add')
                        .send({
                            title: faker.lorem.words(),
                            content: faker.lorem.paragraph(),
                            username: username})
                        .then(function (res) {
                            expect(res).to.have.status(201);
                            expect(res).to.be.json;
                            expect(res.body).to.be.an('object');
                            expect(res.body.notebooks).to.include.all.keys('title', 'content', 'id', 'meta');
                        })
                        .catch(err => {console.log(err);});
                })
                .catch(err => {console.log(err);});
        });
    });

    // ******* TESTING PUT ******* //
    describe('PUT notebooks endpoint', function () {
        it('PUT /notebooks/:id Should update a notebook\'s title for user', function () {
            return Notebook.findOneAndUpdate()
                .then(notebook => {
                    const id = notebook._id;
                    return chai.request(app)
                        .put(`/notebooks/${id}`)
                        .send({
                            title: faker.lorem.words(),
                            id: id})
                        .then(function (res) {
                            expect(res).to.have.status(201);
                            expect(res).to.be.json;
                            expect(res.body).to.be.an('object');
                            expect(res.body.title).to.not.equal(notebook.title);
                        })
                        .catch(err => {console.log(err);});
                })
                .catch(err => {console.log(err);});
        });

        it('PUT /notebooks/book/:id Should update notebook content', function () {
            const updatedData = {
                content: faker.lorem.words()
            };
            return Notebook.findOne()
                .then(notebook => {
                    const id = notebook._id;
                    updatedData.id = id;
                    return chai.request(app)
                        .put(`/notebooks/book/${id}`)
                        .send(updatedData)
                        .then(function (res) {
                            expect(res).to.have.status(201);
                            expect(res).to.be.json;
                            expect(res.body).to.be.an('object');
                            return Notebook.findById(id);
                        })
                        .then(notebook => {
                            expect(res.body.content).to.not.equal(notebook.content);
                        })
                        .catch(err => {console.log(err);});
                })
                .catch(err => {console.log(err);});
        });
    });
    // ******* TESTING DELETE ******* //
    describe('DELETE notebooks endpoint', function () {
        it('DELETE /notebooks/:id Should delete notebook for user', function () {
            return Notebook.findOne()
                .then(notebook => {
                    const id = notebook._id;
                    return chai.request(app)
                        .delete(`/notebooks/${id}`)
                        .then(function (res) {
                            expect(res).to.have.status(204);
                            return Notebook.findById(id);
                        })
                        .then(notebook => {
                            expect(_restaurant).to.be.null;
                        })
                        .catch(err => {console.log(err);});
                })
                .catch(err => {console.log(err);});
        });
    });
});