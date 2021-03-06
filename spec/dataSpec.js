/* eslint func-names: 0 */
/* eslint prefer-arrow-callback: 0 */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import app from '../server/app';
import db from '../database/database';
import generateData from '../data/generateData';

const port = 6474;

let server;
let cities;
let users;

xdescribe('Data Scripting', function () {
  this.timeout(6000);
  before((done) => {
    db.User.drop()
      .then(() => db.Location.drop())
      .then(() => db.Location.sync({ force: true }))
      .then(() => db.User.sync({ force: true }))
      .then(() => generateData())
      .then(() => db.Location.findAll({ raw: true }))
      .then((results) => {
        console.log(results);
        cities = results;
        done();
      });
  });

  beforeEach((done) => {
    server = app.listen(port);
    done();
  });

  afterEach((done) => {
    server.close();
    done();
  });

  // after((done) => {
  //   db.User.drop()
  //     .then(() => db.Location.drop())
  //     .then(() => done());
  // });

  xit('Should post 100 cities', function (done) {
    expect(cities).to.have.lengthOf(100);
    done();
  });

  xit('Should post cities with correct IDs', function (done) {
    const expectCities = [
      'New York City',
      'Los Angeles',
      'Chicago',
      'Houston',
      'Philadelphia',
      'Phoenix',
      'San Antonio',
      'San Diego',
      'Dallas',
      'San Jose',
      'Austin',
      'Jacksonville',
      'San Francisco',
      'Indianapolis',
      'Columbus',
      'Fort Worth',
      'Charlotte',
      'Seattle',
      'Denver',
      'El Paso'
    ];

    cities.forEach(city =>
      expect(city.name).to.equal(expectCities[city.id - 1]));
    done();
  });

  xit('Should order cities by population', function (done) {
    let lastPop;
    let lastId;
    cities.forEach((city) => {
      if (!lastPop || !lastId) {
        lastPop = city.population;
        lastId = city.id;
      } else {
        expect(city.population < lastPop && city.id < lastId).to.be.true;
      }
    });
    done();
  });

  xit('Should create 1000 users', function (done) {
    db.User.findAll()
      .then((results) => {
        users = results;
        expect(users).to.have.lengthOf(1000);
        done();
      });
  });

  xit('Should generate users with correct fields', function (done) {
    expect(users[0].id).to.exist;
    expect(users[0].age).to.exist;
    expect(users[0].locationId).to.exist;
    expect(users[0].joinDate).to.exist;
    expect(users[0].paidStatus).to.exist;
    expect(users[0].favoriteArtists).to.exist;
    expect(users[0].favoriteGenres).to.exist;
    expect(users[0].genreGroup).to.exist;
    done();
  });

  xit('Should properly format user options', function (done) {
    users.forEach((user) => {
      expect(user.locationId).to.be.above(0);
      expect(user.locationId).to.be.below(101);
      expect(user.age).to.be.above(17);
      expect(user.age).to.be.below(91);
      expect(typeof user.paidStatus).to.equal('boolean');
      expect(user.joinDate).to.have.lengthOf(8);
      expect(Array.isArray(user.favoriteArtists)).to.equal(true);
      expect(Array.isArray(user.favoriteGenres)).to.equal(true);
      expect(user.genreGroup).to.equal(user.favoriteGenres[0]);
    });
    done();
  });
});
