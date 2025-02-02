const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index.js');
const FAQ = require('../models/FAQ.js');
const { getCache, setCache } = require('../services/cacheService.js');

const should = chai.should();
chai.use(chaiHttp);

describe('FAQs', () => {
  before((done) => {
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => done())
      .catch((err) => done(err));
  });

  beforeEach(async () => {
    await FAQ.deleteMany({});
  });

  describe('/POST faq', () => {
    it('it should not POST a faq without question and answer', (done) => {
      let faq = {};
      chai.request(server)
        .post('/api/faqs')
        .send(faq)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          done();
        });
    });

    it('it should POST a faq with translations and cache it', (done) => {
      let faq = {
        question: "What is your name?",
        answer: "My name is Sujay.",
        language: "en"
      };
      chai.request(server)
        .post('/api/faqs')
        .send(faq)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('faq');
          res.body.faq.should.have.property('question').eql('What is your name?');
          res.body.faq.should.have.property('answer').eql('My name is Sujay.');
          done();
        });
    });
  });

  describe('/GET faqs', () => {
    it('it should GET all the faqs', (done) => {
      chai.request(server)
        .get('/api/faqs')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
    
          res.body.should.satisfy((body) => {
            return body.hasOwnProperty('translatedFaqs') || body.hasOwnProperty('cachedFaqs');
          });
    
          done();
        });
    });
    

    it('it should GET cached faqs', function (done) {
      this.timeout(20000); 
    
      let faq = new FAQ({
        question: "What is your name?",
        answer: "My name is Sujay.",
        translations: {
          hi: { question: "आपका नाम क्या है?", answer: "मेरा नाम सुजय है।" },
          bn: { question: "তোমার নাম কি?", answer: "আমার নাম সুজয়।" }
        }
      });
    
      faq.save().then((savedFaq) => {
        setCache('faqs:en', [savedFaq]);
    
        setTimeout(() => {
          chai.request(server)
            .get('/api/faqs')
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              
              res.body.should.satisfy((body) => {
                return body.hasOwnProperty('cachedFaqs') || body.hasOwnProperty('translatedFaqs');
              });
    
              done();
            });
        }, 500); 
      });
    });
    
  });
});