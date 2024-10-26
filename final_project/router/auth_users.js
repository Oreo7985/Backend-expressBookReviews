const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return username && !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;
  if(!username || !password){
    return res.status(400).json({message: "Invalid username or password"});
  }

  if (authenticatedUser(username,password)){
    const token = jwt.sign({username},"secret_key", {expiresIn: "1h"});
    return res.status(200).json({
      message:"Login successful!", 
      token
    });
  } else {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  if (!review){
    return res.status(400).json({message: "Review not provided"});
  }
  if (!books[isbn]){
    return res.status(404).json({message: "Book not found"});
  }
  if (!books[isbn].reviews){
    books[isbn].reviews = {};
  }
  books[isbn].reviews[req.username] = review;
  return res.status(200).json({
    message: "Review added", 
    review: books[isbn].reviews
  });
});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!books[isbn]){
    return res.status(404).json({message: "Book not found"});
  }
  if (!books[isbn].reviews){
    return res.status(404).json({message: "No reviews available"});
  }
  if (!books[isbn].reviews[req.username]){
    return res.status(404).json({message: "Review not found"});
  }
  delete books[isbn].reviews[req.username];
  return res.status(200).json({
    message: "Review deleted", 
    review: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
