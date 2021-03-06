const expect = require('expect');
const request = require('supertest')

const {ObjectId} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');

const todos = [{
  _id:new ObjectId(),
  text:'First test todo',
},{
  _id: new ObjectId(),
  text: "Second test todo",
  completed:true,
  completedAt:333
}];

beforeEach((done)=>{
  Todo.remove({}).then(()=>{
    return Todo.insertMany(todos)
  }).then(()=>done())
})

describe('POST /todos', () => {
  it('should create a new todo', (done) =>{
    let text = 'Test todo text'
    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text)
      })
      .end(function(err, res){
        if(err) {
          return done(err)
        }

        Todo.find({text}).then((todos)=> {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          done()
        }).catch((e)=>done(e))
      })
  })

  it('should not create todo with invalid body data', (done)=>{
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) =>{
        if(err) {
          return done(err);
        }

        Todo.find().then((todos)=>{
          expect(todos.length).toBe(2)
          done()
        }).catch((e)=>done(e))
      })

  })
})

//test for get route

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res)=>{
        expect(res.body.todos.length).toBe(2)
      })
      .end(done)
  })
});

describe('GET /todos/:id', ()=> {
  it('should return todo doc', (done) =>{
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should return 404 if todo is not found', (done) => {
    let _id = new ObjectId('5967989ee978311656e93a59')
    request(app)
      .get(`/todos/${todos/_id.toHexString()}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', (done) => {
    let hexId = '5967989ee978311656e93a5312'
    request(app)
      .get(`/todos/${todos/hexId}`)
      .expect(404)
      .end(done)
  })

  
});

