const grpcLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const path = require("path");

const todoProto = grpcLoader.load(path.resolve("todo.proto"))
// const server = new grpc.Server()
const dbInMemory = [
  {id:1, done: false, task: "Learn TS"},
  {id:2, done: true, task:"Learn Golang"}
]

function changeData(id, checked, task = "not found"){
  let currentTask = {id, done: false, task}
  dbInMemory.map((dbItem)=>{
    if(dbItem.id === id){
      const taskChanged = dbItem;
      taskChanged.done = checked
      currentTask = taskChanged
    }
  })
  return currentTask
}

// server.addService(todoProto.TodoService, {
//   insert: (call, callback) =>{
//     const todo = call.request
//     const data = changeData(dbInMemory.length++, false, todo.task)
//     if(todo.task) dbInMemory.push(data)
//     callback(null, data)
//   },
//   list: (_, callback)=>{
//     callback(_, dbInMemory)
//   },
//   mark: (call, callback)=>{
//     const item = call.request
//     callback(null, changeData(item.id, item.checked))
//   }
// })

// const url = '127.0.0.1:50051'
todoProto.then((Definitions) => {
  const server = new grpc.Server();
  server.addService(Definitions.TodoService, {
    insert: (call, callback) =>{
      const todo = call.request
      const data = changeData(dbInMemory.length++, false, todo.task)
      if(todo.task) dbInMemory.push(data)
      callback(null, data)
    },
    list: (_, callback)=>{
      callback(_, dbInMemory)
    },
    mark: (call, callback)=>{
      const item = call.request
      callback(null, changeData(item.id, item.checked))
    }
  });
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      server.start();
      console.log(`.:: Port server at ${port} ::.`);
    }
  );
});
// server.bind(url, grpc.ServerCredentials.createInsecure())
// console.log(`Server running at ${url}`)
// server.start()