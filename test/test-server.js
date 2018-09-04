const {app, runServer, closeServer} = require('../server');
var entry = require('../models/notebook.js');
var chai = require('chai');
var chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('root file', function () {
    it('should return 200 at the root', function () {
        chai.request(app)
            .get('/')
            .then(function (res) {
                expect(res).to.have.status(200);
            });
    });
});

// describe('shakespeare-passport-node-capstone', function () {
//     it('should add an entry on POST', function () {
//         chai.request(app)
//             .post('/entry/create')
//             .send({
//                 entryType: "performed",
//                 inputDate: "2014-11-05T00:00:00.000Z",
//                 inputPlay: "King Lear",
//                 inputAuthor: "William Shakespeare",
//                 inputRole: "Goneril",
//                 inputCo: "Kingman Shakespeare Festival",
//                 inputLocation: "Santa Barbara, CA",
//                 inputNotes: "With A FORK!",
//                 loggedInUserName: "paul.thomp@gmail.com"
//             })
//             .then(function (err, res) {
//                 //should.equal(err, null);
//                 res.should.have.status(201);
//                 res.should.be.json;
//                 res.body.should.be.a('object');
//                 done();
//             })
//             .catch(err => console.log({
//                 err
//             }));
//     });
//     it('Should Update an entry', function () {
//         chai.request(app)
//             .put('/entry/:id') //<-------????? Put request to '/entry/:id'
//             .then(function (res) {
//                 res.should.have.status(201);
//                 done();
//             })
//             .catch(err => console.log({
//                 err
//             }));
//     });
//     it('Should Delete an entry', function () {

//         chai.request(app)
//             .delete('/entry/:id')
//             .then(function (res) {
//                 res.should.have.status(201);
//                 done();
//             })
//             .catch(err => console.log({
//                 err
//             }));

//     });
//     it('Should Get All Users entries', function () {

//         chai.request(app)
//             .get('/entry-date/:user') //<-------????? Get request to '/entry-date/:user'
//             .then(function (res) {
//                 res.should.have.status(201);
//                 done();
//             })
//             .catch(err => console.log({
//                 err
//             }));
//     });

// });