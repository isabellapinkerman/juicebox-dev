const express = require("express");
const postsRouter = express.Router();

const { getAllPosts, createPost, client } = require("../db");
const { requireUser } = require('./utils');

postsRouter.post('/', requireUser, async(req,res,next)=>{
    const { title, content, tags = "" } = req.body;
console.log(req.user, 'this is req.user')
    const tagArr = tags.trim().split(/\s+/)
    const postData = {};

    if (tagArr.length){
        postData.tags = tagArr;
    }

    try {
      postData.title = title
      postData.content = content
      postData.authorId = req.user.id
        const post = await createPost(postData)
        console.log(post)
        if(post){
          res.send({ post })
        }
        //add authorId, title, content to postData object
        // const post = await createPost(postData);
        // this will create the post and the tags for us
        // if the post comes back, res.send({ post });
        // otherwise, next an appropriate error object 
    } catch ({name, message}) {
        next({name, message});
    }
})

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next();
});

postsRouter.get("/", async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts,
  });
});

module.exports = postsRouter;
