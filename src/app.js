const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());
app.use('/repositories/:id', validateId)

const repositories = [];

function validateId (request, response, next) {
  const { id } = request.params;

  // validate if the id passed is an uuid instance
  if(!isUuid(id)){
    return response.status(400).json({
      "Message": `Id ${id} not valid. Please consult the /repositories route to check the ids`
    })
  } 

  // validate if id passed really exists
  const repository = repositories.findIndex( repository => repository.id === id)
  if (repository < 0){
    return response.status(400).json({
      "Message": `Repository with id ${id} not exists`
    })
  }
  
  next()
}

function validateJsonBody(request, response, next){
  // not allow likes to be update manually using unauthorized routes
  if (request.body.likes){
    return response.json({"likes": 0})
  }
  
  const { title, url, techs } = request.body;

  if ((title, url, techs) === undefined){ // if the parameters in json passed not match the requirements, not allow
      return response.status(401).json({
        "Message": "The json used is not following the parameters defined",
        "Json Example": {
          "url": "<github url>",
          "title": "<title of the project>",
          "techs": ["<techs used in the project>"],
        }
      })
    }

    next()
}


app.get("/repositories", (request, response) => {
  
  if(repositories.length < 1){
    return response.json({
      "Repositories": "There is no repositories yet"
    })
  }

  
  return response.json(repositories)
  
});

app.post("/repositories", validateJsonBody, (request, response) => {
    const { title, url, techs } = request.body;
  
    const repository = {id: uuid(), url, title, techs, likes:0}

    repositories.push(repository)

    return response.status(201).json(repository)

});

app.put("/repositories/:id", validateJsonBody, (request, response) => {
  
  const { id } = request.params;

  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(repo => repo.id === id)

  repositories[repositoryIndex] = {id:id, title:title, url:url, techs:techs}

  return response.status(200).json(repositories[repositoryIndex]);

});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repo => repo.id === id)

  repositories.splice(repositoryIndex, 1);
  
  return  response.status(204).json()
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repo => repo.id === id)

  repositories[repositoryIndex].likes += 1
  
  return response.status(200).json(repositories[repositoryIndex])
});

module.exports = app;
